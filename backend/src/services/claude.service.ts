import Anthropic from '@anthropic-ai/sdk';
import { DatabaseService } from './database.service';
import { QueryParserService } from './queryParser.service';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatRequest {
  message: string;
  conversationHistory?: ChatMessage[];
}

export interface ChatResponse {
  response: string;
  context: any[];
  timestamp: Date;
}

export class ClaudeService {
  private anthropic: Anthropic;
  private dbService: DatabaseService;
  private queryParser: QueryParserService;

  constructor(dbService: DatabaseService, apiKey?: string) {
    if (!apiKey) {
      throw new Error('Anthropic API key is required');
    }
    
    this.anthropic = new Anthropic({
      apiKey: apiKey,
    });
    this.dbService = dbService;
    this.queryParser = new QueryParserService(dbService);
  }

  /**
   * Process a chat message and generate a response using Claude
   */
  async processMessage(request: ChatRequest): Promise<ChatResponse> {
    try {
      // Parse query and extract optimized context
      const queryEntities = await this.queryParser.parseQuery(request.message);
      const context = await this.queryParser.buildOptimizedContext(queryEntities);
      
      console.log(`Query analysis: ${queryEntities.queryType} (confidence: ${queryEntities.confidence})`);
      console.log(`Context size: ${context.length} items (vs potential 25+ implementations)`);
      
      // Build the system prompt with context
      const systemPrompt = this.buildSystemPrompt(context);
      
      // Build conversation history
      const messages = this.buildMessageHistory(request);
      
      // Build conversation prompt
      const conversationPrompt = this.buildConversationPrompt(systemPrompt, messages);
      
      // Call Claude API (using legacy completions API)
      const response = await this.anthropic.completions.create({
        model: 'claude-2.1',
        max_tokens_to_sample: 1000,
        prompt: conversationPrompt,
      });

      const assistantResponse = response.completion;
      if (!assistantResponse) {
        throw new Error('No response from Claude');
      }

      return {
        response: assistantResponse,
        context: context,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('Error processing Claude message:', error);
      throw new Error('Failed to process message with AI');
    }
  }


  /**
   * Build the system prompt with context data
   */
  private buildSystemPrompt(context: any[]): string {
    const basePrompt = `You are an AI assistant specialized in NDC (New Distribution Capability) airline features and implementations. 

Your role is to help users understand and query information about:
- Airlines and their NDC capabilities
- Features available through NDC
- Implementation status of features across different airlines
- Technical details about NDC providers and systems

You have access to a comprehensive database of airline feature implementations. The data provided below has been intelligently filtered based on your query to give you the most relevant information. Each implementation record includes both the airline ID and the actual airline name/details for easy reference. 

RESPONSE STYLE:
- Be CONCISE and DIRECT - answer the specific question asked
- Lead with the answer, then provide brief supporting details only if needed
- For simple queries, keep responses to 1-2 sentences maximum
- Only provide longer explanations when the query is complex or asks for comparisons
- Avoid unnecessary summaries, preambles, or "let me know if you need more details"

When answering questions:
1. Always use airline names (not just IDs) when they are available in the data
2. Be accurate and specific based on the provided data  
3. Use clear, professional language
4. If you don't have specific information about an airline/feature, say so clearly
5. Focus on practical, actionable information
6. If asking about features "not supported", focus on airlines with "No" status rather than listing all airlines

Intelligently filtered data context for your query:`;

    let contextString = '';
    
    context.forEach((item, index) => {
      if (item.airlines) {
        contextString += `\n\nAIRLINES:\n`;
        item.airlines.forEach((airline: any) => {
          contextString += `- ${airline.name} (${airline.codes}) - Provider: ${airline.provider}, Status: ${airline.status}\n`;
        });
      } else if (item.features) {
        contextString += `\n\nFEATURES:\n`;
        item.features.forEach((feature: any) => {
          contextString += `- ${feature.name} (${feature.category}): ${feature.description || 'No description'}\n`;
        });
      } else if (item.airline_id && item.feature_id) {
        if (index === 0 || !context[index - 1].airline_id) {
          contextString += `\n\nIMPLEMENTATIONS:\n`;
        }
        
        // Use enriched data if available
        const airlineName = item.airline_name || `Airline ID ${item.airline_id}`;
        const featureName = item.feature_name || `Feature ID ${item.feature_id}`;
        const airlineCodes = item.airline_codes ? ` (${item.airline_codes})` : '';
        
        contextString += `- ${airlineName}${airlineCodes} - ${featureName}: ${item.value}`;
        if (item.notes) {
          contextString += ` (${item.notes})`;
        }
        contextString += '\n';
      }
    });

    return basePrompt + contextString + `\n\nPlease answer the user's question based on this data.`;
  }

  /**
   * Build conversation prompt for legacy completions API
   */
  private buildConversationPrompt(systemPrompt: string, messages: any[]): string {
    const { HUMAN_PROMPT, AI_PROMPT } = require('@anthropic-ai/sdk');
    
    let prompt = systemPrompt + '\n\n';
    
    messages.forEach(msg => {
      if (msg.role === 'user') {
        prompt += `${HUMAN_PROMPT} ${msg.content}`;
      } else if (msg.role === 'assistant') {
        prompt += `${AI_PROMPT} ${msg.content}`;
      }
    });
    
    // Ensure we end with AI_PROMPT for the assistant to respond
    if (!prompt.endsWith(AI_PROMPT)) {
      prompt += AI_PROMPT;
    }
    
    return prompt;
  }

  /**
   * Build message history for Claude API
   */
  private buildMessageHistory(request: ChatRequest): any[] {
    const messages: any[] = [];

    // Add conversation history if provided
    if (request.conversationHistory) {
      request.conversationHistory.forEach(msg => {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({
            role: msg.role,
            content: msg.content,
          });
        }
      });
    }

    // Add current message
    messages.push({
      role: 'user',
      content: request.message,
    });

    return messages;
  }

  /**
   * Test the Claude API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const { HUMAN_PROMPT, AI_PROMPT } = require('@anthropic-ai/sdk');
      const testPrompt = `${HUMAN_PROMPT} Hello, can you confirm you can respond? Just say "AI connection successful"${AI_PROMPT}`;
      
      const response = await this.anthropic.completions.create({
        model: 'claude-2.1',
        max_tokens_to_sample: 100,
        prompt: testPrompt,
      });

      return response.completion && 
             response.completion.toLowerCase().includes('successful');
    } catch (error) {
      console.error('Claude API test failed:', error);
      return false;
    }
  }
}