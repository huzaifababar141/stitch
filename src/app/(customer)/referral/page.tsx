'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export default function ReferralPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
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

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast({
      title: 'Link Copied! 🎉',
      description: 'Your unique referral link has been copied to clipboard.',
    });
    setTimeout(() => setCopied(false), 3000);
  };

  const whatsappShareText = encodeURIComponent(
    `Get PKR 500 off your first unstitched designer suit tailoring at TailorLink! Use my invite link: ${shareUrl}`
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 font-sans">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-[#7E153A] to-[#911642] text-white rounded-3xl p-8 sm:p-10 shadow-lg relative overflow-hidden">
        <div className="max-w-2xl relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider">
            <Gift size={14} /> Refer & Earn Program
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            Give PKR 500, Get PKR 500
          </h1>
          <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
            Invite your friends and family to experience hassle-free doorstep
            custom stitching. They get PKR 500 off their first order, and you
            get PKR 500 tailoring credit when their suit is delivered!
          </p>
        </div>

        <Gift
          size={140}
          className="absolute -bottom-6 -right-6 text-white/10 pointer-events-none"
        />
      </div>

      {/* Share Section */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
              <Share2 size={18} className="text-[#7E153A]" /> Your Unique
              Referral Link
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Your referral code:{' '}
              <span className="font-mono font-bold text-[#7E153A]">
                {refCode}
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            readOnly
            value={shareUrl}
            className="h-12 bg-gray-50 border-gray-200 text-xs rounded-xl font-mono text-gray-700"
          />
          <Button
            onClick={handleCopy}
            className="h-12 px-6 rounded-xl bg-[#7E153A] hover:bg-[#630f2d] text-white text-xs font-bold cursor-pointer shrink-0 shadow-md shadow-[#7E153A]/20"
          >
            {copied ? (
              <>
                <Check size={16} className="mr-1.5" /> Copied!
              </>
            ) : (
              <>
                <Copy size={16} className="mr-1.5" /> Copy Link
              </>
            )}
          </Button>
          <a
            href={`https://wa.me/?text=${whatsappShareText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0"
          >
            <Button
              variant="outline"
              className="h-12 px-6 rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-xs font-bold cursor-pointer w-full sm:w-auto"
            >
              <MessageCircle size={16} className="mr-1.5" /> Share on WhatsApp
            </Button>
          </a>
        </div>
      </div>

      {/* Rewards Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-red-50 text-[#7E153A] flex items-center justify-center font-bold">
            <Users size={20} />
          </div>
          <span className="text-2xl font-black text-gray-900 block">
            {loading ? (
              <Loader2 size={24} className="animate-spin text-gray-400" />
            ) : (
              data.friendsInvited
            )}
          </span>
          <p className="text-xs font-bold text-gray-500">Friends Joined</p>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <Award size={20} />
          </div>
          <span className="text-2xl font-black text-gray-900 block">
            {loading ? (
              <Loader2 size={24} className="animate-spin text-gray-400" />
            ) : (
              data.successfulOrders
            )}
          </span>
          <p className="text-xs font-bold text-gray-500">Successful Orders</p>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <Sparkles size={20} />
          </div>
          <span className="text-2xl font-black text-gray-900 block">
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

      {/* Referrals Activity List */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs space-y-4">
        <h3 className="text-base font-extrabold text-gray-900">
          Referral Activity
        </h3>

        {loading ? (
          <div className="py-8 text-center">
            <Loader2
              size={24}
              className="animate-spin text-[#7E153A] mx-auto"
            />
          </div>
        ) : data.referrals.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <p className="text-xs text-gray-500">
              No referral activity recorded yet.
            </p>
            <p className="text-xs text-gray-400">
              Share your link with friends on WhatsApp to start earning
              tailoring discounts!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 text-xs">
            {data.referrals.map((item) => (
              <div
                key={item.id}
                className="py-3.5 flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-gray-900">{item.refereeName}</p>
                  <p className="text-gray-400 text-[11px]">
                    Joined {new Date(item.joinedDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                      item.rewardGiven
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {item.rewardGiven
                      ? `+PKR ${item.rewardAmount} Credited`
                      : 'Order Pending'}
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
