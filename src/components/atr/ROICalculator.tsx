'use client';

import { useState } from "react";
import { Calculator, DollarSign, Percent, ArrowRight } from "lucide-react";

export function ROICalculator() {
  const [purchasePrice, setPurchasePrice] = useState(500000);
  const [downPayment, setDownPayment] = useState(20);
  const [interestRate, setInterestRate] = useState(6.5);
  const [expectedRent, setExpectedRent] = useState(3500);

  const loanAmount = purchasePrice * (1 - downPayment / 100);
  const monthlyMortgage = loanAmount * 0.006;
  const monthlyCashFlow = expectedRent - monthlyMortgage;

  return (
    <div className="bg-slate-900 border border-white/5 shadow-2xl overflow-hidden relative rounded-md">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl pointer-events-none" />
      <div className="border-b border-white/5 pb-6 p-6">
        <h3 className="text-2xl font-black text-white flex items-center gap-3"
          style={{ fontFamily: "var(--font-serif, 'Playfair Display', serif)" }}>
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
            <Calculator className="h-5 w-5 text-white" />
          </div>
          ROI Analysis Engine
        </h3>
      </div>
      <div className="p-6 space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 block">
                Purchase Price
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="number"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-white/10 pl-10 h-12 text-lg font-bold text-white rounded-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 block">
                  Down Payment %
                </label>
                <div className="relative">
                  <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="number"
                    value={downPayment}
                    onChange={(e) => setDownPayment(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-white/10 h-12 text-lg font-bold text-white px-3 rounded-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 block">
                  Interest Rate %
                </label>
                <input
                  type="number"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-white/10 h-12 text-lg font-bold text-white px-3 rounded-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 block">
                Expected Monthly Rent
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="number"
                  value={expectedRent}
                  onChange={(e) => setExpectedRent(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-white/10 pl-10 h-12 text-lg font-bold text-white rounded-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-950/50 rounded-2xl p-8 border border-white/5 space-y-6">
            <div className="text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 mb-2">
                Estimated Monthly Cash Flow
              </p>
              <div
                className={`text-5xl font-black tracking-tighter ${
                  monthlyCashFlow >= 0 ? "text-white" : "text-red-400"
                }`}
              >
                ${monthlyCashFlow.toFixed(0)}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
              <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">
                  Cap Rate
                </p>
                <p className="text-xl font-black text-white">6.8%</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">
                  Cash-on-Cash
                </p>
                <p className="text-xl font-black text-emerald-500">12.4%</p>
              </div>
            </div>
            <div className="pt-4 border-t border-white/5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Loan Amount
                  </p>
                  <p className="text-sm font-bold text-white">
                    ${loanAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Monthly Payment
                  </p>
                  <p className="text-sm font-bold text-white">
                    ${monthlyMortgage.toFixed(0)}
                  </p>
                </div>
              </div>
            </div>
            <button className="w-full bg-blue-600 hover:bg-blue-700 h-14 font-black text-lg text-white rounded-sm group flex items-center justify-center gap-2 transition-colors">
              Export Analysis PDF
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
