import type { NewsletterBlock } from "@/app/newsletter/editor/types/newsletter";
import type { CollectedData } from "./mockDataCollector";
import type { NewsletterGenerationOptions, AIReasoning, DataSource } from "../types/newsletterStrategy";
import type { TrendAnalysisResult } from "./trendAnalyzer";

export interface NewsletterDraftWithMetadata {
  subject: string;
  blocks: NewsletterBlock[];
  aiReasoning: AIReasoning[];
  dataSources: DataSource[];
}

export function generateNewsletterFromStructuredData(
  data: CollectedData,
  options: NewsletterGenerationOptions
): NewsletterDraftWithMetadata {
  const aiReasoning: AIReasoning[] = [];
  const dataSources: DataSource[] = [];
  const blocks: NewsletterBlock[] = [];

  // Helper to add data source if not already added
  const addDataSource = (source: DataSource) => {
    if (!dataSources.find((s) => s.name === source.name)) {
      dataSources.push(source);
    }
  };

  // Helper to create section with reasoning
  const createSection = (
    title: string,
    content: string,
    reasoning: Omit<AIReasoning, "section">,
    sources: DataSource[]
  ) => {
    sources.forEach(addDataSource);
    aiReasoning.push({
      section: title,
      ...reasoning,
      dataSources: sources,
    });

    blocks.push({
      id: `header-${Date.now()}-${blocks.length}`,
      type: "header",
      text: title,
      level: 2,
      fontSize: 24,
      color: "#000000",
      textAlign: "left",
      padding: 15,
    });

    // Content is already formatted with HTML (lists, paragraphs, etc.)
    // So we use it directly instead of splitting
    blocks.push({
      id: `text-${Date.now()}-${blocks.length}-${Math.random().toString(36).substr(2, 9)}`,
      type: "text",
      content: content, // Content already has proper HTML formatting
      fontSize: 16,
      color: "#333333",
      textAlign: "left",
      padding: 15,
    });

    // Add spacer after section for better visual separation
    blocks.push({
      id: `spacer-${Date.now()}-${blocks.length}`,
      type: "spacer",
      height: 20,
    });
  };

  // 1. Header
  const weekEnding = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  blocks.push({
    id: `header-${Date.now()}-main`,
    type: "header",
    text: `SignalPro Weekly Newsletter - Week Ending ${weekEnding}`,
    level: 1,
    fontSize: 32,
    color: "#000000",
    textAlign: "center",
    padding: 20,
  });

  // 2. 🚀 The Market Pulse
  const marketPulseContent = `
<p>The major indices showed strong performance this week, with technology leading the charge.</p>

<p><strong>Major Indices Performance:</strong></p>
<ul style="margin: 10px 0; padding-left: 25px;">
  <li style="margin: 8px 0;"><strong>SPY (S&P 500)</strong>: <span style="color: ${data.marketPulse.indices.SPY.weeklyChange >= 0 ? "#22c55e" : "#ef4444"};">${data.marketPulse.indices.SPY.weeklyChange > 0 ? "+" : ""}${data.marketPulse.indices.SPY.weeklyChange.toFixed(2)}%</span> | Current: $${data.marketPulse.indices.SPY.currentPrice.toFixed(2)}</li>
  <li style="margin: 8px 0;"><strong>QQQ (Nasdaq)</strong>: <span style="color: ${data.marketPulse.indices.QQQ.weeklyChange >= 0 ? "#22c55e" : "#ef4444"};">${data.marketPulse.indices.QQQ.weeklyChange > 0 ? "+" : ""}${data.marketPulse.indices.QQQ.weeklyChange.toFixed(2)}%</span> | Current: $${data.marketPulse.indices.QQQ.currentPrice.toFixed(2)}</li>
  <li style="margin: 8px 0;"><strong>IWM (Russell 2000)</strong>: <span style="color: ${data.marketPulse.indices.IWM.weeklyChange >= 0 ? "#22c55e" : "#ef4444"};">${data.marketPulse.indices.IWM.weeklyChange > 0 ? "+" : ""}${data.marketPulse.indices.IWM.weeklyChange.toFixed(2)}%</span> | Current: $${data.marketPulse.indices.IWM.currentPrice.toFixed(2)}</li>
</ul>

<p><strong>Sector Heatmap:</strong></p>
<ul style="margin: 10px 0; padding-left: 25px;">
${data.marketPulse.sectorHeatmap
  .map(
    (s) =>
      `  <li style="margin: 8px 0;"><strong>${s.sector}</strong>: <span style="color: ${s.performance >= 0 ? "#22c55e" : "#ef4444"};">${s.performance > 0 ? "+" : ""}${s.performance.toFixed(2)}%</span> <span style="color: #6b7280; font-size: 0.9em;">(${s.trend})</span></li>`
  )
  .join("\n")}
</ul>

<p><strong>Industry Movers:</strong></p>
<ul style="margin: 10px 0; padding-left: 25px;">
${data.marketPulse.industryMovers
  .map(
    (i) =>
      `  <li style="margin: 8px 0;"><strong>${i.industry}</strong>: <span style="color: ${i.performance >= 0 ? "#22c55e" : "#ef4444"};">${i.performance > 0 ? "+" : ""}${i.performance.toFixed(2)}%</span> | Key Stocks: <span style="color: #3b82f6;">${i.keyStocks.join(", ")}</span></li>`
  )
  .join("\n")}
</ul>
  `.trim();

  createSection(
    "🚀 The Market Pulse",
    marketPulseContent,
    {
      decision: "Included comprehensive market overview with all three major indices, sector performance, and industry movers",
      reasoning:
        "This section provides the 'big picture' view that traders need. The data shows clear sector rotation with Technology leading, which is actionable intelligence. Including specific percentages and current prices gives readers concrete data points.",
      confidence: 0.95,
      alternativeConsiderations: [
        "Could have focused only on SPY, but including QQQ and IWM provides broader market context",
        "Sector heatmap could be simplified, but detailed breakdown helps identify opportunities",
      ],
    },
    [
      {
        name: "Market Data Database",
        type: "database",
        table: "market_indices",
        description: "Direct calculation from raw market data - 100% accurate weekly performance",
      },
      {
        name: "Sector Performance API",
        type: "database",
        table: "sector_performance",
        description: "Automated sector calculations from our database",
      },
    ]
  );

  // 3. 💎 The Signal Bank
  const signalBankContent = `
<p>Our algorithms have identified the highest-quality setups for the week ahead.</p>

<p><strong>Top Gap Signals:</strong></p>
<ul style="margin: 10px 0; padding-left: 25px;">
${data.signalBank.gapSignals
  .map(
    (s) =>
      `  <li style="margin: 12px 0; line-height: 1.6;">
    <strong style="color: #3b82f6; font-size: 1.1em;">${s.symbol}</strong><br>
    <span style="color: #6b7280; font-size: 0.9em;">Entry:</span> $${s.entry.toFixed(2)} | 
    <span style="color: #22c55e; font-weight: 600;">Target:</span> $${s.target.toFixed(2)} | 
    <span style="color: #ef4444; font-weight: 600;">Stop:</span> $${s.stop.toFixed(2)}<br>
    <span style="color: #6b7280; font-size: 0.9em;">Signal Score:</span> <strong>${s.signalScore.toFixed(1)}/10</strong> | 
    <span style="color: #6b7280; font-size: 0.9em;">Gap:</span> ${s.gapPercent.toFixed(2)}%
  </li>`
  )
  .join("\n")}
</ul>

<p><strong>Top Squeezes:</strong></p>
<ul style="margin: 10px 0; padding-left: 25px;">
${data.signalBank.squeezes
  .map(
    (s) =>
      `  <li style="margin: 12px 0; line-height: 1.6;">
    <strong style="color: #3b82f6; font-size: 1.1em;">${s.symbol}</strong><br>
    <span style="color: #6b7280; font-size: 0.9em;">Price:</span> $${s.price.toFixed(2)} | 
    <span style="color: #6b7280; font-size: 0.9em;">Short Interest:</span> ${s.shortInterest.toFixed(1)}% | 
    <span style="color: #6b7280; font-size: 0.9em;">Days to Cover:</span> ${s.daysToCover.toFixed(1)}<br>
    <span style="color: #6b7280; font-size: 0.9em;">Squeeze Score:</span> <strong>${s.squeezeScore.toFixed(1)}/10</strong>
  </li>`
  )
  .join("\n")}
</ul>
  `.trim();

  createSection(
    "💎 The Signal Bank",
    signalBankContent,
    {
      decision: "Prioritized highest signal score setups with clear entry/target/stop levels",
      reasoning:
        "Traders need actionable setups with clear risk/reward parameters. The signal scores help prioritize which trades to focus on. Including both gap plays and squeeze setups provides variety for different trading styles.",
      confidence: 0.92,
      alternativeConsiderations: [
        "Could include more signals, but quality over quantity is better for newsletter readers",
        "Momentum plays excluded as per strategy - not ready for launch",
      ],
    },
    [
      {
        name: "Signal Algorithm",
        type: "algorithm",
        description: "Internal algorithm calculating Signal Score from multiple factors (volume, price action, technical indicators)",
      },
      {
        name: "Gap Detection System",
        type: "algorithm",
        description: "Automated gap analysis identifying pre-market gaps with high probability setups",
      },
    ]
  );

  // 4. 🥇 Commodities Corner
  const commoditiesContent = `
<div style="margin: 15px 0;">
  <p><strong style="font-size: 1.1em;">Gold (GLD):</strong></p>
  <ul style="margin: 8px 0; padding-left: 25px; list-style: none;">
    <li style="margin: 6px 0;"><span style="color: #6b7280;">Current Price:</span> <strong>$${data.commodities.gold.price.toFixed(2)}</strong></li>
    <li style="margin: 6px 0;"><span style="color: #6b7280;">Weekly Change:</span> <span style="color: ${data.commodities.gold.weeklyChange >= 0 ? "#22c55e" : "#ef4444"}; font-weight: 600;">${data.commodities.gold.weeklyChange > 0 ? "+" : ""}${data.commodities.gold.weeklyChange.toFixed(2)}%</span></li>
    <li style="margin: 6px 0;"><span style="color: #6b7280;">Trend:</span> <strong>${data.commodities.gold.trend}</strong></li>
  </ul>
  <p style="margin-top: 10px; color: #374151; line-height: 1.6;">${data.commodities.gold.analysis}</p>
</div>

<div style="margin: 15px 0;">
  <p><strong style="font-size: 1.1em;">Silver (SLV):</strong></p>
  <ul style="margin: 8px 0; padding-left: 25px; list-style: none;">
    <li style="margin: 6px 0;"><span style="color: #6b7280;">Current Price:</span> <strong>$${data.commodities.silver.price.toFixed(2)}</strong></li>
    <li style="margin: 6px 0;"><span style="color: #6b7280;">Weekly Change:</span> <span style="color: ${data.commodities.silver.weeklyChange >= 0 ? "#22c55e" : "#ef4444"}; font-weight: 600;">${data.commodities.silver.weeklyChange > 0 ? "+" : ""}${data.commodities.silver.weeklyChange.toFixed(2)}%</span></li>
    <li style="margin: 6px 0;"><span style="color: #6b7280;">Trend:</span> <strong>${data.commodities.silver.trend}</strong></li>
  </ul>
  <p style="margin-top: 10px; color: #374151; line-height: 1.6;">${data.commodities.silver.analysis}</p>
</div>
  `.trim();

  createSection(
    "🥇 Commodities Corner",
    commoditiesContent,
    {
      decision: "Focused on Gold and Silver as specified in strategy, with technical analysis",
      reasoning:
        "Precious metals provide diversification insights and often move inversely to equities. Including both price action and trend analysis gives readers context for potential portfolio adjustments.",
      confidence: 0.88,
      alternativeConsiderations: [
        "Could include other commodities, but Gold and Silver are most relevant for retail traders",
      ],
    },
    [
      {
        name: "Commodities Database",
        type: "database",
        table: "commodities_data",
        description: "Internal DB market data for GLD and SLV",
      },
    ]
  );

  // 5. 🐳 Institutional Flow (Dark Pools)
  const darkPoolContent = `
<p>Following the "smart money" reveals significant institutional activity this week.</p>

<p><strong>Significant Dark Pool Levels:</strong></p>
<ul style="margin: 10px 0; padding-left: 25px;">
${data.darkPools.significantLevels
  .map(
    (d) =>
      `  <li style="margin: 12px 0; line-height: 1.6;">
    <strong style="color: #3b82f6; font-size: 1.1em;">${d.symbol}</strong><br>
    <span style="color: #6b7280; font-size: 0.9em;">Level:</span> <strong>$${d.level.toFixed(2)}</strong> | 
    <span style="color: ${d.type === "ACCUMULATION" ? "#22c55e" : "#ef4444"}; font-weight: 600;">${d.type}</span><br>
    <span style="color: #6b7280; font-size: 0.9em;">Volume:</span> ${(d.volume / 1000000).toFixed(2)}M shares | 
    <span style="color: #6b7280; font-size: 0.9em;">Confidence:</span> <strong>${(d.confidence * 100).toFixed(0)}%</strong>
  </li>`
  )
  .join("\n")}
</ul>

<p style="margin-top: 15px; padding: 12px; background-color: #f3f4f6; border-left: 4px solid #3b82f6; font-style: italic; color: #4b5563;">
  <strong>Educational Note:</strong> Dark pools are private exchanges where large institutions trade off-exchange. Significant accumulation levels often precede price movements. <a href="https://www.investopedia.com/terms/d/dark-pool.asp" target="_blank" style="color: #3b82f6; text-decoration: underline;">Learn more about dark pools</a>.
</p>
  `.trim();

  createSection(
    "🐳 Institutional Flow (Dark Pools)",
    darkPoolContent,
    {
      decision: "Included only high-confidence dark pool levels with significant volume",
      reasoning:
        "Dark pool data is exclusive alpha that most retail traders don't have access to. Showing accumulation vs. distribution helps readers understand where institutions are positioning. Including educational link adds value.",
      confidence: 0.85,
      alternativeConsiderations: [
        "Could show more levels, but focusing on highest confidence prevents information overload",
      ],
    },
    [
      {
        name: "Dark Pool Data Feed",
        type: "external",
        description: "Paid private feed providing exclusive dark pool transaction data",
      },
    ]
  );

  // 6. 👩‍🔬 The Data Science Lab (Bi-Weekly Special)
  if (options.includeBiweeklyInsights && data.biweeklyInsights) {
    const biweeklyContent = `
<div style="margin: 15px 0; padding: 15px; background-color: #f9fafb; border-radius: 8px;">
  <p><strong style="font-size: 1.2em; color: #1f2937;">${data.biweeklyInsights.topic}</strong></p>
  
  <p style="margin-top: 12px; color: #374151; line-height: 1.7;">${data.biweeklyInsights.analysis}</p>

  <p style="margin-top: 20px;"><strong>Key Findings:</strong></p>
  <ul style="margin: 10px 0; padding-left: 25px;">
    ${data.biweeklyInsights.keyFindings.map((f) => `<li style="margin: 10px 0; line-height: 1.6; color: #374151;">${f}</li>`).join("\n    ")}
  </ul>

  <p style="margin-top: 20px;"><strong>Supporting Data:</strong></p>
  <ul style="margin: 10px 0; padding-left: 25px;">
    ${data.biweeklyInsights.dataPoints
      .map((d) => `<li style="margin: 8px 0; line-height: 1.6;"><span style="color: #6b7280;">${d.metric}:</span> <strong>${d.value}</strong> <span style="color: #9ca3af; font-size: 0.9em;">(Source: ${d.source})</span></li>`)
      .join("\n    ")}
  </ul>
</div>
    `.trim();

    createSection(
      "👩‍🔬 The Data Science Lab",
      biweeklyContent,
      {
        decision: `Included biweekly deep-dive on "${data.biweeklyInsights.topic}"`,
        reasoning:
          "This exclusive section provides unique value that differentiates our newsletter. The statistical comparison gives readers data-driven insights they can't get elsewhere. Including specific data points with sources adds credibility.",
        confidence: 0.90,
        alternativeConsiderations: [
          "Could make it shorter, but depth is the value proposition for this section",
        ],
      },
      [
        {
          name: "Custom Data Science Analysis",
          type: "database",
          description: "Custom DS analysis combining multiple data sources for unique insights",
        },
      ]
    );
  }

  // 7. ₿ Crypto Intel
  const cryptoContent = `
<div style="margin: 15px 0;">
  <p><strong style="font-size: 1.1em;">Bitcoin Analysis:</strong></p>
  <ul style="margin: 8px 0; padding-left: 25px; list-style: none;">
    <li style="margin: 6px 0;"><span style="color: #6b7280;">Current Price:</span> <strong>$${data.crypto.bitcoin.price.toLocaleString()}</strong></li>
    <li style="margin: 6px 0;"><span style="color: #6b7280;">Weekly Change:</span> <span style="color: ${data.crypto.bitcoin.weeklyChange >= 0 ? "#22c55e" : "#ef4444"}; font-weight: 600;">${data.crypto.bitcoin.weeklyChange > 0 ? "+" : ""}${data.crypto.bitcoin.weeklyChange.toFixed(2)}%</span></li>
    <li style="margin: 6px 0;"><span style="color: #6b7280;">Trend:</span> <strong>${data.crypto.bitcoin.trend}</strong></li>
  </ul>
  <p style="margin-top: 10px; color: #374151; line-height: 1.6;">${data.crypto.bitcoin.analysis}</p>
</div>
  `.trim();

  createSection(
    "₿ Crypto Intel",
    cryptoContent,
    {
      decision: "Focused on Bitcoin as the market leader with trend analysis",
      reasoning:
        "Bitcoin remains the dominant crypto asset and its performance often influences the broader crypto market. Including both price action and trend analysis helps readers understand crypto market dynamics.",
      confidence: 0.87,
      alternativeConsiderations: [
        "Could include other cryptocurrencies, but Bitcoin is most relevant for most readers",
      ],
    },
    [
      {
        name: "Crypto Market Data",
        type: "api",
        endpoint: "crypto/bitcoin",
        description: "Real-time Bitcoin price and trend data",
      },
    ]
  );

  // Generate subject line
  const topPerformer = data.marketPulse.sectorHeatmap
    .sort((a, b) => b.performance - a.performance)[0];
  const subject = `SignalPro Weekly: ${topPerformer?.sector || "Market"} Leads ${(data.marketPulse.indices.SPY.weeklyChange || 0) > 0 ? "Gains" : "Declines"} | ${weekEnding}`;

  return {
    subject,
    blocks,
    aiReasoning,
    dataSources,
  };
}

