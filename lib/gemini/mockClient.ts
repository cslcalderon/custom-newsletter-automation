// Mock Gemini client for testing without API key
export async function generateMockText(prompt: string): Promise<string> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Return mock responses based on prompt content
  if (prompt.includes("Analyze these stock market trends")) {
    return JSON.stringify({
      relevantStories: [
        {
          title: "Tech Stocks Surge on AI Optimism",
          summary: "Major technology companies see significant gains as AI adoption accelerates. NVIDIA leads with 15% weekly gain, while Microsoft and Google also show strong performance.",
          relevanceScore: 9,
          reason: "High relevance - AI is a major market driver and directly impacts stock market newsletter audience",
        },
        {
          title: "Apple Reports Record iPhone Sales",
          summary: "Apple exceeds expectations with strong iPhone 15 Pro sales, particularly in emerging markets. Stock price jumps 3% in after-hours trading.",
          relevanceScore: 8,
          reason: "Strong relevance - Apple is a major market mover and earnings reports are key for investors",
        },
        {
          title: "Federal Reserve Holds Interest Rates Steady",
          summary: "The Fed announces no change in interest rates, providing stability for financial markets. Analysts predict continued pause through Q2.",
          relevanceScore: 7,
          reason: "Moderate relevance - Interest rate decisions affect all market sectors and investor sentiment",
        },
      ],
      overallTrend: "Markets show bullish sentiment driven by strong tech earnings and AI optimism. The S&P 500 is up 2.5% this week, with technology sector leading gains. Federal Reserve's rate stability provides additional support for risk assets.",
    });
  }

  if (prompt.includes("Create a newsletter")) {
    return JSON.stringify({
      subject: "Tech Stocks Soar: AI Drives Market Gains | Weekly Market Update",
      header: "Weekly Market Update: AI Revolution Continues",
      introduction:
        "This week's market performance has been nothing short of impressive, with technology stocks leading the charge. The AI revolution is in full swing, driving significant gains across major tech companies. Let's dive into the key stories that shaped this week's trading.",
      sections: [
        {
          title: "Tech Stocks Surge on AI Optimism",
          content:
            "The technology sector continues to dominate market headlines as artificial intelligence adoption accelerates across industries. NVIDIA has been the standout performer, with shares surging 15% this week following the announcement of their next-generation AI chip architecture.\n\nMajor tech companies including Microsoft, Google, and Amazon are all seeing strong gains as they integrate AI capabilities into their core products. Microsoft's Azure cloud platform reported record revenue, with AI services being a key growth driver. This trend shows no signs of slowing down, making tech stocks a focal point for investors.",
        },
        {
          title: "Apple Exceeds Expectations with Record Sales",
          content:
            "Apple delivered another strong quarter, with iPhone 15 Pro sales exceeding analyst expectations. The company's performance in emerging markets has been particularly impressive, driving overall revenue growth.\n\nThe stock jumped 3% in after-hours trading following the earnings announcement. Apple's ability to maintain premium pricing while expanding market share demonstrates the strength of their brand and product ecosystem. Investors are optimistic about the company's continued growth trajectory.",
        },
        {
          title: "Fed Provides Market Stability",
          content:
            "The Federal Reserve's decision to hold interest rates steady has provided much-needed stability to financial markets. This pause in rate hikes has been welcomed by investors, who were concerned about the impact of further monetary tightening.\n\nAnalysts predict the Fed will maintain this position through Q2, which should support continued market gains. The low volatility, as indicated by the VIX dropping to 12.5, reflects investor confidence in the current economic environment.",
        },
      ],
      conclusion:
        "This week's market performance highlights the continued strength of the technology sector and the transformative impact of AI on the economy. With strong earnings, stable interest rates, and growing AI adoption, the outlook remains positive for investors. As always, stay informed and make decisions based on thorough analysis.",
    });
  }

  if (prompt.includes("Create a comprehensive blog post")) {
    return JSON.stringify({
      title: "The AI Revolution: How Technology Stocks Are Driving Market Gains",
      excerpt:
        "This week's market performance showcases the transformative power of artificial intelligence, with tech stocks leading significant gains across major indices.",
      content: `# The AI Revolution: How Technology Stocks Are Driving Market Gains

The stock market has been on an impressive run this week, with technology stocks at the forefront of the action. The artificial intelligence revolution is not just a buzzword—it's driving real, measurable gains across the market.

## Tech Stocks Surge on AI Optimism

The technology sector continues to dominate market headlines as artificial intelligence adoption accelerates across industries. NVIDIA has been the standout performer, with shares surging 15% this week following the announcement of their next-generation AI chip architecture.

Major tech companies including Microsoft, Google, and Amazon are all seeing strong gains as they integrate AI capabilities into their core products. Microsoft's Azure cloud platform reported record revenue, with AI services being a key growth driver.

### What This Means for Investors

For investors, this trend represents both opportunity and caution. The AI boom is creating significant value, but it's important to evaluate companies based on their actual AI implementation and revenue generation, not just hype.

## Apple Exceeds Expectations

Apple delivered another strong quarter, with iPhone 15 Pro sales exceeding analyst expectations. The company's performance in emerging markets has been particularly impressive, driving overall revenue growth.

The stock jumped 3% in after-hours trading following the earnings announcement. Apple's ability to maintain premium pricing while expanding market share demonstrates the strength of their brand.

## Federal Reserve Provides Stability

The Federal Reserve's decision to hold interest rates steady has provided much-needed stability to financial markets. This pause in rate hikes has been welcomed by investors, who were concerned about the impact of further monetary tightening.

Analysts predict the Fed will maintain this position through Q2, which should support continued market gains.

## Looking Ahead

The combination of strong tech earnings, AI innovation, and stable monetary policy creates a positive environment for continued market growth. However, investors should remain vigilant and focus on companies with strong fundamentals rather than chasing trends.

As we move forward, the key will be identifying which companies are truly leveraging AI for sustainable competitive advantages versus those simply riding the wave.`,
    });
  }

  // Default mock response
  return JSON.stringify({
    message: "Mock AI response",
    prompt: prompt.substring(0, 100) + "...",
  });
}

export async function analyzeTrendsMock(data: string): Promise<{
  relevantStories: Array<{
    title: string;
    summary: string;
    relevanceScore: number;
    reason: string;
  }>;
  overallTrend: string;
}> {
  const response = await generateMockText("Analyze these stock market trends");
  return JSON.parse(response);
}

export async function generateNewsletterContentMock(
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
  const response = await generateMockText("Create a newsletter");
  return JSON.parse(response);
}

export async function generateBlogPostMock(
  stories: Array<{ title: string; summary: string; reason: string }>,
  overallTrend: string
): Promise<{
  title: string;
  excerpt: string;
  content: string;
}> {
  const response = await generateMockText("Create a comprehensive blog post");
  return JSON.parse(response);
}

