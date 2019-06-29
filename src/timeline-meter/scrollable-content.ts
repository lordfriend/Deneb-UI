
import {fromEvent as observableFromEvent, Observable, Subscription} from 'rxjs';

import {map} from 'rxjs/operators';
import {AfterViewInit, Component, DoCheck, ElementRef, OnDestroy, ViewChild} from '@angular/core';
import {UITimeLineMeter} from './timeline-meter';

@Component({
    selector: 'ui-scrollable-content',
    template: `
        <div class="scrollable-content" #scrollableContent>
        </div>
    `
})
export class UIScrollableContent implements AfterViewInit, OnDestroy, DoCheck {

    private _subcription = new Subscription();

    @ViewChild('scrollableContent') scrollableContent: ElementRef;

    private _contentHeight: number;
    private _containerHeight: number;

    constructor(private _timelineMeter: UITimeLineMeter) {
    }

    ngAfterViewInit(): void {
        let content = this.scrollableContent.nativeElement;
        this._subcription.add(observableFromEvent(content, 'scroll').pipe(
            map(() => {
                return this.scrollableContent.nativeElement.scrollTop;
            }))
            .subscribe(
                (scrollY: number) => {
                    let rect = content.getBoundingClientRect();
                    this._timelineMeter.setScrollY(scrollY / (content.scrollHeight - rect.height));
                }
            ));
        this._subcription.add(
            this._timelineMeter.scrollPosition.pipe(
                map((scrollPercentage: number) => {
                    let rect = content.getBoundingClientRect();
                    return scrollPercentage * (content.scrollHeight - rect.height);
                }))
                .subscribe(
                    (scrollY: number) => {
                        content.scrollTop = scrollY;
                        content.dispatchEvent(new UIEvent('scroll', {
                            bubbles: true,
                            cancelable: true,
                            view: window,
                            detail: 0
                        }));
                    }
                ));
    }

    ngDoCheck(): void {
        if(this.scrollableContent && this.scrollableContent.nativeElement) {
            let content = this.scrollableContent.nativeElement;
            let totalHeight = 0;
            if (content.children && content.children.length > 0) {
                let rowHeightList = [];
                for(let i = 0; i< content.children.length; i++) {
                    let rect = content.children[i].getBoundingClientRect();
                    totalHeight += rect.height;
                    rowHeightList.push(rect);
                }
                this._contentHeight = totalHeight;
                this._containerHeight = content.getBoundingClientRect().height;
                if (this._contentHeight > 0) {
                    this._timelineMeter.rowHeightList = rowHeightList;
                }
            }

        }
    }

    ngOnDestroy(): void {
        this._subcription.unsubscribe();
    }
}
