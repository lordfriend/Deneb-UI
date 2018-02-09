import { Component } from '@angular/core';
import { UIPopoverContent, UIPopoverRef } from '../../../../src/popover';

@Component({
    selector: 'popover-content',
    templateUrl: './popover-content.html',
    styles: [`
        :host {
            display: block;
            position: absolute;
            width: 100px;
            height: 100px;
        }
    `]
})
export class PopoverContentComponent extends UIPopoverContent {
    constructor(popoverRef: UIPopoverRef<PopoverContentComponent>) {
        super(popoverRef);
    }

    close() {
        this.popoverRef.close('closed!');
    }
}
