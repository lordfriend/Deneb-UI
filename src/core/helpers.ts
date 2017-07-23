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

export function ancestor(curr: Element, selector: string): Element {
    let node = curr.parentElement;
    while(node !== null) {
        if (node.classList.contains(selector)) {
            return node;
        }
        node = node.parentElement;
    }
    return node;
}
