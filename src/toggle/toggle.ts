import { Component, Input, ExistingProvider, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

let nextId = 0;

export const UI_TOGGLE_VALUE_ACCESSOR: ExistingProvider = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => UIToggle),
    multi: true
};

@Component({
    selector: 'ui-toggle',
    templateUrl: './toggle.html',
    styleUrls: ['./toggle.less'],
    providers: [UI_TOGGLE_VALUE_ACCESSOR]
})
export class UIToggle implements ControlValueAccessor {

    ready = false;
    isDisabled: boolean;
    checked: boolean;

    @Input() value: any;

    @Input('id') inputId = `toggleId${nextId++}`;

    @Input()
    text: string;

    private _onChangeHandler = (_: any) => {};

    toggle(): void {
        this.checked = !this.checked;
    }

    writeValue(value: any): void {
        if (typeof value === 'boolean') {
            if (!this.ready) {
                this.ready = true;
            }
            // console.log(value);
            this.checked = !!value;
        }
    }

    registerOnChange(fn: any): void {
        this._onChangeHandler = fn;
    }

    registerOnTouched(fn: any): void {
    }

    setDisabledState(isDisabled: boolean): void {
        this.isDisabled = isDisabled;
    }

    onInputChange() {
        if (!this.isDisabled) {
            this.ready =  true;
            this.toggle();
            this._onChangeHandler(this.checked);
        }
    }
}
