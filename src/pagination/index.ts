import {UIPagination} from './pagination';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

@NgModule({
    declarations: [UIPagination],
    imports: [CommonModule],
    exports: [UIPagination]
})
export class UIPaginationModule {

}

export * from './pagination';
