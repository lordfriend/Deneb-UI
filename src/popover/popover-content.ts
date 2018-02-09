/**
 * All popover content component should extends this class
 */
import { AfterViewInit } from '@angular/core';
import { UIPopoverRef } from './popover-ref';

export class UIPopoverContent implements AfterViewInit {

    constructor(protected popoverRef: UIPopoverRef<UIPopoverContent>) {}

    ngAfterViewInit(): void {
        this.popoverRef.updatePosition();
    }
}
