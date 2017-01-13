import {Injectable, Injector, Type} from '@angular/core';
import {Overlay} from '../overlay/overlay';
import {DialogRef} from './dialog-ref';
import {OverlayRef} from '../overlay/overlay-ref';

@Injectable()
export class UIDialog {
    constructor(
        private _overlay: Overlay,
        private _injector: Injector
    ) {}

    open<T>(component: Type<T>): DialogRef<T> {
        let overlay = this._overlay.create();
        let dialogRef = this.
    }

    createDialogContent<T>(component: Type<T>, overlayRef: OverlayRef) {
        let dialogRef = new DialogRef();

    }
}