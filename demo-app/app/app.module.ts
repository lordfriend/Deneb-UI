import {NgModule} from '@angular/core';
import {Dialog} from './dialog/dialog.component';
import {ExampleDialog} from './dialog/example-dialog/example-dialog';
import {BrowserModule} from '@angular/platform-browser';
import {UIModule} from '../../src';
import {App} from './app.component';
import {ToastDemo} from './toast/toast.component';
import {PaginationDemo} from './pagination/pagination.component';
import {InfiniteListDemo} from './infinite-list/infinite-list.component';
import {ListItemExample} from './infinite-list/list-item/list-item.component';
import {TimelineMeterExample} from './timeline-meter/timeline-meter.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {DropdownDemo} from './dropdown/dropdown.component';
@NgModule({
    declarations: [
        App,
        Dialog,
        ExampleDialog,
        ToastDemo,
        PaginationDemo,
        InfiniteListDemo,
        ListItemExample,
        TimelineMeterExample,
        DropdownDemo
    ],
    imports: [UIModule, BrowserModule, BrowserAnimationsModule],
    bootstrap: [App],
    entryComponents: [ExampleDialog]
})
export class AppModule {

}
