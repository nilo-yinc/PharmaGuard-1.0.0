import React, { useEffect, useState, useRef } from 'react';
import { Brain } from 'lucide-react';

interface ChatMessageProps {
    role: 'user' | 'assistant';
    content: string;
    isCritical?: boolean;
    animate?: boolean;
}

/* ── Minimal markdown renderer ─────────────────────────────────────────── */
function renderMarkdown(text: string): React.ReactNode[] {
    return text.split('\n').map((line, li) => {
        // Table rows
        if (line.startsWith('|') && line.endsWith('|')) {
            const cells = line.split('|').filter(Boolean).map(c => c.trim());
            if (cells.every(c => /^[-:]+$/.test(c))) return null; // separator
            const isHeader = li > 0 && text.split('\n')[li - 1]?.includes('|') === false;
            return (
                <div key={li} className="flex gap-2 text-[10px] font-mono py-0.5">
                    {cells.map((cell, ci) => (
                        <span
                            key={ci}
                            className={`flex-1 ${isHeader ? 'font-bold' : ''}`}
                            style={{ color: isHeader ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                        >
                            {renderInline(cell)}
                        </span>
                    ))}
                </div>
            );
        }
        // Headers
        if (line.startsWith('**') && line.endsWith('**') && !line.includes(':**')) {
            return (
                <p key={li} className="font-bold text-[11px] mt-2 mb-1" style={{ color: 'var(--text-primary)' }}>
                    {renderInline(line)}
                </p>
            );
        }
        // Bullet points
        if (line.startsWith('- ')) {
            return (
                <div key={li} className="flex gap-1.5 ml-2 my-0.5">
                    <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ background: 'var(--primary)' }} />
                    <span className="text-[11px] leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                        {renderInline(line.slice(2))}
                    </span>
                </div>
            );
        }
        // Numbered lists
        const numMatch = line.match(/^(\d+)\.\s/);
        if (numMatch) {
            return (
                <div key={li} className="flex gap-1.5 ml-2 my-0.5">
                    <span className="text-[10px] font-bold shrink-0" style={{ color: 'var(--primary)' }}>
                        {numMatch[1]}.
                    </span>
                    <span className="text-[11px] leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                        {renderInline(line.slice(numMatch[0].length))}
                    </span>
                </div>
            );
        }
        // Empty lines
        if (line.trim() === '') return <div key={li} className="h-2" />;
        // Normal text
        return (
            <p key={li} className="text-[11px] leading-relaxed my-0.5" style={{ color: 'var(--text-primary)' }}>
                {renderInline(line)}
            </p>
        );
    });
}

function renderInline(text: string): React.ReactNode {
    // Bold
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return (
                <strong key={i} className="font-bold" style={{ color: 'var(--text-primary)' }}>
                    {part.slice(2, -2)}
                </strong>
            );
        }
        return <span key={i}>{part}</span>;
    });
}

/* ── Component ─────────────────────────────────────────────────────────── */

const ChatMessage: React.FC<ChatMessageProps> = ({ role, content, isCritical, animate }) => {
    const [displayedText, setDisplayedText] = useState(animate ? '' : content);
    const [isTyping, setIsTyping] = useState(animate || false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!animate) {
            setDisplayedText(content);
            setIsTyping(false);
            return;
        }
        setDisplayedText('');
        setIsTyping(true);
        let i = 0;
        const speed = Math.max(2, Math.min(8, 800 / content.length));
        const timer = setInterval(() => {
            i += Math.ceil(content.length / 200);
            if (i >= content.length) {
                setDisplayedText(content);
                setIsTyping(false);
                clearInterval(timer);
            } else {
                setDisplayedText(content.slice(0, i));
            }
        }, speed);
        return () => clearInterval(timer);
    }, [content, animate]);

    useEffect(() => {
        ref.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, [displayedText]);

    if (role === 'user') {
        return (
            <div ref={ref} className="flex justify-end mb-3">
                <div
                    className="max-w-[85%] px-3 py-2 rounded-2xl rounded-br-md text-[11px] leading-relaxed"
                    style={{
                        background: 'var(--primary)',
                        color: '#fff',
                    }}
                >
                    {content}
                </div>
            </div>
        );
    }

    return (
        <div ref={ref} className="flex gap-2 mb-3 items-start">
            {/* AI Avatar */}
            <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                style={{
                    background: isCritical ? 'rgba(239,68,68,0.15)' : 'var(--primary-light)',
                    border: `1px solid ${isCritical ? 'rgba(239,68,68,0.3)' : 'var(--primary)'}20`,
                }}
            >
                <Brain size={14} style={{ color: isCritical ? '#ef4444' : 'var(--primary)' }} />
            </div>

            {/* Message bubble */}
            <div
                className="max-w-[85%] px-3 py-2.5 rounded-2xl rounded-tl-md transition-all duration-300"
                style={{
                    background: 'var(--bg-muted)',
                    border: `1px solid ${isCritical ? 'rgba(239,68,68,0.4)' : 'var(--border)'}`,
                    boxShadow: isCritical ? '0 0 12px rgba(239,68,68,0.15)' : 'none',
                }}
            >
                {renderMarkdown(displayedText)}
                {isTyping && (
                    <span className="inline-flex gap-0.5 ml-1 mt-1">
                        <span className="w-1 h-1 rounded-full animate-pulse" style={{ background: 'var(--primary)', animationDelay: '0ms' }} />
                        <span className="w-1 h-1 rounded-full animate-pulse" style={{ background: 'var(--primary)', animationDelay: '200ms' }} />
                        <span className="w-1 h-1 rounded-full animate-pulse" style={{ background: 'var(--primary)', animationDelay: '400ms' }} />
                    </span>
                )}
            </div>
        </div>
    );
};

export default ChatMessage;
