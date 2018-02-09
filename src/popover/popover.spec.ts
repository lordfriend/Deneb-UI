import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { UIPopoverModule } from './index';
import { By } from '@angular/platform-browser';

describe('UIPopover', () => {
    let fixture: ComponentFixture<any>;

    function createEvent(type: string): Event {
        return new Event(type, {bubbles: true, cancelable: true});
    }

    afterEach(() => {
        fixture.destroy();
        fixture = null;
    });

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [UIPopoverModule],
            declarations: [TestComponent]
        });
    }));

    it('should create component when trigger the directive', () => {
        fixture = createTestComponent();
        fixture.detectChanges();
        let de = fixture.debugElement.query(By.css('[ui-popover]'));
        let el = de.nativeElement;
        el.dispatchEvent(createEvent('click'));
        fixture.detectChanges();
        expect(document.body.querySelector('ui-basic-popover')).not.toBe(null)
    })
});


@Component({
    selector: 'test-cmp',
    template: ''
})
class TestComponent {
}


const TEMPLATE = `
    <div class="test-container">
       <button class="ui button"
                ui-popover
                popover="ui-basic"
                placement="top-end"
                [popoverProp]="{title: 'Popover Title', content: 'This is content', clickToClose: true}">
            Top End Popover
       </button>
    </div> 
    `;


function createTestComponent(template: string = TEMPLATE): ComponentFixture<TestComponent> {
    return TestBed.overrideComponent(TestComponent, {set: {template: template}})
        .createComponent(TestComponent);
}
