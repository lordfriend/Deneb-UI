import {Component, Input, OnDestroy} from '@angular/core';
import {InfiniteList, SCROLL_STATE} from '../../../../src/infinite-list/infinite-list';
import {Subscription} from 'rxjs';
@Component({
    selector: 'list-item-example',
    templateUrl: './list-item.html',
    styles: [`
        .list-item-example {
            width: 100%;
            height: 40px;
            padding: 10px;
        }
        .list-item-example .content {
            width: 100%;
            height: 100%;
            background-color: azure;
        }
    `]
})
export class ListItemExample implements OnDestroy {
    @Input() item;

    private _subscription = new Subscription();

    constructor(private _infiniteList: InfiniteList) {
        this._subscription.add(this._infiniteList.scrollStateChange.subscribe((state: SCROLL_STATE) => {
            console.log('state changed: ', state);
        }));
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }
}
