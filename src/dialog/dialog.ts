import {Injectable, Injector, Type, ComponentFactoryResolver, ApplicationRef} from '@angular/core';
import {DialogRef} from './dialog-ref';
import {DialogContainer} from './dialog-container';

@Injectable()
export class UIDialog {
    constructor(
        private _dialogContainer: DialogContainer,
        private _componentFactoryResolver: ComponentFactoryResolver,
        private _appRef: ApplicationRef,
        private _injector: Injector
    ) {}

    open<T>(component: Type<T>, config: DialogConfig): DialogRef<T> {
        let dialogRef = this.createDialogContent(component, this._dialogContainer, config);
        return dialogRef;
    }

    createDialogContent<T>(component: Type<T>, container: DialogContainer, config: DialogConfig): DialogRef {
        let dialogRef = new DialogRef(container, this._componentFactoryResolver, this._appRef, config);
        let componentRef = dialogRef.attachComponent(component, this._injector);
        dialogRef.componentInstance = componentRef.instance;
        return dialogRef;
    }
}

export class DialogConfig {
    // stickyDialog means it cannot be closed through click on the backdrop or press escape key.
    stickyDialog: boolean
}