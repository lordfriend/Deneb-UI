import {Component, OnInit} from '@angular/core';
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
        this.collection = [
            1, 2, 3, 4, 5, 6, 7, 8
        ];

        setTimeout(() => {
            this.collection.splice(6, 1);
            console.log('current collection', this.collection);
        }, 3000);

        setTimeout(() => {
            this.collection.splice(2,  0, this.collection.splice(6, 1)[0]);
            console.log('current collection', this.collection);
            this.collection.splice(6, 1);
            console.log('current collection', this.collection);
        }, 6000);
    }
}
