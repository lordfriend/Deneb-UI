import {Observable, Subject, Subscription} from 'rxjs';
import {ApplicationRef, ComponentFactoryResolver, ComponentRef, Injector, Type} from '@angular/core';
import {UIDialogConfig} from './dialog';
import {UIDialogContainer} from './dialog-container';
export class UIDialogRef<T> {

    componentInstance: T;

    private _subscription = new Subscription();

    private _afterClosed: Subject<any> = new Subject();

    private _disposeCallback: () => void;

    constructor(
        private _container: ComponentRef<UIDialogContainer>,
        private _componentFactoryResolver: ComponentFactoryResolver,
        private _appRef: ApplicationRef,
        public config: UIDialogConfig
    ) {}

    attachComponent<T>(componentType: Type<T>,  injector?: Injector): ComponentRef<T> {
        let componentFactory = this._componentFactoryResolver.resolveComponentFactory(componentType);
        let componentRef = componentFactory.create(injector);
        let containerInstance = this._container.instance;
        containerInstance.attachDialogContent(componentRef);
        if (this.config.backdrop && !this.config.stickyDialog) {
            this._subscription.add(
                containerInstance.close
                    .subscribe(() => this.close(null))
            );
        }
        this._disposeCallback = () => {
            this._appRef.detachView(this._container.hostView)
            this._container.destroy();
        };
        return componentRef;
    }

    close(dialogResult?: any): void {
        this._disposeCallback();
        this._afterClosed.next(dialogResult);
        this._afterClosed.complete();
        this._subscription.unsubscribe();
    }

    afterClosed(): Observable<any> {
        return this._afterClosed.asObservable();
    }
}
