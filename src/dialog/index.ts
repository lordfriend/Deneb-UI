import {NgModule} from '@angular/core';
import {DIALOG_PROVIDERS} from './dialog';

@NgModule({
    providers: [DIALOG_PROVIDERS]
})
export class UIDialogModule {

}

export * from './dialog';
export * from './dialog-container';
export * from './dialog-ref';
