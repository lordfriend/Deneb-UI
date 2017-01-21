import {
    Optional, SkipSelf, Injectable
} from '@angular/core';
import {Subject, Observable} from 'rxjs';

@Injectable()
export class DialogContainer {
    private _dialogContainer: HTMLElement;

    private _onContainerClick: Subject<any> = new Subject();

    private _attachedDialogCount = 0;

    getContainerElement(): HTMLElement {
        if (!this._dialogContainer) {
            this._createDimmerContainer();
        }
        return this._dialogContainer;
    }

    dialogAttached() {
        this._attachedDialogCount++;
        this._showContainer();
    }

    dialogDetached() {
        if (!this._dialogContainer) {
            return;
        }
        this._attachedDialogCount--;

        if (this._attachedDialogCount <= 0) {
            this._hideContainer();
        }
    }

    onContainerClick(): Observable<any> {
        return this._onContainerClick.asObservable();
    }

    private _showContainer() {
        this._dialogContainer.classList.add('active');
    }

    private _hideContainer() {
        this._dialogContainer.classList.remove('active');
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