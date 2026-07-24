import { EventEmitter } from 'events';
import { logger } from '../../config/logger';

export class OrderEventEmitter extends EventEmitter {}

export const orderEvents = new OrderEventEmitter();

// Registered Lifecycle Listeners
orderEvents.on('order:created', (data: { orderId: string; orderNumber: string; customerId: string }) => {
  logger.info(`[Event] order:created -> Order #${data.orderNumber} created for customer ${data.customerId}`);
});

orderEvents.on('order:payment_confirmed', (data: { orderId: string; orderNumber: string }) => {
  logger.info(`[Event] order:payment_confirmed -> Order #${data.orderNumber} payment confirmed, queuing auto-assignment job`);
});

orderEvents.on('order:assigned', (data: { orderId: string; tailorId: string }) => {
  logger.info(`[Event] order:assigned -> Order ${data.orderId} assigned to tailor ${data.tailorId}`);
});

orderEvents.on('order:in_stitching', (data: { orderId: string }) => {
  logger.info(`[Event] order:in_stitching -> Order ${data.orderId} is now in stitching phase`);
});

orderEvents.on('order:qc_pending', (data: { orderId: string }) => {
  logger.info(`[Event] order:qc_pending -> Order ${data.orderId} pending QC inspection`);
});

orderEvents.on('order:dispatched', (data: { orderId: string; trackingId: string }) => {
  logger.info(`[Event] order:dispatched -> Order ${data.orderId} dispatched with tracking ID ${data.trackingId}`);
});

orderEvents.on('order:delivered', (data: { orderId: string }) => {
  logger.info(`[Event] order:delivered -> Order ${data.orderId} delivered to customer`);
});

orderEvents.on('order:cancelled', (data: { orderId: string; reason: string }) => {
  logger.info(`[Event] order:cancelled -> Order ${data.orderId} cancelled. Reason: ${data.reason}`);
});

orderEvents.on('order:feedback_submitted', (data: { orderId: string; rating: number }) => {
  logger.info(`[Event] order:feedback_submitted -> Feedback rating ${data.rating} submitted for order ${data.orderId}`);
});
