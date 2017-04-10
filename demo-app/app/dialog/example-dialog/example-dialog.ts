import {Component} from '@angular/core';
import {UIDialogRef} from '../../../../src/dialog/dialog-ref';
import {UIDialog} from '../../../../src/dialog/dialog';
@Component({
    selector: 'example-dialog',
    templateUrl: 'example-dialog.html',
    styles: [`
        .dialog-content {
            display: block;
            position: absolute;
            top: 0;
            left: 0;
            bottom: 0;
            right: 0;
            margin: auto;
            width: 400px;
            height: 300px;
            background-color: #fff;
            padding-bottom: 5rem;
        }
        .content {
            width: 100%;
            height: 100%;
            overflow-x: hidden;
            overflow-y: auto;
        }
        .footer {
            width: 100%;
            height: 5rem;
            display: flex;
            justify-content: space-around;
            align-items: center;
        }
    `]
})
export class ExampleDialog {

    constructor(public dialogRef: UIDialogRef<ExampleDialog>, public dialog: UIDialog) {}

    result: string;

    openNewDialog() {
        let ref = this.dialog.open(ExampleDialog, this.dialogRef.config);
        ref.afterClosed().subscribe(
            (data) => {
                this.result = data;
            }
        );
    }

    save() {
        this.dialogRef.close('saved');
    }
    cancel() {
        this.dialogRef.close('cancel');
    }
}
