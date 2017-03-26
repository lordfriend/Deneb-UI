import {NgModule} from '@angular/core';
import {InfiniteForOf} from './infinite-for-of';
import {InfiniteList} from './infinite-list';
@NgModule({
    declarations: [
        InfiniteForOf,
        InfiniteList
    ],
    exports: [
        InfiniteForOf,
        InfiniteList
    ]
})
export class UIInfiniteListModule {

}

export * from './infinite-for-of';
export * from './infinite-list';
