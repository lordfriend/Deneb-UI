import {Component, ViewChild, ElementRef, AfterViewChecked, AfterViewInit, OnDestroy} from '@angular/core';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';

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
            overflow-x: hidden;
            overflow-y: scroll;
            width: 100%;
            height: 100%;
            position: relative;
        }
        .infinite-list-holder {
            overflow-x: hidden;
            overflow-y: visible;
            width: 100%;
            position: absolute;
        }
    `]
})
export class InfiniteList implements AfterViewChecked, AfterViewInit, OnDestroy {

    holderHeight: number;
    private _containerWidth: number;
    private _containerHeight: number;

    private _subscription: Subscription = new Subscription();

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

    get holderHeightInPx(): string {
        if (this.holderHeight) {
            return this.holderHeight + 'px';
        }
        return '100%';
    }

    ngAfterViewChecked(): void {
        // must do this in next tick
        setTimeout(() => {
            this.measure();
        });
    }

    ngAfterViewInit(): void {
        if (window) {
            this._subscription.add(Observable.fromEvent(window, 'resize')
                .throttleTime(200)
                .subscribe(() => {
                    this.measure();
                }));
        }
        if (this.listContainer && this.listContainer.nativeElement) {
            this._subscription.add(Observable.fromEvent(this.listContainer.nativeElement, 'scroll')
                .throttleTime(50)
                .map(() => {
                    return this.listContainer.nativeElement.scrollTop;
                })
                .subscribe((scrollY) => {
                    this.scrollPosition.next(scrollY);
                }));
        }
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }

    private measure() {
        if (this.listContainer && this.listContainer.nativeElement) {
            let measuredWidth = this.listContainer.nativeElement.clientWidth;
            let measuredHeight = this.listContainer.nativeElement.clientHeight;
            if (measuredWidth !== this._containerWidth || measuredHeight !== this._containerHeight) {
                this._containerWidth = measuredWidth;
                this._containerHeight = measuredHeight;
                this.sizeChange.next([measuredWidth, measuredHeight]);
            }
        }
    }
}
