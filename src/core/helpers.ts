/**
 * determine whether an point is inside an rectangle
 * @param x
 * @param y
 * @param rect
 * @returns {boolean}
 */
export function isInRect(x, y, rect): boolean {
    return x > rect.left && x < rect.right && y > rect.top && y < rect.bottom;
}
