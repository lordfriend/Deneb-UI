import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UIToggleModule } from './index';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Component, DebugElement } from '@angular/core';
import { UIToggle } from './toggle';
import { By } from '@angular/platform-browser';
describe('UIToggle', () => {

    let fixture: ComponentFixture<any>;


    function createEvent(type: string): Event {
        return new Event(type, {bubbles: true, cancelable: true});
    }

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [UIToggleModule, FormsModule, ReactiveFormsModule],
            declarations: [
                NgModelBasic
            ]
        });

        TestBed.compileComponents();
    }));

    describe('ngModel basic', () => {
        let testDebugElement: DebugElement;
        let testNativeElement: HTMLElement;
        let testInstance: NgModelBasic;
        let labelElement: HTMLLabelElement;

        beforeEach(() => {
            fixture = TestBed.createComponent(NgModelBasic);
            fixture.detectChanges();

            testDebugElement = fixture.debugElement;
            testNativeElement = testDebugElement.nativeElement;
            testInstance = testDebugElement.componentInstance;
            labelElement = testNativeElement.querySelector('label');
        });

        it('should change value of NgModelBasic by clicking the UIToggle', async() => {
            expect(testInstance.value).toBe(false);
            labelElement.click();
            fixture.detectChanges();
            fixture.whenStable()
                .then(() => {
                    expect(testInstance.value).toBe(true);
                });
        });
    });
});

@Component({
    template: `
        <form>
            <ui-toggle [(ngModel)]="value" name="toggle1"></ui-toggle>
        </form>`
})
class NgModelBasic {
    value = false;
}
