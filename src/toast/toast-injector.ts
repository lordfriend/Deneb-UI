import {Injector} from '@angular/core';
import {ToastRef} from './toast-ref';

export class ToastInjector implements Injector {

    constructor(private _toastRef: ToastRef<any>, private _parentInjector: Injector){}

    get(token: any, notFoundValue?: any): any {
        if (token === ToastRef) {
            return this._toastRef;
        }
        return this._parentInjector.get(token, notFoundValue);
    }
}
