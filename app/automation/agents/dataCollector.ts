const SIGNAL_HUB_API_URL =
  process.env.SIGNAL_HUB_API_URL || "http://localhost:7190/api";
const NEWS_API_KEY = process.env.NEWS_API_KEY;

interface MarketData {
  signals?: any[];
  analysis?: any[];
  trends?: any[];
}

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
}

export async function collectSignalHubData(): Promise<MarketData> {
  try {
    const baseUrl = SIGNAL_HUB_API_URL;

    // Try to fetch common endpoints - adjust based on actual signal-hub API
    const endpoints = [
      "/signals",
      "/analysis",
      "/trends",
      "/market-data",
    ];

    const data: MarketData = {};

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${baseUrl}${endpoint}`, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const result = await response.json();
          if (endpoint.includes("signal")) {
            data.signals = Array.isArray(result) ? result : result.data || [];
          } else if (endpoint.includes("analysis")) {
            data.analysis = Array.isArray(result) ? result : result.data || [];
          } else if (endpoint.includes("trend")) {
            data.trends = Array.isArray(result) ? result : result.data || [];
          }
        }
      } catch (error) {
        // Endpoint doesn't exist or failed, continue
        console.log(`Endpoint ${endpoint} not available or failed`);
      }
    }

    return data;
  } catch (error) {
    console.error("Error collecting signal-hub data:", error);
    return {};
  }
}

export async function collectNewsData(): Promise<NewsArticle[]> {
  const articles: NewsArticle[] = [];

  // Collect from NewsAPI if key is available
  if (NEWS_API_KEY) {
    try {
      const response = await fetch(
        `https://newsapi.org/v2/everything?q=stock+market+OR+stocks+OR+trading&sortBy=publishedAt&language=en&pageSize=20&apiKey=${NEWS_API_KEY}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.articles) {
          articles.push(
            ...data.articles.map((article: any) => ({
              title: article.title || "",
              description: article.description || "",
              url: article.url || "",
              source: article.source?.name || "Unknown",
              publishedAt: article.publishedAt || new Date().toISOString(),
            }))
          );
        }
      }
    } catch (error) {
      console.error("Error fetching from NewsAPI:", error);
    }
  }

  // Add fallback data if no API key
  if (articles.length === 0) {
    // Return sample structure for development
    articles.push({
      title: "Market Update: Stocks Show Mixed Signals",
      description:
        "Today's market analysis shows mixed signals across major indices with technology stocks leading gains.",
      url: "#",
      source: "Market Watch",
      publishedAt: new Date().toISOString(),
    });
  }

  return articles;
}

export async function aggregateData(): Promise<string> {
  const [signalHubData, newsArticles] = await Promise.all([
    collectSignalHubData(),
    collectNewsData(),
  ]);

  // Format data for AI analysis
  let aggregatedText = "STOCK MARKET DATA SUMMARY\n\n";

  // Add signal-hub data
  if (signalHubData.signals && signalHubData.signals.length > 0) {
    aggregatedText += "TRADING SIGNALS:\n";
    signalHubData.signals.slice(0, 10).forEach((signal: any, index: number) => {
      aggregatedText += `${index + 1}. ${JSON.stringify(signal)}\n`;
    });
    aggregatedText += "\n";
  }

  if (signalHubData.analysis && signalHubData.analysis.length > 0) {
    aggregatedText += "MARKET ANALYSIS:\n";
    signalHubData.analysis.slice(0, 10).forEach((analysis: any, index: number) => {
      aggregatedText += `${index + 1}. ${JSON.stringify(analysis)}\n`;
    });
    aggregatedText += "\n";
  }

  if (signalHubData.trends && signalHubData.trends.length > 0) {
    aggregatedText += "MARKET TRENDS:\n";
    signalHubData.trends.slice(0, 10).forEach((trend: any, index: number) => {
      aggregatedText += `${index + 1}. ${JSON.stringify(trend)}\n`;
    });
    aggregatedText += "\n";
  }

  // Add news articles
  if (newsArticles.length > 0) {
    aggregatedText += "FINANCIAL NEWS:\n";
    newsArticles.slice(0, 15).forEach((article, index) => {
      aggregatedText += `${index + 1}. ${article.title}\n`;
      aggregatedText += `   ${article.description}\n`;
      aggregatedText += `   Source: ${article.source}\n`;
      aggregatedText += `   Published: ${article.publishedAt}\n\n`;
    });
  }

  return aggregatedText;
}

