import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Trash2, Brain } from 'lucide-react';
import ModeToggle from './ModeToggle';
import QuickPrompts from './QuickPrompts';
import ChatMessageComponent from './ChatMessage';
import {
    generateResponse,
    buildReportContext,
    type ChatMode,
    type ChatMessage,
    type ReportContext,
} from './reasoningEngine';
import type { StoredAnalysis } from '../../services/storageService';

interface ChatPanelProps {
    isOpen: boolean;
    onClose: () => void;
    analysis: StoredAnalysis;
}

const WELCOME_MESSAGE: ChatMessage = {
    id: 'welcome',
    role: 'assistant',
    content:
        '**Clinical Chat Assistant**\n\n' +
        'I have full context of this pharmacogenomic report. ' +
        'Ask me about drug risks, safer alternatives, evidence strength, monitoring protocols, or request a drug safety ranking.\n\n' +
        'Use the quick prompts below or type your own question.',
    timestamp: Date.now(),
    isCritical: false,
};

const ChatPanel: React.FC<ChatPanelProps> = ({ isOpen, onClose, analysis }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
    const [input, setInput] = useState('');
    const [mode, setMode] = useState<ChatMode>('clinical');
    const [isProcessing, setIsProcessing] = useState(false);
    const [showPrompts, setShowPrompts] = useState(true);
    const inputRef = useRef<HTMLInputElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const context = useRef<ReportContext>(buildReportContext(analysis));

    // Update context when analysis changes
    useEffect(() => {
        context.current = buildReportContext(analysis);
    }, [analysis]);

    // Auto-focus input when panel opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = useCallback(
        (text?: string) => {
            const query = (text || input).trim();
            if (!query || isProcessing) return;

            const userMsg: ChatMessage = {
                id: `u-${Date.now()}`,
                role: 'user',
                content: query,
                timestamp: Date.now(),
            };
            setMessages((prev) => [...prev, userMsg]);
            setInput('');
            setShowPrompts(false);
            setIsProcessing(true);

            // Simulate processing delay for realistic feel
            setTimeout(() => {
                const { text: responseText, isCritical } = generateResponse(
                    query,
                    context.current,
                    mode
                );

                const aiMsg: ChatMessage = {
                    id: `a-${Date.now()}`,
                    role: 'assistant',
                    content: responseText,
                    timestamp: Date.now(),
                    isCritical,
                };
                setMessages((prev) => [...prev, aiMsg]);
                setIsProcessing(false);
            }, 400 + Math.random() * 600);
        },
        [input, isProcessing, mode]
    );

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleClear = () => {
        setMessages([WELCOME_MESSAGE]);
        setShowPrompts(true);
    };

    const handleQuickPrompt = (prompt: string) => {
        setInput(prompt);
        setTimeout(() => handleSend(prompt), 50);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40"
                        style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)' }}
                        onClick={onClose}
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                        className="fixed right-0 top-0 bottom-0 z-50 flex flex-col"
                        style={{
                            width: 'min(420px, 90vw)',
                            background: 'var(--bg-surface)',
                            borderLeft: '1px solid var(--border)',
                            boxShadow: '-8px 0 30px rgba(0,0,0,0.15)',
                        }}
                    >
                        {/* Header */}
                        <div
                            className="flex items-center justify-between px-4 py-3 shrink-0"
                            style={{ borderBottom: '1px solid var(--border)' }}
                        >
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                                    style={{ background: 'var(--primary-light)' }}
                                >
                                    <Brain size={16} style={{ color: 'var(--primary)' }} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                                        Clinical Assistant
                                    </p>
                                    <p className="text-[9px]" style={{ color: 'var(--text-secondary)' }}>
                                        AI-powered analysis
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <ModeToggle mode={mode} onChange={setMode} />
                                <button
                                    onClick={handleClear}
                                    className="p-1.5 rounded-lg transition-colors hover:opacity-80"
                                    style={{ color: 'var(--text-secondary)' }}
                                    title="Clear chat"
                                >
                                    <Trash2 size={14} />
                                </button>
                                <button
                                    onClick={onClose}
                                    className="p-1.5 rounded-lg transition-colors hover:opacity-80"
                                    style={{ color: 'var(--text-secondary)' }}
                                    title="Close"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Quick Prompts */}
                        {showPrompts && <QuickPrompts onSelect={handleQuickPrompt} />}

                        {/* Messages */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto px-4 py-3"
                            style={{ scrollBehavior: 'smooth' }}
                        >
                            {messages.map((msg, idx) => (
                                <ChatMessageComponent
                                    key={msg.id}
                                    role={msg.role}
                                    content={msg.content}
                                    isCritical={msg.isCritical}
                                    animate={msg.role === 'assistant' && idx === messages.length - 1 && idx > 0}
                                />
                            ))}

                            {/* Processing indicator */}
                            {isProcessing && (
                                <div className="flex gap-2 items-start mb-3">
                                    <div
                                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                                        style={{ background: 'var(--primary-light)' }}
                                    >
                                        <Brain size={14} style={{ color: 'var(--primary)' }} />
                                    </div>
                                    <div
                                        className="px-3 py-2.5 rounded-2xl rounded-tl-md"
                                        style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)' }}
                                    >
                                        <div className="flex gap-1">
                                            <span
                                                className="w-1.5 h-1.5 rounded-full animate-bounce"
                                                style={{ background: 'var(--primary)', animationDelay: '0ms' }}
                                            />
                                            <span
                                                className="w-1.5 h-1.5 rounded-full animate-bounce"
                                                style={{ background: 'var(--primary)', animationDelay: '150ms' }}
                                            />
                                            <span
                                                className="w-1.5 h-1.5 rounded-full animate-bounce"
                                                style={{ background: 'var(--primary)', animationDelay: '300ms' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <div
                            className="shrink-0 px-4 py-3"
                            style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-surface)' }}
                        >
                            <div
                                className="flex items-center gap-2 rounded-xl px-3 py-2"
                                style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)' }}
                            >
                                <input
                                    ref={inputRef}
                                    type="text"
                                    placeholder="Ask about this report..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    disabled={isProcessing}
                                    className="flex-1 bg-transparent text-xs outline-none placeholder:text-[var(--text-secondary)]"
                                    style={{ color: 'var(--text-primary)' }}
                                />
                                <button
                                    onClick={() => handleSend()}
                                    disabled={!input.trim() || isProcessing}
                                    className="p-1.5 rounded-lg transition-all duration-200 disabled:opacity-30"
                                    style={{
                                        background: input.trim() ? 'var(--primary)' : 'transparent',
                                        color: input.trim() ? '#fff' : 'var(--text-secondary)',
                                    }}
                                >
                                    <Send size={14} />
                                </button>
                            </div>
                            <p
                                className="text-center mt-2 text-[8px]"
                                style={{ color: 'var(--text-secondary)' }}
                            >
                                AI-generated responses for clinical decision support. Verify with qualified professionals.
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ChatPanel;
