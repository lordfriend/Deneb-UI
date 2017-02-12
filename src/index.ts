import {NgModule} from '@angular/core';
import {UIDialogModule} from './dialog/index';
import {UIToastModule} from './toast/index';

const UI_MODULES = [
    [UIDialogModule, UIToastModule]
];

@NgModule({
    imports: UI_MODULES,
    exports: UI_MODULES
})
export class UIModule {

}

export * from './dialog';
export * from './toast';
