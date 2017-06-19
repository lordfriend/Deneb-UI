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
import {RouterModule} from '@angular/router';
import { ToggleDemo } from './toggle/toggle.component';
import { FormsModule } from '@angular/forms';
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
        DropdownDemo,
        ToggleDemo
    ],
    imports: [
        UIModule,
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        RouterModule.forRoot([
            {
                path: 'dialog',
                component: Dialog
            },
            {
                path: 'toast',
                component: ToastDemo
            },
            {
                path: 'pagination',
                component: PaginationDemo
            },
            {
                path: 'infinite-list',
                component: InfiniteListDemo
            },
            {
                path: 'timeline-meter',
                component: TimelineMeterExample
            },
            {
                path: 'dropdown',
                component: DropdownDemo
            },
            {
                path: 'toggle',
                component: ToggleDemo
            }
        ])
    ],
    bootstrap: [App],
    entryComponents: [ExampleDialog]
})
export class AppModule {

}
