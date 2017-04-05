import {
    Component
} from '@angular/core';

require('semantic-ui-less/definitions/modules/sidebar.less');

@Component({
    selector: 'app',
    templateUrl: 'app.html',
    styles: [`
        .main-container {
            position: fixed;
            top: 0;
            left: 210px;
            right: 0;
            bottom: 0;
            overflow-x: hidden;
            overflow-y: auto;
        }
    `]
})
export class App {
}
