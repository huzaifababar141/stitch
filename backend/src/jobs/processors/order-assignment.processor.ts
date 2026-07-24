import { Job } from 'bullmq';
import { db } from '../../config/database';
import { logger } from '../../config/logger';
import { AuditTriggerType, TailorSkillLevel } from '@prisma/client';
import { notificationQueue } from '../queues';
import { orderEvents } from '../../modules/orders/orders.events';

export interface OrderAssignmentJobData {
  orderId: string;
}

const SKILL_SCORES: Record<TailorSkillLevel, number> = {
  master: 10,
  senior: 7,
  mid: 4,
  junior: 0,
};

export const processOrderAssignment = async (job: Job<OrderAssignmentJobData>) => {
  const { orderId } = job.data;
  logger.info(`[Job: OrderAssignment] Processing tailor auto-assignment for order ${orderId}`);

  const order = await db.order.findUnique({
    where: { id: orderId },
  });

  if (!order || order.deletedAt) {
    logger.warn(`[Job: OrderAssignment] Order ${orderId} not found or deleted`);
    return;
  }

  // Already assigned or cancelled check
  if (order.assignedTailorId) {
    logger.info(`[Job: OrderAssignment] Order ${orderId} already assigned to tailor ${order.assignedTailorId}`);
    return;
  }

  // Fetch all available tailors with their profile
  const tailors = await db.tailorProfile.findMany({
    where: {
      isAvailable: true,
      user: {
        isActive: true,
        isBlocked: false,
        deletedAt: null,
      },
    },
    include: {
      user: true,
    },
  });

  // Filter tailors with capacity
  const eligibleTailors = tailors.filter((t) => t.currentActiveOrders < t.maxDailyCapacity);

  if (eligibleTailors.length === 0) {
    logger.warn(`[Job: OrderAssignment] No available tailors with capacity for order ${orderId}`);
    return;
  }

  // Score each eligible tailor based on workload, quality score & skill level
  const scoredTailors = eligibleTailors.map((tailor) => {
    // 1. Workload Score (40 points max)
    const capacityRatio = (tailor.maxDailyCapacity - tailor.currentActiveOrders) / tailor.maxDailyCapacity;
    const workloadScore = capacityRatio * 40;

    // 2. Quality Score (30 points max) - based on 5-star rating scale
    const qualityNum = Number(tailor.qualityScore) || 4.0;
    const qualityScore = (qualityNum / 5.0) * 30;

    // 3. Seniority Bonus (10 points max)
    const seniorityScore = SKILL_SCORES[tailor.skillLevel] || 0;

    // Total Score (out of 80 points)
    const totalScore = workloadScore + qualityScore + seniorityScore;

    return {
      tailor,
      totalScore,
      workloadScore,
      qualityScore,
    };
  });

  // Sort descending by total score
  scoredTailors.sort((a, b) => b.totalScore - a.totalScore);
  const bestMatch = scoredTailors[0];

  const selectedTailor = bestMatch.tailor;

  // Set stitching deadline (e.g. 48 hours from now)
  const stitchingDeadline = new Date(Date.now() + 48 * 60 * 60 * 1000);

  // Update Order & TailorProfile in transaction
  await db.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: {
        assignedTailorId: selectedTailor.userId,
        assignedAt: new Date(),
        stitchingDeadline,
        status: 'assigned',
        assignmentReason: `Auto-assigned by smart engine (Score: ${bestMatch.totalScore.toFixed(1)}/80)`,
      },
    });

    await tx.tailorProfile.update({
      where: { id: selectedTailor.id },
      data: {
        currentActiveOrders: { increment: 1 },
      },
    });

    await tx.orderStatusHistory.create({
      data: {
        orderId,
        fromStatus: order.status,
        toStatus: 'assigned',
        triggerType: AuditTriggerType.system,
        notes: `Smart Auto-Assignment: Order assigned to ${selectedTailor.user.firstName} ${selectedTailor.user.lastName ?? ''}`,
      },
    });
  });

  logger.info(
    `[Job: OrderAssignment] Successfully assigned order ${orderId} to tailor ${selectedTailor.userId}`
  );

  // Emit event & queue notifications
  orderEvents.emit('order:assigned', {
    orderId,
    tailorId: selectedTailor.userId,
  });

  await notificationQueue.add('send-notification', {
    userId: selectedTailor.userId,
    orderId,
    channel: 'whatsapp',
    templateKey: 'tailor_new_assignment',
    body: `New stitching task assigned! Order #${order.orderNumber}. Please check your tailor dashboard.`,
  });
};
