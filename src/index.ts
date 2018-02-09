import { NgModule } from '@angular/core';
import { UIDialogModule } from './dialog';
import { UIToastModule } from './toast';
import { UIPaginationModule } from './pagination';
import { UIInfiniteListModule } from './infinite-list';
import { UITimelineMeterModule } from './timeline-meter';
import { UIScrollbarModule } from './scrollbar';
import { UIDropdownModule } from './dropdown';
import { UIToggleModule } from './toggle';
import { UIPopoverModule } from './popover';

const UI_MODULES = [
    UIDialogModule,
    UIToastModule,
    UIPaginationModule,
    UIInfiniteListModule,
    UITimelineMeterModule,
    UIScrollbarModule,
    UIDropdownModule,
    UIToggleModule,
    UIPopoverModule
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
export * from './popover';
