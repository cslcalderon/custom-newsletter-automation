import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY is not set. AI features will not work.");
}

export const geminiClient = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY || ""
);

export async function generateText(prompt: string, model: string = "gemini-pro") {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const modelInstance = geminiClient.getGenerativeModel({ model });
  const result = await modelInstance.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

export async function analyzeTrends(data: string): Promise<{
  relevantStories: Array<{
    title: string;
    summary: string;
    relevanceScore: number;
    reason: string;
  }>;
  overallTrend: string;
}> {
  const prompt = `You are a financial news analyst. Analyze the following stock market data and news:

${data}

Identify the top 3 most relevant and interesting stories for a stock market newsletter audience. For each story, provide:
1. A compelling title
2. A brief summary (2-3 sentences)
3. A relevance score (1-10)
4. Why this story is relevant

Also provide an overall market trend summary in 2-3 sentences.

Return your response as a JSON object with this structure:
{
  "relevantStories": [
    {
      "title": "Story title",
      "summary": "Story summary",
      "relevanceScore": 8,
      "reason": "Why it's relevant"
    }
  ],
  "overallTrend": "Overall market trend summary"
}

Only return valid JSON, no additional text.`;

  try {
    const response = await generateText(prompt);
    // Clean the response to ensure it's valid JSON
    const cleanedResponse = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error("Error analyzing trends:", error);
    throw new Error("Failed to analyze trends with AI");
  }
}

export async function generateNewsletterContent(
  stories: Array<{ title: string; summary: string; reason: string }>,
  overallTrend: string
): Promise<{
  subject: string;
  header: string;
  introduction: string;
  sections: Array<{
    title: string;
    content: string;
  }>;
  conclusion: string;
}> {
  const storiesText = stories
    .map((s, i) => `${i + 1}. ${s.title}\n   ${s.summary}\n   Context: ${s.reason}`)
    .join("\n\n");

  const prompt = `You are a professional newsletter writer for a stock market newsletter. Create engaging newsletter content based on these stories:

${storiesText}

Overall Market Trend: ${overallTrend}

Create a newsletter with:
1. A compelling email subject line (max 60 characters)
2. A main header/title for the newsletter
3. An engaging introduction paragraph (3-4 sentences)
4. Content sections for each story (each section should have a title and 2-3 paragraphs of engaging content)
5. A conclusion paragraph that ties everything together

Return your response as a JSON object with this structure:
{
  "subject": "Email subject line",
  "header": "Newsletter header",
  "introduction": "Introduction paragraph",
  "sections": [
    {
      "title": "Section title",
      "content": "Section content with multiple paragraphs"
    }
  ],
  "conclusion": "Conclusion paragraph"
}

Only return valid JSON, no additional text.`;

  try {
    const response = await generateText(prompt);
    const cleanedResponse = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error("Error generating newsletter content:", error);
    throw new Error("Failed to generate newsletter content with AI");
  }
}

export async function generateBlogPost(
  stories: Array<{ title: string; summary: string; reason: string }>,
  overallTrend: string
): Promise<{
  title: string;
  excerpt: string;
  content: string; // Markdown format
}> {
  const storiesText = stories
    .map((s, i) => `${i + 1}. ${s.title}\n   ${s.summary}\n   Context: ${s.reason}`)
    .join("\n\n");

  const prompt = `You are a professional financial blog writer. Create a comprehensive blog post based on these stock market stories:

${storiesText}

Overall Market Trend: ${overallTrend}

Create a well-structured blog post with:
1. A compelling title
2. A brief excerpt (2-3 sentences)
3. Full blog post content in Markdown format with:
   - Introduction
   - Sections for each story with detailed analysis
   - Conclusion
   - Use proper Markdown formatting (headers, paragraphs, lists, etc.)

Return your response as a JSON object with this structure:
{
  "title": "Blog post title",
  "excerpt": "Brief excerpt",
  "content": "Full markdown content with # headers, paragraphs, etc."
}

Only return valid JSON, no additional text.`;

  try {
    const response = await generateText(prompt);
    const cleanedResponse = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error("Error generating blog post:", error);
    throw new Error("Failed to generate blog post with AI");
  }
}

