import React from 'react';

const PROMPTS = [
    'Why is this drug risky?',
    'Suggest safer alternative',
    'How strong is evidence?',
    'Explain in simple language',
    'Compare selected drugs',
    'Is this critical?',
    'What monitoring is required?',
];

interface QuickPromptsProps {
    onSelect: (prompt: string) => void;
}

const QuickPrompts: React.FC<QuickPromptsProps> = ({ onSelect }) => {
    return (
        <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <p
                className="text-[9px] font-semibold uppercase tracking-wider mb-2"
                style={{ color: 'var(--text-secondary)' }}
            >
                Quick Prompts
            </p>
            <div className="flex flex-wrap gap-1.5">
                {PROMPTS.map((p) => (
                    <button
                        key={p}
                        onClick={() => onSelect(p)}
                        className="px-2.5 py-1 rounded-full text-[10px] font-medium transition-all duration-150 hover:scale-[1.03]"
                        style={{
                            background: 'var(--primary-light)',
                            color: 'var(--primary)',
                            border: '1px solid transparent',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--primary)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'transparent';
                        }}
                    >
                        {p}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default QuickPrompts;
