import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { UIModule } from '../../src';
import { App } from './app.component';
import { Dialog } from './dialog/dialog.component';
import { ExampleDialog } from './dialog/example-dialog/example-dialog';
import { DropdownDemo } from './dropdown/dropdown.component';
import { InfiniteListDemo } from './infinite-list/infinite-list.component';
import { ListItemExample } from './infinite-list/list-item/list-item.component';
import { PaginationDemo } from './pagination/pagination.component';
import { PopoverContentComponent } from './popover/popover-content/popover-content.component';
import { PopoverComponent } from './popover/popover.component';
import { TimelineMeterExample } from './timeline-meter/timeline-meter.component';
import { ToastDemo } from './toast/toast.component';
import { ToggleDemo } from './toggle/toggle.component';

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
        ToggleDemo,
        PopoverComponent,
        PopoverContentComponent
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
            },
            {
                path: 'popover',
                component: PopoverComponent
            },
        ], {enableTracing: false})
    ],
    bootstrap: [App],
    entryComponents: [ExampleDialog, PopoverContentComponent]
})
export class AppModule {

}
