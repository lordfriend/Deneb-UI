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
    OnInit, ChangeDetectorRef, ViewRef, OnDestroy
} from '@angular/core';
import {getTypeNameForDebugging} from '@angular/core/src/facade/lang';
import {InfiniteList} from './infinite-list';
import {BehaviorSubject, Subscription} from 'rxjs';

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
     * @param limit
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
export class InfiniteForOf implements OnChanges, DoCheck, OnInit, OnDestroy {

    private _differ: IterableDiffer;
    private _trackByFn: TrackByFn;
    private _subscription: Subscription = new Subscription();

    private _layoutRequest: BehaviorSubject<any> = new BehaviorSubject(false);
    private _measureRequest: BehaviorSubject<boolean> = new BehaviorSubject(false);
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

    private _collection: any[];

    private _recycler: Recycler = new Recycler();

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

    constructor(private _infiniteList: InfiniteList,
                private _differs: IterableDiffers,
                private _changeDetectorRef: ChangeDetectorRef,
                private _template: TemplateRef<InfiniteRow>,
                private _viewContainerRef: ViewContainerRef) {

        this._subscription.add(this._layoutRequest
            .withLatestFrom(this._measureRequest
                .filter(() => {
                    return !!this._rowHeight;
                })
                .map(() => {
                    console.log('measure requested');
                    this.measure();
                    return true;
                }))
            .subscribe(
                () => {
                    this.layout();
                }
            ));
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
        if (!this._collection) {
            this._collection = [];
        }
        let isMeasurementRequired = false;

        changes.forEachOperation((item: CollectionChangeRecord, adjustedPreviousIndex: number, currentIndex: number) => {
            if (item.previousIndex == null) {
                // new item
                console.log('new item', item, adjustedPreviousIndex, currentIndex);
                isMeasurementRequired = true;
                this._collection[currentIndex] = item.item;
            } else if (currentIndex == null) {
                // remove item
                console.log('remove item', item, adjustedPreviousIndex, currentIndex);
                isMeasurementRequired = true;
                this._collection.splice(adjustedPreviousIndex, 1);
            } else {
                // move item
                console.log('move item', item, adjustedPreviousIndex, currentIndex);
                this._collection.splice(currentIndex, 0, this._collection.splice(adjustedPreviousIndex, 1)[0]);
            }
        });

        changes.forEachIdentityChange((record: any) => {
            this._collection[record.currentIndex] = record.item;
        });

        if (isMeasurementRequired) {
            this.requestMeasure(true);
        }

        this.requestLayout();
    }

    ngOnInit(): void {
        this._subscription.add(this._infiniteList.scrollPosition.subscribe(
            (position) => {
                console.log('scrollChange: ', position);
                this._scrollY = position;
                this.requestLayout();
            }
        ));
        this._subscription.add(this._infiniteList.sizeChange.subscribe(
            ([width, height]) => {
                console.log('sizeChange: ', width, height);
                this._containerWidth = width;
                this._containerHeight = height;
                this.requestMeasure(this._containerWidth !== width);
                this.requestLayout();
            }
        ));
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }

    private requestMeasure(invalidateRowHeight: boolean) {
        if (invalidateRowHeight) {
            this._rowHeight = 0;
        }
        if (!this._rowHeight) {
            this.measureChild();
        } else {
            console.log('child measured');
            this._measureRequest.next(true);
        }
    }

    private requestLayout() {
        console.log('requestLayout');
        this._invalidate = true;
        this._layoutRequest.next(true);
    }

    /**
     * we only measure the first child and use its height as every row height
     * This function is asynchronous
     */
    private measureChild() {
        if (!this._collection || this._collection.length === 0) {
            return;
        }
        let view = this._viewContainerRef.createEmbeddedView(
            this._template,
            new InfiniteRow(this._collection[0], 0, this._collection.length),
            0
        );
        view.detectChanges();
        // (view.rootNodes[0] as HTMLElement).style.opacity = '0.1';
        setTimeout(() => {
            console.log((<HTMLElement> view.rootNodes[0]));
            this._rowHeight = (<HTMLElement> view.rootNodes[0]).clientHeight;
            view.destroy();
            console.log(`childHeight: ${this._rowHeight}`);
            this._measureRequest.next(true);
            this._invalidate = true;
        });
    }

    private measure() {
        console.log('on measure');
        if (!this._collection || this._collection.length === 0) {
            return;
        }
        this._infiniteList.holderHeight = this._rowHeight * this._collection.length;
        // calculate a approximate number of which a view can contain
        let limit = this._containerHeight / this._rowHeight + 2;
        this._recycler.setScrapViewsLimit(limit);
    }

    private layout() {
        console.log('on layout');
        if (this._isInLayout || !this._collection || this._collection.length === 0 || !this._containerHeight) {
            return;
        }
        this._isInLayout = true;
        this.findPositionInRange();
        for (let i = 0; i < this._viewContainerRef.length; i++) {
            let child = <EmbeddedViewRef<InfiniteRow>> this._viewContainerRef.get(i);
            if (child.context.index < this._firstItemPosition || child.context.index > this._lastItemPosition || this._invalidate) {
                this._viewContainerRef.detach(i);
                this._recycler.recycleView(child.context.index, child);
                i--;
            }
        }
        this.insertViews();
        // this._changeDetectorRef.detectChanges();
        this._recycler.pruneScrapViews();
        this._isInLayout = false;
        this._invalidate = false;
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
        viewElement.style.transform = `translateY(${y}px)`;
        viewElement.style.webkitTransform = `translateY(${y})`;
        viewElement.style.width = `${this._containerWidth}px`;
        viewElement.style.height = `${this._rowHeight}px`;
        viewElement.style.position = 'absolute';
    }

    private dispatchLayout(position: number, view: ViewRef, addBefore: boolean) {
        let startPosY = position * this._rowHeight;
        this.applyStyles((view as EmbeddedViewRef<InfiniteRow>).rootNodes[0], startPosY);

        if (addBefore) {
            this._viewContainerRef.insert(view, 0);
        } else {
            this._viewContainerRef.insert(view);
        }
    }

    private findPositionInRange() {
        let scrollY = this._scrollY;
        let firstPosition = Math.floor(scrollY / this._rowHeight);
        let firstPositionOffset = scrollY - firstPosition * this._rowHeight;
        let lastPosition = Math.ceil((this._containerHeight + firstPositionOffset) / this._rowHeight) + firstPosition;
        this._firstItemPosition = firstPosition;
        this._lastItemPosition = Math.min(lastPosition, this._collection.length - 1);
    }

    private getView(position: number): ViewRef {
        let view = this._recycler.getView(position);
        let item = this._collection[position];
        let count = this._collection.length;
        if (!view) {
            view = this._template.createEmbeddedView(new InfiniteRow(item, position, count));
        } else {
            (view as EmbeddedViewRef<InfiniteRow>).context.$implicit = this._collection[position];
        }
        return view;
    }
}
