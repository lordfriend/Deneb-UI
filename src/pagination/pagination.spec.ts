import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {UIPaginationModule} from './index';
import {DebugElement} from '@angular/core';
import {UIPagination} from './pagination';
import {By} from '@angular/platform-browser';

function itemToArray(el: HTMLElement): string[] {
    let arr = [], allItems = el.querySelectorAll('.item');
    for (let i = 0; i < allItems.length; i++) {
        arr.push(allItems[i].textContent.trim());
    }
    return arr;
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
        comp.max = 4;
        fixture.detectChanges();
        expect(itemToArray(el)).toEqual(['1', '2', '3', '4', '...', '20']);
    })
});
