/**
 * Application entry point for the Tetris game.
 * Sets up React with StrictMode for better development warnings
 * and renders the main Game component.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Game from "./components/Game";
import "./index.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Failed to find the root element");
}

createRoot(rootElement).render(
  <StrictMode>
    <Game />
  </StrictMode>
);
