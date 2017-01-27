import {Injector} from '@angular/core';
import {DialogRef} from './dialog-ref';

export class DialogInjector implements Injector {

    constructor(private _dialogRef: DialogRef<any>, private _parentInjector: Injector) {}

    get(token: any, notFoundValue?: any): any {
        if (token === DialogRef) {
            return this._dialogRef;
        }
        return this._parentInjector.get(token, notFoundValue);
    }
}