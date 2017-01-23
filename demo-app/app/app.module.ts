import {NgModule} from '@angular/core';
import {Dialog} from './dialog/dialog.component';
import {ExampleDialog} from './dialog/example-dialog/example-dialog';
import {BrowserModule} from '@angular/platform-browser';
import {UIModule} from '../../src';
import {App} from './app.component';
@NgModule({
    declarations: [App, Dialog, ExampleDialog],
    imports: [UIModule, BrowserModule],
    bootstrap: [App],
    entryComponents: [ExampleDialog]
})
export class AppModule {

}