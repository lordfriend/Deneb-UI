import {NgModule} from '@angular/core';
import {UIToastComponent} from './toast.component';
import {UIToast} from './toast';

@NgModule({
    declarations: [UIToastComponent],
    providers: [UIToast],
    exports: [UIToastComponent],
    entryComponents: [UIToastComponent]
})
export class UIToastModule {

}

export * from './toast.component';
export * from './toast';
export * from './toast-injector';
export * from './toast-ref';
