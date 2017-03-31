import {
    AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, Optional, SimpleChanges,
    ViewChild
} from '@angular/core';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';


export class RowItem {
    // use native Date instead Momentjs to get a good performance
    // https://jsperf.com/moment-js-vs-native-date
    date: Date;
    rowHeightPercent: number;
}

export class Marker {
    items: RowItem[] = [];
    totalHeightPercent: number = 0;
    showMarker: boolean = false;
}

export class Label {
    label: string;
    leadDate: Date;
    markers: Marker[] = [];
    totalHeightPercent: number = 0;
    showLabel: boolean = true;
}

export class RenderEntity {
    constructor(public isLabel: boolean, public label: string, public top: string) {
    }
}

export const LABEL_MARGIN = 15;
export const MARKER_MARGIN = 8;

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

    labelList: Label[];
    /**
     * we maintain this list which only contains label an mark whose showLabel or showMarker property is true.
     * this approach could reduce DOM elements and increase speed and save memory
     */
    renderEntityList: RenderEntity[];

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
     * mark on meter will be evenly placed.
     * If you use InfiniteList as content, row height must be set.
     */
    @Optional()
    @Input()
    rowHeight: number;

    set rowHeightList(list: number[]) {
        let totalHeight = list.reduce((prev, curr) => prev + curr, 0);
        this._itemList = list.map((rowHeight, index) => {
            let item = new RowItem();
            item.rowHeightPercent = rowHeight / totalHeight;
            if (this.timestampList && this.timestampList[index]) {
                item.date = new Date(this.timestampList[index]);
            }
            return item;
        });
        this.buildMeter(null, this.timestampList);
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
                        this.measure();
                    }
                ));
        }
        setTimeout(() => {
            this.measure();
        });
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
            let timestampList = 'timestampList' in changes ? changes['timestampList'].currentValue : this.timestampList;
            let rowHeight = 'rowHeight' in changes ? changes['rowHeight'].currentValue : this.rowHeight;
            this.buildMeter(rowHeight, timestampList);
        }
    }

    private makeRenderEntity() {
        let labelTop = 0;
        let markerTop = 0;
        this.renderEntityList = [];
        let label: Label, marker: Marker;
        for (let i = 0; i < this.labelList.length; i++) {
            label = this.labelList[i];
            markerTop = labelTop;
            if (label.showLabel) {
                this.renderEntityList.push(new RenderEntity(true, label.label, labelTop * 100 + '%'));
            }
            for (let j = 0; j < label.markers.length; j++) {
                marker = label.markers[j];
                if (marker.showMarker) {
                    this.renderEntityList.push(new RenderEntity(false, null, markerTop * 100 + '%'));
                }
                markerTop += marker.totalHeightPercent;
            }
            labelTop += label.totalHeightPercent;
        }
    }

    private measureMarker(computedFontSize: number) {
        let markerTopMargin = 0;
        let markerBottomMargin = 0;
        let label, prevLabel, lastMarker, bp;
        for(let i = 0; i < this.labelList.length; i++) {
            label = this.labelList[i];
            if (label.showLabel) {
                // check previous label's last marker margin to avoid it too close to current label.
                if (i > 0) {
                    prevLabel = this.labelList[i - 1];
                    bp = prevLabel.markers.length - 1;
                    lastMarker = prevLabel.markers[bp];
                    markerBottomMargin = lastMarker.totalHeightPercent * this._meterHeight;
                    while(markerBottomMargin < MARKER_MARGIN && bp > 0) {
                        lastMarker.showMarker = false;
                        bp--;
                        lastMarker = prevLabel.markers[bp];
                        markerBottomMargin += lastMarker.totalHeightPercent * this._meterHeight;
                    }
                }
                markerTopMargin -= computedFontSize + MARKER_MARGIN;
            }
            for (let j = 0; j < label.markers.length; j++) {
                let marker = label.markers[j];
                if (markerTopMargin > MARKER_MARGIN) {
                    marker.showMarker = true;
                    markerTopMargin = marker.totalHeightPercent * this._meterHeight;
                } else {
                    markerTopMargin += marker.totalHeightPercent * this._meterHeight;
                }
            }
        }
    }

    private measure() {
        if (!this.labelList) {
            return;
        }
        let computedFontSize = parseFloat(window.getComputedStyle(this.meter.nativeElement).getPropertyValue('font-size').match(/(\d+(?:\.\d+)?)px/)[1]);
        let rect = this.meter.nativeElement.getBoundingClientRect();
        this._meterWidth = rect.width;
        this._meterHeight = rect.height;
        if (!this._meterWidth || !this._meterHeight) {
            return;
        }
        let lp = 0, rp = this.labelList.length - 2;
        let heightFromTop = 0, heightFromBottom = 0;
        console.log(computedFontSize + LABEL_MARGIN);
        while(lp < rp) {
            heightFromTop += this.labelList[lp].totalHeightPercent * this._meterHeight;
            // console.log(heightFromTop);
            if (heightFromTop < (computedFontSize + LABEL_MARGIN)) {
                this.labelList[++lp].showLabel = false;
            } else {
                lp++;
                // this.marker[++lp].showLabel = true;
                heightFromTop = 0;
            }
            heightFromBottom += this.labelList[rp].totalHeightPercent * this._meterHeight;
            if (heightFromBottom < (computedFontSize + LABEL_MARGIN)) {
                this.labelList[rp--].showLabel = false;
            } else {
                rp--;
                heightFromBottom = 0;
            }
        }
        this.measureMarker(computedFontSize);
        this.makeRenderEntity();
    }

    private buildMeter(rowHeight: number, timestampList: number[]) {
        performance.mark('start_building');
        if (rowHeight && timestampList) {
            this._itemList = [];
            this._itemList = timestampList.map((timestamp) => {
                let item = new RowItem();
                item.date = new Date(timestamp);
                item.rowHeightPercent = 1 / timestampList.length;
                return item;
            });
        }
        if (!this._itemList || this._itemList.length === 0) {
            return;
        }
        this.labelList = [];
        let lastLabel = new Label();
        this.labelList.push(lastLabel);
        let lastMarker = new Marker();
        lastMarker.totalHeightPercent = this._itemList[0].rowHeightPercent;
        lastMarker.items.push(this._itemList[0]);
        lastLabel.markers.push(lastMarker);
        lastLabel.leadDate = this._itemList[0].date;
        lastLabel.label = this.getLabel(lastLabel.leadDate, true);
        for (let i = 1; i < this._itemList.length; i++) {
            let item = this._itemList[i];
            let sameMarker = this.isInSameSpan(lastMarker.items[0].date, item.date, this.markSpan);
            if (sameMarker.same) {
                lastMarker.items.push(item);
                lastMarker.totalHeightPercent += item.rowHeightPercent;
            } else {
                lastLabel.totalHeightPercent += lastMarker.totalHeightPercent;
                lastMarker = new Marker();
                lastMarker.items.push(item);
                lastMarker.totalHeightPercent = item.rowHeightPercent;
                let sameLabel = this.isInSameSpan(lastLabel.leadDate, item.date, this.labelSpan);
                if (sameLabel.same) {
                    lastLabel.markers.push(lastMarker);
                } else {
                    lastLabel = new Label();
                    lastLabel.markers.push(lastMarker);
                    lastLabel.leadDate = lastMarker.items[0].date;
                    lastLabel.label = this.getLabel(lastLabel.leadDate, !sameLabel.parentSame);
                    this.labelList.push(lastLabel);
                }
            }
        }
        this.measure();
        performance.mark('end_building');
        performance.measure('building_performance', 'start_building', 'end_building');
        console.log(window.performance.getEntriesByType('measure'));
        performance.clearMarks();
    }

    private isInSameSpan(date1, date2, span): {same: boolean, parentSame: boolean} {
        let sameHours = date1.getHours() === date2.getHours();
        let sameDay = date1.getDay() === date2.getDay();
        let sameMonth = date1.getMonth() === date2.getMonth();
        let sameYear = date1.getFullYear() === date2.getFullYear();
        switch (span) {
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
