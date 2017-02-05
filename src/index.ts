import {NgModule} from '@angular/core';
import {UIDialogModule} from './dialog/index';

@NgModule({
    imports: [UIDialogModule],
    exports: [UIDialogModule]
})
export class UIModule {

}

export * from './dialog';
