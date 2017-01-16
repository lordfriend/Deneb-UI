import {OverlayRef} from '../overlay/overlay-ref';
import {Observable, Subject} from 'rxjs';
export class DialogRef<T> {
    componentInstance: T;

    private _afterClosed: Subject<any> = new Subject();

    constructor(private _overlayRef: OverlayRef) {}

    close(dialogResult?: any): void {
        this._overlayRef.dispose();
        this._afterClosed.next(dialogResult);
        this._afterClosed.complete();
    }

    afterClosed(): Observable<any> {
        return this._afterClosed.asObservable();
    }
}