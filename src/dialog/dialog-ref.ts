import {Observable, Subject} from 'rxjs';
import {Type, Injector, ComponentRef, ComponentFactoryResolver, ApplicationRef, EmbeddedViewRef} from '@angular/core';
import {DialogContainer} from './dialog-container';
import {DialogConfig} from './dialog';

export class DialogRef<T> {

    componentInstance: T;

    private _afterClosed: Subject<any> = new Subject();

    private _disposeCallback: () => void;

    constructor(
        private _container: DialogContainer,
        private _componentFactoryResolver: ComponentFactoryResolver,
        private _appRef: ApplicationRef,
        private _config: DialogConfig
    ) {}

    attachComponent<T>(componentType: Type<T>,  injector?: Injector): ComponentRef<T> {
        let componentFactory = this._componentFactoryResolver.resolveComponentFactory(componentType);
        let componentRef: ComponentRef<T>;

        componentRef = componentFactory.create(injector);

        this._appRef.attachView(componentRef.hostView);
        this._disposeCallback = () => {
            this._appRef.detachView(componentRef.hostView);
            componentRef.destroy();
        };
        let containerElement = this._container.getContainerElement();
        // At this point the component has been instantiated, so we move it to the location in the DOM
        // where we want it to be rendered.
        containerElement.appendChild(this._getComponentRootNode(componentRef));
        this._container.dialogAttached();

        if (this._config.stickyDialog) {
            this._container.onContainerClick().subscribe(() => {
                this.close();
            });
        }

        return componentRef;
    }

    close(dialogResult?: any): void {
        this._disposeCallback();
        this._afterClosed.next(dialogResult);
        this._afterClosed.complete();

        this._container.dialogDetached();
    }

    afterClosed(): Observable<any> {
        return this._afterClosed.asObservable();
    }


    /** Gets the root HTMLElement for an instantiated component. */
    private _getComponentRootNode(componentRef: ComponentRef<any>): HTMLElement {
        return (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
    }
}