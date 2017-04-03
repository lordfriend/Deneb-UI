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
    `]
})
export class InfiniteListDemo implements OnInit {

    collection: any[];

    ngOnInit(): void {
        let collection = [];
        for (let i = 0; i < 15; i++){
            collection.push({index: i});
        }
        setTimeout(() => {
            this.collection = collection;
        }, 3000);

        setTimeout(() => {
            this.collection = collection.filter(item => item.index % 2 === 0);
            // console.log('current collection', this.collection);
        }, 5000);

        setTimeout(() => {
            this.collection = collection.filter(item => true);
            // console.log('current collection', this.collection);
        }, 7000);
    }
}
