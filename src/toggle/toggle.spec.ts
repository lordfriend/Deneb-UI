import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UIToggleModule } from './index';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Component, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
describe('UIToggle', () => {

    let fixture: ComponentFixture<any>;


    function createEvent(type: string):Event {
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
        let toggleDebugElement: DebugElement;
        let toggleNativeElement: HTMLElement;
        let toggleInstance: NgModelBasic;

        beforeEach(() => {
            fixture = TestBed.createComponent(NgModelBasic);
            fixture.detectChanges();

            toggleDebugElement = fixture.debugElement.query(By.directive(NgModelBasic));
            toggleNativeElement = toggleDebugElement.nativeElement;
            toggleInstance = toggleDebugElement.componentInstance;
        });

        it('should change value of NgModelBasic by clicking the UIToggle', () => {
            expect(toggleInstance.value).toBe(true);
            toggleNativeElement.dispatchEvent(createEvent('click'));
            fixture.detectChanges();
            expect(toggleInstance.value).toBe(false);
        });
    });
});

@Component({
    template: `<ui-toggle [(ngModel)]="value"></ui-toggle>`
})
class NgModelBasic {
    value = false;
}
