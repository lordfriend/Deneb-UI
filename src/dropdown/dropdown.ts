import {Directive, ElementRef, Input, OnInit} from '@angular/core';
import {Observable, Subscription} from 'rxjs';

@Directive({
    selector: '[uiDropdown]',
    host: {
        '[class.active]': 'menuOpen',
        '[class.visible]': 'menuOpen'
    }
})
export class UIDropdown implements OnInit {

    private _subscription = new Subscription();
    private _menuOpen: boolean = false;

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

    ngOnInit(): void {
        let _el = this._element.nativeElement;
        if (this.uiDropdown === 'click') {
            this._subscription.add(
                Observable.fromEvent(_el, 'click')
                    .filter(() => !this.menuOpen)
                    .do((event: MouseEvent) => {
                        event.preventDefault();
                        event.stopPropagation();
                        this.menuOpen = true;
                    })
                    .flatMap(() => {
                        return Observable.fromEvent(document.body, 'click')
                            .do((event: MouseEvent) => {
                                event.preventDefault();
                                event.stopPropagation();
                            })
                            .takeWhile(() => this.menuOpen)
                    })
                    .subscribe(
                        () => {
                            this.menuOpen = false;
                        }
                    )
            );
        } else if (this.uiDropdown === 'hover') {
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
}
