import { ApplicationRef, ComponentRef, EmbeddedViewRef } from '@angular/core';
import Popper from "popper.js";
import { Observable, Subject } from 'rxjs';

export class UIPopoverRef<T> {
    private _popper: Popper;
    private _disposeCallback: () => void;
    private _afterClosed = new Subject<any>();

    componentInstance: T;

    constructor(private _appRef: ApplicationRef,
                public placement: Popper.Placement) {}

    afterClosed(): Observable<any> {
        return this._afterClosed.asObservable();
    }

    applyProps(props: {[prop: string]: any}): void {
        if (!props) {
            return;
        }
        Object.keys(props).forEach((propKey) => {
            this.componentInstance[propKey] = props[propKey];
        });
    }

    attach(refElement: Element, componentRef: ComponentRef<T>) {
        this.componentInstance = componentRef.instance;
        const componentElement = this.getComponentRootNode(componentRef);
        this.appendToBody(componentElement);
        this._appRef.attachView(componentRef.hostView);
        this._popper = new Popper(refElement, componentElement, {
            placement: this.placement
            // onCreate: (data) => {
            //     console.log('onCreate', data);
            // },
            // onUpdate: (data) => {
            //     console.log('onUpdate', data);
            // }
        });
        this._disposeCallback = () => {
            this._appRef.detachView(componentRef.hostView);
        };
    }

    close(result?: any) {
        this._disposeCallback();
        this._afterClosed.next(result);
        this._afterClosed.complete();
        this._popper.destroy();
    }

    updatePosition() {
        this._popper.scheduleUpdate();
    }

    private appendToBody(componentElement: HTMLElement) {
        componentElement.style.webkitTransform = 'translate3d(-1000px, 0, 0)';
        componentElement.style.transform = 'translate3d(-1000px, 0, 0)';
        document.body.appendChild(componentElement);
    }

    /** Gets the root HTMLElement for an instantiated component. */
    private getComponentRootNode(componentRef: ComponentRef<any>): HTMLElement {
        return (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
    }
}
