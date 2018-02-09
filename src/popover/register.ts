import { Type } from '@angular/core';

export const registry = new Map<string, Type<any>>();

/**
 * Decorator for register the popover content component
 * @param {string} name
 * @constructor
 */
export function Popover(name: string) {
    if (registry.has(name)) {
        throw new Error('name already registered');
    }
    return function<T>(target: {new (...args: any[]): T}) {
        registry.set(name, target);
        return target;
    }
}
