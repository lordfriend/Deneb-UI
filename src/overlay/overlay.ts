import {Injectable, Provider, ComponentFactoryResolver, ApplicationRef, Injector} from '@angular/core';
import {OverlayRef} from './overlay-ref';
import {OVERLAY_CONTAINER_PROVIDER, OverlayContainer} from './overlay-contianer';

let nextUniqueId = 0;

@Injectable()
export class Overlay {
    constructor(
        private _overlayContainer: OverlayContainer,
        private _componentFactoryResolver: ComponentFactoryResolver,
        private _appRef: ApplicationRef,
        private _injector: Injector
    ) {}

    create(): OverlayRef {
        return new OverlayRef(
            this._createPlateElement(),
            this._overlayContainer,
            this._componentFactoryResolver,
            this._appRef,
            this._injector);
    }

    private _createPlateElement(): HTMLElement {
        let plate = document.createElement('div');
        plate.id = `ui-overlay-${nextUniqueId++}`;
        plate.classList.add('ui-overlay-plate');

        this._overlayContainer.getContainerElement().appendChild(plate);

        return plate;
    }
}

export const OVERLAY_PROVIDERS: Provider[] = [
    Overlay,
    OVERLAY_CONTAINER_PROVIDER
];