import {Component, Input, OnDestroy} from '@angular/core';
import {InfiniteList, SCROLL_STATE} from '../../../../src/infinite-list/infinite-list';
import {Subscription} from 'rxjs';
@Component({
    selector: 'list-item-example',
    templateUrl: './list-item.html',
    styles: [`
        .list-item-example {
            width: 100%;
            height: 140px;
            padding: 10px;
        }
        .list-item-wrapper {
            background-color: #fff;
            box-shadow: 0 0 2px rgba(0, 0, 0, 0.2);
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
        }
        .image {
            flex: 0 0 auto;
            width: 120px;
            padding: 10px;
            height: 120px;
        }
        .image > img {
            width: 100%;
            height: 100%;
            display: block;
        }
        .content {
            flex: 1 1 auto;
            padding: 10px;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .index-label {
            position: absolute;
            top: 10px;
            right: 10px;
            padding: 0.5rem;
            background-color: #eaeaea;
        }
    `]
})
export class ListItemExample implements OnDestroy {
    @Input() item;

    @Input() index;

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
