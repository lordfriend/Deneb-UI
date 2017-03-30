import {Component, OnInit} from '@angular/core';
@Component({
    selector: 'timeline-meter-demo',
    templateUrl: './timeline-meter.html',
    styles: [
        `
            ui-timeline-meter {
                display: block;
                width: 500px;
                height: 300px;
            }
            .demo-card {
                width: 100%;
                font-size: 16px;
            }
        `
    ]
})
export class TimelineMeterExample implements OnInit {
    cards: string[];
    timestampList: number[];

    ngOnInit(): void {
        let timestamp = Date.now();
        this.timestampList = [];
        this.cards = [];
        for(let i = 0; i < 100; i++) {
            this.cards.push(i + '');
            this.timestampList.push(timestamp);
            timestamp = Math.floor(timestamp - 3600 * 1000 * 24 * 30 * Math.random() * 3);
        }
    }
}
