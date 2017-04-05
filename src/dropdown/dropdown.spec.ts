import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {UIDropdownModule} from './index';
import {Component} from '@angular/core';
import {By} from '@angular/platform-browser';

describe('UIDropdown', () => {
    let fixture: ComponentFixture<any>;

    function createEvent(type: string):Event {
        return new Event(type, {bubbles: true, cancelable: true});
    }

    afterEach(() => {
        fixture = null;
    });

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [UIDropdownModule],
            declarations: [TestComponent]
        });
    }));

    it('should manipulate classes on element when event fires', () => {
        fixture = createTestComponent();
        fixture.detectChanges();
        let de = fixture.debugElement.query(By.css('[uiDropdown]'));
        let el = de.nativeElement;
        let menu = el.querySelector('.menu');
        expect(el.classList.contains('active')).toBe(false);
        expect(el.classList.contains('visible')).toBe(false);
        expect(menu.classList.contains('visible')).toBe(false);
        // open dropdown
        el.dispatchEvent(createEvent('click'));
        fixture.detectChanges();
        expect(el.classList.contains('active')).toBe(true);
        expect(el.classList.contains('visible')).toBe(true);
        expect(menu.classList.contains('transition')).toBe(true);
        expect(menu.classList.contains('visible')).toBe(true);
        // click item
        let items = menu.querySelectorAll('.item');
        items[0].dispatchEvent(createEvent('click'));
        fixture.detectChanges();
        expect(el.classList.contains('active')).toBe(false);
        expect(el.classList.contains('visible')).toBe(false);
        expect(menu.classList.contains('visible')).toBe(false);
        expect(menu.classList.contains('hidden')).toBe(true);

        // open and click outside
        el.dispatchEvent(createEvent('click'));
        fixture.detectChanges();
        expect(el.classList.contains('active')).toBe(true);
        expect(el.classList.contains('visible')).toBe(true);
        expect(menu.classList.contains('transition')).toBe(true);
        expect(menu.classList.contains('visible')).toBe(true);
        document.body.dispatchEvent(createEvent('click'));
        fixture.detectChanges();
        expect(el.classList.contains('active')).toBe(false);
        expect(el.classList.contains('visible')).toBe(false);
        expect(menu.classList.contains('visible')).toBe(false);
        expect(menu.classList.contains('hidden')).toBe(true);
    });
});

@Component({
    selector: 'test-cmp',
    template: ''
})
class TestComponent {
}

const TEMPLATE = `
        <div class="ui selection dropdown" uiDropdown="click">
            <i class="dropdown icon"></i>
            <div class="default text">Gender</div>
            <div class="menu">
                <div class="item">Male</div>
                <div class="item">Female</div>
            </div>
        </div> 
    `;

function createTestComponent(template: string = TEMPLATE): ComponentFixture<TestComponent> {
    return TestBed.overrideComponent(TestComponent, {set: {template: template}})
        .createComponent(TestComponent);
}
