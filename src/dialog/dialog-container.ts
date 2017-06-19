import {
    Component,
    ComponentRef,
    EventEmitter,
    Input,
    Output,
    ViewChild,
    ViewContainerRef,
    ViewEncapsulation
} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {UIDialogConfig} from './dialog';

@Component({
    selector: 'ui-dialog-container',
    templateUrl: 'dialog-container.html',
    styleUrls: ['dialog-container.less'],
    encapsulation: ViewEncapsulation.None,
    animations: [
        trigger('backdropState', [
            state('active', style({opacity: '1'})),
            transition('void => active', [
                style({opacity: '0'}),
                animate(200)
            ]),
            transition('active => void', [
                style({opacity: '0'}),
                animate(200)
            ])
        ])
    ]
})
export class UIDialogContainer {

    private _config: UIDialogConfig;

    backdropDisplay: string;

    insideParent: boolean;

    @ViewChild('backdrop', {read: ViewContainerRef}) _viewContainer: ViewContainerRef;

    @Input()
    set dialogConfig(config: UIDialogConfig) {
        this._config = config;
        if (config.backdrop) {
            this.backdropDisplay = 'block';
        } else {
            this.backdropDisplay = 'none';
        }
    }

    get dialogConfig(): UIDialogConfig {
        return this._config;
    }

    @Output()
    close = new EventEmitter<any>();

    onClickBackDrop($event: Event) {
        $event.preventDefault();
        $event.stopPropagation();
        if (!this.dialogConfig.stickyDialog) {
            this.close.emit(null);
        }
    }

    attachDialogContent<T>(componentRef: ComponentRef<T>) {
        console.log(this._viewContainer.element.nativeElement);
        this._viewContainer.insert(componentRef.hostView);
    }
}
