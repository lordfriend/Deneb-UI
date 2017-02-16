import {Component} from '@angular/core';
import {UIDialogRef} from '../../../../src/dialog/dialog-ref';
@Component({
    selector: 'example-dialog',
    templateUrl: 'example-dialog.html'
})
export class ExampleDialog {

    constructor(public dialogRef: UIDialogRef<ExampleDialog>) {}
}
