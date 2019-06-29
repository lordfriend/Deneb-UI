
import {fromEvent as observableFromEvent,  Subscription ,  Observable } from 'rxjs';
import { AfterViewInit, Component, OnDestroy } from '@angular/core';

require('semantic-ui-less/definitions/modules/transition.less');
require('semantic-ui-less/definitions/collections/menu.less');
require('semantic-ui-less/definitions/modules/dropdown.less');

@Component({
    selector: 'dropdown-demo',
    templateUrl: './dropdown.html'
})
export class DropdownDemo implements AfterViewInit, OnDestroy {
    private _subscription = new Subscription();

    ngAfterViewInit(): void {
        this._subscription.add(
            observableFromEvent(document, 'click')
                .subscribe(
                    () => {
                        console.log('document clicked');
                    }
                )
        )
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }
}
