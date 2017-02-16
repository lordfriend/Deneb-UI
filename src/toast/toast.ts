import {
    Injectable, Injector, ApplicationRef, ComponentFactoryResolver, Type, ComponentRef,
    EmbeddedViewRef
} from '@angular/core';
import {UIToastRef} from './toast-ref';
import {UIToastComponent} from './toast.component';
import {ToastInjector} from './toast-injector';
import {Subscription} from 'rxjs';
import {UIToastAnimation} from './toast-interface';

@Injectable()
export class UIToast {
    private _currentActiveToast: ComponentRef<any>;
    // private _lastActiveToast: ComponentRef<any>;

    private _pendingToast: ComponentRef<any>;
    private _pendingToastDuration: number;

    private _leaveAnimationSubscription: Subscription;

    private timerId;

    constructor(private _injector: Injector,
                private _appRef: ApplicationRef,
                private _componentFactoryResolver: ComponentFactoryResolver) {
    }

    make<T>(componentType?: Type<T>): UIToastRef<T> {
        return new UIToastRef(this, componentType);
    }

    makeText(): UIToastRef<UIToastComponent> {
        return this.make(UIToastComponent);
    }

    createComponent<T>(toastRef: UIToastRef<T>): ComponentRef<T> {
        // if (this._lastActiveToast && this._lastActiveToast.componentType === toastRef.componentType) {
        //     console.log('reused', this._lastActiveToast);
        //     return this._lastActiveToast;
        // }
        let componentFactory = this._componentFactoryResolver.resolveComponentFactory(toastRef.componentType);
        let toastInject = new ToastInjector(toastRef, this._injector);
        return componentFactory.create(toastInject);
    }

    activeToast<T>(component: ComponentRef<T>, duration: number) {
        if (this._pendingToast) {
            this._pendingToast = component;
            this._pendingToastDuration = duration;
        } else {
            this._pendingToast = component;
            this._pendingToastDuration = duration;
            if (!this._currentActiveToast) {
                this.activePendingToast();
            } else {
                this.deactiveToast();
            }
        }
    }

    activePendingToast() {
        this._currentActiveToast = this._pendingToast;
        this._pendingToast = null;
        let duration  = this._pendingToastDuration;

        this._appRef.attachView(this._currentActiveToast.hostView);
        document.body.appendChild(this._getComponentRootNode(this._currentActiveToast));

        this.timerId = setTimeout(() => {
            this.deactiveToast();
        }, duration);
    }

    deactiveToast() {
        clearTimeout(this.timerId);
        if (this._currentActiveToast) {
            if (this._currentActiveToast.instance['animationEvent'] && this._currentActiveToast.instance['uiLeaveAnimationDone']) {
                this._leaveAnimationSubscription = (this._currentActiveToast.instance as UIToastAnimation).animationEvent.subscribe(
                    () => {
                        this._leaveAnimationSubscription.unsubscribe();
                        // if (this._lastActiveToast !== this._currentActiveToast && this._lastActiveToast) {
                        //     console.log('destroy lastActiveToast: ', this._lastActiveToast, this._currentActiveToast);
                        //     this._lastActiveToast.destroy();
                        // }
                        // this._lastActiveToast = this._currentActiveToast;
                        this._currentActiveToast.destroy();
                        this._currentActiveToast = null;
                        if (this._pendingToast) {
                            this.activePendingToast();
                        }
                    }
                );
                this._appRef.detachView(this._currentActiveToast.hostView);
            } else {
                // if (this._lastActiveToast !== this._currentActiveToast && this._lastActiveToast) {
                //     this._lastActiveToast.destroy();
                // }
                // this._lastActiveToast = this._currentActiveToast;
                this._currentActiveToast.destroy();
                this._currentActiveToast = null;
            }
        }
    }


    /** Gets the root HTMLElement for an instantiated component. */
    private _getComponentRootNode(componentRef: ComponentRef<any>): HTMLElement {
        return (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
    }
}

export const LONG_TOAST = 6 * 1000;
export const SHORT_TOAST = 3 * 1000;
