import { ChatMessage } from '../types';

const CONVERSATION_STORAGE_KEY = 'ndc_chat_conversation';

export interface StoredConversation {
  messages: ChatMessage[];
  lastUpdated: string;
}

export class ConversationStorage {
  /**
   * Save conversation to localStorage
   */
  static saveConversation(messages: ChatMessage[]): void {
    try {
      const conversation: StoredConversation = {
        messages,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(CONVERSATION_STORAGE_KEY, JSON.stringify(conversation));
    } catch (error) {
      console.warn('Failed to save conversation to localStorage:', error);
    }
  }

  /**
   * Load conversation from localStorage
   */
  static loadConversation(): ChatMessage[] {
    try {
      const stored = localStorage.getItem(CONVERSATION_STORAGE_KEY);
      if (!stored) {
        return [];
      }

      const conversation: StoredConversation = JSON.parse(stored);
      
      // Convert timestamp strings back to Date objects
      const messages = conversation.messages.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));

      return messages;
    } catch (error) {
      console.warn('Failed to load conversation from localStorage:', error);
      return [];
    }
  }

  /**
   * Clear stored conversation
   */
  static clearConversation(): void {
    try {
      localStorage.removeItem(CONVERSATION_STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear conversation from localStorage:', error);
    }
  }

  /**
   * Check if there's a stored conversation
   */
  static hasStoredConversation(): boolean {
    try {
      const stored = localStorage.getItem(CONVERSATION_STORAGE_KEY);
      return stored !== null && stored !== undefined;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get the last updated timestamp of stored conversation
   */
  static getLastUpdated(): Date | null {
    try {
      const stored = localStorage.getItem(CONVERSATION_STORAGE_KEY);
      if (!stored) {
        return null;
      }

      const conversation: StoredConversation = JSON.parse(stored);
      return new Date(conversation.lastUpdated);
    } catch (error) {
      return null;
    }
  }
}