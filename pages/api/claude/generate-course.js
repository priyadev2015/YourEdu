// API endpoint for generating course structure with Claude
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
    const { materials } = req.body;

    if (!materials) {
      return res.status(400).json({ error: 'Materials are required' });
    }

    // Keep the prompt simple to avoid large headers
    const prompt = `Create a course structure for: ${materials}`;
    
    // System prompt to guide the response format
    const systemPrompt = "You are an expert curriculum designer. Create a course structure with modules and items. Return JSON with this structure: {modules: [{title, description, items: [{type, title, description}]}]}";
    
    // Use the API key from environment variable
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || process.env.REACT_APP_ANTHROPIC_API_KEY,
    });

    const response = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: "user", content: prompt }],
    });

    // Extract the content from Claude's response
    const content = response.content[0];
    
    if (content.type !== 'text' || !content.text) {
      throw new Error('Unexpected response format from Claude API');
    }
    
    // Try to parse JSON from the response
    try {
      // Look for JSON in the response
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        const courseData = JSON.parse(jsonStr);
        return res.status(200).json(courseData);
      } else {
        // If no JSON found, return the raw text
        return res.status(200).json({ 
          modules: [
            {
              title: "Generated Course",
              description: "Course generated from Claude",
              items: [
                {
                  type: "link",
                  title: "Claude Response",
                  description: content.text
                }
              ]
            }
          ]
        });
      }
    } catch (parseError) {
      console.error('Failed to parse Claude response:', parseError);
      // Return a fallback structure
      return res.status(200).json({ 
        modules: [
          {
            title: "Generated Course",
            description: "Course generated from Claude",
            items: [
              {
                type: "link",
                title: "Claude Response",
                description: content.text
              }
            ]
          }
        ]
      });
    }
  } catch (error) {
    console.error('Error generating course structure:', error);
    return res.status(500).json({ 
      error: error.message,
      details: error.response?.data || 'No additional details available'
    });
  }
} 