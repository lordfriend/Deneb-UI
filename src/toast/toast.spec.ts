import {async, TestBed, inject} from '@angular/core/testing';
import {
    NgModule, Component, Input, AnimationTransitionEvent, EventEmitter, style, transition,
    animate, state, trigger, ApplicationRef
} from '@angular/core';
import {UIToastModule} from './index';
import {UIToastAnimation} from './toast-interface';
import {UIToast} from './toast';
import {UIToastRef} from './toast-ref';

describe('UIToast', () => {
    let toast: UIToast;
    let appRef: ApplicationRef;
    let toastRef: UIToastRef<any>;
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [UIToastModule, ToastTestModule]
        });

        TestBed.compileComponents();
    }));

    beforeEach(inject([UIToast, ApplicationRef], (t: UIToast, aref: ApplicationRef) => {
        toast = t;
        appRef = aref;
    }));

    afterEach(async(() => {
        toastRef.hide();
    }));

    it('should show a toast with given text', () => {
        const text = 'A toast';
        toastRef = toast.makeText();
        toastRef.show(text);
        appRef.tick();
        let uiToastEl = document.body.querySelector('ui-toast');
        expect(uiToastEl).not.toBe(null);
        expect(uiToastEl.querySelector('.toast-content').textContent).toBe(text);
    });

    it('should show a toast and hide it after a given time', done => {
        const duration = 1000;
        toastRef = toast.makeText();
        const text = 'A toast';
        toastRef.duration = duration;
        toastRef.show(text);
        appRef.tick();
        spyOn(appRef, 'detachView');
        setTimeout(() => {
            expect(appRef.detachView).toHaveBeenCalled();
            done();
        }, 1000 + 300); // add a little more time
    });

    it('should show a custom toast with given component', () => {
        const text = 'a custom toast';
        toastRef = toast.make(TestToastComponent);
        toastRef.show(text);
        appRef.tick();
        let toastEl = document.body.querySelector('test-toast-component');
        expect(toastEl).not.toBe(null);
        expect(toastEl.querySelector('.toast-test').textContent).toBe(text);
    });
});

@Component({
    selector: 'test-toast-component',
    template: '<div class="toast-test">{{message}}</div>',
    animations: [
        trigger('flyIn', [
            state('in', style({transform: 'translateX(0)'})),
            transition('void => *', [
                style({transform: 'translateX(-100%)'}),
                animate(300)
            ]),
            transition('* => void', [
                animate(300, style({transform: 'translateX(100%)'}))
            ])
        ])
    ],
    host: {
        '[@flyIn]': '"in"',
        '(@flyIn.done)': 'uiLeaveAnimationDone($event)'
    },
    styles: [
        `
            :host{
                display: block;            
            }
        `
    ]
})
class TestToastComponent implements UIToastAnimation {
    @Input() message: string;
    animationEvent: EventEmitter<any> = new EventEmitter<any>();
    uiLeaveAnimationDone(event: AnimationTransitionEvent) {
        if (event.toState === 'void') {
            this.animationEvent.emit(null);
        }
    }
}

const TEST_DIRECTIVES = [TestToastComponent];

@NgModule({
    declarations: TEST_DIRECTIVES,
    imports: [UIToastModule],
    exports: TEST_DIRECTIVES,
    entryComponents: [TestToastComponent]
})
class ToastTestModule {

}
