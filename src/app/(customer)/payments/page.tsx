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
  Printer,
  X,
  FileText,
  Truck,
  Check,
  HelpCircle,
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
  const [selectedStatusFilter, setSelectedStatusFilter] =
    useState<string>('all');
  const [activeInvoice, setActiveInvoice] = useState<any | null>(null);

  const methods = [
    {
      id: 'cod',
      title: 'Cash on Delivery (COD)',
      desc: 'Pay cash to TCS / Leopards courier upon doorstep suit delivery.',
      icon: Wallet,
      isDefault: true,
      badge: 'Most Popular',
    },
    {
      id: 'jazzcash',
      title: 'JazzCash / EasyPaisa / Raast',
      desc: 'Instant direct mobile wallet payment with zero transaction fees.',
      icon: Smartphone,
      isDefault: false,
      badge: 'Instant Sync',
    },
    {
      id: 'card',
      title: 'Visa / Mastercard / UnionPay',
      desc: '256-bit encrypted card checkout for local and overseas Pakistanis.',
      icon: CreditCard,
      isDefault: false,
      badge: '256-Bit SSL',
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
      case 'card':
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

    const invoiceWindow = window.open('', '_blank');
    if (invoiceWindow) {
      invoiceWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invoice - ${tx.orderNumber}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #111; max-width: 800px; margin: 0 auto; line-height: 1.5; }
            .header { border-bottom: 2px solid #7E153A; padding-bottom: 20px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-start; }
            .brand { font-size: 26px; font-weight: 900; color: #7E153A; letter-spacing: -0.5px; }
            .subtitle { font-size: 13px; color: #666; margin-top: 4px; }
            .inv-badge { background: #fdf2f4; color: #7E153A; padding: 6px 14px; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; font-size: 13px; }
            .table { width: 100%; border-collapse: collapse; margin-top: 24px; }
            .table th { background: #f9fafb; padding: 12px; text-align: left; font-size: 12px; font-weight: bold; text-transform: uppercase; color: #4b5563; border-bottom: 2px solid #e5e7eb; }
            .table td { padding: 14px 12px; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
            .total-box { margin-top: 24px; text-align: right; border-top: 2px solid #e5e7eb; padding-top: 16px; }
            .total-amount { font-size: 22px; font-weight: 900; color: #7E153A; }
            .footer { margin-top: 40px; border-top: 1px dashed #d1d5db; padding-top: 20px; font-size: 12px; color: #6b7280; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="brand">TailorLink.pk</div>
              <div class="subtitle">Bespoke Custom Tailoring & Nationwide Doorstep Delivery</div>
            </div>
            <div>
              <div class="inv-badge">OFFICIAL INVOICE</div>
            </div>
          </div>

          <div class="grid">
            <div>
              <p><strong>Order Reference:</strong> ${tx.orderNumber}</p>
              <p><strong>Invoice Date:</strong> ${new Date(tx.date).toLocaleDateString()}</p>
              <p><strong>Payment Method:</strong> ${formatMethod(tx.method)}</p>
            </div>
            <div>
              <p><strong>Payment Status:</strong> <span style="color: ${tx.status === 'completed' ? '#059669' : '#d97706'}; font-weight: bold; text-transform: uppercase;">${tx.status}</span></p>
              <p><strong>Courier Logistics:</strong> TCS Tracked Doorstep Delivery</p>
              <p><strong>Currency:</strong> PKR (Pakistani Rupee)</p>
            </div>
          </div>

          <table class="table">
            <thead>
              <tr>
                <th>Service Description</th>
                <th style="text-align: right;">Amount (PKR)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>Bespoke Custom Tailoring & Stitching</strong><br>
                  <span style="color: #6b7280; font-size: 12px;">Fabric handling, precision cutting, collar styling, and finish craftsmanship</span>
                </td>
                <td style="text-align: right; font-weight: bold;">PKR ${tx.amount.toLocaleString()}</td>
              </tr>
              <tr>
                <td>
                  <strong>Nationwide TCS Courier Transit</strong><br>
                  <span style="color: #059669; font-size: 12px;">Doorstep delivery across Pakistan</span>
                </td>
                <td style="text-align: right; color: #059669; font-weight: bold;">Included</td>
              </tr>
            </tbody>
          </table>

          <div class="total-box">
            <div style="font-size: 13px; color: #6b7280; margin-bottom: 4px;">Total Amount Paid / Payable:</div>
            <div class="total-amount">PKR ${tx.amount.toLocaleString()}</div>
          </div>

          <div class="footer">
            <p>Thank you for choosing TailorLink.pk — Pakistan's Leading Online Tailoring Network.</p>
            <p>For questions or 7-day free alterations, contact support@tailorlink.pk or WhatsApp 0300-1234567.</p>
          </div>

          <script>window.onload = function() { window.print(); }</script>
        </body>
        </html>
      `);
      invoiceWindow.document.close();
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    if (selectedStatusFilter === 'all') return true;
    if (selectedStatusFilter === 'completed') return t.status === 'completed';
    if (selectedStatusFilter === 'pending') return t.status === 'pending';
    return true;
  });

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto space-y-5 sm:space-y-8 font-sans">
      {/* ── Top Header Banner ── */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-4 sm:p-6 md:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
        <div className="space-y-1 sm:space-y-1.5 min-w-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                Billing & Payments
              </h1>
              <span className="bg-blue-50 text-blue-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                100% Encrypted
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-500 max-w-xl leading-relaxed">
            Manage your payment methods, download official PDF tax invoices, and
            track your cash on delivery order settlements.
          </p>
        </div>

        {/* Total Spent Stat Pill */}
        <div className="bg-emerald-50/80 border border-emerald-200/60 p-3.5 sm:p-4 rounded-2xl flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-xs shrink-0">
            <Receipt size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-700">
              Total Tailoring Volume
            </p>
            <p className="text-base sm:text-lg font-black text-emerald-800">
              {loading ? '...' : `PKR ${totalSpent.toLocaleString()}`}
            </p>
          </div>
        </div>
      </div>

      {/* ── Payment Security & Buyer Confidence Micro-Strip ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 p-3.5 sm:p-4 flex items-center gap-3 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-red-50 text-[#7E153A] flex items-center justify-center shrink-0">
            <Wallet size={18} />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-extrabold text-gray-900 truncate">
              Cash on Delivery (COD)
            </h4>
            <p className="text-[11px] text-gray-500 truncate">
              Inspect suit at doorstep before paying
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-3.5 sm:p-4 flex items-center gap-3 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Smartphone size={18} />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-extrabold text-gray-900 truncate">
              JazzCash & EasyPaisa
            </h4>
            <p className="text-[11px] text-gray-500 truncate">
              Zero extra fees on wallet transfers
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-3.5 sm:p-4 flex items-center gap-3 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <ShieldCheck size={18} />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-extrabold text-gray-900 truncate">
              7-Day Free Alteration
            </h4>
            <p className="text-[11px] text-gray-500 truncate">
              100% fit satisfaction guarantee
            </p>
          </div>
        </div>
      </div>

      {/* ── Payment Methods Grid ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
            <CreditCard size={14} className="text-[#7E153A]" /> Supported
            Payment Channels
          </h3>
          <span className="text-[11px] text-gray-400">
            All Pakistani Banks & Wallets
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {methods.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.id}
                className={`bg-white rounded-2xl sm:rounded-3xl border p-4 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 ${
                  m.isDefault
                    ? 'border-[#7E153A]/40 ring-2 ring-[#7E153A]/10 bg-gradient-to-b from-white to-red-50/10'
                    : 'border-gray-100'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-red-50 text-[#7E153A] flex items-center justify-center font-bold">
                      <Icon size={20} />
                    </div>
                    {m.badge && (
                      <span className="text-[10px] font-bold text-[#7E153A] bg-red-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-red-100">
                        {m.badge}
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

                <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 size={13} /> Active & Verified
                  </span>
                  {m.isDefault && (
                    <span className="text-[10px] font-bold text-gray-400 uppercase">
                      Default
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Transactions & Invoices History ── */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-4 sm:p-6 md:p-8 shadow-xs space-y-5">
        {/* Section Header with Status Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div className="space-y-0.5">
            <h2 className="text-base sm:text-lg font-extrabold text-gray-900 flex items-center gap-2">
              <Receipt size={18} className="text-[#7E153A]" /> Tailoring
              Invoices & Receipts
            </h2>
            <p className="text-xs text-gray-500">
              Download tax invoices and proof of payment for your tailoring
              orders
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
            <button
              onClick={() => setSelectedStatusFilter('all')}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all shrink-0 cursor-pointer ${
                selectedStatusFilter === 'all'
                  ? 'bg-[#7E153A] text-white border-[#7E153A]'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              All ({transactions.length})
            </button>
            <button
              onClick={() => setSelectedStatusFilter('completed')}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all shrink-0 cursor-pointer ${
                selectedStatusFilter === 'completed'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              Paid (
              {transactions.filter((t) => t.status === 'completed').length})
            </button>
            <button
              onClick={() => setSelectedStatusFilter('pending')}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all shrink-0 cursor-pointer ${
                selectedStatusFilter === 'pending'
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              Pending (
              {transactions.filter((t) => t.status === 'pending').length})
            </button>
          </div>
        </div>

        {/* Invoice List */}
        {loading ? (
          <div className="py-14 text-center space-y-2">
            <Loader2
              size={32}
              className="animate-spin text-[#7E153A] mx-auto mb-2"
            />
            <p className="text-xs font-semibold text-gray-600">
              Loading your invoices...
            </p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="py-14 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-red-50 text-[#7E153A] flex items-center justify-center mx-auto">
              <Receipt size={28} />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-extrabold text-gray-900">
                {selectedStatusFilter === 'all'
                  ? 'No Payment Receipts Found'
                  : `No ${selectedStatusFilter} invoices found`}
              </h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Your order invoices and receipts will appear here automatically
                when you place a custom stitching order.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((tx) => (
              <div
                key={tx.id}
                className="bg-gray-50/70 hover:bg-gray-50 p-4 sm:p-5 rounded-2xl border border-gray-100 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Left Section: Order & Meta */}
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono font-extrabold text-sm text-gray-900">
                      {tx.orderNumber}
                    </span>

                    {/* Status Badge */}
                    <span
                      className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${
                        tx.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : tx.status === 'refunded'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {tx.status === 'completed'
                        ? 'Paid'
                        : tx.status === 'refunded'
                          ? 'Refunded'
                          : 'COD / Pending'}
                    </span>

                    {tx.orderId && (
                      <Link
                        href={`/orders/${tx.orderId}`}
                        className="text-[#7E153A] hover:underline flex items-center gap-1 text-xs font-semibold"
                      >
                        Order Details <ExternalLink size={11} />
                      </Link>
                    )}
                  </div>

                  <p className="text-xs text-gray-500">
                    Paid via{' '}
                    <span className="font-semibold text-gray-700">
                      {formatMethod(tx.method)}
                    </span>{' '}
                    ·{' '}
                    {new Date(tx.date).toLocaleDateString(undefined, {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                {/* Right Section: Amount & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-200/60">
                  <div className="text-left sm:text-right">
                    <span className="text-base sm:text-lg font-black text-gray-900 block">
                      PKR {tx.amount.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">
                      Doorstep Delivery Included
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      onClick={() => setActiveInvoice(tx)}
                      variant="outline"
                      size="sm"
                      className="h-9 text-xs font-bold border-gray-200 hover:bg-white text-gray-700 rounded-xl cursor-pointer"
                    >
                      <FileText size={13} className="mr-1 text-[#7E153A]" />{' '}
                      Preview
                    </Button>

                    <Button
                      onClick={() => handleDownloadInvoice(tx)}
                      size="sm"
                      className="h-9 text-xs font-bold bg-[#7E153A] hover:bg-[#630f2d] text-white rounded-xl shadow-xs cursor-pointer"
                    >
                      <Download size={13} className="mr-1" /> PDF
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── In-App Printable Invoice Viewer Modal ── */}
      {activeInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-xl w-full p-4 sm:p-6 md:p-8 shadow-2xl space-y-5 max-h-[92vh] flex flex-col justify-between overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
            {/* Mobile Grab Bar */}
            <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto sm:hidden shrink-0" />

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3.5 shrink-0">
              <div className="space-y-0.5">
                <h3 className="text-lg font-extrabold text-gray-900">
                  Invoice #{activeInvoice.orderNumber}
                </h3>
                <p className="text-xs text-gray-500">
                  Official TailorLink.pk digital receipt
                </p>
              </div>

              <button
                onClick={() => setActiveInvoice(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors cursor-pointer shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Invoice Content (Scrollable) */}
            <div className="flex-1 overflow-y-auto px-1 py-1 space-y-4 text-xs">
              {/* Top Banner Card */}
              <div className="bg-gradient-to-r from-red-50/80 to-red-100/50 p-4 rounded-2xl border border-red-200/60 flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-[#7E153A] text-base">
                    TailorLink.pk
                  </h4>
                  <p className="text-[11px] text-gray-600">
                    Pakistan&apos;s Digital Tailoring Platform
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-extrabold bg-[#7E153A] text-white px-2.5 py-1 rounded-full uppercase">
                    {activeInvoice.status}
                  </span>
                </div>
              </div>

              {/* Order Metadata Grid */}
              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                <div>
                  <span className="text-gray-400 font-medium block">
                    Order Number:
                  </span>
                  <span className="font-mono font-bold text-gray-900">
                    {activeInvoice.orderNumber}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 font-medium block">
                    Invoice Date:
                  </span>
                  <span className="font-bold text-gray-900">
                    {new Date(activeInvoice.date).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 font-medium block">
                    Payment Method:
                  </span>
                  <span className="font-bold text-gray-900">
                    {formatMethod(activeInvoice.method)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 font-medium block">
                    Logistics:
                  </span>
                  <span className="font-bold text-gray-900">
                    TCS Doorstep Courier
                  </span>
                </div>
              </div>

              {/* Line Items Breakdown */}
              <div className="border border-gray-100 rounded-2xl overflow-hidden">
                <div className="bg-gray-50 px-3.5 py-2 font-bold text-gray-700 flex justify-between border-b border-gray-100">
                  <span>Item / Description</span>
                  <span>Amount</span>
                </div>
                <div className="p-3.5 space-y-2.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-gray-900">
                        Custom Suit Tailoring & Finishing
                      </p>
                      <p className="text-[11px] text-gray-500">
                        Master tailor cut, neck & sleeve styling, stitching
                      </p>
                    </div>
                    <span className="font-extrabold text-gray-900 shrink-0 pl-3">
                      PKR {activeInvoice.amount.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-start text-emerald-700 pt-1 border-t border-gray-100">
                    <div>
                      <p className="font-bold">Nationwide Doorstep Delivery</p>
                      <p className="text-[11px] text-emerald-600">
                        Tracked courier transit
                      </p>
                    </div>
                    <span className="font-bold shrink-0 pl-3">
                      Included (Free)
                    </span>
                  </div>
                </div>
              </div>

              {/* Total Box */}
              <div className="bg-gray-50/80 p-3.5 rounded-2xl border border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-gray-600">
                    Total Invoice Amount
                  </span>
                  <p className="text-[10px] text-gray-400">
                    All Pakistani sales taxes included
                  </p>
                </div>
                <span className="text-lg font-black text-[#7E153A]">
                  PKR {activeInvoice.amount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-100 pt-3.5 flex flex-col-reverse sm:flex-row items-center justify-between gap-2.5 shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setActiveInvoice(null)}
                className="w-full sm:w-auto h-11 px-6 rounded-xl text-xs font-semibold cursor-pointer border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Close
              </Button>

              <Button
                type="button"
                onClick={() => handleDownloadInvoice(activeInvoice)}
                className="w-full sm:w-auto h-11 px-8 rounded-xl text-xs font-bold bg-[#7E153A] hover:bg-[#630f2d] text-white shadow-md shadow-[#7E153A]/20 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Printer size={15} /> Print & Save PDF
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
