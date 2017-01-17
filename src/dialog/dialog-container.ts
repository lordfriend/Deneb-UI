import {Optional, SkipSelf} from '@angular/core';
import {Subject, Observable} from 'rxjs';

export class DialogContainer {
    private _dialogContainer: HTMLElement;

    private _onContainerClick: Subject<any> = new Subject();
    
    getContainerElement(): HTMLElement {
        if (!this._dialogContainer) {
            this._createDimmerContainer();
        }
        return this._dialogContainer;
    }

    onContainerClick(): Observable<any> {
        return this._onContainerClick.asObservable();
    }

    private _createDimmerContainer(): void {
        this._dialogContainer = document.createElement('div');
        this._dialogContainer.classList.add('ui-overlay-container');
        this._dialogContainer.classList.add('ui');
        this._dialogContainer.classList.add('dimmer');
        document.body.appendChild(this._dialogContainer);
        this._dialogContainer.addEventListener('click', () => {this._onContainerClick.next(null);});
    }
}


function DialogContainerFactory(parentContainer: DialogContainer) {
    return parentContainer || new DialogContainer();
}

export const DIALOG_CONTAINER = {
    provide: DialogContainer,
    deps: [[new Optional(), new SkipSelf(), DialogContainer]],
    useFactory: DialogContainerFactory
};