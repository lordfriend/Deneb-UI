import {Component} from '@angular/core';
import {UIDialog} from '../../../src';
import {ExampleDialog} from './example-dialog/example-dialog';
@Component({
    selector: 'dialog-demo',
    template: require('./dialog.html')
})
export class Dialog {
    constructor(private _uiDialog: UIDialog) {}

    openDialog() {
        let dialogRef = this._uiDialog.open(ExampleDialog, {stickyDialog: false});
    }
}