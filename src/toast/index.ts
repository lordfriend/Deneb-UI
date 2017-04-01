import {NgModule} from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {UIToastComponent} from './toast.component';
import {UIToast} from './toast';

@NgModule({
    declarations: [UIToastComponent],
    providers: [UIToast],
    imports: [BrowserAnimationsModule],
    exports: [UIToastComponent],
    entryComponents: [UIToastComponent]
})
export class UIToastModule {

}

export * from './toast.component';
export * from './toast';
export * from './toast-injector';
export * from './toast-ref';
