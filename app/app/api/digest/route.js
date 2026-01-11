import { NextResponse } from 'next/server';

export async function POST(request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    const { articles } = await request.json();
    
    if (!articles || !Array.isArray(articles) || articles.length === 0) {
      return NextResponse.json({ error: 'No articles provided' }, { status: 400 });
    }

    const summaryInput = articles.slice(0, 25).map((a, i) => 
      `[${i + 1}] ${a.title} (${a.source}): ${a.snippet || 'No summary'}`
    ).join('\n');

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [{
          role: "user",
          content: `You are writing a weekly intelligence briefing on veterinary AI for an executive audience.

Here are ${articles.length} recent articles (numbered for citation):
${summaryInput}

Write a concise digest (3-4 paragraphs) that:
1. Opens with the most significant development or trend
2. Synthesizes key themes across research, industry, and news
3. Highlights notable papers, product launches, or strategic moves
4. Closes with implications for veterinary practice leaders

IMPORTANT: When referencing specific articles, include the citation number in brackets, e.g., [1], [3], [7].

Write in a crisp, newsletter style. No bullet points. Use citation numbers to reference sources.`
        }]
      })
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Digest error:', error);
    return NextResponse.json({ error: 'Digest generation failed' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
