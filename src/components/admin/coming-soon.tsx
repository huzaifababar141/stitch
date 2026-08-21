import type { ComponentType } from 'react';

interface ComingSoonProps {
  icon: ComponentType<{ size?: number | string; className?: string }>;
  title: string;
  description?: string;
}

/**
 * On-brand placeholder for admin sections that are part of the shell's
 * navigation but not yet built (Quality Control, Delivery Sync, Settings).
 * Keeps every nav link functional instead of 404-ing.
 */
export function ComingSoon({
  icon: Icon,
  title,
  description,
}: ComingSoonProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-[#7E153A]">
        <Icon size={30} />
      </div>
      <h1 className="text-xl font-bold text-gray-900">{title}</h1>
      <p className="mt-2 max-w-md text-sm text-gray-500">
        {description ?? 'This module is coming soon.'}
      </p>
      <span className="mt-5 inline-block rounded-full bg-gray-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
        Coming soon
      </span>
    </div>
  );
}
