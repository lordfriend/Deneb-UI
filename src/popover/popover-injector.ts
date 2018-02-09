import { Injector } from '@angular/core';
import { UIPopoverRef } from './popover-ref';

export class UIPopoverInjector implements Injector {
    constructor(private _popoverRef: UIPopoverRef<any>, private _parentInjector: Injector) {}
    get(token: any, notFoundValue?: any): any {
        if (token === UIPopoverRef) {
            return this._popoverRef;
        }
        return this._parentInjector.get(token, notFoundValue);
    }
}
