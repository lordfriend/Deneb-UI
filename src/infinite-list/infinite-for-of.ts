import {
    Directive,
    DoCheck,
    EmbeddedViewRef,
    Input,
    isDevMode,
    IterableChangeRecord,
    IterableChanges,
    IterableDiffer,
    IterableDiffers,
    NgIterable,
    OnChanges,
    OnDestroy,
    OnInit,
    SimpleChanges,
    TemplateRef,
    TrackByFunction,
    ViewContainerRef,
    ViewRef
} from '@angular/core';
import {InfiniteList} from './infinite-list';
import {Subscription} from 'rxjs';

export class Recycler {
    private limit: number = 0;
    private _scrapViews: Map<number, ViewRef> = new Map();

    getView(position: number): ViewRef | null {
        let view = this._scrapViews.get(position);
        if (!view && this._scrapViews.size > 0) {
            position = this._scrapViews.keys().next().value;
            view = this._scrapViews.get(position);
        }
        if (view) {
            this._scrapViews.delete(position);
        }
        return view || null;
    }

    recycleView(position: number, view: ViewRef) {
        view.detach();
        this._scrapViews.set(position, view);
    }

    /**
     * scrap view count should not exceed the number of current attached views.
     */
    pruneScrapViews() {
        if (this.limit <= 1) {
            return;
        }
        let keyIterator = this._scrapViews.keys();
        let key: number;
        while (this._scrapViews.size > this.limit) {
            key = keyIterator.next().value;
            this._scrapViews.get(key).destroy();
            this._scrapViews.delete(key);
        }
    }

    setScrapViewsLimit(limit: number) {
        this.limit = limit;
        this.pruneScrapViews();
    }

    clean() {
        this._scrapViews.forEach((view: ViewRef) => {
            view.destroy();
        });
        this._scrapViews.clear();
    }
}

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
export class InfiniteForOf<T> implements OnChanges, DoCheck, OnInit, OnDestroy {

    private _differ: IterableDiffer<T>;
    private _trackByFn: TrackByFunction<T>;
    private _subscription: Subscription = new Subscription();
    /**
     * scroll offset of y-axis in pixel
     */
    private _scrollY: number = 0;
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

    /**
     * when this value is true, a full clean layout is required, every element must be reposition
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

    private _isInMeasure: boolean = false;

    private _pendingMeasurement: number;

    private _collection: any[];

    private _recycler: Recycler = new Recycler();

    @Input() infiniteForOf: NgIterable<T>;

    @Input()
    set infiniteForTrackBy(fn: TrackByFunction<T>) {
        if (isDevMode() && fn != null && typeof fn !== 'function') {
            if (<any>console && <any>console.warn) {
                console.warn(
                    `trackBy must be a function, but received ${JSON.stringify(fn)}. ` +
                    `See https://angular.io/docs/ts/latest/api/common/index/NgFor-directive.html#!#change-propagation for more information.`);
            }
        }
        this._trackByFn = fn;
    }

    get infiniteForTrackBy(): TrackByFunction<T> {
        return this._trackByFn;
    }

    @Input()
    set infiniteForTemplate(value: TemplateRef<InfiniteRow>) {
        if (value) {
            this._template = value;
        }
    }

    constructor(private _infiniteList: InfiniteList,
                private _differs: IterableDiffers,
                private _template: TemplateRef<InfiniteRow>,
                private _viewContainerRef: ViewContainerRef) {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if ('infiniteForOf' in changes) {
            // React on infiniteForOf only once all inputs have been initialized
            const value = changes['infiniteForOf'].currentValue;
            if (!this._differ && value) {
                try {
                    this._differ = this._differs.find(value).create(this._trackByFn);
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

    private applyChanges(changes: IterableChanges<T>) {
        if (!this._collection) {
            this._collection = [];
        }
        let isMeasurementRequired = false;

        changes.forEachOperation((item: IterableChangeRecord<any>, adjustedPreviousIndex: number, currentIndex: number) => {
            if (item.previousIndex == null) {
                // new item
                // console.log('new item', item, adjustedPreviousIndex, currentIndex);
                isMeasurementRequired = true;
                this._collection.splice(currentIndex, 0, item.item);
            } else if (currentIndex == null) {
                // remove item
                // console.log('remove item', item, adjustedPreviousIndex, currentIndex);
                isMeasurementRequired = true;
                this._collection.splice(adjustedPreviousIndex, 1);
            } else {
                // move item
                // console.log('move item', item, adjustedPreviousIndex, currentIndex);
                this._collection.splice(currentIndex, 0, this._collection.splice(adjustedPreviousIndex, 1)[0]);
            }
        });
        changes.forEachIdentityChange((record: any) => {
            this._collection[record.currentIndex] = record.item;
        });

        if (isMeasurementRequired) {
            this.requestMeasure();
        }

        this.requestLayout();
    }

    ngOnInit(): void {
        this._subscription.add(this._infiniteList.scrollPosition
            .filter((scrollY) => {
                return Math.abs(scrollY - this._scrollY) >= this._infiniteList.rowHeight;
            })
            .subscribe(
                (scrollY) => {
                    this._scrollY = scrollY;
                    this.requestLayout();
                }
            ));
        this._subscription.add(this._infiniteList.sizeChange.subscribe(
            ([width, height]) => {
                // console.log('sizeChange: ', width, height);
                this._containerWidth = width;
                this._containerHeight = height;
                this.requestMeasure();
            }
        ));
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
        this._recycler.clean();
    }

    private requestMeasure() {
        if (this._isInMeasure || this._isInLayout) {
            clearTimeout(this._pendingMeasurement);
            this._pendingMeasurement = window.setTimeout(() => {
                this.requestMeasure();
            }, 60);
            return;
        }
        this.measure();
    }

    private requestLayout() {
        // console.log('requestLayout', this._infiniteList.rowHeight, this._containerHeight, this._collection.length);
        if (!this._isInMeasure && this._infiniteList.rowHeight) {
            this.layout();
        }
    }

    private measure() {
        let collectionNumber = !this._collection || this._collection.length === 0 ? 0 : this._collection.length;
        this._isInMeasure = true;
        this._infiniteList.holderHeight = this._infiniteList.rowHeight * collectionNumber;
        // calculate a approximate number of which a view can contain
        this.calculateScrapViewsLimit();
        this._isInMeasure = false;
        this._invalidate = true;
        this.requestLayout();
    }

    private layout() {
        if (this._isInLayout) {
            return;
        }
        // console.log('on layout');
        this._isInLayout = true;
        let {width, height} = this._infiniteList.measure();
        this._containerWidth = width;
        this._containerHeight = height;
        if (!this._collection || this._collection.length === 0) {
            // detach all views without recycle them.
            for (let i = 0; i < this._viewContainerRef.length; i++) {
                let child = <EmbeddedViewRef<InfiniteRow>> this._viewContainerRef.get(i);
                // if (child.context.index < this._firstItemPosition || child.context.index > this._lastItemPosition || this._invalidate) {
                this._viewContainerRef.detach(i);
                // this._recycler.recycleView(child.context.index, child);
                i--;
                // }
            }
            this._isInLayout = false;
            this._invalidate = false;
            return;
        }
        this.findPositionInRange();
        for (let i = 0; i < this._viewContainerRef.length; i++) {
            let child = <EmbeddedViewRef<InfiniteRow>> this._viewContainerRef.get(i);
            // if (child.context.index < this._firstItemPosition || child.context.index > this._lastItemPosition || this._invalidate) {
            this._viewContainerRef.detach(i);
            this._recycler.recycleView(child.context.index, child);
            i--;
            // }
        }
        this.insertViews();
        this._recycler.pruneScrapViews();
        this._isInLayout = false;
        this._invalidate = false;
    }

    private calculateScrapViewsLimit() {
        let limit = this._containerHeight / this._infiniteList.rowHeight + 2;
        this._recycler.setScrapViewsLimit(limit);
    }

    private insertViews() {
        if (this._viewContainerRef.length > 0) {
            let firstChild = <EmbeddedViewRef<InfiniteRow>> this._viewContainerRef.get(0);
            let lastChild = <EmbeddedViewRef<InfiniteRow>> this._viewContainerRef.get(this._viewContainerRef.length - 1);
            for (let i = firstChild.context.index - 1; i >= this._firstItemPosition; i--) {
                let view = this.getView(i);
                this.dispatchLayout(i, view, true);
            }
            for (let i = lastChild.context.index + 1; i <= this._lastItemPosition; i++) {
                let view = this.getView(i);
                this.dispatchLayout(i, view, false);
            }
        } else {
            for (let i = this._firstItemPosition; i <= this._lastItemPosition; i++) {
                let view = this.getView(i);
                this.dispatchLayout(i, view, false);
            }
        }
    }

    //noinspection JSMethodCanBeStatic
    private applyStyles(viewElement: HTMLElement, y: number) {
        viewElement.style.transform = `translate3d(0, ${y}px, 0)`;
        viewElement.style.webkitTransform = `translate3d(0, ${y}px, 0)`;
        viewElement.style.width = `${this._containerWidth}px`;
        viewElement.style.height = `${this._infiniteList.rowHeight}px`;
        viewElement.style.position = 'absolute';
    }

    private dispatchLayout(position: number, view: ViewRef, addBefore: boolean) {
        let startPosY = position * this._infiniteList.rowHeight;
        this.applyStyles((view as EmbeddedViewRef<InfiniteRow>).rootNodes[0], startPosY);
        if (addBefore) {
            this._viewContainerRef.insert(view, 0);
        } else {
            this._viewContainerRef.insert(view);
        }
        view.reattach();
    }

    private findPositionInRange() {
        let scrollY = this._scrollY;
        let firstPosition = Math.floor(scrollY / this._infiniteList.rowHeight);
        let firstPositionOffset = scrollY - firstPosition * this._infiniteList.rowHeight;
        let lastPosition = Math.ceil((this._containerHeight + firstPositionOffset) / this._infiniteList.rowHeight) + firstPosition;
        this._firstItemPosition = Math.max(firstPosition - 1, 0);
        this._lastItemPosition = Math.min(lastPosition + 1, this._collection.length - 1);
    }

    private getView(position: number): ViewRef {
        let view = this._recycler.getView(position);
        let item = this._collection[position];
        let count = this._collection.length;
        if (!view) {
            view = this._template.createEmbeddedView(new InfiniteRow(item, position, count));
        } else {
            (view as EmbeddedViewRef<InfiniteRow>).context.$implicit = item;
            (view as EmbeddedViewRef<InfiniteRow>).context.index = position;
            (view as EmbeddedViewRef<InfiniteRow>).context.count = count;
        }
        return view;
    }
}


export function getTypeNameForDebugging(type: any): string {
    return type['name'] || typeof type;
}
