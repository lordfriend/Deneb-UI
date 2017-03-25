import {Component, Input} from '@angular/core';
@Component({
    selector: 'list-item-example',
    templateUrl: './list-item.html',
    styles: [`
        .list-item-example {
            width: 100%;
            height: 40px;
            padding: 10px;
        }
        .list-item-example .content {
            width: 100%;
            height: 100%;
            background-color: azure;
        }
    `]
})
export class ListItemExample {
    @Input() item;
}
