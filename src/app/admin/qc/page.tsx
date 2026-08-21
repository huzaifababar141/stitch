import { ShieldCheck } from 'lucide-react';
import { ComingSoon } from '@/components/admin/coming-soon';

export default function QualityControlPage() {
  return (
    <ComingSoon
      icon={ShieldCheck}
      title="Quality Control"
      description="QC inspection queues, pass/fail decisions, and rework tracking will live here."
    />
  );
}
