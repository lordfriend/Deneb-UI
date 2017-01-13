import {Optional, SkipSelf} from '@angular/core';

export class OverlayContainer {
    protected _overlayContainer: HTMLElement;

    getContainerElement(): HTMLElement {
        if (!this._overlayContainer) {
            this._createDimmerContainer();
        }
        return this._overlayContainer
    }

    private _createDimmerContainer(): void {
        this._overlayContainer = document.createElement('div');
        this._overlayContainer.classList.add('ui-overlay-container');
        this._overlayContainer.classList.add('ui');
        this._overlayContainer.classList.add('dimmer');
        document.body.appendChild(this._overlayContainer);
    }
}

function overlayContainerFactory(parentContainer: OverlayContainer) {
    return parentContainer || new OverlayContainer();
}

export const OVERLAY_CONTAINER_PROVIDER = {
    provide: OverlayContainer,
    deps: [[new Optional(), new SkipSelf(), OverlayContainer]],
    useFactory: overlayContainerFactory
};