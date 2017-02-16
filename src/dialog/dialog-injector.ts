import {Injector} from '@angular/core';
import {UIDialogRef} from './dialog-ref';

export class DialogInjector implements Injector {

    constructor(private _dialogRef: UIDialogRef<any>, private _parentInjector: Injector) {}

    get(token: any, notFoundValue?: any): any {
        if (token === UIDialogRef) {
            return this._dialogRef;
        }
        return this._parentInjector.get(token, notFoundValue);
    }
}
