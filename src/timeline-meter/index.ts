import {NgModule} from '@angular/core';
import {UITimeLineMeter} from './timeline-meter';
import {UIScrollableContent} from './scrollable-content';
import {CommonModule} from '@angular/common';
import {UIScrollbarModule} from '../scrollbar/index';

const directives = [
    UITimeLineMeter,
    UIScrollableContent
];

@NgModule({
    declarations: directives,
    exports: directives,
    imports: [CommonModule, UIScrollbarModule]
})
export class UITimelineMeterModule {
}

export * from './scrollable-content';
export * from './timeline-meter';
