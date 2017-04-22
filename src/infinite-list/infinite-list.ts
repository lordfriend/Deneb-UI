import {AfterViewInit, Component, ElementRef, Input, OnDestroy, Optional, ViewChild} from '@angular/core';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {UITimeLineMeter} from '../timeline-meter/timeline-meter';

export const SCROLL_STOP_TIME_THRESHOLD = 200; // in milliseconds

@Component({
    selector: 'infinite-list',
    templateUrl: 'infinite-list.html',
    styleUrls: ['infinite-list.less']
})
export class InfiniteList implements AfterViewInit, OnDestroy {
    private _holderHeight: number;
    private _containerWidth: number;
    private _containerHeight: number;

    private _subscription: Subscription = new Subscription();

    private _scrollStateChange: BehaviorSubject<SCROLL_STATE> = new BehaviorSubject(SCROLL_STATE.IDLE);
    private _scrollPosition: BehaviorSubject<number> = new BehaviorSubject(0);
    private _sizeChange: BehaviorSubject<number[]> = new BehaviorSubject([0, 0]);

    currentScrollState: SCROLL_STATE = SCROLL_STATE.IDLE;

    @ViewChild('listContainer') listContainer: ElementRef;

    scrollbarStyle: string;
    scrollbarWidth: number;

    set holderHeight(height: number) {
        if (height) {
            this._holderHeight = height;
        }
    }

    get holderHeight(): number {
        return this._holderHeight;
    }

    get holderHeightInPx(): string {
        if (this.holderHeight) {
            return this.holderHeight + 'px';
        }
        return '100%';
    }

    /**
     * scroll state change
     * @returns {Observable<SCROLL_STATE>}
     */
    get scrollStateChange(): Observable<SCROLL_STATE> {
        return this._scrollStateChange.asObservable();
    }

    /**
     * current scroll position.
     * @type {number}
     */
    get scrollPosition(): Observable<number> {
        return this._scrollPosition.asObservable();
    }

    /**
     * list container width and height.
     */
    get sizeChange(): Observable<number[]> {
        return this._sizeChange.asObservable();
    }

    @Input() rowHeight: number;

    /**
     * UITimelineMeter is optional injection. when this component used inside a UITimelineMeter.
     * it is responsible to update the scrollY
     * @param _timelineMeter
     */
    constructor(@Optional() private _timelineMeter: UITimeLineMeter) {
        this.scrollbarStyle = !!this._timelineMeter ? 'hide-scrollbar' : 'normal';
        this.scrollbarWidth = getScrollBarWidth();
    }

    ngAfterViewInit(): void {
        if (this.scrollbarStyle === 'hide-scrollbar') {
            this.listContainer.nativeElement.style.right =  (0 - this.scrollbarWidth)+ 'px';
            this.listContainer.nativeElement.style.paddingRight = this.scrollbarWidth + 'px';
        }

        if (window) {
            this._subscription.add(Observable.fromEvent(window, 'resize')
                .subscribe(() => {
                    this.requestMeasure();
                }));
        }
        this._subscription.add(Observable.fromEvent(this.listContainer.nativeElement, 'scroll')
            .map(() => {
                return this.listContainer.nativeElement.scrollTop;
            })
            .subscribe((scrollY: number) => {
                // console.log('on scroll ', scrollY);
                if (this._timelineMeter) {
                    this._timelineMeter.setScrollY(scrollY / (this.holderHeight - this._containerHeight));
                }
                this._scrollPosition.next(scrollY);
            }));
        this._subscription.add(Observable.fromEvent(this.listContainer.nativeElement, 'scroll')
            .do(() => {
                if (this.currentScrollState === SCROLL_STATE.IDLE) {
                    this.currentScrollState = SCROLL_STATE.SCROLLING;
                    this._scrollStateChange.next(this.currentScrollState);
                }
            })
            .debounceTime(SCROLL_STOP_TIME_THRESHOLD)
            .subscribe(
                ()=> {
                    if (this.currentScrollState === SCROLL_STATE.SCROLLING) {
                        this.currentScrollState = SCROLL_STATE.IDLE;
                        this._scrollStateChange.next(this.currentScrollState);
                    }
                }
            ));

        if (this._timelineMeter) {
            this._subscription.add(this._timelineMeter.scrollPosition
                .map((scrollPercentage: number) => {
                    return scrollPercentage * (this.holderHeight - this._containerHeight);
                })
                .filter((scrollY: number) => {
                    return scrollY >= 0 && scrollY <= (this.holderHeight - this._containerHeight);
                })
                .do(
                    (scrollY: number) => {
                        this.listContainer.nativeElement.scrollTop = scrollY;
                        this._scrollPosition.next(scrollY);
                        if (this.currentScrollState === SCROLL_STATE.IDLE) {
                            this.currentScrollState = SCROLL_STATE.SCROLLING;
                            this._scrollStateChange.next(this.currentScrollState);
                        }
                    }
                )
                .debounceTime(SCROLL_STOP_TIME_THRESHOLD)
                .subscribe(
                    () => {
                        if (this.currentScrollState === SCROLL_STATE.SCROLLING) {
                            this.currentScrollState = SCROLL_STATE.IDLE;
                            this._scrollStateChange.next(this.currentScrollState);
                        }
                    }
                ));
        }
        setTimeout(() => {
            this.requestMeasure();
        });
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }

    measure():{width: number, height: number} {
        if (this.listContainer && this.listContainer.nativeElement) {
            // let measuredWidth = this.listContainer.nativeElement.clientWidth;
            // let measuredHeight = this.listContainer.nativeElement.clientHeight;
            let rect = this.listContainer.nativeElement.getBoundingClientRect();
            this._containerWidth = rect.width - this.scrollbarWidth;
            this._containerHeight = rect.height;
            return {width: this._containerWidth, height: this._containerHeight};
        }
        return {width: 0, height: 0};
    }

    requestMeasure() {
        let {width, height} = this.measure();
        this._sizeChange.next([width, height]);
    }
}

export enum SCROLL_STATE {
    SCROLLING,
    IDLE
}

export function getScrollBarWidth() {
    let inner = document.createElement('p');
    inner.style.width = "100%";
    inner.style.height = "200px";

    let outer = document.createElement('div');
    outer.style.position = "absolute";
    outer.style.top = "0px";
    outer.style.left = "0px";
    outer.style.visibility = "hidden";
    outer.style.width = "200px";
    outer.style.height = "150px";
    outer.style.overflow = "hidden";
    outer.appendChild(inner);

    document.body.appendChild(outer);
    let w1 = inner.offsetWidth;
    outer.style.overflow = 'scroll';
    let w2 = inner.offsetWidth;

    if (w1 == w2) {
        w2 = outer.clientWidth;
    }

    document.body.removeChild(outer);

    return (w1 - w2);
}
