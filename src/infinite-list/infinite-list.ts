import {Component, ViewChild, ElementRef, AfterViewInit, OnDestroy, Input} from '@angular/core';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';

export const SCROLL_STOP_TIME_THRESHOLD = 200; // in milliseconds

@Component({
    selector: 'infinite-list',
    template: `
        <div class="infinite-list" #listContainer>
            <div class="infinite-list-holder" [style.height]="holderHeightInPx">
                <ng-content></ng-content>
            </div>
        </div>`,
    styles: [`
        .infinite-list {
            overflow-y: auto;
            overflow-x: hidden;
            width: 100%;
            height: 100%;
            position: relative;
        }

        .infinite-list-holder {
            width: 100%;
            position: relative;
        }
    `]
})
export class InfiniteList implements AfterViewInit, OnDestroy {
    private _holderHeight: number;
    private _containerWidth: number;
    private _containerHeight: number;

    private _subscription: Subscription = new Subscription();

    private _scrollStateChange: BehaviorSubject<SCROLL_STATE> = new BehaviorSubject(SCROLL_STATE.IDLE);

    currentScrollState: SCROLL_STATE = SCROLL_STATE.IDLE;

    @ViewChild('listContainer') listContainer: ElementRef;

    /**
     * current scroll position subject.
     * @type {number}
     */
    scrollPosition: BehaviorSubject<number> = new BehaviorSubject(0);
    /**
     * list container width and height.
     */
    sizeChange: BehaviorSubject<number[]> = new BehaviorSubject([0, 0]);


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

    get scrollStateChange(): Observable<SCROLL_STATE> {
        return this._scrollStateChange.asObservable();
    }

    @Input() rowHeight: number;

    ngAfterViewInit(): void {
        if (window) {
            this._subscription.add(Observable.fromEvent(window, 'resize')
                .subscribe(() => {
                    let {width, height} = this.measure();
                    this.sizeChange.next([width, height]);
                }));
        }
        this._subscription.add(Observable.fromEvent(this.listContainer.nativeElement, 'scroll')
            .map(() => {
                return this.listContainer.nativeElement.scrollTop;
            })
            .subscribe((scrollY: number) => {
                // console.log('on scroll ', scrollY);
                this.scrollPosition.next(scrollY);
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
        setTimeout(() => {
            let {width, height} = this.measure();
            this.sizeChange.next([width, height]);
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
            this._containerWidth = rect.width;
            this._containerHeight = rect.height;
            return {width: this._containerWidth, height: this._containerHeight};
        }
        return {width: 0, height: 0};
    }
}

export enum SCROLL_STATE {
    SCROLLING,
    IDLE
}
