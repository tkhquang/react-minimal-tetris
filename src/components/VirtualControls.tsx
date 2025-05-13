import React from "react";
import type { GameState } from "../core/types";

interface VirtualControlsProps {
  gameState: GameState;
}

const buttonStyle = {
  padding: "15px",
  margin: "2px",
  backgroundColor: "#333",
  color: "#fff",
  border: "2px solid #555",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "20px",
  fontWeight: "bold",
  minWidth: "60px",
  minHeight: "60px",
  userSelect: "none" as const,
  transition: "all 0.1s",
  WebkitTapHighlightColor: "transparent",
};

const activeButtonStyle = {
  ...buttonStyle,
  backgroundColor: "#555",
  transform: "scale(0.95)",
};

const VirtualButton = ({
  keyCode,
  label,
  width = "60px",
  height = "60px",
  hint,
  holdable = false,
  initialDelay = 500,
  repeatDelay = 50,
  highlighted = false,
}: {
  keyCode: string;
  label: string;
  width?: string;
  height?: string;
  hint?: string;
  holdable?: boolean;
  initialDelay?: number;
  repeatDelay?: number;
  highlighted?: boolean;
}) => {
  const [isPressed, setIsPressed] = React.useState(false);
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Dispatch real keyboard events for the virtual keyboard
  const dispatchKeyboardEvent = (key: string) => {
    const event = new KeyboardEvent("keydown", {
      key: key,
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(event);
  };

  const startPressing = () => {
    setIsPressed(true);
    dispatchKeyboardEvent(keyCode);

    if (holdable) {
      // Start repeating after initial delay
      timeoutRef.current = setTimeout(() => {
        // Then repeat at regular intervals
        intervalRef.current = setInterval(() => {
          dispatchKeyboardEvent(keyCode);
        }, repeatDelay);
      }, initialDelay);
    }
  };

  const stopPressing = () => {
    setIsPressed(false);

    // Clear any running timers
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    startPressing();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    startPressing();
  };

  const handleEnd = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    stopPressing();
  };

  // Also stop if mouse/touch leaves the button
  const handleLeave = () => {
    stopPressing();
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        onMouseDown={handleMouseDown}
        onMouseUp={handleEnd}
        onMouseLeave={handleLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleEnd}
        onTouchCancel={handleEnd}
        style={{
          ...(isPressed ? activeButtonStyle : buttonStyle),
          width,
          height,
          ...(highlighted ? { backgroundColor: "rgba(255,0,0,0.2)" } : {}),
        }}
      >
        {label}
      </button>
      {hint && (
        <div
          style={{
            position: "absolute",
            bottom: "-18px",
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: "11px",
            color: "#666",
            whiteSpace: "nowrap",
          }}
        >
          {hint}
        </div>
      )}
    </div>
  );
};

const VirtualControls = ({ gameState }: VirtualControlsProps) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        padding: "20px",
      }}
    >
      {/* Movement controls section - D-pad layout */}
      <div
        style={{
          backgroundColor: "#222",
          borderRadius: "10px",
          padding: "10px",
          border: "2px solid #444",
        }}
      >
        <div
          style={{
            marginBottom: "10px",
            textAlign: "center",
            color: "#999",
            fontSize: "14px",
          }}
        >
          Controls
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "2px",
            width: "200px",
          }}
        >
          <VirtualButton keyCode=" " label="↻" />
          <VirtualButton keyCode="ArrowUp" label="↑" />
          {gameState.type === "GameOver" ? (
            <VirtualButton keyCode="Enter" label="⏯︎" highlighted />
          ) : (
            <div />
          )}

          <VirtualButton
            keyCode="ArrowLeft"
            label="←"
            holdable
            repeatDelay={100}
          />
          <VirtualButton
            keyCode="ArrowDown"
            label="↓"
            holdable
            repeatDelay={100}
          />
          <VirtualButton
            keyCode="ArrowRight"
            label="→"
            holdable
            repeatDelay={100}
          />

          <div />
          <div />
        </div>
      </div>
    </div>
  );
};

export default VirtualControls;
