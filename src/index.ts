import {NgModule} from '@angular/core';
import {UIDialogModule} from './dialog/index';
import {UIToastModule} from './toast/index';
import {UIPaginationModule} from './pagination/index';
import {UIInfiniteListModule} from './infinite-list/index';
import {UITimelineMeterModule} from './timeline-meter/index';
import {UIScrollbarModule} from './scrollbar/index';
import {UIDropdownModule} from './dropdown/index';
import { UIToggleModule } from './toggle/index';

const UI_MODULES = [
    UIDialogModule,
    UIToastModule,
    UIPaginationModule,
    UIInfiniteListModule,
    UITimelineMeterModule,
    UIScrollbarModule,
    UIDropdownModule,
    UIToggleModule
];

@NgModule({
    imports: UI_MODULES,
    exports: UI_MODULES
})
export class UIModule {

}

export * from './dialog';
export * from './toast';
export * from './pagination';
export * from './infinite-list';
export * from './timeline-meter';
export * from './scrollbar';
export * from './dropdown';
export * from './toggle';
