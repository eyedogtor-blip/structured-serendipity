import { NextResponse } from 'next/server';

const SEARCH_QUERIES = [
  'veterinary artificial intelligence machine learning diagnosis 2024 2025',
  'AI pet health animal medicine deep learning research',
  'dvm360 AVMA veterinary technology innovation AI',
  'machine learning veterinary radiology imaging pathology',
  'AI veterinary practice management automation software',
  'livestock cattle poultry AI health monitoring'
];

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const queryIndex = parseInt(searchParams.get('q') || '0');
  
  if (queryIndex < 0 || queryIndex >= SEARCH_QUERIES.length) {
    return NextResponse.json({ error: 'Invalid query index' }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        messages: [{
          role: "user",
          content: `Search: ${SEARCH_QUERIES[queryIndex]}

Return ONLY a JSON array of 8-10 recent articles. Each must have:
- title: article title
- url: source URL
- source: publication name
- date: publication date or "Recent"
- snippet: 1-2 sentence summary

ONLY valid JSON array, no other text:
[{"title":"...","url":"...","source":"...","date":"...","snippet":"..."}]`
        }]
      })
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
