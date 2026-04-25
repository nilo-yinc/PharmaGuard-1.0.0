import React, { useRef } from "react";
import { motion } from "framer-motion";

type FileUploadDropzoneProps = {
  isDragActive: boolean;
  isDragReject: boolean;
  isSuccess: boolean;
  isUploading: boolean;
  children: React.ReactNode; // AnimatePresence content (idle/uploading/success states)
  rootProps: React.HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> };
  inputProps: React.InputHTMLAttributes<HTMLInputElement>;
};

// Decorative file icon used in the background grid
const FileGridIcon = ({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="20"
    height="20"
    fill="none"
    className={className}
    style={style}
  >
    <path
      d="M13 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V9L13 2Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13 2V9H20"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// SVG background grid showing decorative file icons connected by lines
const FileGridBackground = ({ isDragActive }: { isDragActive: boolean }) => {
  const iconPositions = [
    { x: "8%", y: "10%" },
    { x: "88%", y: "8%" },
    { x: "5%", y: "80%" },
    { x: "85%", y: "82%" },
    { x: "48%", y: "6%" },
    { x: "18%", y: "45%" },
    { x: "78%", y: "45%" },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
      {/* Connecting lines SVG */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {iconPositions.map((_, i) =>
          iconPositions.slice(i + 1, i + 3).map((target, j) => (
            <motion.line
              key={`${i}-${j}`}
              x1={iconPositions[i].x}
              y1={iconPositions[i].y}
              x2={target.x}
              y2={target.y}
              stroke={isDragActive ? "#0D7377" : "currentColor"}
              strokeWidth="0.5"
              strokeDasharray="4 4"
              initial={{ opacity: 0 }}
              animate={{ opacity: isDragActive ? 0.6 : 0.15 }}
              transition={{ duration: 0.4 }}
              className="text-neutral-400"
            />
          ))
        )}
      </svg>

      {/* File icons */}
      {iconPositions.map((pos, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: pos.x, top: pos.y, transform: "translate(-50%, -50%)" }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: isDragActive ? 0.6 : 0.2,
            scale: isDragActive ? 1.1 : 1,
          }}
          transition={{ duration: 0.3, delay: i * 0.04 }}
        >
          <FileGridIcon
            style={{
              color: isDragActive ? "#0D7377" : "#9CA3AF",
            }}
          />
        </motion.div>
      ))}
    </div>
  );
};

// Animated upload arrow icon
const UploadArrow = ({ isDragActive }: { isDragActive: boolean }) => (
  <motion.div
    animate={isDragActive ? { y: -8, scale: 1.15 } : { y: [0, -6, 0] }}
    transition={
      isDragActive
        ? { duration: 0.25 }
        : { duration: 2.2, repeat: Infinity, ease: "easeInOut" }
    }
    className="relative flex items-center justify-center"
  >
    <div
      className="w-16 h-16 rounded-2xl flex items-center justify-center"
      style={{
        background: isDragActive ? "rgba(13,115,119,0.15)" : "var(--bg-muted)",
        border: `1px solid ${isDragActive ? "#0D7377" : "var(--border)"}`,
        transition: "all 0.3s ease",
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke={isDragActive ? "#0D7377" : "var(--text-muted)"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ transition: "stroke 0.3s ease" }}
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    </div>
    {/* Ripple on drag */}
    {isDragActive && (
      <motion.div
        className="absolute inset-0 rounded-2xl"
        style={{ border: "2px solid #0D7377" }}
        initial={{ scale: 1, opacity: 0.8 }}
        animate={{ scale: 1.5, opacity: 0 }}
        transition={{ duration: 0.8, repeat: Infinity }}
      />
    )}
  </motion.div>
);

export const FileUploadDropzone: React.FC<FileUploadDropzoneProps> = ({
  isDragActive,
  isDragReject,
  isSuccess,
  isUploading,
  children,
  rootProps,
  inputProps,
}) => {
  const getBorderColor = () => {
    if (isDragReject) return "var(--danger)";
    if (isDragActive) return "#0D7377";
    if (isSuccess) return "var(--success)";
    return "var(--border-hover)";
  };

  const getBgColor = () => {
    if (isDragReject) return "var(--danger-light)";
    if (isDragActive) return "rgba(13,115,119,0.06)";
    if (isSuccess) return "var(--success-light)";
    return "var(--bg-muted)";
  };

  return (
    <div
      {...rootProps}
      className="cursor-pointer rounded-2xl transition-all duration-300 p-8 sm:p-12 text-center relative"
      style={{
        border: `2px dashed ${getBorderColor()}`,
        background: getBgColor(),
        minHeight: "220px",
      }}
    >
      <input {...inputProps} />
      {/* Background grid only visible in idle state */}
      {!isSuccess && !isUploading && (
        <FileGridBackground isDragActive={isDragActive} />
      )}

      {/* Content (idle / uploading / success passed by parent) */}
      <div className="relative z-10">
        {/* Show animated upload arrow only in idle state */}
        {!isSuccess && !isUploading && !isDragReject && (
          <div className="flex justify-center mb-4">
            <UploadArrow isDragActive={isDragActive} />
          </div>
        )}
        {children}
      </div>
    </div>
  );
};
