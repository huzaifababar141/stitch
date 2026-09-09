'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Gift,
  Copy,
  Check,
  Share2,
  Users,
  Award,
  Sparkles,
  ArrowRight,
  MessageCircle,
  Loader2,
  Clock,
  CheckCircle2,
  Send,
  ShoppingBag,
  Coins,
  QrCode,
  HeartHandshake,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export default function ReferralPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [loading, setLoading] = useState(true);

  const [data, setData] = useState<{
    referralCode: string;
    friendsInvited: number;
    successfulOrders: number;
    totalCreditsEarned: number;
    referrals: any[];
  }>({
    referralCode: '',
    friendsInvited: 0,
    successfulOrders: 0,
    totalCreditsEarned: 0,
    referrals: [],
  });

  const loadReferralData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/referrals');
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setData(json.data);
        }
      }
    } catch (err) {
      console.error('Failed to load referral data:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadReferralData();
  }, [loadReferralData]);

  const refCode =
    data.referralCode ||
    (user ? `TLK-${user.id.slice(0, 6).toUpperCase()}` : 'TLK-GUEST');

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/?ref=${refCode}`
      : `https://tailorlink.pk/?ref=${refCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast({
      title: 'Invite Link Copied! 🎉',
      description: 'Your unique referral link is ready to share.',
    });
    setTimeout(() => setCopied(false), 3000);
  };

  const handleCopyCodeOnly = () => {
    navigator.clipboard.writeText(refCode);
    setCopiedCode(true);
    toast({
      title: 'Code Copied! 🏷️',
      description: `Referral code "${refCode}" copied to clipboard.`,
    });
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Get PKR 500 Tailoring Discount on TailorLink.pk',
          text: `Get PKR 500 off your first custom unstitched suit tailoring order! Use my referral invite:`,
          url: shareUrl,
        });
      } catch (err) {
        // Fallback to copy link
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const whatsappShareText = encodeURIComponent(
    `Assalam-o-Alaikum! ✨ Get PKR 500 OFF your first custom unstitched suit tailoring at TailorLink.pk with free doorstep pickup & delivery! Use my invite link:\n${shareUrl}`
  );

  return (
    <div className="w-full min-w-0 max-w-5xl mx-auto space-y-5 sm:space-y-8 font-sans">
      {/* ── Top Hero Banner ── */}
      <div className="bg-gradient-to-br from-[#7E153A] via-[#8c1740] to-[#5e0d29] text-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 shadow-lg relative overflow-hidden">
        <div className="max-w-2xl relative z-10 space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider">
            <Gift size={14} /> Refer & Earn Program
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight">
            Give PKR 500, Get PKR 500
          </h1>
          <p className="text-white/85 text-xs sm:text-sm leading-relaxed">
            Invite your friends and family to experience hassle-free doorstep
            custom stitching. They get{' '}
            <strong className="text-amber-200">PKR 500 OFF</strong> their first
            unstitched suit order, and you earn{' '}
            <strong className="text-amber-200">PKR 500 tailoring credit</strong>{' '}
            when their suit is delivered!
          </p>
        </div>

        <Gift
          size={160}
          className="absolute -bottom-8 -right-8 text-white/10 pointer-events-none hidden sm:block"
        />
      </div>

      {/* ── Referral Link & Sharing Hub ── */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-4 sm:p-6 md:p-8 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-gray-900 flex items-center gap-2">
              <Share2 size={18} className="text-[#7E153A]" /> Your Unique
              Referral Link
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Share via WhatsApp, SMS, or social media to start earning instant
              rewards
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto bg-red-50/80 border border-red-100 px-3 py-1.5 rounded-xl">
            <span className="text-xs text-gray-600 font-medium">Code:</span>
            <span className="font-mono font-black text-sm text-[#7E153A]">
              {refCode}
            </span>
            <button
              onClick={handleCopyCodeOnly}
              className="text-gray-400 hover:text-[#7E153A] p-0.5 transition-colors cursor-pointer"
              title="Copy Code Only"
            >
              {copiedCode ? (
                <Check size={14} className="text-emerald-600" />
              ) : (
                <Copy size={14} />
              )}
            </button>
          </div>
        </div>

        {/* Input & Action Buttons Row */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
            <Input
              readOnly
              value={shareUrl}
              className="h-11 sm:h-12 bg-gray-50/80 border-gray-200 text-xs rounded-xl font-mono text-gray-700 flex-1 truncate"
            />

            <Button
              onClick={handleCopyLink}
              className="h-11 sm:h-12 px-6 rounded-xl bg-[#7E153A] hover:bg-[#630f2d] text-white text-xs font-bold cursor-pointer shrink-0 shadow-md shadow-[#7E153A]/20 flex items-center justify-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check size={16} className="text-emerald-300" /> Copied!
                </>
              ) : (
                <>
                  <Copy size={16} /> Copy Link
                </>
              )}
            </Button>

            <a
              href={`https://wa.me/?text=${whatsappShareText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto shrink-0"
            >
              <Button
                type="button"
                className="w-full sm:w-auto h-11 sm:h-12 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5"
              >
                <MessageCircle size={16} /> WhatsApp Share
              </Button>
            </a>
          </div>

          <p className="text-[11px] text-gray-400 text-center sm:text-left">
            Credits are automatically credited to your TailorLink wallet once
            your friend&apos;s suit is delivered.
          </p>
        </div>
      </div>

      {/* ── How It Works 3-Step Guide ── */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-4 sm:p-6 md:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles size={14} className="text-[#7E153A]" /> How the Referral
            Program Works
          </h3>
          <span className="text-[11px] text-emerald-600 font-bold">
            Simple 3 Steps
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-gray-50/70 p-4 rounded-2xl border border-gray-100 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-red-50 text-[#7E153A] font-black text-xs flex items-center justify-center">
              1
            </div>
            <h4 className="text-xs font-extrabold text-gray-900">
              Send Your Invite Link
            </h4>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Share your link or code with friends, colleagues, or family on
              WhatsApp.
            </p>
          </div>

          <div className="bg-gray-50/70 p-4 rounded-2xl border border-gray-100 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 font-black text-xs flex items-center justify-center">
              2
            </div>
            <h4 className="text-xs font-extrabold text-gray-900">
              Friend Gets PKR 500 OFF
            </h4>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              They register with your code and get PKR 500 discount on their
              first suit tailoring.
            </p>
          </div>

          <div className="bg-gray-50/70 p-4 rounded-2xl border border-gray-100 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 font-black text-xs flex items-center justify-center">
              3
            </div>
            <h4 className="text-xs font-extrabold text-gray-900">
              You Earn PKR 500 Credit
            </h4>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              When their order is delivered, PKR 500 credit is added to your
              account instantly.
            </p>
          </div>
        </div>
      </div>

      {/* ── Rewards Stat Metrics Matrix ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-4 sm:p-6 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-red-50 text-[#7E153A] flex items-center justify-center font-bold">
            <Users size={20} />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-gray-900 block">
            {loading ? (
              <Loader2 size={24} className="animate-spin text-gray-400" />
            ) : (
              data.friendsInvited
            )}
          </span>
          <p className="text-xs font-bold text-gray-500">Friends Joined</p>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-4 sm:p-6 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <Award size={20} />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-gray-900 block">
            {loading ? (
              <Loader2 size={24} className="animate-spin text-gray-400" />
            ) : (
              data.successfulOrders
            )}
          </span>
          <p className="text-xs font-bold text-gray-500">Delivered Orders</p>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-4 sm:p-6 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <Coins size={20} />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-gray-900 block">
            {loading ? (
              <Loader2 size={24} className="animate-spin text-gray-400" />
            ) : (
              `PKR ${data.totalCreditsEarned.toLocaleString()}`
            )}
          </span>
          <p className="text-xs font-bold text-gray-500">
            Total Credits Earned
          </p>
        </div>
      </div>

      {/* ── Referral Activity List ── */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-4 sm:p-6 md:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
            <HeartHandshake size={18} className="text-[#7E153A]" /> Referral
            Activity Log
          </h3>
          {data.referrals.length > 0 && (
            <span className="text-xs font-bold text-gray-400">
              {data.referrals.length}{' '}
              {data.referrals.length === 1 ? 'invite' : 'invites'}
            </span>
          )}
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <Loader2
              size={28}
              className="animate-spin text-[#7E153A] mx-auto mb-2"
            />
            <p className="text-xs text-gray-500">Loading referral history...</p>
          </div>
        ) : data.referrals.length === 0 ? (
          <div className="py-12 text-center space-y-2.5">
            <div className="w-14 h-14 rounded-full bg-red-50 text-[#7E153A] flex items-center justify-center mx-auto">
              <Gift size={26} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-extrabold text-gray-900">
                No referral activity recorded yet
              </p>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                Share your unique invite link with friends and family on
                WhatsApp to earn tailoring credits!
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 text-xs">
            {data.referrals.map((item) => (
              <div
                key={item.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-gray-50/50 px-2 rounded-xl transition-colors"
              >
                <div>
                  <p className="font-extrabold text-sm text-gray-900">
                    {item.refereeName}
                  </p>
                  <p className="text-gray-500 text-[11px] mt-0.5">
                    Joined on{' '}
                    {new Date(item.joinedDate).toLocaleDateString(undefined, {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                    {item.orderNumber ? ` · Order #${item.orderNumber}` : ''}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full font-extrabold text-[11px] ${
                      item.rewardGiven
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {item.rewardGiven
                      ? `+PKR ${item.rewardAmount.toLocaleString()} Credited`
                      : 'Order in Progress'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
