import {InfiniteList} from './infinite-list';
import {async, ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {Component} from '@angular/core';
import {UIInfiniteListModule} from './index';
import {By} from '@angular/platform-browser';
describe('InfiniteList', () => {
    const rowHeight = 40;
    let fixture: ComponentFixture<any>;

    function getComponent(): TestComponent {
        return fixture.componentInstance;
    }

    afterEach(() => {
        fixture = null;
    });

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [UIInfiniteListModule],
            declarations: [TestComponent]
        });
    }));

    it('should reflect initial elements', async(() => {
        fixture = createTestComponent();
        fixture.detectChanges();
        let de = fixture.debugElement.query(By.css('.infinite-list'));
        let el = de.nativeElement;
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            let rowElements = el.querySelectorAll('.row-element');
            // calculate initial displayed element.
            // let firstPosition = 0;
            let lastPosition = Math.ceil(300 / rowHeight) + 1;
            expect(rowElements.length).toEqual(lastPosition + 1);
        });
    }));

    it('should reLayout when scrolling', fakeAsync(() => {
        fixture = createTestComponent();
        fixture.detectChanges();
        let de = fixture.debugElement.query(By.css('.infinite-list'));
        let el = de.nativeElement;
        tick();
        // it is actually the height of inner holder
        let totalHeight = rowHeight * 100;

        // random scroll to a position
        el.scrollTop = Math.floor(Math.random() * totalHeight);
        // trigger scroll event
        el.dispatchEvent(new Event('scroll', {bubbles: true, cancelable: true}));
        // calculate initial displayed element.
        let firstPosition = Math.floor(el.scrollTop / rowHeight);
        let firstPositionOffset = el.scrollTop - firstPosition * rowHeight;
        let lastPosition = Math.ceil((300 + firstPositionOffset) / rowHeight) + firstPosition;
        firstPosition = Math.max(firstPosition - 1, 0);
        lastPosition = Math.min(lastPosition + 1, 99);
        // wait longer than 60 milliseconds
        tick(200);
        fixture.detectChanges();
        let rowElements = el.querySelectorAll('.row-element');
        expect(rowElements.length).toEqual(lastPosition - firstPosition + 1);
        // console.log('scrollTop', el.scrollTop, 'rows ', rowElements);
        expect(rowElements[0].textContent.trim()).toEqual(firstPosition + '');
        expect(rowElements[rowElements.length - 1].textContent.trim()).toEqual(lastPosition + '');
    }));
});

@Component({
    selector: 'test-cmp',
    template: '',
    styles: [`
        infinite-list {
            display: block;
            width: 300px;
            height: 300px;
        }
    `]
})
class TestComponent {
    collection: any[];

    constructor() {
        this.collection = [];
        for (let i = 0; i < 100; i++) {
            this.collection.push(i);
        }
    }
}

const TEMPLATE = `
        <infinite-list [rowHeight]="40">
            <div *infiniteFor="let row of collection" class="row-element">
                {{row}}
            </div>
        </infinite-list>
    `;

function createTestComponent(template: string = TEMPLATE): ComponentFixture<TestComponent> {
    return TestBed.overrideComponent(TestComponent, {set: {template: template}})
        .createComponent(TestComponent);
}
