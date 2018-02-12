import { AfterViewInit, Component, HostBinding, HostListener, Input, OnDestroy } from '@angular/core';
import { Popover } from '../register';
import { Subscription } from 'rxjs/Subscription';
import { UIPopoverRef } from '../popover-ref';
import { Observable } from 'rxjs/Observable';
import { UIPopoverContent } from '../popover-content';

@Popover('ui-basic')
@Component({
    selector: 'ui-basic-popover',
    templateUrl: './basic-popover.html',
    styleUrls: ['./basic-popover.less']
})
export class BasicPopoverComponent extends UIPopoverContent implements AfterViewInit, OnDestroy {
    private _subscription = new Subscription();

    @Input()
    title: string;

    @Input()
    content: string;

    @Input()
    clickToClose: boolean;

    @Input()
    triggeredBy: 'click' | 'alwaysOn';

    @HostBinding('style.zIndex')
    zIndex: number;

    placement: string;

    constructor(popoverRef: UIPopoverRef<BasicPopoverComponent>) {
        super(popoverRef);
        this.placement = this.popoverRef.placement;
        switch (this.placement) {
            case 'auto':
            case 'auto-start':
            case 'auto-end':
            case 'left-start':
            case 'left-end':
            case 'right-start':
            case 'right-end':
                const warningMessage= `This popover content component doesn\'t support the ${this.placement} placement`;
                if (console.warn) {
                    console.warn(warningMessage);
                } else {
                    console.log(warningMessage);
                }
                break;
            default:
                // otherwise this is fine.
        }
    }

    @HostListener('click', ['$event'])
    onPopoverClick(event: Event) {
        if (this.clickToClose) {
            event.stopPropagation();
        }
    }

    ngAfterViewInit(): void {
        super.ngAfterViewInit();
        if (this.clickToClose) {
            let skipCount = this.triggeredBy === 'click' ? 1: 0;
            this._subscription.add(
                Observable.fromEvent(document.body, 'click')
                    .skip(skipCount)
                    .subscribe(() => {
                        this.popoverRef.close();
                    })
            );
        }
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }

}
