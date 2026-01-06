import { analyzeTrends } from "@/lib/gemini/client";
import { analyzeTrendsMock } from "@/lib/gemini/mockClient";
import { aggregateData } from "./dataCollector";
import { collectMockData, type CollectedData } from "./mockDataCollector";
import type { NewsletterGenerationOptions } from "../types/newsletterStrategy";

export interface TrendAnalysisResult {
  relevantStories?: Array<{
    title: string;
    summary: string;
    relevanceScore: number;
    reason: string;
  }>;
  overallTrend?: string;
  analyzedAt: Date;
  rawData?: CollectedData; // For newsletter generation with structured data
}

const USE_MOCK_MODE = process.env.USE_MOCK_MODE === "true" || !process.env.GEMINI_API_KEY;

export async function analyzeMarketTrends(
  options?: NewsletterGenerationOptions
): Promise<TrendAnalysisResult> {
  try {
    // For newsletter generation, use structured data collection
    if (options) {
      if (USE_MOCK_MODE) {
        console.log("Using mock structured data for newsletter generation...");
        const structuredData = await collectMockData(options.includeBiweeklyInsights);
        return {
          analyzedAt: new Date(),
          rawData: structuredData,
        };
      } else {
        // In real mode, would collect structured data from APIs
        // For now, fall back to mock
        const structuredData = await collectMockData(options.includeBiweeklyInsights);
        return {
          analyzedAt: new Date(),
          rawData: structuredData,
        };
      }
    }

    // Legacy path for blog posts
    let aggregatedData: string;

    // Use mock data if in mock mode or if API key is not set
    if (USE_MOCK_MODE) {
      console.log("Using mock data for testing...");
      aggregatedData = await collectMockDataLegacy();
    } else {
      // Collect and aggregate data from real APIs
      aggregatedData = await aggregateData();
    }

    // Use Gemini AI to analyze trends (or mock if no API key)
    let analysis;
    if (USE_MOCK_MODE) {
      analysis = await analyzeTrendsMock(aggregatedData);
    } else {
      analysis = await analyzeTrends(aggregatedData);
    }

    return {
      ...analysis,
      analyzedAt: new Date(),
    };
  } catch (error) {
    console.error("Error in trend analysis:", error);
    // Fallback to mock mode if real API fails
    if (!USE_MOCK_MODE) {
      console.log("Falling back to mock mode...");
      const mockData = await collectMockData(false);
      return {
        analyzedAt: new Date(),
        rawData: mockData,
      };
    }
    throw error;
  }
}

// Legacy function for backward compatibility
async function collectMockDataLegacy(): Promise<string> {
  const { collectMockDataLegacy } = await import("./mockDataCollector");
  return collectMockDataLegacy();
}

