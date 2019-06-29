
import {fromEvent as observableFromEvent,  Observable, Subscription } from 'rxjs';

import {takeUntil, delay, takeWhile, mergeMap, tap} from 'rxjs/operators';
import { Directive, ElementRef, HostListener, Input, OnDestroy, OnInit } from '@angular/core';

@Directive({
    selector: '[uiDropdown]',
    host: {
        '[class.active]': 'menuOpen',
        '[class.visible]': 'menuOpen'
    }
})
export class UIDropdown implements OnInit, OnDestroy {

    private _subscription = new Subscription();
    private _menuOpen: boolean = false;
    private _timestamp: number = 0;

    /**
     * determine what event should trigger dropdown open.
     * @type {string}
     */
    @Input()
    uiDropdown: 'click' | 'hover' = 'click';

    @Input()
    stopPropagation = false;

    set menuOpen(value: boolean) {
        let menu = this._element.nativeElement.querySelector('.menu');
        if (value) {
            menu.classList.add('transition');
            menu.classList.add('visible');
            menu.classList.remove('hidden');
        } else {
            menu.classList.remove('visible');
            menu.classList.add('hidden')
        }
        this._menuOpen = value;
    }

    get menuOpen(): boolean {
        return this._menuOpen;
    }

    constructor(private _element: ElementRef) {
    }

    @HostListener('click', ['$event'])
    onHostClick(event: MouseEvent) {
        event.preventDefault();
        if (this.stopPropagation) {
            event.stopPropagation();
        }
        this._timestamp = event.timeStamp;
        this.menuOpen = !this.menuOpen;
    }

    ngOnInit(): void {
        let _el = this._element.nativeElement;
        this._subscription.add(
            observableFromEvent(document.body, 'click')
                .subscribe((event: MouseEvent) => {
                    if (event.timeStamp !== this._timestamp && this.menuOpen) {
                        event.preventDefault();
                        this.menuOpen = false;
                    }
                    this._timestamp = 0;
                })
        );
        if (this.uiDropdown === 'hover') {
            this._subscription.add(
                observableFromEvent(_el, 'mouseenter').pipe(
                    tap((event: MouseEvent) => {
                        event.preventDefault();
                        event.stopPropagation();
                        this.menuOpen = true;
                    }),
                    mergeMap(() => {
                        return observableFromEvent(_el, 'mouseleave').pipe(
                            takeWhile(() => this.menuOpen),
                            delay(300),
                            takeUntil(observableFromEvent(_el, 'mouseenter')),);
                    }),)
                    .subscribe(
                        () => {
                            this.menuOpen = false;
                        }
                    )
            );
        }
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }
}
