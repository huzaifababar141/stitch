'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Users, ShieldCheck, Ban, CircleCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog';
import { EmptyState } from '@/components/admin/empty-state';
import { useAuth } from '@/hooks/useAuth';
import { useUser, useChangeRole, useSetBlocked } from '@/hooks/admin/use-users';
import {
  USER_ROLES,
  formatRole,
  roleVariant,
  formatStatus,
  formatDate,
  formatDateTime,
  fullName,
} from '@/lib/admin/format';

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const isSuperAdmin = currentUser?.app_metadata?.role === 'super_admin';

  const { data: user, isLoading, isError } = useUser(id);
  const unblock = useSetBlocked(id);
  const [roleOpen, setRoleOpen] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);

  if (isLoading) return <UserSkeleton />;

  if (isError || !user) {
    return (
      <Card className="p-4">
        <EmptyState
          icon={Users}
          title="User not found"
          description="This user could not be loaded."
        />
        <div className="flex justify-center pb-4">
          <Link href="/admin/users">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to users
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/users"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-[#7E153A]"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Users
        </Link>

        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold text-gray-900">
                {fullName(user.firstName, user.lastName)}
              </h1>
              <Badge variant={roleVariant(user.role)}>
                {formatRole(user.role)}
              </Badge>
              {user.isBlocked ? (
                <Badge variant="destructive">Blocked</Badge>
              ) : user.isActive ? (
                <Badge variant="success">Active</Badge>
              ) : (
                <Badge variant="secondary">Inactive</Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-500">{user.phone}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {isSuperAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRoleOpen(true)}
              >
                <ShieldCheck className="mr-2 h-4 w-4" />
                Change role
              </Button>
            )}
            {user.isBlocked ? (
              <Button
                variant="outline"
                size="sm"
                disabled={unblock.isPending}
                onClick={() => unblock.mutate({ isBlocked: false })}
              >
                <CircleCheck className="mr-2 h-4 w-4 text-green-600" />
                Unblock
              </Button>
            ) : (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setBlockOpen(true)}
              >
                <Ban className="mr-2 h-4 w-4" />
                Block
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
            <InfoRow label="Phone" value={user.phone} />
            <InfoRow label="Email" value={user.email ?? '—'} />
            <InfoRow
              label="Gender"
              value={user.gender ? formatStatus(user.gender) : '—'}
            />
            <InfoRow
              label="Phone verified"
              value={user.phoneVerified ? 'Yes' : 'No'}
            />
            <InfoRow
              label="Email verified"
              value={user.emailVerified ? 'Yes' : 'No'}
            />
            <InfoRow
              label="Last login"
              value={
                user.lastLoginAt ? formatDateTime(user.lastLoginAt) : 'Never'
              }
            />
            <InfoRow label="Joined" value={formatDate(user.createdAt)} />
          </CardContent>
        </Card>

        {user.isBlocked && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <Ban className="h-4 w-4" />
                Blocked
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              <InfoRow label="Reason" value={user.blockReason ?? '—'} />
              <InfoRow
                label="Blocked at"
                value={user.blockedAt ? formatDateTime(user.blockedAt) : '—'}
              />
            </CardContent>
          </Card>
        )}
      </div>

      {roleOpen && (
        <ChangeRoleModal
          userId={id}
          current={user.role}
          onClose={() => setRoleOpen(false)}
        />
      )}
      {blockOpen && (
        <BlockModal
          userId={id}
          name={fullName(user.firstName, user.lastName)}
          onClose={() => setBlockOpen(false)}
        />
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-gray-50 py-2 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="text-right font-medium text-gray-800">{value}</span>
    </div>
  );
}

function UserSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-56 w-full" />
    </div>
  );
}

/* --------------------------------- modals -------------------------------- */

function ChangeRoleModal({
  userId,
  current,
  onClose,
}: {
  userId: string;
  current: string;
  onClose: () => void;
}) {
  const changeRole = useChangeRole(userId);
  const [role, setRole] = useState(current);

  const submit = () => {
    if (role === current) return onClose();
    changeRole.mutate(role, { onSuccess: onClose });
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change role</DialogTitle>
          <DialogDescription>
            The new role takes effect on the user&apos;s next request. Role
            authority is stored securely.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Label htmlFor="role" className="mb-1.5 block">
            Role
          </Label>
          <Select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            {USER_ROLES.map((r) => (
              <option key={r} value={r}>
                {formatRole(r)}
              </option>
            ))}
          </Select>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={changeRole.isPending}
          >
            Cancel
          </Button>
          <Button onClick={submit} disabled={changeRole.isPending}>
            {changeRole.isPending ? 'Updating…' : 'Update role'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BlockModal({
  userId,
  name,
  onClose,
}: {
  userId: string;
  name: string;
  onClose: () => void;
}) {
  const block = useSetBlocked(userId);
  const [reason, setReason] = useState('');

  const submit = () =>
    block.mutate(
      { isBlocked: true, reason: reason.trim() || undefined },
      { onSuccess: onClose }
    );

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Block {name}?</DialogTitle>
          <DialogDescription>
            A blocked user is signed out and cannot access the platform until
            unblocked.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Label htmlFor="reason" className="mb-1.5 block">
            Reason (optional)
          </Label>
          <Textarea
            id="reason"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why is this user being blocked?"
          />
        </DialogBody>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={block.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={submit}
            disabled={block.isPending}
          >
            {block.isPending ? 'Blocking…' : 'Block user'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
