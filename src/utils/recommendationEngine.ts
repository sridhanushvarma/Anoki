// Define tool categories and tags for recommendation system
export interface Tool {
  id: string;
  name: string;
  description: string;
  url: string;
  category: string;
  tags: string[];
}

// Define all tools with their categories and tags
export const allTools: Tool[] = [
  // AI Tools
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    description: 'OpenAI\'s conversational AI',
    url: 'https://chat.openai.com',
    category: 'ai-tools',
    tags: ['ai', 'chat', 'writing', 'assistant']
  },
  {
    id: 'gemini',
    name: 'Gemini',
    description: 'Google\'s multimodal AI',
    url: 'https://gemini.google.com',
    category: 'ai-tools',
    tags: ['ai', 'chat', 'multimodal', 'assistant']
  },
  {
    id: 'claude',
    name: 'Claude',
    description: 'Anthropic\'s helpful assistant',
    url: 'https://claude.ai',
    category: 'ai-tools',
    tags: ['ai', 'chat', 'writing', 'assistant']
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    description: 'AI-powered search engine',
    url: 'https://perplexity.ai',
    category: 'ai-tools',
    tags: ['ai', 'search', 'research']
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    description: 'Open-weight language models',
    url: 'https://mistral.ai',
    category: 'ai-tools',
    tags: ['ai', 'language-model', 'developer']
  },
  {
    id: 'midjourney',
    name: 'Midjourney',
    description: 'AI image generation',
    url: 'https://www.midjourney.com',
    category: 'ai-tools',
    tags: ['ai', 'image', 'art', 'creative']
  },
  {
    id: 'dalle',
    name: 'DALL-E',
    description: 'OpenAI\'s image generator',
    url: 'https://openai.com/dall-e-3',
    category: 'ai-tools',
    tags: ['ai', 'image', 'art', 'creative']
  },
  {
    id: 'stability',
    name: 'Stability AI',
    description: 'Open-source image models',
    url: 'https://stability.ai',
    category: 'ai-tools',
    tags: ['ai', 'image', 'open-source']
  },
  {
    id: 'huggingface',
    name: 'Hugging Face',
    description: 'AI model repository',
    url: 'https://huggingface.co',
    category: 'ai-tools',
    tags: ['ai', 'developer', 'models', 'repository']
  },
  {
    id: 'runway',
    name: 'Runway',
    description: 'AI video generation',
    url: 'https://runwayml.com',
    category: 'ai-tools',
    tags: ['ai', 'video', 'creative']
  },
  
  // File Converters
  {
    id: 'pdf-to-word',
    name: 'PDF to Word',
    description: 'Convert PDF files to Word documents',
    url: '/converters/pdf-to-word',
    category: 'converters',
    tags: ['pdf', 'word', 'document', 'conversion']
  },
  {
    id: 'word-to-pdf',
    name: 'Word to PDF',
    description: 'Convert Word documents to PDF files',
    url: '/converters/word-to-pdf',
    category: 'converters',
    tags: ['word', 'pdf', 'document', 'conversion']
  },
  {
    id: 'image-converter',
    name: 'Image Converter',
    description: 'Convert images between formats',
    url: '/converters/image',
    category: 'converters',
    tags: ['image', 'conversion', 'format']
  },
  
  // AI Detectors
  {
    id: 'ai-text-detector',
    name: 'AI Text Detector',
    description: 'Detect AI-generated text',
    url: '/detectors/ai-text',
    category: 'detectors',
    tags: ['ai', 'text', 'detection', 'plagiarism']
  },
  {
    id: 'ai-image-detector',
    name: 'AI Image Detector',
    description: 'Detect AI-generated images',
    url: '/detectors/ai-image',
    category: 'detectors',
    tags: ['ai', 'image', 'detection']
  },
  {
    id: 'plagiarism-checker',
    name: 'Plagiarism Checker',
    description: 'Check text for plagiarism',
    url: '/detectors/plagiarism',
    category: 'detectors',
    tags: ['text', 'plagiarism', 'academic', 'writing']
  }
];

// Function to get tool by ID
export const getToolById = (id: string): Tool | undefined => {
  return allTools.find(tool => tool.id === id);
};

// Function to get related tools based on a tool ID
export const getRelatedTools = (toolId: string, limit: number = 3): Tool[] => {
  const tool = getToolById(toolId);
  
  if (!tool) {
    return [];
  }
  
  // Calculate relevance score for each tool based on shared tags and category
  const scoredTools = allTools
    .filter(t => t.id !== toolId) // Exclude the current tool
    .map(t => {
      let score = 0;
      
      // Add points for same category
      if (t.category === tool.category) {
        score += 3;
      }
      
      // Add points for each shared tag
      tool.tags.forEach(tag => {
        if (t.tags.includes(tag)) {
          score += 2;
        }
      });
      
      return { tool: t, score };
    })
    .filter(item => item.score > 0) // Only include tools with some relevance
    .sort((a, b) => b.score - a.score); // Sort by score (highest first)
  
  // Return the top N tools
  return scoredTools.slice(0, limit).map(item => item.tool);
};

// Local storage key for user history
const USER_HISTORY_KEY = 'anoki_user_tool_history';

// Function to save tool interaction to local storage
export const saveToolInteraction = (toolId: string): void => {
  if (typeof window === 'undefined') {
    return; // Skip if running on server
  }
  
  try {
    // Get existing history or initialize empty array
    const history = JSON.parse(localStorage.getItem(USER_HISTORY_KEY) || '[]');
    
    // Add new interaction at the beginning (most recent first)
    history.unshift({
      toolId,
      timestamp: new Date().toISOString()
    });
    
    // Keep only the 10 most recent interactions
    const trimmedHistory = history.slice(0, 10);
    
    // Save back to local storage
    localStorage.setItem(USER_HISTORY_KEY, JSON.stringify(trimmedHistory));
  } catch (error) {
    console.error('Error saving tool interaction:', error);
  }
};

// Function to get personalized recommendations based on user history
export const getPersonalizedRecommendations = (limit: number = 4): Tool[] => {
  if (typeof window === 'undefined') {
    return []; // Return empty array if running on server
  }
  
  try {
    // Get user history
    const history = JSON.parse(localStorage.getItem(USER_HISTORY_KEY) || '[]');
    
    if (history.length === 0) {
      // If no history, return some popular tools
      return allTools.slice(0, limit);
    }
    
    // Get unique tool IDs from history, most recent first
    const uniqueToolIds: string[] = Array.from(new Set(history.map((item: any) => item.toolId)));
    
    // Get related tools for each tool in history
    const recommendations = uniqueToolIds.flatMap((toolId: string) => 
      getRelatedTools(toolId, Math.ceil(limit / Math.min(uniqueToolIds.length, 3)))
    );
    
    // Remove duplicates and limit to requested number
    const uniqueRecommendations = Array.from(
      new Map(recommendations.map(tool => [tool.id, tool])).values()
    ).slice(0, limit);
    
    return uniqueRecommendations;
  } catch (error) {
    console.error('Error getting personalized recommendations:', error);
    return allTools.slice(0, limit); // Fallback to some default tools
  }
};
