import {Injector} from '@angular/core';
import {UIToastRef} from './toast-ref';

export class ToastInjector implements Injector {

    constructor(private _toastRef: UIToastRef<any>, private _parentInjector: Injector){}

    get(token: any, notFoundValue?: any): any {
        if (token === UIToastRef) {
            return this._toastRef;
        }
        return this._parentInjector.get(token, notFoundValue);
    }
}
