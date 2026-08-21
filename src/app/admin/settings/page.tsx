import { Settings } from 'lucide-react';
import { ComingSoon } from '@/components/admin/coming-soon';

export default function SystemSettingsPage() {
  return (
    <ComingSoon
      icon={Settings}
      title="System Settings"
      description="Platform configuration, pricing rules, and operational preferences will live here."
    />
  );
}
