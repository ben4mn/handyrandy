import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage as ChatMessageType, ChatExample, LoadingState } from '../types';
import { chatAPI } from '../services/api';
import { ChatMessage } from '../components/ChatMessage';
import { ChatInput } from '../components/ChatInput';
import { ExampleQueries } from '../components/ExampleQueries';
import { ConversationStorage } from '../utils/conversationStorage';

export const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [examples, setExamples] = useState<ChatExample[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    error: undefined,
  });
  const [isServiceAvailable, setIsServiceAvailable] = useState<boolean | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [conversationRestored, setConversationRestored] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load examples, check service availability, and restore conversation on mount
  useEffect(() => {
    loadExamples();
    checkServiceAvailability();
    loadStoredConversation();
  }, []);

  // Save conversation whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      ConversationStorage.saveConversation(messages);
    }
  }, [messages]);

  const loadExamples = async () => {
    try {
      setLoadingState({ isLoading: true });
      const examplesData = await chatAPI.getExamples();
      setExamples(examplesData);
      setLoadingState({ isLoading: false });
    } catch (error) {
      setLoadingState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load examples',
      });
    }
  };

  const checkServiceAvailability = async () => {
    try {
      const isAvailable = await chatAPI.checkHealth();
      setIsServiceAvailable(isAvailable);
    } catch (error) {
      setIsServiceAvailable(false);
    }
  };

  const generateMessageId = () => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleSendMessage = async (messageContent: string) => {
    if (!isServiceAvailable) {
      return;
    }

    // Add user message immediately
    const userMessage: ChatMessageType = {
      id: generateMessageId(),
      role: 'user',
      content: messageContent,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsSending(true);

    try {
      // Prepare conversation history for API
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
      }));

      // Send to AI
      const response = await chatAPI.sendMessage(messageContent, conversationHistory);

      // Add AI response
      const aiMessage: ChatMessageType = {
        id: generateMessageId(),
        role: 'assistant',
        content: response.message,
        timestamp: new Date(response.timestamp),
        context: response.context,
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Add error message
      const errorMessage: ChatMessageType = {
        id: generateMessageId(),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your message. Please try again or check if the AI service is available.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  const handleExampleSelect = (query: string) => {
    handleSendMessage(query);
  };

  const loadStoredConversation = () => {
    try {
      const storedMessages = ConversationStorage.loadConversation();
      if (storedMessages.length > 0) {
        setMessages(storedMessages);
        setConversationRestored(true);
        console.log(`Restored ${storedMessages.length} messages from previous session`);
        
        // Hide restoration notice after 3 seconds
        setTimeout(() => {
          setConversationRestored(false);
        }, 3000);
      }
    } catch (error) {
      console.warn('Failed to load stored conversation:', error);
    }
  };

  const clearChat = () => {
    setMessages([]);
    ConversationStorage.clearConversation();
  };

  const resetConversation = () => {
    setMessages([]);
    ConversationStorage.clearConversation();
  };

  const renderServiceStatus = () => {
    if (isServiceAvailable === null) {
      return (
        <div className="service-status checking">
          <span className="status-icon">🔄</span>
          <span>Checking AI service...</span>
        </div>
      );
    }

    if (!isServiceAvailable) {
      return (
        <div className="service-status unavailable">
          <span className="status-icon">⚠️</span>
          <div className="status-content">
            <span className="status-title">AI Service Unavailable</span>
            <span className="status-message">
              The AI chat service is not configured or currently unavailable. 
              Please check the server configuration.
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className="service-status available">
        <span className="status-icon">✅</span>
        <span>AI Assistant Ready</span>
      </div>
    );
  };

  const renderContent = () => {
    if (loadingState.error) {
      return (
        <div className="error-container">
          <h3>Error Loading Chat</h3>
          <p>{loadingState.error}</p>
          <button onClick={loadExamples} className="btn btn-primary">
            Try Again
          </button>
        </div>
      );
    }

    return (
      <>
        {renderServiceStatus()}
        
        {conversationRestored && (
          <div className="conversation-restored-notice">
            <span className="status-icon">💬</span>
            <span>Previous conversation restored</span>
          </div>
        )}
        
        {messages.length === 0 && examples.length > 0 && isServiceAvailable && (
          <ExampleQueries
            examples={examples}
            onSelectExample={handleExampleSelect}
            isLoading={isSending}
          />
        )}

        {messages.length > 0 && (
          <div className="chat-messages" ref={chatContainerRef}>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </>
    );
  };

  return (
    <div className="chat-page">
      <div className="page-header">
        <div className="page-title">
          <h1>AI Chat Assistant</h1>
          <p>Ask questions about airline features and NDC implementations</p>
        </div>

        {messages.length > 0 && (
          <div className="page-actions">
            <button
              onClick={resetConversation}
              className="btn btn-secondary"
              disabled={isSending}
              title="Reset conversation and clear history"
            >
              🔄 Reset Chat
            </button>
            <button
              onClick={checkServiceAvailability}
              className="btn btn-secondary"
              disabled={isSending}
              title="Check AI service status"
            >
              ⚡ Check Status
            </button>
          </div>
        )}
      </div>

      <div className="chat-container">
        <div className="chat-content">
          {renderContent()}
        </div>

        {isServiceAvailable && (
          <div className="chat-input-section">
            <ChatInput
              onSendMessage={handleSendMessage}
              isLoading={isSending}
              disabled={!isServiceAvailable}
            />
          </div>
        )}
      </div>
    </div>
  );
};