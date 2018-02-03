import {Component} from '@angular/core';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {UIInfiniteListModule} from '../infinite-list/index';
import {UITimelineMeterModule} from './index';
import {By} from '@angular/platform-browser';

describe('UITimelineMeter', () => {
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
            imports: [UIInfiniteListModule, UITimelineMeterModule],
            declarations: [TestComponent]
        });
    }));

    it('should create a timeline meter', (done) => {
        fixture = createTestComponent();
        fixture.detectChanges();
        let de = fixture.debugElement.query(By.css('.ui-timeline-meter'));
        let el = de.nativeElement;
        setTimeout(() => {
            fixture.detectChanges();
            let labels = el.querySelectorAll('.render-entity .label');
            console.log(labels);
            // calculate initial displayed element.
            // let firstPosition = 0;
            expect(labels.length).toEqual(4);
            done();
        }, 500);
    });
});

@Component({
    selector: 'test-cmp',
    template: '',
    styles: [`
        ui-timeline-meter {
            display: block;
            width: 200px;
            height: 400px;
        }
        .demo-card {
            width: 100%;
            font-size: 16px;
        }
    `]
})
class TestComponent {
    collection: any[];
    timestampList: number[];

    constructor() {
        let timestamp = new Date('2017-01-30T14:48:00').valueOf();
        this.timestampList = [];
        for(let i = 1; i <= 4 * 12; i++) {
            this.timestampList.push(Math.floor(timestamp - 3600 * 1000 * 24 * 30 * i));
            // console.log(new Date(this.timestampList[this.timestampList.length - 1]).getFullYear());
        }

        this.collection = [];
        for (let i = 0; i < 4 * 12; i++) {
            this.collection.push(i + '');
        }
    }
}

const TEMPLATE = `
        <ui-timeline-meter [timestampList]="timestampList" [rowHeight]="40">
        <infinite-list [rowHeight]="40">
            <div *infiniteFor="let row of collection" class="row-element">
                {{row}}
            </div>
        </infinite-list>
    </ui-timeline-meter>
    `;

function createTestComponent(template: string = TEMPLATE): ComponentFixture<TestComponent> {
    return TestBed.overrideComponent(TestComponent, {set: {template: template}})
        .createComponent(TestComponent);
}
