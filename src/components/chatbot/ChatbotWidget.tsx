'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  Minimize2,
  Maximize2
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatbotWidgetProps {
  chatbotId: string;
  apiKey: string;
  position?: 'bottom-right' | 'bottom-left';
  theme?: 'light' | 'dark';
  welcomeMessage?: string;
}

export default function ChatbotWidget({
  chatbotId,
  apiKey,
  position = 'bottom-right',
  theme = 'light',
  welcomeMessage = 'Hello! How can I help you today?'
}: ChatbotWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: welcomeMessage,
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Determine backend base URL. Use NEXT_PUBLIC_API_BASE_URL if provided at build time,
      // otherwise fall back to localhost:3001 which is the backend default.
      const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL as string) || 'http://localhost:3001';

      // Prefer explicit apiKey prop (for public/chatbot-specific keys). If not provided,
      // fall back to any JWT stored in localStorage under 'token' or 'auth_token'.
      const jwt = apiKey || localStorage.getItem('token') || localStorage.getItem('auth_token');

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (jwt) {
        headers['Authorization'] = `Bearer ${jwt}`;
      }

      const response = await fetch(`${baseUrl.replace(/\/$/, '')}/chatbot/${chatbotId}/message`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: inputMessage,
          sessionId,
          previousMessages: messages.slice(-10).map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();

      const botText = data?.data?.response || data?.response || 'Sorry, I could not generate a response.';

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: botText,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      // Log for debugging; user sees a friendly message below.
  console.error('Chatbot sendMessage error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again later.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  };

  const themeClasses = {
    light: {
      widget: 'bg-white border-gray-200',
      header: 'bg-purple-600 text-white',
      message: {
        user: 'bg-purple-600 text-white',
        assistant: 'bg-gray-100 text-gray-900',
      },
      input: 'bg-white border-gray-300 text-gray-900',
      button: 'bg-purple-600 hover:bg-purple-700 text-white',
    },
    dark: {
      widget: 'bg-gray-800 border-gray-700',
      header: 'bg-purple-700 text-white',
      message: {
        user: 'bg-purple-600 text-white',
        assistant: 'bg-gray-700 text-gray-100',
      },
      input: 'bg-gray-700 border-gray-600 text-gray-100',
      button: 'bg-purple-600 hover:bg-purple-700 text-white',
    },
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      {/* Chat Widget */}
      {isOpen && (
        <div className={`w-80 h-96 ${themeClasses[theme].widget} border rounded-lg shadow-lg flex flex-col`}>
          {/* Header */}
          <div className={`${themeClasses[theme].header} p-4 rounded-t-lg flex items-center justify-between`}>
            <div className="flex items-center">
              <Bot className="h-5 w-5 mr-2" />
              <span className="font-medium">AI Assistant</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:text-gray-200"
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-3 py-2 rounded-lg ${
                        message.role === 'user'
                          ? themeClasses[theme].message.user
                          : themeClasses[theme].message.assistant
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className={`max-w-xs px-3 py-2 rounded-lg ${themeClasses[theme].message.assistant}`}>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${themeClasses[theme].input}`}
                    disabled={isLoading}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className={`px-3 py-2 rounded-lg ${themeClasses[theme].button} disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`w-12 h-12 ${themeClasses[theme].button} rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-transform`}
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}
