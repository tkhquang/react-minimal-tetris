/**
 * Application entry point for the Tetris game.
 * Sets up React with StrictMode for better development warnings
 * and renders the main Game component.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Game from "./components/Game";
import "./index.css";

// Find the root element in the HTML
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Failed to find the root element");
}

// Create React root and render the game
createRoot(rootElement).render(
  <StrictMode>
    <Game />
  </StrictMode>
);
