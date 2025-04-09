import Anthropic from '@anthropic-ai/sdk';

/**
 * Types for Claude API responses and parameters
 */
export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string | Array<{type: string; text: string}>;
}

export interface CourseModule {
  title: string;
  description: string;
  items: Array<{
    type: 'link' | 'assignment';
    title: string;
    description: string;
    url?: string;
  }>;
}

export interface CourseStructure {
  modules: CourseModule[];
}

/**
 * Creates an Anthropic client instance with the provided API key
 * @param apiKey - Optional API key to use instead of the environment variable
 * @returns Anthropic client instance
 */
export const createAnthropicClient = (apiKey?: string): Anthropic => {
  return new Anthropic({
    apiKey: apiKey || process.env.REACT_APP_ANTHROPIC_API_KEY,
    dangerouslyAllowBrowser: true,
  });
};

/**
 * Sends a message to Claude and returns the response
 * @param prompt - The user message to send to Claude
 * @param options - Additional options
 * @returns The Claude API response
 */
export const sendMessageToClaude = async (
  prompt: string,
  options: {
    apiKey?: string;
    model?: string;
    maxTokens?: number;
    temperature?: number;
  } = {}
) => {
  const {
    apiKey,
    model = 'claude-3-opus-20240229',
    maxTokens = 1000,
    temperature = 0.7,
  } = options;

  try {
    // Use our server-side API endpoint instead of calling Claude directly
    const response = await fetch('/api/claude/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        apiKey,
        model,
        maxTokens,
        temperature,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API error: ${errorData.error || response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error calling Claude API:', error);
    throw error;
  }
};

/**
 * Generates a course structure based on provided materials
 * @param materials - Course materials and requirements
 * @param options - Additional options
 * @returns Course structure with modules
 */
export const generateCourseStructure = async (
  materials: string,
  options: {
    apiKey?: string;
    temperature?: number;
  } = {}
) => {
  const {
    apiKey,
    temperature = 0.7,
  } = options;

  const prompt = `Create a detailed course structure based on these materials and requirements: ${materials}. 
                 Return ONLY a JSON response with this exact structure: 
                 {
                   "modules": [
                     {
                       "title": "string",
                       "description": "string",
                       "items": [
                         {
                           "type": "link" or "assignment",
                           "title": "string",
                           "description": "string"
                         }
                       ]
                     }
                   ]
                 }`;

  const systemPrompt = "You are an expert curriculum designer. Always respond with valid JSON matching the exact structure specified. Never include explanatory text or markdown formatting.";

  try {
    // Use our server-side API endpoint instead of calling Claude directly
    const response = await fetch('/api/claude/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: `${systemPrompt}\n\n${prompt}`,
        apiKey,
        model: 'claude-3-opus-20240229',
        maxTokens: 4000,
        temperature,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API error: ${errorData.error || response.statusText}`);
    }
    
    const data = await response.json();
    
    // Extract the content from Claude's response
    const content = data.content[0] as { type: string; text: string };
    
    if (content.type !== 'text' || !content.text) {
      throw new Error('Unexpected response format from Claude API');
    }
    
    // Parse the JSON response
    try {
      return JSON.parse(content.text) as CourseStructure;
    } catch (parseError) {
      console.error('Failed to parse Claude response:', parseError);
      throw new Error('Failed to parse course structure from Claude');
    }
  } catch (error) {
    console.error('Error generating course structure:', error);
    throw error;
  }
};

export default {
  sendMessageToClaude,
  generateCourseStructure,
  createAnthropicClient,
}; 