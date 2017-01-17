import {Injectable, Injector, Type} from '@angular/core';
import {Overlay} from '../overlay/overlay';
import {DialogRef} from './dialog-ref';
import {OverlayRef} from '../overlay/overlay-ref';
import {DialogContainer} from './dialog-container';

@Injectable()
export class UIDialog {
    constructor(
        private _dialogContainer: DialogContainer,
        private _injector: Injector
    ) {}

    open<T>(component: Type<T>, config: DialogConfig): DialogRef<T> {
    }

    createDialogContent<T>(component: Type<T>, container: DialogContainer, config: DialogConfig): DialogRef {

    }
}

export class DialogConfig {
    // stickyDialog means it cannot be closed through click on the backdrop or press escape key.
    stickyDialog: boolean
}