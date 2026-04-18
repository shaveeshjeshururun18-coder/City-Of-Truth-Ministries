import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { generateSpatulaAIResponse, streamSpatulaAIResponse } from '../services/openRouterService';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const SpatulaAIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Welcome to Spatula AI! How can I provide spiritual guidance today? 🙏',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useStreaming, setUseStreaming] = useState(true);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      if (useStreaming) {
        // Streaming response
        let assistantMessage = '';
        setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

        await streamSpatulaAIResponse(
          input,
          (chunk) => {
            assistantMessage += chunk;
            setMessages((prev) => {
              const newMessages = [...prev];
              newMessages[newMessages.length - 1].content = assistantMessage;
              return newMessages;
            });
          }
        );
      } else {
        // Regular response
        const response = await generateSpatulaAIResponse(input);
        setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'I apologize, but I encountered an error. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="spatula-ai-chat">
      <div className="chat-header">
        <h2>💬 Spatula AI - Spiritual Assistant</h2>
        <label className="streaming-toggle">
          <input
            type="checkbox"
            checked={useStreaming}
            onChange={(e) => setUseStreaming(e.target.checked)}
          />
          <span>Streaming Mode</span>
        </label>
      </div>

      <div className="messages-container">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <div className="message-avatar">
              {msg.role === 'user' ? '👤' : '✨'}
            </div>
            <div className="message-content">
              <p>{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && !useStreaming && (
          <div className="message assistant">
            <div className="message-avatar">✨</div>
            <div className="message-content">
              <Loader2 className="animate-spin" size={20} />
            </div>
          </div>
        )}
      </div>

      <div className="chat-input-container">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask for spiritual guidance..."
          disabled={isLoading}
          rows={2}
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="send-button"
        >
          {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
        </button>
      </div>

      <style>{`
        .spatula-ai-chat {
          display: flex;
          flex-direction: column;
          height: 600px;
          max-width: 800px;
          margin: 0 auto;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .chat-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .chat-header h2 {
          margin: 0;
          font-size: 1.5rem;
        }

        .streaming-toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          cursor: pointer;
        }

        .streaming-toggle input {
          cursor: pointer;
        }

        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          background: #f9fafb;
        }

        .message {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .message-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .message.user .message-avatar {
          background: #e0e7ff;
        }

        .message.assistant .message-avatar {
          background: #fef3c7;
        }

        .message-content {
          flex: 1;
          background: white;
          padding: 1rem;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .message.user .message-content {
          background: #667eea;
          color: white;
        }

        .message-content p {
          margin: 0;
          line-height: 1.6;
          white-space: pre-wrap;
        }

        .chat-input-container {
          display: flex;
          gap: 1rem;
          padding: 1.5rem;
          background: white;
          border-top: 1px solid #e5e7eb;
        }

        .chat-input-container textarea {
          flex: 1;
          padding: 0.75rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-family: inherit;
          font-size: 1rem;
          resize: none;
          transition: border-color 0.2s;
        }

        .chat-input-container textarea:focus {
          outline: none;
          border-color: #667eea;
        }

        .send-button {
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s, opacity 0.2s;
        }

        .send-button:hover:not(:disabled) {
          transform: translateY(-2px);
        }

        .send-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};
