import { NgModule } from '@angular/core';
import { UIPopover } from './popover';
import { UIPopoverDirective } from './popover.directive';
import { CommonModule } from '@angular/common';
import { BasicPopoverComponent } from './basic-popover/basic-popover.component';

@NgModule({
    declarations: [UIPopoverDirective, BasicPopoverComponent],
    providers: [UIPopover],
    imports: [CommonModule],
    exports: [UIPopoverDirective],
    entryComponents: [BasicPopoverComponent]
})
export class UIPopoverModule {

}

export * from './popover';
export * from './popover-ref';
export * from './popover.directive';
export * from './register';
export * from './popover-content';
