/**
 * Color utility functions for rendering tetromino pieces and blocks.
 * This module handles the conversion from color names to RGB values
 * and provides color manipulation for visual effects.
 */

import type { Color } from "../core/types";

/**
 * Maps color names to RGB values for rendering.
 * Each color corresponds to a specific tetromino piece type.
 * The RGB values are chosen for clear visual distinction.
 * @param color - Color name to convert
 * @returns RGB color string for canvas rendering
 */
export function getColorCode(color: Color): string {
  switch (color) {
    case "Red":
      return "rgb(255,0,0)";
    case "Green":
      return "rgb(0,255,0)";
    case "Blue":
      return "rgb(128,128,255)";
    case "Magenta":
      return "rgb(255,0,255)";
    case "Cyan":
      return "rgb(0,255,255)";
    case "Yellow":
      return "rgb(255,255,0)";
    case "Orange":
      return "rgb(255,128,0)";
  }
}

/**
 * Extracts RGB components from a color string.
 * Used for creating shaded versions of colors.
 * @param colorString - RGB string like "rgb(255,0,0)"
 * @returns Array of [r, g, b] values, or null if parsing fails
 */
export function parseRGBComponents(
  colorString: string
): [number, number, number] | null {
  const match = colorString.match(/\d+/g);
  if (match && match.length >= 3) {
    return [Number(match[0]), Number(match[1]), Number(match[2])];
  }
  return null;
}

/**
 * Creates a darker shade of a color for the inner block effect.
 * This creates the 3D appearance of tetromino blocks.
 * @param r - Red component (0-255)
 * @param g - Green component (0-255)
 * @param b - Blue component (0-255)
 * @param factor - Darkness factor (0-1, default 0.8)
 * @returns Darkened RGB color string
 */
export function darkenColor(
  r: number,
  g: number,
  b: number,
  factor: number = 0.8
): string {
  return `rgb(${Math.floor(r * factor)},${Math.floor(g * factor)},${Math.floor(
    b * factor
  )})`;
}
