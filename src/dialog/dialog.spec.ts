import {TestBed, async, inject} from '@angular/core/testing';
import {UIDialog} from './dialog';
import {Component, NgModule} from '@angular/core';
import {DialogRef} from './dialog-ref';
import {UIDialogModule} from './index';
import {DialogContainer} from './dialog-container';

describe('UIDialog', () => {
    let dialog: UIDialog;
    let dialogContainer: DialogContainer;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [DialogTestModule, UIDialogModule]
        });

        TestBed.compileComponents();
    }));

    beforeEach(inject([UIDialog, DialogContainer], (d: UIDialog, dc: DialogContainer) => {
        dialog = d;
        dialogContainer = dc;
    }));

    it('should open a dialog with given component', () => {
        let dialogRef = dialog.open(ExampleDialog, {stickyDialog: false});
        let containerElement = dialogContainer.getContainerElement();
        expect(dialogRef.componentInstance).toEqual(jasmine.any(ExampleDialog));
        expect(containerElement.querySelector('example-dialog')).not.toBe(null);
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
