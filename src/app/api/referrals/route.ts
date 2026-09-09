import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/utils/auth';
import { apiSuccess } from '@/lib/utils/response';
import { handleApiError } from '@/lib/utils/errors';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    // 1. Fetch current user and ensure they have a unique referral code
    let dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, referralCode: true, firstName: true, lastName: true },
    });

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          id: user.id,
          phone: user.phone || `+92${Date.now().toString().slice(-10)}`,
          email: user.email || null,
          firstName: user.user_metadata?.first_name || 'Customer',
          referralCode: `TLK-${user.id.slice(0, 6).toUpperCase()}`,
        },
      });
    } else if (!dbUser.referralCode) {
      const generatedCode = `TLK-${user.id.slice(0, 6).toUpperCase()}`;
      dbUser = await prisma.user.update({
        where: { id: user.id },
        data: { referralCode: generatedCode },
        select: {
          id: true,
          referralCode: true,
          firstName: true,
          lastName: true,
        },
      });
    }

    // 2. Fetch all referrals where this user is the referrer
    const referrals = await prisma.referral.findMany({
      where: { referrerId: user.id },
      include: {
        referee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            createdAt: true,
          },
        },
        qualifyingOrder: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            totalAmount: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const friendsInvited = referrals.length;
    const successfulOrders = referrals.filter(
      (r) => r.rewardGiven || r.qualifyingOrderId !== null
    ).length;

    const totalCreditsEarned = referrals.reduce((sum, r) => {
      return (
        sum + (r.rewardGiven && r.rewardAmount ? Number(r.rewardAmount) : 0)
      );
    }, 0);

    return apiSuccess({
      referralCode: dbUser.referralCode,
      friendsInvited,
      successfulOrders,
      totalCreditsEarned,
      referrals: referrals.map((r) => ({
        id: r.id,
        refereeName: r.referee
          ? `${r.referee.firstName} ${r.referee.lastName || ''}`.trim()
          : 'Invited Friend',
        joinedDate: r.createdAt,
        rewardGiven: r.rewardGiven,
        rewardAmount: r.rewardAmount ? Number(r.rewardAmount) : 500,
        orderStatus: r.qualifyingOrder?.status || 'Pending First Order',
        orderNumber: r.qualifyingOrder?.orderNumber || null,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
