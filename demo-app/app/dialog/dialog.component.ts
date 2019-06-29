import { Component, OnDestroy, ViewChild, ViewContainerRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { UIDialog } from '../../../src';
import { ExampleDialog } from './example-dialog/example-dialog';

require('semantic-ui-less/definitions/modules/dimmer.less');
require('semantic-ui-less/definitions/modules/modal.less');
require('semantic-ui-less/definitions/elements/button.less');

@Component({
    selector: 'dialog-demo',
    templateUrl: 'dialog.html',
    styles: [`
        .some-container {
            width: 800px;
            height: 600px;
            margin: 10px;
            background: #aaa;
            position: relative;
        }
    `]
})
export class Dialog implements OnDestroy {
    private _subscription = new Subscription();

    @ViewChild('refChild', {read: ViewContainerRef}) refChild: ViewContainerRef;

    constructor(private _uiDialog: UIDialog) {}

    openDialog() {
        let dialogRef = this._uiDialog.open(ExampleDialog, {stickyDialog: false, backdrop: true});
    }

    openStickyDialog() {
        let dialogRef = this._uiDialog.open(ExampleDialog, {stickyDialog: true, backdrop: true});
    }

    openDialogInsideContainer() {
        let dialogRef = this._uiDialog.open(ExampleDialog, {stickyDialog: false, backdrop: true}, this.refChild);
    }

    openNonStickyNoBackdropDialog() {
        let dialogRef = this._uiDialog.open(ExampleDialog, {stickyDialog: false, backdrop: false});
        dialogRef.componentInstance.boundContent = 'this is bound value passed by parent';

        this._subscription.add(
            dialogRef.afterClosed()
                .subscribe((result) => {
                    console.log(result);
                })
        );
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }
}
