import {async, TestBed} from '@angular/core/testing';
import {UIPaginationModule} from './index';
import {Component, NgModule, OnInit} from '@angular/core';

describe('UIPagination', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [UIPaginationModule, PaginationTestModule]
        });

        TestBed.compileComponents();
    }));
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
