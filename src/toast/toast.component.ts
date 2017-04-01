import {
    AnimationTransitionEvent,
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    Output,
    ViewEncapsulation
} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {UIToastRef} from './toast-ref';
import {UIToastAnimation} from './toast-interface';

@Component({
    selector: 'ui-toast',
    template: '<div class="toast-content ui black message">{{message}}</div>',
    animations: [
        trigger('fade', [
            state('in', style({opacity: 1})),
            transition('void => *', [
                style({opacity: 0}),
                animate(300)
            ]),
            transition('* => void', [
                animate(300, style({opacity: 0}))
            ])
        ])
    ],
    host: {
        '[@fade]': '"in"',
        '(@fade.done)': 'uiLeaveAnimationDone($event)'
    },
    styleUrls: ['toast.less'],
    encapsulation: ViewEncapsulation.Emulated
})
export class UIToastComponent implements OnDestroy, UIToastAnimation {
    @Input() message: string;

    @Output()
    animationEvent = new EventEmitter<any>();

    constructor(private _toastRef: UIToastRef<UIToastComponent>) {}

    ngOnDestroy(): void {
        console.log('destroyed');
    }

    uiLeaveAnimationDone(event: AnimationTransitionEvent) {
        if (event.toState === 'void') {
            this.animationEvent.emit(null);
        }
    }
}
