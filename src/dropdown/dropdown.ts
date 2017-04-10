import {Directive, ElementRef, HostListener, Input, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {Observable, Subscription} from 'rxjs';

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
        this._timestamp = event.timeStamp;
        this.menuOpen = !this.menuOpen;
        return false;
    }

    ngOnInit(): void {
        let _el = this._element.nativeElement;
        this._subscription.add(
            Observable.fromEvent(document.body, 'click')
                .subscribe((event: MouseEvent) => {
                    if (event.timeStamp !== this._timestamp && this.menuOpen) {
                        this.menuOpen = false;
                    }
                    this._timestamp = 0;
                    return false;
                })
        );
        if (this.uiDropdown === 'hover') {
            this._subscription.add(
                Observable.fromEvent(_el, 'mouseenter')
                    .do((event: MouseEvent) => {
                        event.preventDefault();
                        event.stopPropagation();
                        this.menuOpen = true;
                    })
                    .flatMap(() => {
                        return Observable.fromEvent(_el, 'mouseleave')
                            .takeWhile(() => this.menuOpen)
                            .delay(300)
                            .takeUntil(Observable.fromEvent(_el, 'mouseenter'));
                    })
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
