export interface DataSource {
  name: string;
  type: "database" | "api" | "algorithm" | "external";
  endpoint?: string;
  table?: string;
  description: string;
}

export interface AIReasoning {
  section: string;
  decision: string;
  reasoning: string;
  confidence: number;
  dataSources: DataSource[];
  alternativeConsiderations?: string[];
}

export interface NewsletterSection {
  id: string;
  title: string;
  content: string;
  dataSources: DataSource[];
  aiReasoning: AIReasoning;
}

export interface NewsletterGenerationOptions {
  includeBiweeklyInsights: boolean;
  biweeklyTopic?: string;
}

