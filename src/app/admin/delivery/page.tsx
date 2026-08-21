import { Truck } from 'lucide-react';
import { ComingSoon } from '@/components/admin/coming-soon';

export default function DeliverySyncPage() {
  return (
    <ComingSoon
      icon={Truck}
      title="TCS Delivery Sync"
      description="Courier dispatch, tracking sync, and delivery status oversight will live here."
    />
  );
}
