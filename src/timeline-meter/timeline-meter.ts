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
    label: string;
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
    labelSpan: 'year' | 'month' | 'day' | 'hour' = 'year';

    @Input()
    labelDateFormat: string;

    /**
     * markSpan should always smaller than labelSpan
     * @type {string}
     */
    @Input()
    markSpan: 'month' | 'week' | 'day' | 'hour' = 'month';

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
        if (this._itemList.length > 0) {

        }
        let lastMarker = new Marker();
        this.marker.push(lastMarker);
        lastMarker.items.push(this._itemList[0]);
        lastMarker.label = this.getLabel(this._itemList[0].date, true);
        for (let i = 1; i < this._itemList.length; i++) {
            let item = this._itemList[i];
            let {same, parentSame} = this.isInSameMarker(lastMarker[0].date, item.date);
            if (same) {
                lastMarker.items.push(item);
            } else {
                lastMarker = new Marker();
                this.marker.push(lastMarker);
                lastMarker.items.push(item);
                lastMarker.label = this.getLabel(item.date, !parentSame);
            }
        }
    }

    private isInSameMarker(date1, date2): {same: boolean, parentSame: boolean} {
        let sameHours = date1.getHours() === date2.getHours();
        let sameDay = date1.getDay() === date2.getDay();
        let sameMonth = date1.getMonth() === date2.getMonth();
        let sameYear = date1.getFullYear() === date2.getFullYear();
        switch (this.labelSpan) {
            case 'hour':
                return {
                    same: sameHours && sameDay && sameMonth && sameYear,
                    parentSame: sameDay && sameMonth && sameYear
                };
            case 'day':
                return {
                    same: sameDay && sameMonth && sameYear,
                    parentSame: sameMonth && sameYear
                };
            case 'month':
                return {
                    same: sameMonth && sameYear,
                    parentSame: sameYear
                };
            case 'year':
                return {
                    same: sameYear,
                    parentSame: true
                }
        }
    }

    private getLabel(date: Date, needParentUnit: boolean): string {
        switch (this.labelSpan) {
            case 'year':
                return date.getFullYear() + '';
            case 'month':
                let month = (date.getMonth() + 1) + '';
                if (needParentUnit) {
                    return date.getFullYear() + '-' + month;
                }
                return month;
            case 'day':
                let day = (date.getDay() + 1) + '';
                if (needParentUnit) {
                    return (date.getMonth() + 1) + '-' + day;
                }
                break;
            case 'hour':
                let hour = (date.getHours()) + ':00';
                if (needParentUnit) {
                    return (date.getDay() + 1) + ' ' + hour;
                }
                return hour;
        }
    }

    private scrollTo(pos: number) {

    }
}
