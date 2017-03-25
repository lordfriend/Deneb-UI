import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
@Component({
    selector: 'infinite-list-demo',
    templateUrl: './infinite-list.html',
    styles: [`
        infinite-list {
            width: 300px;
            height: 300px;
            display: block;
        }
        .outer {
            position: relative;
            overflow-y: auto;
            width: 100%;
            height: 300px;
        }
        .inner {
            position: relative;
            width: 100%;
            height: 950px;
        }
    `]
})
export class InfiniteListDemo implements OnInit {

    collection: any[];

    ngOnInit(): void {
        this.collection = [];
        for (let i = 0; i < 50; i++){
            this.collection.push(i);
        }

        // setTimeout(() => {
        //     this.collection.splice(6, 1);
        //     console.log('current collection', this.collection);
        // }, 3000);
        //
        // setTimeout(() => {
        //     this.collection.splice(2,  0, this.collection.splice(6, 1)[0]);
        //     console.log('current collection', this.collection);
        //     this.collection.splice(6, 1);
        //     console.log('current collection', this.collection);
        // }, 6000);
    }
}
