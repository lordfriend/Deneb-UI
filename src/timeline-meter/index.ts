import {NgModule} from '@angular/core';
import {UITimeLineMeter} from './timeline-meter';
import {UIScrollableContent} from './scrollable-content';
import {CommonModule} from '@angular/common';

const directives = [
    UITimeLineMeter,
    UIScrollableContent
];

@NgModule({
    declarations: directives,
    exports: directives,
    imports: [CommonModule]
})
export class UITimelineMeterModule {
}

export * from './scrollable-content';
export * from './timeline-meter';
