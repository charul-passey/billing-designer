"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const STAGES = ["Early-stage startup", "Growth stage", "Enterprise"];
const CUSTOMER_TYPES = ["Consumers", "SMBs", "Mid-market", "Enterprise"];

interface Tier {
  name: string;
  price: string;
  includes: string[];
  bestFor: string;
}

interface DesignResult {
  recommendedModel: string;
  rationale: string;
  tiers: Tier[];
  risks: string[];
  keyMetricJustification: string;
  competitiveContext: string;
}

export default function BillingDesigner() {
  const [description, setDescription] = useState("");
  const [stage, setStage] = useState("Early-stage startup");
  const [revenueGoal, setRevenueGoal] = useState("");
  const [customerType, setCustomerType] = useState("SMBs");
  const [metric, setMetric] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DesignResult | null>(null);
  const [error, setError] = useState("");

  async function design() {
    if (!description.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, stage, revenueGoal, customerType, metric }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-2">
          <span className="text-lg font-semibold text-gray-900">Billing Designer</span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Billing Designer</h1>
          <p className="text-gray-500 mt-1">Describe your product. Get a complete pricing model with tiers, rationale, and risks.</p>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">What does your product do?</label>
              <textarea
                className="w-full h-32 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
                placeholder="Describe your product, who uses it, and the value it delivers. E.g. 'API that transcribes audio files for call centers and compliance teams...'"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business stage</label>
                <div className="flex flex-wrap gap-2">
                  {STAGES.map((s) => (
                    <button
                      key={s}
                      onClick={() => setStage(s)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${stage === s ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primary customer type</label>
                <div className="flex flex-wrap gap-2">
                  {CUSTOMER_TYPES.map((t) => (
                    <button
                      key={t}
                      onClick={() => setCustomerType(t)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${customerType === t ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly revenue target ($)</label>
                <input
                  type="number"
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  placeholder="e.g. 50000"
                  value={revenueGoal}
                  onChange={(e) => setRevenueGoal(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Key usage metric</label>
                <input
                  type="text"
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  placeholder="e.g. API calls, users, documents, hours..."
                  value={metric}
                  onChange={(e) => setMetric(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={design} disabled={loading || !description.trim()}>
                {loading ? "Designing..." : "Design my pricing"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-4 mb-6 text-sm">{error}</div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
            Designing your pricing model...
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <Badge className="bg-gray-900 text-white text-sm px-3 py-1">{result.recommendedModel}</Badge>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-gray-900">Why this model</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-700 leading-relaxed">{result.rationale}</p>
                <p className="text-xs text-gray-500 italic">{result.keyMetricJustification}</p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {result.tiers.map((tier, i) => (
                <Card key={i} className={i === 1 ? "border-gray-400 shadow-sm" : ""}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base text-gray-900">{tier.name}</CardTitle>
                      {i === 1 && <Badge className="text-xs bg-gray-100 text-gray-700">Recommended</Badge>}
                    </div>
                    <p className="text-xl font-bold text-gray-900">{tier.price}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <ul className="space-y-1">
                      {tier.includes.map((item, j) => (
                        <li key={j} className="flex gap-2 text-xs text-gray-600">
                          <span className="text-green-500 shrink-0">✓</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-gray-400 pt-1 border-t border-gray-100">{tier.bestFor}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-gray-900">Risks & watch-outs</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.risks.map((r, i) => (
                      <li key={i} className="flex gap-2 text-sm text-gray-700">
                        <span className="text-amber-500 shrink-0 mt-0.5">⚠</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-gray-900">Competitive context</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 leading-relaxed">{result.competitiveContext}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
