import {UIScrollbar} from './scrollbar';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

@NgModule({
    declarations: [UIScrollbar],
    imports: [CommonModule],
    exports: [UIScrollbar]
})
export class UIScrollbarModule {
}

export * from './scrollbar';
