import React from 'react';
import { ChatMessage as ChatMessageType } from '../types';

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const formatTime = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(timestamp));
  };

  const formatContent = (content: string) => {
    // Simple markdown-like formatting
    return content
      .split('\n')
      .map((line, index) => {
        // Handle bullet points
        if (line.trim().startsWith('- ')) {
          return (
            <li key={index} className="chat-list-item">
              {line.trim().substring(2)}
            </li>
          );
        }
        
        // Handle numbered lists
        if (/^\d+\.\s/.test(line.trim())) {
          return (
            <li key={index} className="chat-list-item numbered">
              {line.trim().replace(/^\d+\.\s/, '')}
            </li>
          );
        }
        
        // Handle regular paragraphs
        if (line.trim()) {
          return (
            <p key={index} className="chat-paragraph">
              {line.trim()}
            </p>
          );
        }
        
        return null;
      })
      .filter(Boolean);
  };

  return (
    <div className={`chat-message ${message.role}`}>
      <div className="message-header">
        <div className="message-avatar">
          {message.role === 'user' ? '👤' : '🤖'}
        </div>
        <div className="message-info">
          <span className="message-role">
            {message.role === 'user' ? 'You' : 'AI Assistant'}
          </span>
          <span className="message-time">
            {formatTime(message.timestamp)}
          </span>
        </div>
      </div>
      
      <div className="message-content">
        {formatContent(message.content)}
      </div>

      {message.context && message.context.length > 0 && (
        <div className="message-context">
          <details className="context-details">
            <summary className="context-summary">
              📊 Data Context ({message.context.length} items)
            </summary>
            <div className="context-content">
              {message.context.slice(0, 3).map((ctx, index) => (
                <div key={index} className="context-item">
                  <pre>{JSON.stringify(ctx, null, 2)}</pre>
                </div>
              ))}
              {message.context.length > 3 && (
                <div className="context-more">
                  ...and {message.context.length - 3} more items
                </div>
              )}
            </div>
          </details>
        </div>
      )}
    </div>
  );
};