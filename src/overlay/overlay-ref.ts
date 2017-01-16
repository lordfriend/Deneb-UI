import {
    ComponentRef, TemplateRef, ApplicationRef, ComponentFactoryResolver, Type,
    ViewContainerRef, Injector
} from '@angular/core';
import {OverlayContainer} from './overlay-contianer';
import {Subject} from 'rxjs';
/**
 * OverlayRef is a reference to an overlay created by overlay service.
 */
export class OverlayRef {

    private _disposeCallback: () => void;

    private _containerClick: Subject<any> = new Subject();

    constructor(
        private _plate: HTMLElement,
        private _container: OverlayContainer,
        private _componentFactoryResolver: ComponentFactoryResolver,
        private _appRef: ApplicationRef,
        private _defaultInjector: Injector
    ) {}

    attachComponent<T>(componentType: Type<T>, viewContainer?: ViewContainerRef, injector?: Injector) {
        let componentFactory = this._componentFactoryResolver.resolveComponentFactory(componentType);
        let componentRef: ComponentRef<T>;

        // If viewContainer is available. we will use this viewContainer as attachment point.
        if (viewContainer) {
            componentRef = viewContainer.createComponent(
                componentFactory,
                viewContainer.length,
                injector || viewContainer.parentInjector);

            this._disposeCallback = () => {componentRef.destroy();};
        } else {
            componentRef = componentFactory.create(injector || this._defaultInjector);

            this._appRef.attachView(componentRef.hostView);
            this._disposeCallback = () => {
                this._appRef.detachView(componentRef.hostView);
                componentRef.destroy();
            }
        }
    }

    attachTemplate<T>(template: TemplateRef<T>) {

    }

    dispose() {
        this._disposeCallback();
    }
}