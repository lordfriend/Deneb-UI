import {AfterViewInit, Component, ElementRef, OnDestroy, ViewChild} from '@angular/core';
import {UITimeLineMeter} from './timeline-meter';
import {Observable, Subscription} from 'rxjs';

@Component({
    selector: 'ui-scrollable-content',
    template: `
        <div class="scrollable-content" #scrollableContent>
        </div>
    `
})
export class UIScrollableContent implements AfterViewInit, OnDestroy {

    private _subcription = new Subscription();

    @ViewChild('scrollableContent') scrollableContent: ElementRef;

    constructor(
        private _timelineMeter: UITimeLineMeter
    ) {}

    ngAfterViewInit(): void {
        this._subcription.add(Observable.fromEvent(this.scrollableContent.nativeElement, 'scroll')
            .map(() => {
                return this.scrollableContent.nativeElement.scrollTop;
            })
            .subscribe(
                (scrollY: number) => {
                    this._timelineMeter.setScrollY(scrollY);
                }
            ));
        this._subcription.add(this._timelineMeter.scrollPosition.subscribe(
            (scrollY: number) => {
                let el = this.scrollableContent.nativeElement;
                el.scrollTop = scrollY;
                el.dispatchEvent(new UIEvent('scroll', {
                    bubbles: true,
                    cancelable: true,
                    view: window,
                    detail: 0
                }));
            }
        ));
    }

    ngOnDestroy(): void {
        this._subcription.unsubscribe();
    }
}
