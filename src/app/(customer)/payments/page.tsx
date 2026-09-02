'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentsPage() {
  const [methods] = useState([
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
  ]);

  const [transactions] = useState([
    {
      id: 'tx_101',
      orderNumber: 'TLK-9021',
      amount: 'PKR 4,850',
      method: 'JazzCash Mobile',
      status: 'Paid',
      date: 'Aug 14, 2026',
    },
    {
      id: 'tx_102',
      orderNumber: 'TLK-8814',
      amount: 'PKR 14,500',
      method: 'Cash On Delivery',
      status: 'Paid',
      date: 'Jul 28, 2026',
    },
  ]);

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
                  <CheckCircle2 size={13} /> Active & Ready
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

        <div className="divide-y divide-gray-100 text-xs">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <span className="font-mono font-bold text-gray-900">
                  {tx.orderNumber}
                </span>
                <p className="text-gray-500 mt-0.5">
                  Paid via {tx.method} · {tx.date}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <span className="font-black text-sm text-gray-900">
                  {tx.amount}
                </span>
                <span className="bg-emerald-50 text-emerald-700 font-bold px-2.5 py-0.5 rounded-full">
                  {tx.status}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs font-bold text-gray-600 hover:text-gray-900"
                >
                  <Download size={13} className="mr-1" /> Invoice PDF
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
