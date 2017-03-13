import {Component, Input, Output, EventEmitter} from '@angular/core';


interface PageNumber {
  number: number,
  text: string,
  active: boolean
}

@Component({
  selector: 'ui-pagination',
  template: `
    <div class="ui pagination menu">
      <a class="item" *ngFor="let page of pageNumberList" [ngClass]="{disabled: page.text === '...', active: page.active}" (click)="onClickPage(page)">
        {{page.text}}
      </a>
    </div>
`
})
export class UIPagination {

  _currentPageNumber: number;
  private _total: number;
  private _countPerPage: number;
  private _max: number = Number.MAX_SAFE_INTEGER;

  pageNumberList: PageNumber[] = [];

  @Output()
  pageChange = new EventEmitter<number>();

  @Input()
  set currentPage(page: number) {
    if(page !== this._currentPageNumber) {
      this._currentPageNumber = page;
      this.pageNumberList = this.updatePageNumberList();
    }
  }

  get currentPage(): number {
    return this._currentPageNumber;
  }

  @Input()
  set total(total: number) {
    this._total = total;
    if(!this.isUndefined(this._total) && !this.isUndefined(this._currentPageNumber) && !this.isUndefined(this._countPerPage)) {
      this.pageNumberList = this.updatePageNumberList();
    }
  }

  @Input()
  set countPerPage(count: number) {
    this._countPerPage = count;
    this.pageNumberList = this.updatePageNumberList();
  }

  @Input()
  set max(max: number) {
    this._max = max;
    this.pageNumberList = this.updatePageNumberList();
  }

  onClickPage(page: PageNumber) {
    if(page.text === '...') {
      return;
    }
    if(page.number !== this._currentPageNumber) {
      this.currentPage = page.number;
      this.pageChange.emit(page.number);
    }
  }

  private isUndefined(obj: any) {
    return typeof obj === 'undefined';
  }

  private makePage(number: number, text: string, isActive: boolean): PageNumber {
    return {
      number: number,
      text: text,
      active: isActive
    }
  }

  private updatePageNumberList(): PageNumber[] {
    console.log('rebuild pages');
    let maxSize = this._max;
    let currentPage = this.currentPage;
    let totalPages = Math.ceil(this._total / this._countPerPage);
    let pages: PageNumber [] = [];
    let startPage = 1, endPage = totalPages;
    let isMaxSized = maxSize < totalPages;


    if (isMaxSized) {
        startPage = Math.max(currentPage - Math.floor(maxSize / 2), 1);
        endPage = startPage + maxSize - 1;

        if (endPage > totalPages) {
            endPage = totalPages;
            startPage = endPage - maxSize + 1;
        }
    }
    for (let number = startPage; number < endPage; number++) {
        pages.push(this.makePage(number, number + '', number === currentPage));
    }

    if (isMaxSized && maxSize > 0) {
        if (startPage > 1) {
            if (startPage > 3) {
                pages.unshift(this.makePage(startPage - 1, '...', false));
            }
            if (startPage === 3) {
                pages.unshift(this.makePage(2, '2', false));
            }
            // add the first page
            pages.unshift(this.makePage(1, '1', false));
        }
        if (endPage < totalPages) {
            if (endPage < totalPages -2) {
                pages.push(this.makePage(endPage + 1, '...', false));
            }
            if (endPage === totalPages -2) {
                pages.push(this.makePage(totalPages - 1, (totalPages - 1) + '', false));
            }
            pages.push(this.makePage(totalPages, totalPages + '', false));
        }
    }
    return pages;
  }
}
