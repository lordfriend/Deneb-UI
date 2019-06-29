// Optional is unused here but in order to emit declaration files, we need to import it.
// https://github.com/Microsoft/TypeScript/issues/9944#issuecomment-244448079
import {
    Optional,
    ApplicationRef,
    ComponentFactoryResolver,
    ComponentRef,
    EmbeddedViewRef,
    Injectable,
    Injector,
    Type, ViewContainerRef
} from '@angular/core';
import {UIDialogRef} from './dialog-ref';
import {UIDialogContainer} from './dialog-container';
import {DialogInjector} from './dialog-injector';

@Injectable()
export class UIDialog {
    constructor(
        private _componentFactoryResolver: ComponentFactoryResolver,
        private _appRef: ApplicationRef,
        private _injector: Injector
    ) {}

    open<T>(component: Type<T>, config: UIDialogConfig, viewContainer?: ViewContainerRef): UIDialogRef<T> {
        let componentFactory = this._componentFactoryResolver.resolveComponentFactory(UIDialogContainer);
        let container = componentFactory.create(this._injector);
        container.instance.dialogConfig = config;
        container.instance.insideParent = !!viewContainer;
        let dialogRef = this.createDialogContent(component, container, config);
        this.attachContainer(container, viewContainer);
        return dialogRef;
    }

    createDialogContent<T>(component: Type<T>, containerRef: ComponentRef<UIDialogContainer>, config: UIDialogConfig): UIDialogRef<T> {
        let dialogRef = new UIDialogRef<T>(containerRef, this._componentFactoryResolver, this._appRef, config);
        let dialogInjector = new DialogInjector(dialogRef, this._injector);
        let componentRef = dialogRef.attachComponent(component, dialogInjector);
        dialogRef.componentInstance = componentRef.instance;
        return dialogRef;
    }

    attachContainer(containerRef: ComponentRef<UIDialogContainer>, viewContainer?: ViewContainerRef) {
        if (viewContainer) {
            viewContainer.insert(containerRef.hostView);
        } else {
            this._appRef.attachView(containerRef.hostView);
            document.body.appendChild(this.getComponentRootNode(containerRef));
        }
    }

    /** Gets the root HTMLElement for an instantiated component. */
    private getComponentRootNode(componentRef: ComponentRef<any>): HTMLElement {
        return (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
    }
}

export class UIDialogConfig {
    // stickyDialog means it cannot be closed through click on the backdrop or press escape key.
    stickyDialog: boolean = false;
    backdrop: boolean = true;
}
