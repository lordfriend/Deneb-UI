import {Injectable} from '@angular/core';
import {Overlay} from '../overlay/overlay';
import {DialogRef} from './dialog-ref';

@Injectable()
export class UIDialog {
    constructor(
        private _overlay: Overlay
    ) {}

    open(): DialogRef {
        let overlay = this._overlay.create();
    }
}