import {NgModule} from '@angular/core';
import {UITimeLineMeter} from './timeline-meter';
import {UIScrollableContent} from './scrollable-content';

const directives = [
    UITimeLineMeter,
    UIScrollableContent
];

@NgModule({
    declarations: directives,
    exports: directives
})
export class UITimelineMeterModule {
}

export * from './scrollable-content';
export * from './timeline-meter';
