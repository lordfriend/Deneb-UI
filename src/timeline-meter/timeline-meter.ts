import {AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild} from '@angular/core';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
@Component({
    selector: 'ui-timeline-meter',
    templateUrl: 'timeline-meter.html',
    styleUrls: ['timeline-meter.less']
})
export class UITimeLineMeter implements AfterViewInit, OnDestroy {

    private _subscription = new Subscription();

    private _scrollPosition = new BehaviorSubject<number>(0);

    /**
     * if _rowHeight is set, meter will use this height for all rows.
     * mark on meter will evenly displaced.
     * If you use InfiniteList as content, row height must be set.
     */
    private _rowHeight: number;

    @ViewChild('meter') meter: ElementRef;

    @Input()
    timestampList: number[];

    @Input()
    set rowHeight(value: number) {
        this._rowHeight = value;
    }

    /**
     * This method is called by content component to update its
     * @param scrollY
     */
    setScrollY(scrollY: number) {

    }

    get scrollPosition(): Observable<number> {
        return this._scrollPosition.asObservable();
    }

    ngAfterViewInit(): void {
        let meterEl = this.meter.nativeElement;
        // for mouse event
        this._subscription.add(
            Observable.fromEvent(meterEl, 'mousedown')
                .flatMap(() => {
                    return Observable.fromEvent(meterEl, 'mousemove')
                        .takeUntil(Observable.fromEvent(meterEl, 'mouseup'));
                })
                .map((event: MouseEvent) => {
                    return event.clientY;
                })
                .subscribe((pos: number) => {
                    this.scrollTo(pos);
                })
        );
        // for touch event
        this._subscription.add(
            Observable.fromEvent(meterEl, 'touchstart')
                .map((event: TouchEvent) => {
                    event.preventDefault();
                    return event.touches[0].clientY;
                })
                .flatMap(() => {
                    return Observable.fromEvent(meterEl, 'touchmove')
                        .map((event: TouchEvent) => {
                            event.preventDefault();
                            return event.touches[0].clientY;
                        })
                        .takeUntil(
                            Observable.fromEvent(meterEl, 'touchend')
                                .map((event: TouchEvent) => {
                                    event.preventDefault();
                                    return event.changedTouches[0].clientY;
                                })
                        );
                })
                .subscribe(
                    (viewportOffsetY: number) => {
                        let rect = this.meter.nativeElement.getBoundingClientRect();
                        let scrollY = Math.max(Math.min(viewportOffsetY - rect.top,  rect.height), 0);
                        this.scrollTo(scrollY);
                    }
                )
        );
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }

    private scrollTo(pos: number) {

    }
}
