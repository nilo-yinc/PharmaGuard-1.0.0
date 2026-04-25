import React, { useRef, useState } from "react";

type CardSpotlightProps = {
  children: React.ReactNode;
  radius?: number;
  color?: string;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>;

export const CardSpotlight = ({
  children,
  radius = 350,
  color = "rgba(13,115,119,0.18)",
  className = "",
  ...props
}: CardSpotlightProps) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={`relative overflow-hidden ${className}`}
      {...props}
    >
      {/* Spotlight gradient layer */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300 rounded-[inherit]"
        style={{
          opacity,
          background: `radial-gradient(${radius}px circle at ${position.x}px ${position.y}px, ${color}, transparent 80%)`,
        }}
      />
      {/* Subtle border glow */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300 rounded-[inherit]"
        style={{
          opacity: opacity * 0.6,
          background: `radial-gradient(${radius * 0.4}px circle at ${position.x}px ${position.y}px, rgba(13,115,119,0.08), transparent 70%)`,
        }}
      />
      {children}
    </div>
  );
};
