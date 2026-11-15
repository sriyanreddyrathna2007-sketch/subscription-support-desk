import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import {
  Receipt,
  Download,
  Filter,
  CreditCard,
  Sparkles,
  Search,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export const BillingPage = () => {
  const toast = useToast();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  const fetchBilling = async () => {
    try {
      const data = await api.getBillingHistory();
      setRecords(data);
    } catch (err) {
      toast.error('Failed to load billing history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBilling();
  }, []);

  const handleDownloadInvoice = (invoice) => {
    // Generate downloadable text / invoice receipt
    const receiptContent = `=========================================
SUPPORTDESK AI - OFFICIAL INVOICE RECEIPT
=========================================
Invoice Number: ${invoice.invoice_number}
Date:           ${new Date(invoice.billing_date).toLocaleDateString()}
Plan:           ${invoice.plan_name}
Total Amount:   $${invoice.amount.toFixed(2)} ${invoice.currency}
Status:         ${invoice.status}
Payment Method: ${invoice.payment_method}
-----------------------------------------
This is a simulated invoice receipt generated
in SupportDesk AI Demo Mode.
=========================================`;

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoice.invoice_number}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded receipt for ${invoice.invoice_number}`);
  };

  if (loading) {
    return <LoadingSpinner text="Loading billing records..." />;
  }

  const filteredRecords = records.filter((r) => {
    const matchesStatus = statusFilter === 'All' || r.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSearch =
      !search ||
      r.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
      r.plan_name.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">Billing History</h1>
          <p className="text-xs text-slate-500 mt-1">
            Review past invoice receipts and simulated payment transactions.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold self-start sm:self-auto">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Simulated Billing Ledger</span>
        </div>
      </div>

      {/* Payment Method Overview Card */}
      <Card
        title="Payment Method On File"
        subtitle="Manage your primary recurring payment source."
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-2">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-8 rounded-md bg-slate-800 text-white flex items-center justify-center font-mono font-bold text-xs shadow-xs">
              VISA
            </div>
            <div>
              <div className="text-sm font-bold text-slate-800">
                Simulated Visa ending in <span className="font-mono">4242</span>
              </div>
              <div className="text-xs text-slate-400">Expires 12/2028 &bull; Default for recurring renewals</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full font-semibold border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Active
            </span>
          </div>
        </div>
      </Card>

      {/* Filter and Invoices Table */}
      <Card padding={false}>
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search invoice number or plan..."
                className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 w-64"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold uppercase">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Invoices</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
        </div>

        {filteredRecords.length === 0 ? (
          <EmptyState
            title="No billing records found"
            description="No matching invoices were found for your query."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Invoice Number</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Subscription Plan</th>
                  <th className="px-6 py-3.5">Amount</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Payment Method</th>
                  <th className="px-6 py-3.5 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-mono font-semibold text-blue-600">
                      {r.invoice_number}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {new Date(r.billing_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {r.plan_name}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      ${r.amount.toFixed(2)} {r.currency}
                    </td>
                    <td className="px-6 py-4">
                      <Badge size="sm" variant={r.status}>{r.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {r.payment_method}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDownloadInvoice(r)}
                        className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-semibold p-1 hover:bg-blue-50 rounded transition-colors"
                        title="Download Receipt"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
