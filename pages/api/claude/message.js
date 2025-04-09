// Next.js API route to proxy requests to Claude API
import Anthropic from '@anthropic-ai/sdk';

export default async function handler(req, res) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, apiKey, maxTokens = 1000, temperature = 0.7, model = 'claude-3-opus-20240229' } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Use the provided API key or fall back to environment variable
    const anthropic = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY || process.env.REACT_APP_ANTHROPIC_API_KEY,
    });

    const response = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      temperature,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error calling Claude API:', error);
    return res.status(500).json({ 
      error: error.message,
      details: error.response?.data || 'No additional details available'
    });
  }
} 