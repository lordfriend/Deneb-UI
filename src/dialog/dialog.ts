// Optional is unused here but in order to emit declaration files, we need to import it.
// https://github.com/Microsoft/TypeScript/issues/9944#issuecomment-244448079
import {Injectable, Injector, Type, ComponentFactoryResolver, ApplicationRef, Optional} from '@angular/core';
import {DialogRef} from './dialog-ref';
import {DialogContainer, DIALOG_CONTAINER} from './dialog-container';
import {DialogInjector} from './dialog-injector';

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

    createDialogContent<T>(component: Type<T>, container: DialogContainer, config: DialogConfig): DialogRef<T> {
        let dialogRef = new DialogRef<T>(container, this._componentFactoryResolver, this._appRef, config);
        let dialogInjector = new DialogInjector(dialogRef, this._injector);
        let componentRef = dialogRef.attachComponent(component, dialogInjector);
        dialogRef.componentInstance = componentRef.instance;
        return dialogRef;
    }
}

export class DialogConfig {
    // stickyDialog means it cannot be closed through click on the backdrop or press escape key.
    stickyDialog: boolean;
}

export const DIALOG_PROVIDERS = [
    UIDialog,
    DIALOG_CONTAINER
];
