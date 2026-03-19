export const PX_PER_MM = 96 / 25.4;
export const A4_WIDTH_MM = 210;
export const A4_HEIGHT_MM = 297;
export const A4_WIDTH_PX = A4_WIDTH_MM * PX_PER_MM;
export const A4_HEIGHT_PX = A4_HEIGHT_MM * PX_PER_MM;

/**
 * One-page auto fit should target the A4 content area, not edge-to-edge paper.
 * Keep a sane minimum margin for templates that define very small page paddings.
 */
export const AUTO_ONE_PAGE_MIN_MARGIN_PX = 24;
