
import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';

interface AIAgentPanelProps {
  title: string;
  description: string;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const LoadingDots: React.FC = () => (
    <div className="flex items-center space-x-1">
        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
    </div>
);

export const AIAgentPanel: React.FC<AIAgentPanelProps> = ({ title, description, messages, onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg flex flex-col h-[45vh] min-h-[400px]">
      <div className="p-4 border-b border-gray-700">
        <h2 className="font-bold text-lg text-cyan-400">{title}</h2>
        <p className="text-xs text-gray-400">{description}</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-200'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex justify-start">
                 <div className="bg-gray-700 text-gray-200 p-3 rounded-lg">
                    <LoadingDots />
                 </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-gray-700">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Message ${title}...`}
            disabled={isLoading}
            className="flex-1 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
            aria-label={`Message to ${title}`}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-cyan-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};
