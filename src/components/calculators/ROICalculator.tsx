import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calculator, DollarSign, Percent, ArrowRight } from "lucide-react";

export function ROICalculator() {
  const [purchasePrice, setPurchasePrice] = useState(500000);
  const [downPayment, setDownPayment] = useState(20);
  const [interestRate, setInterestRate] = useState(6.5);
  const [expectedRent, setExpectedRent] = useState(3500);

  return (
    <Card className="bg-slate-900 border-white/5 shadow-2xl overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl pointer-events-none" />
      <CardHeader className="border-b border-white/5 pb-6">
        <CardTitle className="text-2xl font-black text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
            <Calculator className="h-5 w-5 text-white" />
          </div>
          ROI Analysis Engine
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-8 space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Purchase Price</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  type="number"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(Number(e.target.value))}
                  className="bg-slate-950 border-white/10 pl-10 h-12 text-lg font-bold"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Down Payment %</Label>
                <div className="relative">
                  <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    type="number"
                    value={downPayment}
                    onChange={(e) => setDownPayment(Number(e.target.value))}
                    className="bg-slate-950 border-white/10 h-12 text-lg font-bold"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Interest Rate %</Label>
                <Input
                  type="number"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="bg-slate-950 border-white/10 h-12 text-lg font-bold"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-950/50 rounded-2xl p-8 border border-white/5 space-y-6">
            <div className="text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 mb-2">Estimated Monthly Cash Flow</p>
              <div className="text-5xl font-black text-white tracking-tighter">
                ${(expectedRent - (purchasePrice * (1 - downPayment/100) * 0.006)).toFixed(0)}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
              <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Cap Rate</p>
                <p className="text-xl font-black text-white">6.8%</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Cash-on-Cash</p>
                <p className="text-xl font-black text-emerald-500">12.4%</p>
              </div>
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 h-14 font-black text-lg group">
              Export Analysis PDF <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
