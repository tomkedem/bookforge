/**
 * Knowledge Universe — orbit-angle math + DOM helpers.
 *
 * Pure functions, no DOM mutation, no side effects. Imported from both
 * the library.astro frontmatter (SSR initial layout) and the runtime
 * hydrator (post-metadata angle recompute) so the math is defined in
 * exactly one place.
 *
 *   bookAngle(i, total)   → degrees on the inline-start arc
 *                            (top → bottom via 180°, the visual-left arc
 *                            in LTR / visual-right in RTL).
 *   lessonAngle(i, total) → degrees on the inline-end arc
 *                            (top → bottom via 0°, mirror of the books).
 *   cssEscape(value)      → escape attribute-selector input. Used to
 *                            embed user-typed series names safely in
 *                            `[data-series-member="..."]` queries.
 *
 * Math convention: angles in degrees, 0° = right, 90° = down, 180° =
 * left, 270° = up. Both arcs span 180° starting from the top so the
 * book column and lesson column meet at 12 o'clock and 6 o'clock.
 */

export function bookAngle(i: number, total: number): number {
  const t = (i + 0.5) / Math.max(total, 1);
  return 270 - t * 180; // 270° (top) → 90° (bottom) via 180° (left)
}

export function lessonAngle(i: number, total: number): number {
  const t = (i + 0.5) / Math.max(total, 1);
  return (270 + t * 180) % 360; // 270° (top) → 90° (bottom) via 0° (right)
}

/**
 * CSS.escape with a manual fallback. Series names are user-typed in the
 * admin and may contain quotes, brackets or backslashes — characters
 * that would otherwise break attribute-selector syntax.
 */
export function cssEscape(value: string): string {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(value);
  }
  return value.replace(/["\\\[\]]/g, '\\$&');
}
