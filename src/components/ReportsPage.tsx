import React from 'react';
import { Download, FileText, BarChart3, Calendar, CheckCircle2, DollarSign } from 'lucide-react';
import { TransactionItem } from '../types.ts';

interface ReportsPageProps {
  transactions: TransactionItem[];
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ transactions }) => {
  const completed = transactions.filter(t => t.status === 'Completed');
  const total = completed.reduce((sum, t) => sum + t.amount, 0);

  const handleDownloadCSV = () => {
    window.location.href = '/api/reports/export';
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E2924] tracking-tight">
            Financial Reports & Accounting
          </h1>
          <p className="text-sm text-[#55635B] mt-0.5">
            Download reconciled revenue reports, transaction ledgers, and audit-ready spreadsheets.
          </p>
        </div>

        <button
          onClick={handleDownloadCSV}
          className="bg-[#174B38] hover:bg-[#11382A] text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95 self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Download All CSV</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-[#E8EAE5] shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#E7F1E9] text-[#174B38] flex items-center justify-center">
              <FileText className="w-5 h-5 text-[#10B981]" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Monthly Revenue Summary</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Consolidated revenue, merchant fee breakdown, and net deposits for tax reporting.
            </p>
          </div>
          <button
            onClick={handleDownloadCSV}
            className="w-full bg-[#FAF9F5] hover:bg-[#E7F1E9] text-[#174B38] font-bold text-xs py-2.5 rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E8EAE5] shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#E6F0FA] text-[#0079C1] flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">PayPal Settlement Ledger</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Full list of verified PayPal Order IDs, capture references, and timestamps.
            </p>
          </div>
          <button
            onClick={handleDownloadCSV}
            className="w-full bg-[#FAF9F5] hover:bg-[#E6F0FA] text-[#0079C1] font-bold text-xs py-2.5 rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E8EAE5] shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#F3E8FF] text-[#8B5CF6] flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Client Billing Matrix</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Lifetime customer value (LTV), total fulfilled requests, and payment timeliness.
            </p>
          </div>
          <button
            onClick={handleDownloadCSV}
            className="w-full bg-[#FAF9F5] hover:bg-[#F3E8FF] text-[#8B5CF6] font-bold text-xs py-2.5 rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
};
