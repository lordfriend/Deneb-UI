import { Component, ElementRef, ViewChild } from '@angular/core';
import { UIPopover } from '../../../src/popover';
import { PopoverContentComponent } from './popover-content/popover-content.component';

@Component({
    selector: 'popover-demo',
    templateUrl: './popover.html',
    styles: [`
        :host {
            height: 100%;
        }

        .popover-container {
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            align-items: center;
            height: 100%;
            position: relative;
        }
        
        .popover-container > .ui.button {
            position: relative;
        }

    `]
})
export class PopoverComponent {

    @ViewChild('refButton') refButtonRef: ElementRef;

    constructor(private _popover: UIPopover) {}

    openPopover() {
        let refButton = this.refButtonRef.nativeElement;
        console.log(refButton);
        this._popover.createPopover(refButton, PopoverContentComponent);
    }
}
