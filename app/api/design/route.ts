import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { description, stage, revenueGoal, customerType, metric } = await req.json();
    if (!description) return NextResponse.json({ error: "description required" }, { status: 400 });

    const msg = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      messages: [{
        role: "user",
        content: `You are a pricing strategy expert. Design a complete pricing model for this product.

PRODUCT: ${description}
STAGE: ${stage}
CUSTOMER TYPE: ${customerType}
MONTHLY REVENUE TARGET: ${revenueGoal ? `$${revenueGoal}` : "Not specified"}
KEY USAGE METRIC: ${metric || "Not specified"}

Design a pricing model with 3 tiers. Use real, specific prices — not vague ranges. Make this immediately actionable.

Respond with valid JSON only (no markdown fences):
{
  "recommendedModel": "Short label e.g. 'Usage-Based with seat minimum' or 'Tiered flat-rate'",
  "rationale": "2-3 sentences explaining why this model fits this product, stage, and customer type",
  "tiers": [
    {
      "name": "Starter",
      "price": "$49/month",
      "includes": ["Feature A", "Up to X units", "Email support"],
      "bestFor": "Who this tier is for"
    },
    {
      "name": "Growth",
      "price": "$199/month",
      "includes": ["Everything in Starter", "Feature B", "Up to Y units", "Priority support"],
      "bestFor": "Who this tier is for"
    },
    {
      "name": "Scale",
      "price": "$799/month",
      "includes": ["Everything in Growth", "Unlimited units", "Dedicated support", "SLA"],
      "bestFor": "Who this tier is for"
    }
  ],
  "risks": ["3-4 specific risks or failure modes for this pricing model"],
  "keyMetricJustification": "Why the key usage metric chosen (or recommended) is the right value metric",
  "competitiveContext": "2-3 sentences on how this pricing compares to typical competitors in this space and what it signals to buyers"
}`
      }]
    });

    const raw = (msg.content[0] as { type: string; text: string }).text.trim()
      .replace(/^```json\s*/i, "").replace(/\s*```$/, "");
    return NextResponse.json(JSON.parse(raw));
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
