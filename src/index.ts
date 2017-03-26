import {NgModule} from '@angular/core';
import {UIDialogModule} from './dialog/index';
import {UIToastModule} from './toast/index';
import {UIPaginationModule} from './pagination/index';
import {UIInfiniteListModule} from './infinite-list/index';

const UI_MODULES = [
    UIDialogModule,
    UIToastModule,
    UIPaginationModule,
    UIInfiniteListModule
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
