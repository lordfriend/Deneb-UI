import { Directive, ElementRef, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { UIPopover } from './popover';
import { Subscription } from 'rxjs';
import { UIPopoverRef } from './popover-ref';
import Popper from 'popper.js';

@Directive({
    selector: '[ui-popover]'
})
export class UIPopoverDirective implements OnInit, OnDestroy {
    private _subscription = new Subscription();
    private _popoverRef: UIPopoverRef<any>;

    @Input()
    popover: string;

    @Input()
    popoverProp: {[prop: string]: any};

    @Input()
    trigger: 'alwaysOn' | 'click' = 'click';

    @Input()
    placement: Popper.Placement;

    @Output()
    onClose = new EventEmitter<any>();

    constructor(private _element: ElementRef, private _popoverService: UIPopover) {
    }

    @HostListener('click')
    onClickListener(): void {
        this.initPopover();
    }

    ngOnInit(): void {
        if (this.trigger === 'alwaysOn') {
            this.initPopover();
        }
    }

    ngOnDestroy(): void {
        if (this._popoverRef) {
            this._popoverRef.close();
        }
        this._subscription.unsubscribe();
    }

    private initPopover(): void {
        this._popoverRef = this._popoverService.createPopoverFromRegistry(this._element.nativeElement, this.popover, this.placement);
        this._popoverRef.applyProps(this.popoverProp);
        this._subscription.add(
            this._popoverRef.afterClosed()
                .subscribe((result: any) => {
                    this.onClose.emit(result);
                })
        );
    }
}
