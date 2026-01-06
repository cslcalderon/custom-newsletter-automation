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

    const paragraphs = content.split("\n\n").filter((p) => p.trim());
    paragraphs.forEach((paragraph) => {
      blocks.push({
        id: `text-${Date.now()}-${blocks.length}-${Math.random().toString(36).substr(2, 9)}`,
        type: "text",
        content: `<p>${paragraph.trim()}</p>`,
        fontSize: 16,
        color: "#333333",
        textAlign: "left",
        padding: 10,
      });
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
The major indices showed strong performance this week, with technology leading the charge.

<strong>Major Indices Performance:</strong>
• <strong>SPY (S&P 500)</strong>: ${data.marketPulse.indices.SPY.weeklyChange > 0 ? "+" : ""}${data.marketPulse.indices.SPY.weeklyChange.toFixed(2)}% | Current: $${data.marketPulse.indices.SPY.currentPrice.toFixed(2)}
• <strong>QQQ (Nasdaq)</strong>: ${data.marketPulse.indices.QQQ.weeklyChange > 0 ? "+" : ""}${data.marketPulse.indices.QQQ.weeklyChange.toFixed(2)}% | Current: $${data.marketPulse.indices.QQQ.currentPrice.toFixed(2)}
• <strong>IWM (Russell 2000)</strong>: ${data.marketPulse.indices.IWM.weeklyChange > 0 ? "+" : ""}${data.marketPulse.indices.IWM.weeklyChange.toFixed(2)}% | Current: $${data.marketPulse.indices.IWM.currentPrice.toFixed(2)}

<strong>Sector Heatmap:</strong>
${data.marketPulse.sectorHeatmap
  .map(
    (s) =>
      `• <strong>${s.sector}</strong>: ${s.performance > 0 ? "+" : ""}${s.performance.toFixed(2)}% (${s.trend})`
  )
  .join("\n")}

<strong>Industry Movers:</strong>
${data.marketPulse.industryMovers
  .map(
    (i) =>
      `• <strong>${i.industry}</strong>: ${i.performance > 0 ? "+" : ""}${i.performance.toFixed(2)}% | Key Stocks: ${i.keyStocks.join(", ")}`
  )
  .join("\n")}
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
Our algorithms have identified the highest-quality setups for the week ahead.

<strong>Top Gap Signals:</strong>
${data.signalBank.gapSignals
  .map(
    (s) =>
      `• <strong>${s.symbol}</strong>: Entry $${s.entry.toFixed(2)} | Target $${s.target.toFixed(2)} | Stop $${s.stop.toFixed(2)} | Signal Score: ${s.signalScore.toFixed(1)}/10 | Gap: ${s.gapPercent.toFixed(2)}%`
  )
  .join("\n")}

<strong>Top Squeezes:</strong>
${data.signalBank.squeezes
  .map(
    (s) =>
      `• <strong>${s.symbol}</strong>: Price $${s.price.toFixed(2)} | Short Interest: ${s.shortInterest.toFixed(1)}% | Days to Cover: ${s.daysToCover.toFixed(1)} | Squeeze Score: ${s.squeezeScore.toFixed(1)}/10`
  )
  .join("\n")}
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
<strong>Gold (GLD):</strong>
Current Price: $${data.commodities.gold.price.toFixed(2)} | Weekly Change: ${data.commodities.gold.weeklyChange > 0 ? "+" : ""}${data.commodities.gold.weeklyChange.toFixed(2)}% | Trend: ${data.commodities.gold.trend}
${data.commodities.gold.analysis}

<strong>Silver (SLV):</strong>
Current Price: $${data.commodities.silver.price.toFixed(2)} | Weekly Change: ${data.commodities.silver.weeklyChange > 0 ? "+" : ""}${data.commodities.silver.weeklyChange.toFixed(2)}% | Trend: ${data.commodities.silver.trend}
${data.commodities.silver.analysis}
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
Following the "smart money" reveals significant institutional activity this week.

<strong>Significant Dark Pool Levels:</strong>
${data.darkPools.significantLevels
  .map(
    (d) =>
      `• <strong>${d.symbol}</strong>: $${d.level.toFixed(2)} | Type: ${d.type} | Volume: ${(d.volume / 1000000).toFixed(2)}M shares | Confidence: ${(d.confidence * 100).toFixed(0)}%`
  )
  .join("\n")}

<em>Educational Note: Dark pools are private exchanges where large institutions trade off-exchange. Significant accumulation levels often precede price movements. <a href="https://www.investopedia.com/terms/d/dark-pool.asp" target="_blank">Learn more about dark pools</a>.</em>
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
<strong>${data.biweeklyInsights.topic}</strong>

${data.biweeklyInsights.analysis}

<strong>Key Findings:</strong>
${data.biweeklyInsights.keyFindings.map((f) => `• ${f}`).join("\n")}

<strong>Supporting Data:</strong>
${data.biweeklyInsights.dataPoints
  .map((d) => `• ${d.metric}: ${d.value} (Source: ${d.source})`)
  .join("\n")}
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
<strong>Bitcoin Analysis:</strong>
Current Price: $${data.crypto.bitcoin.price.toLocaleString()} | Weekly Change: ${data.crypto.bitcoin.weeklyChange > 0 ? "+" : ""}${data.crypto.bitcoin.weeklyChange.toFixed(2)}% | Trend: ${data.crypto.bitcoin.trend}

${data.crypto.bitcoin.analysis}
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
  const subject = `SignalPro Weekly: ${topPerformer.sector} Leads ${data.marketPulse.indices.SPY.weeklyChange > 0 ? "Gains" : "Declines"} | ${weekEnding}`;

  return {
    subject,
    blocks,
    aiReasoning,
    dataSources,
  };
}

