import {
    AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, Optional, SimpleChanges,
    ViewChild
} from '@angular/core';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {isInRect} from '../core/utils';

export class RowItem {
    // use native Date instead Momentjs to get a good performance
    // https://jsperf.com/moment-js-vs-native-date
    date: Date;
    rowHeightPercent: number;
    // used by pointedItem;
    label: string;
    pos: string;
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
/**
 * Minimum speed to show tooltip when scroll
 * @type {number} unit is rows/sec
 */
export const MIN_VELOCITY = 4;

export const TOOLTIP_FADE_TIME = 800;

@Component({
    selector: 'ui-timeline-meter',
    templateUrl: 'timeline-meter.html',
    styleUrls: ['timeline-meter.less']
})
export class UITimeLineMeter implements AfterViewInit, OnDestroy, OnChanges {

    private _subscription = new Subscription();

    private _scrollPosition = new BehaviorSubject<number>(0);
    private _onContentScroll = new BehaviorSubject<number>(-1);

    private _itemList: RowItem[];

    private _meterWidth: number;
    private _meterHeight: number;
    private _isBuilding: boolean;
    private _isInMeasure: boolean;

    scrollPercentage: number;

    /**
     * the scrollable content height
     */
    contentHeight: number;

    // availableHeight is _meterHeight - toolTipHeight
    availableHeight: number;

    toolTipHeight: number;

    labelList: Label[];
    /**
     * we maintain this list which only contains label an mark whose showLabel or showMarker property is true.
     * this approach could reduce DOM elements and increase speed and save memory
     */
    renderEntityList: RenderEntity[];

    showTooltip: boolean = false;
    floatMarkPos: string;
    pointedItem: RowItem;

    @ViewChild('meter') meter: ElementRef;
    @ViewChild('container') container: ElementRef;
    @ViewChild('renderWrapper') renderWrapper: ElementRef;

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

    /**
     * markSpan should always smaller than labelSpan
     * @type {string}
     */
    @Input()
    markSpan: 'month' | 'week' | 'day' | 'hour' = 'month';

    @Input()
    showMarker: boolean = true;

    /**
     * if rowHeight is set, meter will use this height for all rows.
     * mark on meter will be evenly placed.
     * If you use InfiniteList as content, row height must be set.
     */
    @Input()
    rowHeight: number = 0;

    set rowHeightList(list: number[]) {
        this.contentHeight = list.reduce((prev, curr) => prev + curr, 0);
        this._itemList = list.map((rowHeight, index) => {
            let item = new RowItem();
            item.rowHeightPercent = rowHeight / this.contentHeight;
            if (this.timestampList && this.timestampList[index]) {
                item.date = new Date(this.timestampList[index]);
            }
            return item;
        });
        if (this._itemList && this._itemList.length > 0) {
            this.buildMeter();
        }
    }

    /**
     * This method is called by content component to update its
     * @param scrollPercentage should be percentage digital of scroll y position
     */
    setScrollY(scrollPercentage: number) {
        this.scrollPercentage = scrollPercentage;
        let scrollY = scrollPercentage * this.availableHeight;
        this.updatePointedItem(scrollPercentage);
        this.updateCursorPosition(scrollY + this.toolTipHeight / 2);
        this._onContentScroll.next(scrollPercentage);
    }

    onScrollbarChange(scrollPercentage: number) {
        this.setScrollY(scrollPercentage);
        this._scrollPosition.next(scrollPercentage);
    }
    /**
     * scroll position is a percentage float number.
     * content component should calculate actual scrollY multiply its own height
     * @returns {Observable<number>}
     */
    get scrollPosition(): Observable<number> {
        return this._scrollPosition.asObservable();
    }

    ngAfterViewInit(): void {
        let meterEl = this.meter.nativeElement;
        let container = this.container.nativeElement;
        let renderWrapper = this.renderWrapper.nativeElement;
        // for mouse event
        this._subscription.add(
            Observable.fromEvent(meterEl, 'mousedown')
                .filter(() => {
                    return this.timestampList && this.timestampList.length > 0;
                })
                .flatMap(() => {
                    // console.log('mouse down');
                    return Observable.fromEvent(meterEl, 'mousemove')
                        .takeUntil(Observable.fromEvent(meterEl, 'mouseup'));
                })
                .map((event: MouseEvent) => {
                    return Math.max(0, Math.min(event.clientY - renderWrapper.getBoundingClientRect().top, this.availableHeight));
                })
                .subscribe((pos: number) => {
                    this.scrollTo(pos);
                })
        );

        // for click
        this._subscription.add(
            Observable.fromEvent(meterEl, 'click')
                .filter(() => {
                    return this.timestampList && this.timestampList.length > 0;
                })
                .map((event: MouseEvent) => {
                    return Math.max(0, Math.min(event.clientY - renderWrapper.getBoundingClientRect().top, this.availableHeight));
                })
                .subscribe(
                    (pos: number) => {
                        this.scrollTo(pos);
                    }
                )
        );

        // for touch event
        this._subscription.add(
            Observable.fromEvent(renderWrapper, 'touchstart')
                .filter(() => {
                    return this.timestampList && this.timestampList.length > 0;
                })
                .do(() => {
                    this.showTooltip = true;
                })
                .map((event: TouchEvent) => {
                    event.preventDefault();
                    return event.touches[0].clientY;
                })
                .flatMap(() => {
                    return Observable.fromEvent(renderWrapper, 'touchmove')
                        .map((event: TouchEvent) => {
                            event.preventDefault();
                            return event.touches[0].clientY;
                        })
                        .takeUntil(
                            Observable.fromEvent(renderWrapper, 'touchend')
                                .map((event: TouchEvent) => {
                                    event.preventDefault();
                                    return event.changedTouches[0].clientY;
                                })
                        )
                        .do(
                            () => {
                            },
                            () => {
                            },
                            () => {
                                this.showTooltip = false;
                            }
                        );
                })
                .subscribe(
                    (viewportOffsetY: number) => {
                        let rect = this.renderWrapper.nativeElement.getBoundingClientRect();
                        let scrollY = Math.max(Math.min(viewportOffsetY - rect.top, rect.height), 0);
                        this.updatePointedItem(scrollY / this.availableHeight);
                        this.updateCursorPosition(scrollY + this.toolTipHeight / 2);
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

        this._subscription.add(
            Observable.fromEvent(container, 'mouseenter')
                .filter(() => {
                    return this.timestampList && this.timestampList.length > 0;
                })
                .flatMap(() => {
                    return Observable.fromEvent(container, 'mousemove')
                        .takeUntil(Observable.fromEvent(container, 'mouseleave'))
                        .do(
                            () => {
                            },
                            () => {
                            },
                            () => {
                                this.showTooltip = false;
                            }
                        );
                })
                .subscribe(
                    (event: MouseEvent) => {
                        let meterRect = meterEl.getBoundingClientRect();
                        let wrapperRect = renderWrapper.getBoundingClientRect();
                        if (!isInRect(event.clientX, event.clientY, meterRect)) {
                            this.showTooltip = false;
                            return;
                        } else {
                            this.showTooltip = true;
                        }
                        let scrollY = Math.max(0, Math.min(event.clientY - wrapperRect.top, this.availableHeight));
                        this.updatePointedItem(scrollY / this.availableHeight);
                        this.updateCursorPosition(scrollY + this.toolTipHeight / 2);
                    }
                )
        );
        let lastScrollTime = 0;
        let lastScrollPos = 0;
        this._subscription.add(
            this._onContentScroll
                .filter(() => {
                    return this.timestampList && this.timestampList.length > 0;
                })
                .filter((scrollPercentage: number) => scrollPercentage !== -1)
                .map((scrollPercentage: number) => {
                    let currentTime = performance.now();
                    let velocity = 0;
                    let averageRowHeight = this.contentHeight / this._itemList.length;
                    if (lastScrollTime) {
                        // unit is rows/sec
                        velocity = Math.abs((scrollPercentage - lastScrollPos) * this.contentHeight) / averageRowHeight / ((currentTime - lastScrollTime) / 1000);
                    }
                    lastScrollTime = currentTime;
                    lastScrollPos = scrollPercentage;
                    return velocity;
                })
                .do((velocity: number) => {
                    if (velocity > MIN_VELOCITY) {
                        this.showTooltip = true;
                    }
                })
                .debounceTime(TOOLTIP_FADE_TIME)
                .subscribe(
                    () => {
                        if (this.showTooltip) {
                            this.showTooltip = false;
                        }
                    }
                ));

        // measure once view is ready
        setTimeout(() => {
            this.measure();
        });
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if ('timestampList' in changes && changes['timestampList'].currentValue && !this.rowHeight && this._itemList) {
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
            if (rowHeight && timestampList) {
                this._itemList = [];
                this._itemList = timestampList.map((timestamp) => {
                    let item = new RowItem();
                    item.date = new Date(timestamp);
                    item.rowHeightPercent = 1 / timestampList.length;
                    return item;
                });
                this.contentHeight = rowHeight * timestampList.length;
            }
            if (this._itemList && this._itemList.length > 0) {
                this.buildMeter();
            }

        }
        if ('showMarker' in changes && !this._isBuilding && !this._isInMeasure) {
            this.makeRenderEntity();
        }
    }

    /**
     * to increase performance. we only render a list of entity which can be both label and marker but only those to be shown
     * will be in this list.
     */
    private makeRenderEntity() {
        if (!this.labelList || this.labelList.length === 0) {
            return;
        }
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
            if (this.showMarker) {
                for (let j = 0; j < label.markers.length; j++) {
                    marker = label.markers[j];
                    if (marker.showMarker) {
                        this.renderEntityList.push(new RenderEntity(false, null, markerTop * 100 + '%'));
                    }
                    markerTop += marker.totalHeightPercent;
                }
            }
            labelTop += label.totalHeightPercent;
        }
    }

    /**
     * measure the marker
     * @param computedFontSize
     */
    private measureMarker(computedFontSize: number) {
        let markerTopMargin = 0;
        let markerBottomMargin = 0;
        let label, prevLabel, lastMarker, bp;
        for (let i = 0; i < this.labelList.length; i++) {
            label = this.labelList[i];
            if (label.showLabel) {
                // check previous label's last marker margin to avoid it too close to current label.
                if (i > 0) {
                    prevLabel = this.labelList[i - 1];
                    bp = prevLabel.markers.length - 1;
                    lastMarker = prevLabel.markers[bp];
                    markerBottomMargin = lastMarker.totalHeightPercent * this.availableHeight;
                    while (markerBottomMargin < MARKER_MARGIN && bp > 0) {
                        lastMarker.showMarker = false;
                        bp--;
                        lastMarker = prevLabel.markers[bp];
                        markerBottomMargin += lastMarker.totalHeightPercent * this.availableHeight;
                    }
                }
                markerTopMargin -= computedFontSize + MARKER_MARGIN;
            }
            for (let j = 0; j < label.markers.length; j++) {
                let marker = label.markers[j];
                if (markerTopMargin > MARKER_MARGIN) {
                    marker.showMarker = true;
                    markerTopMargin = marker.totalHeightPercent * this.availableHeight;
                } else {
                    markerTopMargin += marker.totalHeightPercent * this.availableHeight;
                }
            }
        }
    }

    private measureTooltipSize() {
        let baseSize = parseFloat(window.getComputedStyle(document.body).getPropertyValue('font-size').match(/(\d+(?:\.\d+)?)/)[1]);
        this.toolTipHeight = baseSize * 2; // 2rem
    }

    /**
     * Once we have labelList ready. we need to measure the meter height and width. then if height is available. we need to decide
     * which label and marker should be show depending on their height and our rule.
     */
    private measure() {
        if (!this.labelList || this._isInMeasure) {
            return;
        }
        this.measureTooltipSize();
        this._isInMeasure = true;
        let computedFontSize = parseFloat(window.getComputedStyle(this.meter.nativeElement).getPropertyValue('font-size').match(/(\d+(?:\.\d+)?)px/)[1]);
        let rect = this.meter.nativeElement.getBoundingClientRect();
        this._meterWidth = rect.width;
        this._meterHeight = rect.height;
        this.availableHeight = this._meterHeight - this.toolTipHeight;
        if (!this._meterWidth || !this._meterHeight) {
            return;
        }
        let lp = 0, rp = this.labelList.length - 2;
        let heightFromTop = 0, heightFromBottom = 0;
        // console.log(computedFontSize + LABEL_MARGIN);
        while (lp < rp) {
            heightFromTop += this.labelList[lp].totalHeightPercent * this.availableHeight;
            // console.log(heightFromTop);
            if (heightFromTop < (computedFontSize + LABEL_MARGIN)) {
                this.labelList[++lp].showLabel = false;
            } else {
                lp++;
                // this.marker[++lp].showLabel = true;
                heightFromTop = 0;
            }
            heightFromBottom += this.labelList[rp].totalHeightPercent * this.availableHeight;
            if (heightFromBottom < (computedFontSize + LABEL_MARGIN)) {
                this.labelList[rp--].showLabel = false;
            } else {
                rp--;
                heightFromBottom = 0;
            }
        }
        this.measureMarker(computedFontSize);
        this.makeRenderEntity();
        this._isInMeasure = false;
    }

    /**
     * build our labelList to store the label, mark tree. each row item is group to markers and then markers group
     * to labels depending on their label time span and marker time span.
     * this method will be called in two situation:
     * - rowHeight and timestampList are all available. then build _itemList base on these two information. in this case,
     *  every row has some height. this is usually happened when you use InfiniteList with this component.
     * - rowHeightList is set by content child, this is the case when you use ScrollableContent component with this component.
     *  In this case, _itemList has already built.
     * @param rowHeight
     * @param timestampList
     */
    private buildMeter() {
        if (this._isBuilding) {
            return;
        }
        this._isBuilding = true;
        // performance.mark('start_building');
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
        // performance.mark('end_building');
        // performance.measure('building_performance', 'start_building', 'end_building');
        // console.log(window.performance.getEntriesByType('measure'));
        // performance.clearMarks();
        this._isBuilding = false;
    }

    private isInSameSpan(date1, date2, span): { same: boolean, parentSame: boolean } {
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

    /**
     * get label string represent for given date in label time span
     * TODO: need i18n compatibility for label.
     * @param date the date used to get label.
     * @param needParentUnit sometimes, a label in certain time span is reset from the beginning. to give enough information
     * a parent time span will added to this label. e.g. labelSpan = 'hour', we have a series of label 11, 12, 1, 2... 11,
     * we know that second 11 is the 11hrs of second day. But add the day will be more informative.
     * @returns {string}
     */
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

    private getTooltipLabel(date: Date) {
        switch (this.markSpan) {
            case 'month':
                return date.getFullYear() + '-' + (date.getMonth() + 1);
            case 'day':
                return (date.getMonth() + 1) + '-' + (date.getDay() + 1);
            case 'hour':
                return (date.getDay() + 1) + ' ' + date.getHours() + ':00';
        }
    }

    /**
     * This method is called every time a user click or move on this meter.
     * A popover should be shown contain current pointed item date (up to marker span accuracy).
     * then content component should be scroll to corresponding position.
     * @param pos
     */
    private scrollTo(pos: number) {
        if (!this.availableHeight || !this._itemList) {
            return;
        }
        let scrollYPercentage = pos / this.availableHeight;
        // let content component know
        this._scrollPosition.next(scrollYPercentage);
        this.scrollPercentage = scrollYPercentage;
    }

    /**
     * update pointedItem
     * @param percentage
     */
    private updatePointedItem(percentage: number) {
        let heightFromTop = 0;
        let pointedIndex = -1;
        if (percentage === 0) {
            pointedIndex = 0;
        } else {
            for (let i = 0; i < this._itemList.length; i++) {
                let item = this._itemList[i];
                if (heightFromTop > percentage && i > 0) {
                    pointedIndex = i - 1;
                    break;
                }
                heightFromTop += item.rowHeightPercent;
            }
        }
        if (pointedIndex === -1) {
            pointedIndex = this._itemList.length - 1;
        }
        if (!this.pointedItem || this.pointedItem.date.valueOf() !== this._itemList[pointedIndex].date.valueOf()) {
            this.pointedItem = Object.assign({}, this._itemList[pointedIndex]);
            this.pointedItem.label = this.getTooltipLabel(this.pointedItem.date);
        }
    }

    private updateCursorPosition(pos: number) {
        if (this.pointedItem) {
            this.pointedItem.pos = `translate3d(-100%, ${pos - this.toolTipHeight / 2}px, 0)`;
        }
        this.floatMarkPos = `translate3d(0, ${pos}px, 0)`;
    }
}

