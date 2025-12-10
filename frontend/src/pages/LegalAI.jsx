import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from '../config';
import FloatingLegalIcons from '../components/FloatingLegalIcons';

const LegalAI = () => {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: '👋 Hello! I\'m your AI Legal Assistant specialized in Indian law. Ask me about:\n\n• Constitutional provisions and amendments\n• Landmark Supreme Court cases\n• IPC/BNS sections and provisions\n• Legal concepts and principles\n\nHow can I help you today?'
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');

        // Add user message to chat
        const newMessages = [...messages, { role: 'user', content: userMessage }];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            // Prepare chat history for API
            const chatHistory = newMessages.slice(1).map(msg => ({
                role: msg.role,
                content: msg.content
            }));

            const response = await fetch(`${API_URL}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage,
                    chatHistory: chatHistory.slice(0, -1) // Exclude the current message
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to get response');
            }

            // Add AI response to chat
            setMessages([...newMessages, { role: 'assistant', content: data.response }]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages([...newMessages, {
                role: 'assistant',
                content: `⚠️ Error: ${error.message}. Please make sure the Gemini API key is configured in the backend.`
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="max-w-5xl mx-auto h-[calc(100vh-12rem)] flex flex-col relative">
            <FloatingLegalIcons />
            {/* Header */}
            <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg">
                        <Sparkles className="text-white" size={24} />
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                        Law <span className="text-blue-600">AI Assistant</span>
                    </h1>
                </div>
                <p className="text-slate-500 text-sm">Powered by Local Knowledge Base • Indian Law Specialist</p>
            </div>

            {/* Chat Container */}
            <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    <AnimatePresence>
                        {messages.map((message, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                {message.role === 'assistant' && (
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                                        <Bot className="text-blue-600" size={18} />
                                    </div>
                                )}
                                <div
                                    className={`max-w-[75%] rounded-2xl px-5 py-3 ${message.role === 'user'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-slate-100 text-slate-900'
                                        }`}
                                >
                                    <div className="text-sm leading-relaxed whitespace-pre-wrap">
                                        {message.content}
                                    </div>
                                </div>
                                {message.role === 'user' && (
                                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0 mt-1">
                                        <User className="text-white" size={18} />
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Loading Indicator */}
                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex gap-3"
                        >
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <Bot className="text-blue-600" size={18} />
                            </div>
                            <div className="bg-slate-100 rounded-2xl px-5 py-3 flex items-center gap-2">
                                <Loader2 className="animate-spin text-blue-600" size={16} />
                                <span className="text-sm text-slate-600">Thinking...</span>
                            </div>
                        </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="border-t border-slate-200 p-4 bg-slate-50">
                    <div className="flex gap-3 items-end">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask about Indian legal cases, statutes, or concepts..."
                            className="flex-1 resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent max-h-32 min-h-[44px]"
                            rows={1}
                            disabled={isLoading}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!input.trim() || isLoading}
                            className="px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold shadow-sm"
                        >
                            <Send size={18} />
                            <span className="hidden sm:inline">Send</span>
                        </button>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 text-center">
                        AI can make mistakes. Verify important legal information.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LegalAI;
