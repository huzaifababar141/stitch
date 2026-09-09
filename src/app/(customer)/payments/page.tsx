'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  ShieldCheck,
  Smartphone,
  Wallet,
  CheckCircle2,
  Download,
  Receipt,
  Building,
  Plus,
  Loader2,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export default function PaymentsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);

  const methods = [
    {
      id: 'cod',
      title: 'Cash on Doorstep Delivery (COD)',
      desc: 'Pay cash upon delivery via TCS courier. Free across Pakistan.',
      icon: Wallet,
      isDefault: true,
    },
    {
      id: 'jazzcash',
      title: 'JazzCash / EasyPaisa Wallet',
      desc: 'Instant direct mobile wallet checkout.',
      icon: Smartphone,
      isDefault: false,
    },
    {
      id: 'card',
      title: 'Visa / Mastercard / UnionPay',
      desc: '256-bit encrypted global checkout via Paddle.',
      icon: CreditCard,
      isDefault: false,
    },
  ];

  const loadPayments = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/payments');
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setTransactions(json.data.transactions || []);
          setTotalSpent(json.data.totalSpent || 0);
        }
      }
    } catch (err) {
      console.error('Failed to load payment transactions:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const formatMethod = (method: string) => {
    switch (method?.toLowerCase()) {
      case 'cod':
        return 'Cash on Delivery (TCS)';
      case 'jazzcash':
        return 'JazzCash Mobile';
      case 'easypaisa':
        return 'EasyPaisa Mobile';
      case 'paddle':
        return 'Debit / Credit Card';
      case 'bank_transfer':
        return 'Direct Bank Transfer';
      default:
        return 'Online Checkout';
    }
  };

  const handleDownloadInvoice = (tx: any) => {
    toast({
      title: 'Invoice Generated',
      description: `Invoice for Order #${tx.orderNumber} prepared.`,
    });
    // Trigger printable invoice window
    const invoiceWindow = window.open('', '_blank');
    if (invoiceWindow) {
      invoiceWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invoice - ${tx.orderNumber}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #111; }
            .header { border-bottom: 2px solid #7E153A; padding-bottom: 15px; margin-bottom: 20px; }
            .title { font-size: 24px; font-weight: bold; color: #7E153A; }
            .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .table th, .table td { padding: 10px; border-bottom: 1px solid #eee; text-align: left; font-size: 14px; }
            .total { font-weight: bold; font-size: 16px; margin-top: 20px; text-align: right; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">TailorLink.pk - Official Invoice</div>
            <p>Digital Custom Tailoring Platform</p>
          </div>
          <p><strong>Order Number:</strong> ${tx.orderNumber}</p>
          <p><strong>Date:</strong> ${new Date(tx.date).toLocaleDateString()}</p>
          <p><strong>Payment Method:</strong> ${formatMethod(tx.method)}</p>
          <p><strong>Status:</strong> ${tx.status.toUpperCase()}</p>
          <table class="table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Custom Suit Tailoring & TCS Doorstep Delivery</td>
                <td>PKR ${tx.amount.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
          <div class="total">Total Paid: PKR ${tx.amount.toLocaleString()}</div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
        </html>
      `);
      invoiceWindow.document.close();
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 font-sans">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck size={14} /> 100% Encrypted & Verified
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Payments & Billing
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage your payment preferences, invoice receipts, and cash on
            delivery authorizations.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200/60 p-4 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-xs">
            <Receipt size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900">
              Total Tailoring Volume
            </p>
            <p className="text-sm font-black text-emerald-800">
              {loading ? '...' : `PKR ${totalSpent.toLocaleString()}`}
            </p>
          </div>
        </div>
      </div>

      {/* Methods Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {methods.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.id}
              className={`bg-white rounded-3xl border p-6 shadow-xs flex flex-col justify-between space-y-4 ${
                m.isDefault
                  ? 'border-[#7E153A]/40 ring-2 ring-[#7E153A]/10'
                  : 'border-gray-100'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-red-50 text-[#7E153A] flex items-center justify-center font-bold">
                    <Icon size={20} />
                  </div>
                  {m.isDefault && (
                    <span className="text-[10px] font-bold text-[#7E153A] bg-red-50 px-2.5 py-0.5 rounded-full uppercase">
                      Default Method
                    </span>
                  )}
                </div>
                <h3 className="font-extrabold text-sm text-gray-900">
                  {m.title}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {m.desc}
                </p>
              </div>

              <div className="border-t border-gray-100 pt-3">
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 size={13} /> Active & Verified
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Transactions History */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
          <Receipt size={18} className="text-[#7E153A]" /> Tailoring Invoices &
          Receipts
        </h2>

        {loading ? (
          <div className="py-12 text-center">
            <Loader2
              size={24}
              className="animate-spin text-[#7E153A] mx-auto mb-2"
            />
            <p className="text-xs text-gray-500">Loading invoices...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <Receipt size={32} className="text-gray-300 mx-auto" />
            <p className="text-xs font-bold text-gray-700">
              No payment receipts yet
            </p>
            <p className="text-xs text-gray-400">
              Your order invoices and receipts will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 text-xs">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/50 px-2 rounded-xl transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-gray-900">
                      {tx.orderNumber}
                    </span>
                    {tx.orderId && (
                      <Link
                        href={`/orders/${tx.orderId}`}
                        className="text-[#7E153A] hover:underline flex items-center gap-0.5 text-[11px] font-semibold"
                      >
                        View Order <ExternalLink size={10} />
                      </Link>
                    )}
                  </div>
                  <p className="text-gray-500 mt-0.5">
                    Paid via {formatMethod(tx.method)} ·{' '}
                    {new Date(tx.date).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-black text-sm text-gray-900">
                    PKR {tx.amount.toLocaleString()}
                  </span>
                  <span
                    className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] ${
                      tx.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-700'
                        : tx.status === 'refunded'
                          ? 'bg-red-50 text-red-700'
                          : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {tx.status === 'completed'
                      ? 'Paid'
                      : tx.status === 'refunded'
                        ? 'Refunded'
                        : 'Pending'}
                  </span>
                  <Button
                    onClick={() => handleDownloadInvoice(tx)}
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs font-bold text-gray-600 hover:text-gray-900 cursor-pointer"
                  >
                    <Download size={13} className="mr-1" /> Invoice PDF
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
