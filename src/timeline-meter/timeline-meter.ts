import {
    AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, Optional, SimpleChanges,
    ViewChild
} from '@angular/core';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';


export class RowItem {
    // use native Date instead Momentjs to get a good performance
    // https://jsperf.com/moment-js-vs-native-date
    date: Date;
    rowHeight: number;
}

export class Marker {
    labelSpan: 'string';
    items: RowItem[];
}

@Component({
    selector: 'ui-timeline-meter',
    templateUrl: 'timeline-meter.html',
    styleUrls: ['timeline-meter.less']
})
export class UITimeLineMeter implements AfterViewInit, OnDestroy, OnChanges {

    private _subscription = new Subscription();

    private _scrollPosition = new BehaviorSubject<number>(0);

    private _itemList: RowItem[];

    private _meterWidth: number;
    private _meterHeight: number;

    marker: Marker[];

    @ViewChild('meter') meter: ElementRef;

    @Input()
    timestampList: number[];

    /**
     * labelSpan is used to regular what span of time should a label be displayed.
     * The labels display may vary base on timestamp list, height of each row and height of meter.
     * But the minimal time span of the label is not less than this value.
     * @type {string}
     */
    @Input()
    labelSpan: 'year' | 'season' | 'month' | 'week' | 'day' | 'hour' = 'season';

    @Input()
    labelDateFormat: string;

    /**
     * markSpan should always smaller than labelSpan
     * @type {string}
     */
    @Input()
    markSpan: 'season' | 'month' | 'week' | 'day' | 'hour' = 'month';

    @Input()
    showMarker: boolean = true;

    /**
     * if _rowHeight is set, meter will use this height for all rows.
     * mark on meter will evenly displaced.
     * If you use InfiniteList as content, row height must be set.
     */
    @Optional()
    @Input()
    rowHeight: number;

    set rowHeightList(list: number[]) {
        this._itemList = list.map((rowHeight, index) => {
            let item = new RowItem();
            item.rowHeight = rowHeight;
            if (this.timestampList && this.timestampList[index]) {
                item.date = new Date(this.timestampList[index]);
            }
            return item;
        });
        this.buildMeter();
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
                        let scrollY = Math.max(Math.min(viewportOffsetY - rect.top, rect.height), 0);
                        this.scrollTo(scrollY);
                    }
                )
        );

        if (window) {
            this._subscription.add(Observable.fromEvent(window, 'resize')
                .debounceTime(300)
                .subscribe(
                    () => {
                        let rect = this.meter.nativeElement.getBoundingClientRect();
                        this._meterWidth = rect.width;
                        this._meterHeight = rect.height;
                    }
                ));
        }
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if ('timestampList' in changes && !this.rowHeight && this._itemList) {
            let currentTimestampList = changes['timestampList'].currentValue;
            if (currentTimestampList.length === this._itemList.length) {
                this._itemList.forEach((item, index) => {
                    item.date = new Date(currentTimestampList[index]);
                });
            }
        }
        if ('timestampList' in changes || 'rowHeight' in changes) {
            this.buildMeter();
        }
    }

    private buildMeter() {
        if (this.rowHeight && this.timestampList) {
            this._itemList = [];
            this._itemList = this.timestampList.map((timestamp) => {
                let item = new RowItem();
                item.date = new Date(timestamp);
                item.rowHeight = this.rowHeight;
                return item;
            });
        }
        this.marker = [];
        // need an algorithm to build meter
        let firstItem = this._itemList[0];
        let lastItem = this._itemList[this._itemList.length - 1];
        let labelSpan;
        // if (firstItem.date.getFullYear() === lastItem.date.getFullYear()) {
        //     if (Math.abs(firstItem.date.getMonth() - lastItem.date.getMonth()) <= 3) {
        //         if (firstItem.date.getMonth() === lastItem.date.getMonth()) {
        //             if (firstItem.date.getMonth())
        //         } else {
        //             labelSpan = 'month';
        //         }
        //     } else {
        //         // same year but different season. use season as label
        //         labelSpan = 'season';
        //     }
        // } else {
        //     labelSpan = 'year';
        // }
        let i = 1;
        let lastGroupStart = this._itemList[0];
    }

    private scrollTo(pos: number) {

    }
}
