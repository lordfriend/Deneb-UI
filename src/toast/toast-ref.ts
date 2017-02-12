import {SHORT_TOAST, UIToast} from './toast';
import {Type} from '@angular/core';
export class ToastRef<T> {

    duration = SHORT_TOAST;

    messageObject: any;

    constructor(
        private _toastService: UIToast,
        public componentType: Type<T>
    ) {}

    show(message: any): void {
        if (typeof message !== 'undefined') {
            this.messageObject = message;
        }
        let componentRef = this._toastService.createComponent(this);
        this._bindingMessage(this.messageObject, componentRef.instance);
        this._toastService.activeToast(componentRef, this.duration);
    }

    hide(): void {
        this._toastService.deactiveToast();
    }

    private _bindingMessage(message: any, componentInstance: any) {
        if (typeof message === 'string') {
            componentInstance.message = message;
        } else {
            Object.assign(componentInstance, message);
        }
    }
}
