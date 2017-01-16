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

    open<T>(component: Type<T>, config: DialogConfig): DialogRef<T> {
        let overlay = this._overlay.create();
        let dialogRef = this.createDialogContent(component, overlay, config);
    }

    createDialogContent<T>(component: Type<T>, overlayRef: OverlayRef, config: DialogConfig): DialogRef {
        let dialogRef = new DialogRef(overlayRef);
        if(!config.stickyDialog) {

        }

    }
}

export class DialogConfig {
    // stickyDialog means it cannot be closed through click on the backdrop or press escape key.
    stickyDialog: boolean
}