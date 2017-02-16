import {Component, OnInit} from '@angular/core';
import {UIToast, LONG_TOAST} from '../../../src/toast/toast';
import {UIToastRef} from '../../../src/toast/toast-ref';
import {UIToastComponent} from '../../../src/toast/toast.component';

require('semantic-ui-less/definitions/collections/message.less');

const dummy_text = [
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    'Sed interdum diam non vehicula rhoncus.',
    'Integer sit amet magna lacinia, venenatis nunc eu, sagittis turpis.',
    'Sed ut elit eu ipsum aliquam semper.',
    'Cras fermentum ante quis mollis maximus.',
    'Maecenas accumsan mi condimentum tempus eleifend.',
    'Maecenas gravida velit id justo volutpat posuere.',
    'Integer in sapien vitae augue pharetra suscipit.',
    'Curabitur tincidunt lorem et velit posuere pulvinar.',
    'Fusce id purus porttitor, pharetra mauris consectetur, accumsan nibh.',
    'In ut justo eu nulla lobortis sodales.',
    'Vivamus dictum velit in enim luctus hendrerit.',
    'Nunc bibendum dui et velit sodales, quis luctus nisi scelerisque.',
    'Quisque ac neque sed lacus rhoncus efficitur.',
    'Pellentesque aliquam lacus vel enim egestas, sed accumsan felis placerat.',
    'Curabitur et eros sed quam porta ultricies vel sit amet libero.',
    'Nam non orci finibus elit ultricies faucibus.',
    'Curabitur feugiat neque at dolor maximus, gravida laoreet tortor pharetra.',
    'Nunc eu augue sed nisl commodo suscipit.',
    'Donec sed velit eget orci placerat cursus non eu enim.',
    'Quisque sit amet eros a libero hendrerit tempus a non tortor.',
    'Ut at leo tempus, lacinia ligula id, gravida mauris.',
    'Phasellus porta sapien in risus mollis volutpat.',
];

@Component({
    selector: 'toast-demo',
    templateUrl: 'toast.html',
})
export class ToastDemo implements OnInit {

    private _toastRef: UIToastRef<UIToastComponent>;

    constructor(private _uiToastService: UIToast) {}

    showToast() {
        let message = dummy_text[Math.floor(Math.random() * dummy_text.length)];
        this._toastRef.show(message);
    }

    ngOnInit(): any {
        this._toastRef = this._uiToastService.makeText();
        this._toastRef.duration = LONG_TOAST;
        return null;
    }
}
