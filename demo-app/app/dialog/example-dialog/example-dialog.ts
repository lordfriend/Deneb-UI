import {Component} from '@angular/core';
import {DialogRef} from '../../../../src/dialog/dialog-ref';
@Component({
    selector: 'example-dialog',
    templateUrl: 'example-dialog.html'
})
export class ExampleDialog {

    constructor(public dialogRef: DialogRef<ExampleDialog>) {}
}
