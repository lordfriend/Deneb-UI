import {TestBed, async, inject} from '@angular/core/testing';
import {UIDialog} from './dialog';
import {Component, NgModule} from '@angular/core';
import {DialogRef} from './dialog-ref';
import {UIDialogModule} from './index';

describe('UIDialog', () => {
    let dialog: UIDialog;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [DialogTestModule, UIDialogModule]
        });

        TestBed.compileComponents();
    }));

    beforeEach(inject([UIDialog], (d: UIDialog) => {
        dialog = d;
    }));

    it('should open a dialog with given component', () => {
        let dialogRef = dialog.open(ExampleDialog, {stickyDialog: false});

        expect(dialogRef.componentInstance).toEqual(jasmine.any(ExampleDialog));
    });
});

@Component({
    selector: 'example-dialog',
    template: '<div class="dialog-content"><button type="button" (click)="dialogRef.close()"></button></div>'
})
class ExampleDialog {
    constructor(public dialogRef: DialogRef<ExampleDialog>) {}
}

const TEST_DIRECTIVES = [
    ExampleDialog
];

@NgModule({
    declarations: TEST_DIRECTIVES,
    imports: [UIDialogModule],
    exports: TEST_DIRECTIVES,
    entryComponents: [ExampleDialog]
})
class DialogTestModule {}
