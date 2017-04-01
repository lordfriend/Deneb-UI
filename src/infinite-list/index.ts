import {NgModule} from '@angular/core';
import {InfiniteForOf} from './infinite-for-of';
import {InfiniteList} from './infinite-list';
import {CommonModule} from '@angular/common';
@NgModule({
    declarations: [
        InfiniteForOf,
        InfiniteList
    ],
    imports: [CommonModule],
    exports: [
        InfiniteForOf,
        InfiniteList
    ]
})
export class UIInfiniteListModule {

}

export * from './infinite-for-of';
export * from './infinite-list';
