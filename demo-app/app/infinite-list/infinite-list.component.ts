import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';

const MOCK_DATA = require('../../MOCK_DATA.json');

@Component({
    selector: 'infinite-list-demo',
    templateUrl: './infinite-list.html',
    styles: [`
        .demo-container {
            width: 100%;
            height: 100%;
            position: relative;
            background-color: #f0f0f0;
        }
        infinite-list {
            width: 600px;
            height: 100%;
            display: block;
        }
    `]
})
export class InfiniteListDemo implements OnInit {

    collection: {id: number, image: string, content: string}[];

    ngOnInit(): void {

        setTimeout(() => {
            this.collection = MOCK_DATA;
        }, 3000);

        setTimeout(() => {
            this.collection = MOCK_DATA.filter(item => item.id % 2 === 0);
            // console.log('current collection', this.collection);
        }, 5000);

        setTimeout(() => {
            this.collection = MOCK_DATA.filter(item => true);
            // console.log('current collection', this.collection);
        }, 7000);
    }
}
