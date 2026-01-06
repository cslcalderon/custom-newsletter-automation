// Mock data collector for testing without external APIs
// Follows SignalPro Newsletter Strategy structure

export interface MarketPulseData {
  indices: {
    SPY: { weeklyChange: number; currentPrice: number };
    QQQ: { weeklyChange: number; currentPrice: number };
    IWM: { weeklyChange: number; currentPrice: number };
  };
  sectorHeatmap: Array<{
    sector: string;
    performance: number;
    trend: "BULLISH" | "NEUTRAL" | "BEARISH";
  }>;
  industryMovers: Array<{
    industry: string;
    performance: number;
    keyStocks: string[];
  }>;
}

export interface SignalBankData {
  gapSignals: Array<{
    symbol: string;
    entry: number;
    target: number;
    stop: number;
    signalScore: number;
    gapPercent: number;
  }>;
  squeezes: Array<{
    symbol: string;
    shortInterest: number;
    daysToCover: number;
    squeezeScore: number;
    price: number;
  }>;
}

export interface CommoditiesData {
  gold: {
    symbol: "GLD";
    price: number;
    weeklyChange: number;
    trend: "BULLISH" | "NEUTRAL" | "BEARISH";
    analysis: string;
  };
  silver: {
    symbol: "SLV";
    price: number;
    weeklyChange: number;
    trend: "BULLISH" | "NEUTRAL" | "BEARISH";
    analysis: string;
  };
}

export interface DarkPoolData {
  significantLevels: Array<{
    symbol: string;
    level: number;
    type: "ACCUMULATION" | "DISTRIBUTION";
    volume: number;
    confidence: number;
  }>;
}

export interface CryptoData {
  bitcoin: {
    price: number;
    weeklyChange: number;
    trend: "BULLISH" | "NEUTRAL" | "BEARISH";
    analysis: string;
  };
}

export interface BiweeklyInsightsData {
  topic: string;
  analysis: string;
  keyFindings: string[];
  dataPoints: Array<{
    metric: string;
    value: string | number;
    source: string;
  }>;
}

export interface CollectedData {
  marketPulse: MarketPulseData;
  signalBank: SignalBankData;
  commodities: CommoditiesData;
  darkPools: DarkPoolData;
  crypto: CryptoData;
  biweeklyInsights?: BiweeklyInsightsData;
}

export async function collectMockData(includeBiweekly: boolean = false): Promise<CollectedData> {
  // Simulate data collection delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    marketPulse: {
      indices: {
        SPY: { weeklyChange: 2.3, currentPrice: 445.50 },
        QQQ: { weeklyChange: 3.1, currentPrice: 385.20 },
        IWM: { weeklyChange: 1.8, currentPrice: 195.40 },
      },
      sectorHeatmap: [
        { sector: "Technology", performance: 3.2, trend: "BULLISH" },
        { sector: "Energy", performance: -1.5, trend: "BEARISH" },
        { sector: "Healthcare", performance: 1.9, trend: "BULLISH" },
        { sector: "Finance", performance: 0.8, trend: "NEUTRAL" },
        { sector: "Consumer Discretionary", performance: 2.1, trend: "BULLISH" },
        { sector: "Industrials", performance: 1.2, trend: "NEUTRAL" },
      ],
      industryMovers: [
        { industry: "Semiconductors", performance: 4.5, keyStocks: ["NVDA", "AMD", "INTC"] },
        { industry: "Cloud Computing", performance: 3.8, keyStocks: ["MSFT", "AMZN", "GOOGL"] },
        { industry: "AI Infrastructure", performance: 5.2, keyStocks: ["NVDA", "SMCI", "TSM"] },
      ],
    },
    signalBank: {
      gapSignals: [
        {
          symbol: "NVDA",
          entry: 485.50,
          target: 520.00,
          stop: 470.00,
          signalScore: 9.2,
          gapPercent: 3.5,
        },
        {
          symbol: "TSLA",
          entry: 245.30,
          target: 265.00,
          stop: 235.00,
          signalScore: 7.8,
          gapPercent: 2.8,
        },
        {
          symbol: "AMD",
          entry: 142.50,
          target: 155.00,
          stop: 138.00,
          signalScore: 8.5,
          gapPercent: 4.2,
        },
      ],
      squeezes: [
        {
          symbol: "COIN",
          shortInterest: 18.5,
          daysToCover: 4.2,
          squeezeScore: 8.9,
          price: 125.40,
        },
        {
          symbol: "TSLA",
          shortInterest: 15.2,
          daysToCover: 3.8,
          squeezeScore: 7.5,
          price: 245.30,
        },
      ],
    },
    commodities: {
      gold: {
        symbol: "GLD",
        price: 198.50,
        weeklyChange: 1.2,
        trend: "BULLISH",
        analysis: "Gold continues to show strength as investors seek safe haven assets. Technical indicators suggest potential breakout above $200 resistance level.",
      },
      silver: {
        symbol: "SLV",
        price: 23.40,
        weeklyChange: 0.8,
        trend: "NEUTRAL",
        analysis: "Silver trading in consolidation range. Industrial demand remains steady, but lacks the momentum seen in gold.",
      },
    },
    darkPools: {
      significantLevels: [
        {
          symbol: "AAPL",
          level: 175.00,
          type: "ACCUMULATION",
          volume: 2500000,
          confidence: 0.85,
        },
        {
          symbol: "MSFT",
          level: 380.00,
          type: "ACCUMULATION",
          volume: 1800000,
          confidence: 0.78,
        },
        {
          symbol: "NVDA",
          level: 490.00,
          type: "DISTRIBUTION",
          volume: 1200000,
          confidence: 0.72,
        },
      ],
    },
    crypto: {
      bitcoin: {
        price: 42500,
        weeklyChange: 2.8,
        trend: "BULLISH",
        analysis: "Bitcoin showing resilience above $42K support. Institutional interest remains strong with ETF inflows continuing. Next resistance at $45K.",
      },
    },
    ...(includeBiweekly && {
      biweeklyInsights: {
        topic: "AI Bubble vs. 1995 Dot-Com: A Statistical Comparison",
        analysis: "Comparing current AI sector valuations to the 1995-2000 dot-com bubble reveals key differences. While both periods show rapid growth, current AI companies demonstrate stronger fundamentals with actual revenue generation and clearer paths to profitability. The 1995 bubble was characterized by companies with no revenue, while today's AI leaders like NVIDIA and Microsoft show robust earnings.",
        keyFindings: [
          "Current AI sector P/E ratios average 28x vs. 1999 dot-com average of 45x",
          "Revenue growth in AI sector is 35% YoY vs. 15% in 1999 tech sector",
          "Profit margins are positive for 65% of AI companies vs. 25% in 1999",
          "Institutional ownership is 45% vs. 20% in 1999, indicating more stable investor base",
        ],
        dataPoints: [
          { metric: "AI Sector Market Cap Growth (2023-2024)", value: "+85%", source: "Internal Database" },
          { metric: "Dot-Com Market Cap Growth (1995-1999)", value: "+320%", source: "Historical Data" },
          { metric: "Current AI Sector Revenue Growth", value: "35% YoY", source: "Internal Database" },
          { metric: "1999 Tech Sector Revenue Growth", value: "15% YoY", source: "Historical Data" },
        ],
      },
    }),
  };
}

// Legacy function for backward compatibility - returns string format
export async function collectMockDataLegacy(): Promise<string> {
  // Return old string format for blog generation
  return `STOCK MARKET DATA SUMMARY

TRADING SIGNALS:
1. {"symbol": "AAPL", "signal": "BUY", "confidence": 0.85, "price": 175.50, "target": 185.00, "reason": "Strong earnings report and positive guidance"}
2. {"symbol": "TSLA", "signal": "HOLD", "confidence": 0.65, "price": 245.30, "target": 250.00, "reason": "Mixed signals from production data"}
3. {"symbol": "MSFT", "signal": "BUY", "confidence": 0.90, "price": 380.25, "target": 400.00, "reason": "Cloud revenue growth exceeds expectations"}

MARKET ANALYSIS:
1. {"sector": "Technology", "trend": "BULLISH", "performance": "+2.5%", "keyDrivers": ["AI adoption", "Cloud migration", "Strong earnings"]}
2. {"sector": "Finance", "trend": "NEUTRAL", "performance": "+0.3%", "keyDrivers": ["Interest rate stability", "Loan growth"]}

FINANCIAL NEWS:
1. Tech Stocks Surge on AI Optimism
   Major technology companies see significant gains as AI adoption accelerates across industries.
   Source: Financial Times
   Published: 2024-01-15T10:30:00Z`;
}
