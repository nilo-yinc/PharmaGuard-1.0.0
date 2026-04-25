import React from 'react';
import type { ChatMode } from './reasoningEngine';

interface ModeToggleProps {
    mode: ChatMode;
    onChange: (mode: ChatMode) => void;
}

const modes: { id: ChatMode; label: string }[] = [
    { id: 'clinical', label: 'Clinical' },
    { id: 'patient', label: 'Patient' },
    { id: 'research', label: 'Research' },
];

const ModeToggle: React.FC<ModeToggleProps> = ({ mode, onChange }) => {
    return (
        <div
            className="flex rounded-lg p-0.5 gap-0.5"
            style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)' }}
        >
            {modes.map((m) => (
                <button
                    key={m.id}
                    onClick={() => onChange(m.id)}
                    className="px-3 py-1 rounded-md text-[10px] font-semibold transition-all duration-200"
                    style={{
                        background: mode === m.id ? 'var(--primary)' : 'transparent',
                        color: mode === m.id ? '#fff' : 'var(--text-secondary)',
                    }}
                >
                    {m.label}
                </button>
            ))}
        </div>
    );
};

export default ModeToggle;
