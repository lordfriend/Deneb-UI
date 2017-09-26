import {Component, OnInit} from '@angular/core';
@Component({
    selector: 'timeline-meter-demo',
    templateUrl: './timeline-meter.html',
    styles: [
        `
            ui-timeline-meter {
                display: block;
                width: 200px;
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

    newPosition = 0;
    newPercentage = 0;

    onScrollChange(p: number) {
        console.log(p);
    }

    ngOnInit(): void {
        setTimeout(() => {
            let timestamp = Date.now();
            this.timestampList = [];
            this.cards = [];
            for(let i = 0; i < 100; i++) {
                this.cards.push(i + '');
                this.timestampList.push(timestamp);
                timestamp = Math.floor(timestamp - 3600 * 1000 * 24 * 30 * Math.random() * 3);
            }
        }, 1000);

        setTimeout(() => {
            this.newPosition = 500;
        }, 6000);

        setTimeout(() => {
            this.newPercentage = 0.5;
        }, 4000);
    }
}
