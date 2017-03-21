import {
    Directive,
    Input,
    IterableDiffers,
    TemplateRef,
    ViewContainerRef,
    IterableDiffer,
    OnChanges,
    DoCheck,
    SimpleChanges,
    TrackByFn,
    isDevMode,
    DefaultIterableDiffer,
    EmbeddedViewRef,
    CollectionChangeRecord,
    OnInit, ChangeDetectorRef
} from '@angular/core';
import {getTypeNameForDebugging} from '@angular/core/src/facade/lang';
import {InfiniteList} from './infinite-list';


export class InfiniteRow {
    constructor(public $implicit: any, public index: number, public count: number) {
    }

    get first(): boolean {
        return this.index === 0;
    }

    get last(): boolean {
        return this.index === this.count - 1;
    }

    get even(): boolean {
        return this.index % 2 === 0;
    }

    get odd(): boolean {
        return !this.even;
    }
}

@Directive({
    selector: '[infiniteFor][infiniteForOf]'
})
export class InfiniteForOf implements OnChanges, DoCheck, OnInit {

    private _differ: IterableDiffer;
    private _trackByFn: TrackByFn;
    /**
     * scroll offset of y-axis in pixel
     */
    private _scrollY: number;
    /**
     * first visible item index in collection
     */
    private _firstItemPosition: number;
    /**
     * last visible item index in collection
     */
    private _lastItemPosition: number;

    private _containerWidth: number;
    private _containerHeight: number;
    private _rowHeight: number;

    /**
     * when this value is true, a measurement is required
     * @type {boolean}
     * @private
     */
    private _isMeasurementRequired: boolean = true;
    /**
     * when this value is true, a layout is required
     * @type {boolean}
     * @private
     */
    private _invalidate: boolean = true;
    /**
     * when this value is true, a layout is in process
     * @type {boolean}
     * @private
     */
    private _isInLayout: boolean = false;

    private _collection: any[];

    @Input() infiniteForOf: any;

    @Input()
    set infiniteForTrackBy(fn: TrackByFn) {
        if (isDevMode() && fn != null && typeof fn !== 'function') {
            if (<any>console && <any>console.warn) {
                console.warn(
                    `trackBy must be a function, but received ${JSON.stringify(fn)}. ` +
                    `See https://angular.io/docs/ts/latest/api/common/index/NgFor-directive.html#!#change-propagation for more information.`);
            }
        }
        this._trackByFn = fn;
    }

    get infiniteForTrackBy(): TrackByFn {
        return this._trackByFn;
    }

    @Input()
    set infiniteForTemplate(value: TemplateRef<InfiniteRow>) {
        if (value) {
            this._template = value;
        }
    }

    constructor(
        private _infiniteList: InfiniteList,
        private _differs: IterableDiffers,
        private _changeDetectorRef: ChangeDetectorRef,
        private _template: TemplateRef<InfiniteRow>,
        private _viewContainerRef: ViewContainerRef) {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if ('infiniteForOf' in changes) {
            // React on infiniteForOf only once all inputs have been initialized
            const value = changes['infiniteForOf'].currentValue;
            if (!this._differ && value) {
                try {
                    this._differ = this._differs.find(value).create(this._changeDetectorRef, this._trackByFn);
                } catch (e) {
                    throw new Error(`Cannot find a differ supporting object '${value}' of type '${getTypeNameForDebugging(value)}'. NgFor only supports binding to Iterables such as Arrays.`);
                }
            }
        }
    }

    ngDoCheck(): void {
        if (this._differ) {
            const changes = this._differ.diff(this.infiniteForOf);
            if (changes) {
                this.applyChanges(changes);
            }
        }
    }

    private applyChanges(changes: DefaultIterableDiffer) {
        const insertTuples: RecordViewTuple[] = [];
        if (!this._collection) {
            this._collection = [];
        }

        changes.forEachOperation((item: CollectionChangeRecord, adjustedPreviousIndex: number, currentIndex: number) => {
            if (item.previousIndex == null) {
                // new item
                console.log('new item', item, adjustedPreviousIndex, currentIndex);
                this._isMeasurementRequired = true;
                this._collection[currentIndex] = item.item;
            } else if (currentIndex == null) {
                // remove item
                console.log('remove item', item, adjustedPreviousIndex, currentIndex);
                this._isMeasurementRequired = true;
                this._collection.splice(adjustedPreviousIndex, 1);
            } else {
                // move item
                console.log('move item', item, adjustedPreviousIndex, currentIndex);
                this._collection.splice(currentIndex, 0, this._collection.splice(adjustedPreviousIndex, 1)[0]);
            }
        });

        this.measure();
        this.layout();
    }

    ngOnInit(): void {
        this._infiniteList.scrollPosition.subscribe(
            (position) => {
                this._scrollY = position;
                this._invalidate = true;
                this.layout();
            }
        );
        this._infiniteList.sizeChange.subscribe(
            ([width, height]) => {
                this._containerWidth = width;
                this._containerHeight = height;
                if (this._containerWidth !== width) {
                    this._rowHeight = 0;
                }
                this._isMeasurementRequired = true;
                this._invalidate = true;
                this.measure();
                this.layout();
            }
        );
    }

    private measureChild(): number {
        if (!this._collection || this._collection.length === 0) {
            return;
        }
        let view = this._viewContainerRef.createEmbeddedView(
            this._template,
            new InfiniteRow(this._collection[0], 0, this._collection.length),
            0
        );
        let childHeight = (<HTMLElement> view.rootNodes[0]).clientHeight;
        console.log(`childHeight: ${childHeight}`);
        view.destroy();
        return childHeight;
    }

    private measure() {
        if (!this._isMeasurementRequired) {
            return;
        }
        if (!this._rowHeight) {
            this._rowHeight = this.measureChild();
        }
        if (!this._collection || this._collection.length === 0) {
            return;
        }
        this._infiniteList.holderHeight = this._rowHeight * this._collection.length;
    }

    private layout() {
        if (!this._invalidate) {
            return;
        }

    }

    private perViewChange(view: EmbeddedViewRef<InfiniteRow>, record: CollectionChangeRecord) {
        view.context.$implicit = record.item;
    }
}

class RecordViewTuple {
    constructor(public record: any, public view: EmbeddedViewRef<InfiniteRow>) {
    }
}
