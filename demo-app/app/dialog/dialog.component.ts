import {Component} from '@angular/core';
import {UIDialog} from '../../../src';
import {ExampleDialog} from './example-dialog/example-dialog';

require('semantic-ui-less/definitions/modules/dimmer.less');
require('semantic-ui-less/definitions/modules/modal.less');
require('semantic-ui-less/definitions/elements/button.less');

@Component({
    selector: 'dialog-demo',
    templateUrl: 'dialog.html'
})
export class Dialog {
    constructor(private _uiDialog: UIDialog) {}

    openDialog() {
        let dialogRef = this._uiDialog.open(ExampleDialog, {stickyDialog: false, backdrop: true});
    }

    openStickyDialog() {
        let dialogRef = this._uiDialog.open(ExampleDialog, {stickyDialog: true, backdrop: true});
    }
}
