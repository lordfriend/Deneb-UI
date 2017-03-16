import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {UIPaginationModule} from './index';
import {Component, DebugElement, NgModule, OnInit} from '@angular/core';
import {UIPagination} from './pagination';
import {By} from '@angular/platform-browser';

function getPaginationItemSize(el: HTMLElement) {
    return el.querySelectorAll('.item').length;
}

describe('UIPagination', () => {
    let comp: UIPagination;
    let fixture: ComponentFixture<UIPagination>;
    let de: DebugElement;
    let el: HTMLElement;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [UIPaginationModule]
        });

        fixture = TestBed.createComponent(UIPagination);
        comp = fixture.componentInstance;
        de = fixture.debugElement.query(By.css('.ui.pagination.menu'));
        el = de.nativeElement;
    }));

    it('should render a list of menu buttons', () => {
        comp.currentPage = 1;
        comp.total = 200;
        comp.countPerPage = 10;
        comp.max = 6;
        fixture.detectChanges();
        // expect(getPaginationItemSize(el)).toBe(comp.max);
    })
});

@Component({
    selector: 'pagination-test',
    template: `
        <div class="test-container">
            <ui-pagination
                [currentPage]="currentPage"
                [total]="total"
                (pageChange)="onPageUpdate($event)"
                [countPerPage]="countPerPage"
                [max]="max"></ui-pagination>
        </div>`
})
class PaginationTestComponent implements OnInit {
    currentPage: number;
    total: number;
    countPerPage: number;
    max: number;
    ngOnInit(): void {
        this.currentPage = 1;
        this.total = 200;
        this.countPerPage = 10;
        this.max = 6;
    }

    onPageUpdate(page) {
        console.log(page);
    }
}


const TEST_DIRECTIVES = [PaginationTestComponent];

@NgModule({
    declarations: TEST_DIRECTIVES,
    imports: [UIPaginationModule],
    exports: TEST_DIRECTIVES,
    entryComponents: [PaginationTestComponent]
})
class PaginationTestModule {

}
