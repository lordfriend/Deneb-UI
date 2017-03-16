import {NgModule} from '@angular/core';
import {Dialog} from './dialog/dialog.component';
import {ExampleDialog} from './dialog/example-dialog/example-dialog';
import {BrowserModule} from '@angular/platform-browser';
import {UIModule} from '../../src';
import {App} from './app.component';
import {ToastDemo} from './toast/toast.component';
import {PaginationDemo} from './pagination/pagination.component';
@NgModule({
    declarations: [App, Dialog, ExampleDialog, ToastDemo, PaginationDemo],
    imports: [UIModule, BrowserModule],
    bootstrap: [App],
    entryComponents: [ExampleDialog]
})
export class AppModule {

}
