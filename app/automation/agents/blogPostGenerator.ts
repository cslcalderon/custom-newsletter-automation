import type { CollectedData } from "./mockDataCollector";
import type { NewsletterGenerationOptions } from "../types/newsletterStrategy";

export interface BlogPostDraft {
  title: string;
  excerpt: string;
  content: string; // Markdown format
}

export function generateBlogPostFromStructuredData(
  data: CollectedData,
  options: NewsletterGenerationOptions
): BlogPostDraft {
  const weekEnding = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Generate title based on top performing sector
  const topPerformer = data.marketPulse.sectorHeatmap
    .sort((a, b) => b.performance - a.performance)[0];
  const title = `Market Weekly: ${topPerformer?.sector || "Technology"} Leads ${(data.marketPulse.indices.SPY.weeklyChange || 0) > 0 ? "Gains" : "Declines"} - Week Ending ${weekEnding}`;

  // Generate excerpt
  const excerpt = `This week's market performance shows ${topPerformer?.sector || "Technology"} leading with ${topPerformer?.performance > 0 ? "+" : ""}${topPerformer?.performance.toFixed(2) || "0.00"}% gains. Major indices ${(data.marketPulse.indices.SPY.weeklyChange || 0) > 0 ? "rose" : "declined"} as ${data.marketPulse.industryMovers[0]?.industry || "technology"} stocks drove market momentum.`;

  // Build markdown content
  let markdown = `# ${title}\n\n`;
  markdown += `${excerpt}\n\n`;
  markdown += "---\n\n";

  // Market Pulse Section
  markdown += `## 🚀 The Market Pulse\n\n`;
  markdown += `The major indices showed ${(data.marketPulse.indices.SPY.weeklyChange || 0) > 0 ? "strong" : "mixed"} performance this week, with technology leading the charge.\n\n`;
  
  markdown += `### Major Indices Performance\n\n`;
  markdown += `- **SPY (S&P 500)**: ${data.marketPulse.indices.SPY.weeklyChange > 0 ? "+" : ""}${data.marketPulse.indices.SPY.weeklyChange.toFixed(2)}% | Current: $${data.marketPulse.indices.SPY.currentPrice.toFixed(2)}\n`;
  markdown += `- **QQQ (Nasdaq)**: ${data.marketPulse.indices.QQQ.weeklyChange > 0 ? "+" : ""}${data.marketPulse.indices.QQQ.weeklyChange.toFixed(2)}% | Current: $${data.marketPulse.indices.QQQ.currentPrice.toFixed(2)}\n`;
  markdown += `- **IWM (Russell 2000)**: ${data.marketPulse.indices.IWM.weeklyChange > 0 ? "+" : ""}${data.marketPulse.indices.IWM.weeklyChange.toFixed(2)}% | Current: $${data.marketPulse.indices.IWM.currentPrice.toFixed(2)}\n\n`;

  markdown += `### Sector Heatmap\n\n`;
  data.marketPulse.sectorHeatmap.forEach((s) => {
    markdown += `- **${s.sector}**: ${s.performance > 0 ? "+" : ""}${s.performance.toFixed(2)}% (${s.trend})\n`;
  });
  markdown += `\n`;

  markdown += `### Industry Movers\n\n`;
  data.marketPulse.industryMovers.forEach((i) => {
    markdown += `- **${i.industry}**: ${i.performance > 0 ? "+" : ""}${i.performance.toFixed(2)}% | Key Stocks: ${i.keyStocks.join(", ")}\n`;
  });
  markdown += `\n`;

  // Signal Bank Section
  markdown += `## 💎 The Signal Bank\n\n`;
  markdown += `Our algorithms have identified the highest-quality setups for the week ahead.\n\n`;

  markdown += `### Top Gap Signals\n\n`;
  data.signalBank.gapSignals.forEach((s) => {
    markdown += `#### ${s.symbol}\n\n`;
    markdown += `- **Entry**: $${s.entry.toFixed(2)}\n`;
    markdown += `- **Target**: $${s.target.toFixed(2)}\n`;
    markdown += `- **Stop**: $${s.stop.toFixed(2)}\n`;
    markdown += `- **Signal Score**: ${s.signalScore.toFixed(1)}/10\n`;
    markdown += `- **Gap**: ${s.gapPercent.toFixed(2)}%\n\n`;
  });

  markdown += `### Top Squeezes\n\n`;
  data.signalBank.squeezes.forEach((s) => {
    markdown += `#### ${s.symbol}\n\n`;
    markdown += `- **Price**: $${s.price.toFixed(2)}\n`;
    markdown += `- **Short Interest**: ${s.shortInterest.toFixed(1)}%\n`;
    markdown += `- **Days to Cover**: ${s.daysToCover.toFixed(1)}\n`;
    markdown += `- **Squeeze Score**: ${s.squeezeScore.toFixed(1)}/10\n\n`;
  });

  // Commodities Section
  markdown += `## 🥇 Commodities Corner\n\n`;

  markdown += `### Gold (GLD)\n\n`;
  markdown += `- **Current Price**: $${data.commodities.gold.price.toFixed(2)}\n`;
  markdown += `- **Weekly Change**: ${data.commodities.gold.weeklyChange > 0 ? "+" : ""}${data.commodities.gold.weeklyChange.toFixed(2)}%\n`;
  markdown += `- **Trend**: ${data.commodities.gold.trend}\n\n`;
  markdown += `${data.commodities.gold.analysis}\n\n`;

  markdown += `### Silver (SLV)\n\n`;
  markdown += `- **Current Price**: $${data.commodities.silver.price.toFixed(2)}\n`;
  markdown += `- **Weekly Change**: ${data.commodities.silver.weeklyChange > 0 ? "+" : ""}${data.commodities.silver.weeklyChange.toFixed(2)}%\n`;
  markdown += `- **Trend**: ${data.commodities.silver.trend}\n\n`;
  markdown += `${data.commodities.silver.analysis}\n\n`;

  // Dark Pools Section
  markdown += `## 🐳 Institutional Flow (Dark Pools)\n\n`;
  markdown += `Following the "smart money" reveals significant institutional activity this week.\n\n`;

  markdown += `### Significant Dark Pool Levels\n\n`;
  data.darkPools.significantLevels.forEach((d) => {
    markdown += `#### ${d.symbol}\n\n`;
    markdown += `- **Level**: $${d.level.toFixed(2)}\n`;
    markdown += `- **Type**: ${d.type}\n`;
    markdown += `- **Volume**: ${(d.volume / 1000000).toFixed(2)}M shares\n`;
    markdown += `- **Confidence**: ${(d.confidence * 100).toFixed(0)}%\n\n`;
  });

  markdown += `> **Educational Note**: Dark pools are private exchanges where large institutions trade off-exchange. Significant accumulation levels often precede price movements. [Learn more about dark pools](https://www.investopedia.com/terms/d/dark-pool.asp)\n\n`;

  // Biweekly Insights
  if (options.includeBiweeklyInsights && data.biweeklyInsights) {
    markdown += `## 👩‍🔬 The Data Science Lab\n\n`;
    markdown += `### ${data.biweeklyInsights.topic}\n\n`;
    markdown += `${data.biweeklyInsights.analysis}\n\n`;

    markdown += `### Key Findings\n\n`;
    data.biweeklyInsights.keyFindings.forEach((f) => {
      markdown += `- ${f}\n`;
    });
    markdown += `\n`;

    markdown += `### Supporting Data\n\n`;
    data.biweeklyInsights.dataPoints.forEach((d) => {
      markdown += `- **${d.metric}**: ${d.value} (Source: ${d.source})\n`;
    });
    markdown += `\n`;
  }

  // Crypto Section
  markdown += `## ₿ Crypto Intel\n\n`;
  markdown += `### Bitcoin Analysis\n\n`;
  markdown += `- **Current Price**: $${data.crypto.bitcoin.price.toLocaleString()}\n`;
  markdown += `- **Weekly Change**: ${data.crypto.bitcoin.weeklyChange > 0 ? "+" : ""}${data.crypto.bitcoin.weeklyChange.toFixed(2)}%\n`;
  markdown += `- **Trend**: ${data.crypto.bitcoin.trend}\n\n`;
  markdown += `${data.crypto.bitcoin.analysis}\n\n`;

  // Conclusion
  markdown += `---\n\n`;
  markdown += `## Conclusion\n\n`;
  markdown += `This week's market performance highlights the continued strength of the technology sector and the transformative impact of AI on the economy. With strong earnings, stable interest rates, and growing AI adoption, the outlook remains positive for investors. As always, stay informed and make decisions based on thorough analysis.\n`;

  return {
    title,
    excerpt,
    content: markdown,
  };
}

