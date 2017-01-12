import {Injectable} from '@angular/core';

@Injectable()
export class Overlay {

    _overlayContainer: HTMLElement;

    constructor() {
    }

    create(): HTMLElement {

    }

    createOverContainer(): void {
        this._overlayContainer = document.createElement('div');
        this._overlayContainer.classList.add('ui-overlay-container');
        document.body.appendChild(this._overlayContainer);
    }
}

export class OverlayConfig {
    hasBackDrop: boolean = true;
}