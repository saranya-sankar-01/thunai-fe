import { Message } from "../../pages/Copilot";

export const generateMockResponse = (userPrompt: string): Message => {
  const prompt = userPrompt.toLowerCase();

  // Pipeline overview
  if (prompt.includes("open deals") || prompt.includes("pipeline")) {
    return {
      id: `ai-${Date.now()}`,
      role: "assistant",
      title: "Q4 Pipeline Overview",
      confidence: 72,
      content: `You have 12 open opportunities this quarter totaling $1.2M.

3 are marked high risk due to inactivity or negative sentiment:
• Acme Corp – No meeting for 15 days, negative pricing discussion
• Fynix Ltd – Decision-maker absent from last 2 calls  
• NexPro – Low email engagement (-40%)

Estimated close probability for the quarter: 72%.

Suggested next step: Schedule a follow-up with Acme's CFO next week.`,
      reasoning: {
        evidence: [
          {
            id: "e1",
            type: "call",
            title: "Acme Corp - Pricing Discussion",
            timestamp: "15 days ago",
            content: "Negative sentiment detected when discussing enterprise tier pricing. CFO expressed concerns about ROI timeline.",
          },
          {
            id: "e2",
            type: "email",
            title: "NexPro - Email Thread",
            timestamp: "12 days ago",
            content: "Last 4 emails sent with no response. Open rate dropped from 80% to 30%.",
          },
          {
            id: "e3",
            type: "crm",
            title: "Fynix Ltd - Meeting Notes",
            timestamp: "8 days ago",
            content: "CTO attended last meeting alone. CEO and CFO have not joined the last 2 calls despite being key decision makers.",
          },
          {
            id: "e4",
            type: "call",
            title: "KarmaSoft - Demo Call",
            timestamp: "3 days ago",
            content: "Positive engagement, technical validation complete. CFO requested ROI deck for board review.",
          },
        ],
        factors: [
          {
            name: "Decision-maker engagement",
            weight: -0.27,
            rationale: "Key decision makers absent from recent calls in 2 high-value deals",
          },
          {
            name: "Recency of activity",
            weight: -0.14,
            rationale: "Average 12 days since last touchpoint vs team average of 5 days",
          },
          {
            name: "Positive product-fit signals",
            weight: 0.09,
            rationale: "Technical validation completed in 4 opportunities",
          },
        ],
        comparative: {
          metric: "Deals that closed from this stage",
          current: 24,
          mean: 9,
          percentile: 67,
        },
        counterfactual: "Re-engaging decision makers in Acme and Fynix could increase close probability to 84%",
        auditTrail: "Updated 2m ago • Sources: 12 calls, 28 emails, SFDC sync",
      },
      actions: [
        {
          id: "a1",
          label: "Schedule CFO review with Acme",
          impact: "high",
          description: "High-priority meeting to address pricing concerns",
        },
        {
          id: "a2",
          label: "Send re-engagement email to NexPro",
          impact: "medium",
          description: "Personalized follow-up with value proposition",
        },
        {
          id: "a3",
          label: "Update Fynix stage to 'At Risk'",
          impact: "medium",
          description: "Alert manager for executive intervention",
        },
      ],
    };
  }

  // Deals that will slip
  if (prompt.includes("slip") || prompt.includes("risk")) {
    return {
      id: `ai-${Date.now()}`,
      role: "assistant",
      title: "Deals at Risk of Slipping",
      confidence: 81,
      content: `3 deals likely to slip this quarter (total value: $410K):

1. **Acme Corp** ($180K) - 89% slip probability
   • No executive engagement for 15 days
   • Negative pricing sentiment detected
   
2. **Nordic Systems** ($90K) - 76% slip probability  
   • VP IT last seen 22 days ago
   • Decision date pushed twice
   
3. **Texa Labs** ($140K) - 68% slip probability
   • Champion left company
   • New stakeholder unresponsive

Total forecast impact if all slip: $410K → reduces Q4 from $1.2M to $790K`,
      reasoning: {
        evidence: [
          {
            id: "e1",
            type: "call",
            title: "Acme Corp - Last Meeting",
            timestamp: "15 days ago",
            content: "CFO raised concerns about implementation timeline and cost. No follow-up meeting scheduled.",
          },
          {
            id: "e2",
            type: "crm",
            title: "Nordic Systems - Activity Log",
            timestamp: "22 days ago",
            content: "VP IT last interaction. Close date pushed from Nov 15 to Dec 1, then to Dec 15.",
          },
          {
            id: "e3",
            type: "email",
            title: "Texa Labs - Champion Update",
            timestamp: "9 days ago",
            content: "Former champion John Smith no longer at company. New contact Sarah Lee has not responded to 3 emails.",
          },
        ],
        factors: [
          {
            name: "Executive engagement",
            weight: -0.31,
            rationale: "No C-level involvement in deals over 14 days",
          },
          {
            name: "Close date changes",
            weight: -0.22,
            rationale: "Multiple pushes correlate with 73% slip rate historically",
          },
          {
            name: "Champion status",
            weight: -0.18,
            rationale: "Loss of internal champion reduces close rate by 54%",
          },
        ],
        comparative: {
          metric: "Average time to slip detection",
          current: 18,
          mean: 24,
          percentile: 42,
        },
        counterfactual: "Executive engagement in next 7 days could reduce slip probability by 34%",
        auditTrail: "Updated 5m ago • Sources: 7 calls, 15 emails, SFDC pipeline",
      },
      actions: [
        {
          id: "a1",
          label: "Schedule executive alignment for Acme",
          impact: "high",
          description: "Bring in VP Sales to address CFO concerns",
        },
        {
          id: "a2",
          label: "Escalate Nordic Systems to manager",
          impact: "high",
          description: "Request manager outreach to VP IT",
        },
        {
          id: "a3",
          label: "Rebuild champion network at Texa Labs",
          impact: "high",
          description: "Schedule discovery call with new stakeholder",
        },
      ],
    };
  }

  // Call summary
  if (prompt.includes("call") || prompt.includes("summarize")) {
    return {
      id: `ai-${Date.now()}`,
      role: "assistant",
      title: "Call Summary: TechNova Demo",
      confidence: 92,
      content: `Call with TechNova (45 minutes):

**Key Points:**
• Pain point: Integration with Azure AD
• Objection: "Implementation effort too high" (17:42)
• Competitor: Okta mentioned twice (22:14, 31:18)
• Sentiment shift: Positive → Neutral → Negative after pricing

**Next Steps:**
1. Send Zero-Trust ROI deck
2. Schedule follow-up with CTO (requested by Alex)
3. Address implementation concerns with solution architect`,
      reasoning: {
        evidence: [
          {
            id: "e1",
            type: "call",
            title: "TechNova Demo - Opening",
            timestamp: "00:00 - 12:30",
            content: "Strong rapport established. Alex (VP IT) expressed frustration with current Azure AD integration complexity.",
          },
          {
            id: "e2",
            type: "call",
            title: "TechNova Demo - Objection",
            timestamp: "17:42",
            content: "Implementation effort objection raised: 'We don't have bandwidth for a 6-month deployment'",
          },
          {
            id: "e3",
            type: "call",
            title: "TechNova Demo - Competitor",
            timestamp: "22:14, 31:18",
            content: "Okta mentioned as incumbent vendor. Concerns about switching costs and data migration.",
          },
          {
            id: "e4",
            type: "call",
            title: "TechNova Demo - Pricing",
            timestamp: "38:20 - 42:00",
            content: "Negative sentiment detected when discussing enterprise tier. Asked for discount options.",
          },
        ],
        factors: [
          {
            name: "Pain point validation",
            weight: 0.24,
            rationale: "Clear frustration with current solution indicates high intent",
          },
          {
            name: "Implementation concern",
            weight: -0.19,
            rationale: "Deployment timeline objection needs to be addressed",
          },
          {
            name: "Competitive pressure",
            weight: -0.12,
            rationale: "Incumbent vendor creates switching friction",
          },
        ],
        auditTrail: "Analyzed 3m ago • Call recording: 45 min • Sentiment: Mixed",
      },
      actions: [
        {
          id: "a1",
          label: "Send Zero-Trust ROI deck",
          impact: "high",
          description: "Includes Azure AD integration case study",
        },
        {
          id: "a2",
          label: "Draft implementation timeline",
          impact: "high",
          description: "Show 90-day fast-track deployment option",
        },
        {
          id: "a3",
          label: "Schedule CTO call",
          impact: "medium",
          description: "Technical deep-dive requested by prospect",
        },
      ],
    };
  }

  // Forecast
  if (prompt.includes("forecast") || prompt.includes("revenue")) {
    return {
      id: `ai-${Date.now()}`,
      role: "assistant",
      title: "November Revenue Forecast",
      confidence: 68,
      content: `Weighted pipeline for November: $830K with 68% confidence (↑5% from October)

**Likely to close:**
• KarmaSoft: $240K (85% confidence)
• Rivea Systems: $180K (78% confidence)

**Over-forecasted (at risk):**
• Nordic Systems: $90K - low engagement, pushed twice
• Texa Labs: $60K - champion departed

If both slip, forecast drops to $680K.

**Action:** Re-engage Nordic Systems VP IT (last contact: 22 days ago)`,
      reasoning: {
        evidence: [
          {
            id: "e1",
            type: "crm",
            title: "KarmaSoft - Deal Status",
            timestamp: "Updated yesterday",
            content: "Contract sent for signature. Legal review complete. CFO confirmed board approval for Q4 budget.",
          },
          {
            id: "e2",
            type: "email",
            title: "Nordic Systems - Engagement Drop",
            timestamp: "22 days ago",
            content: "Last email from VP IT. Three follow-up emails sent with no response.",
          },
        ],
        factors: [
          {
            name: "Contract stage progression",
            weight: 0.32,
            rationale: "Deals in legal review close at 85% rate historically",
          },
          {
            name: "Engagement recency",
            weight: -0.28,
            rationale: "Deals inactive >20 days slip 67% of the time",
          },
          {
            name: "Champion presence",
            weight: -0.15,
            rationale: "Champion departure reduces close rate significantly",
          },
        ],
        comparative: {
          metric: "Forecast accuracy vs actual",
          current: 68,
          mean: 63,
          percentile: 58,
        },
        counterfactual: "If Nordic and Texa engage in next 5 days, confidence increases to 79%",
        auditTrail: "Updated 1h ago • Sources: Pipeline snapshot, historical data",
      },
      actions: [
        {
          id: "a1",
          label: "Priority follow-up: Nordic Systems",
          impact: "high",
          description: "Multi-channel outreach to VP IT",
        },
        {
          id: "a2",
          label: "Secure KarmaSoft signature",
          impact: "high",
          description: "Follow up on contract execution timeline",
        },
        {
          id: "a3",
          label: "Update forecast in CRM",
          impact: "medium",
          description: "Adjust Nordic and Texa probabilities",
        },
      ],
    };
  }

  // Generic response
  return {
    id: `ai-${Date.now()}`,
    role: "assistant",
    content: `I understand you're asking about: "${userPrompt}"

I can help you with:
• Pipeline and deal analysis
• Forecasting and revenue prediction
• Call summaries and conversation intelligence
• Deal coaching and performance insights
• Follow-up automation and CRM tasks
• Knowledge-based assistance
• Team performance tracking

Try asking something like:
• "Show me my open deals this quarter"
• "Which deals are likely to slip?"
• "Summarize my last call with [company]"
• "What's my forecast for this month?"`,
  };
};
