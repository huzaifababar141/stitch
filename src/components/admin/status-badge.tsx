import { Badge } from '@/components/ui/badge';
import { formatStatus, statusVariant } from '@/lib/admin/format';

export function StatusBadge({ status }: { status: string }) {
  return <Badge variant={statusVariant(status)}>{formatStatus(status)}</Badge>;
}
