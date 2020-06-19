import { catchError, finalize } from 'rxjs/operators';
// RxJS
import { map } from 'rxjs/operators';
// CRUD
import { BehaviorSubject, of } from 'rxjs';
import { BaseDataSource } from '../../../../../core/_base/crud';
import { ProductService } from '../services/product.service';

export class ProductDatasource extends BaseDataSource {

    private loadingSubject = new BehaviorSubject<boolean>(false);
    private isPreloadTextViewedSubject = new BehaviorSubject<boolean>(true);

    public loading$ = this.loadingSubject.asObservable();
    public isPreloadTextViewed$ = this.isPreloadTextViewedSubject.asObservable();

    constructor(private productService: ProductService) {
        super();
    }

    loadProducts(data) {
        this.loadingSubject.next(true);

        this.productService.getAllProducts(data)
            .pipe(
                map(
                    data => {
                        this.paginatorTotalSubject.next(data.count);
                        this.entitySubject.next(data.data);
                    }
                ),
                catchError(() => of([])),
                finalize(() => {
                    this.loadingSubject.next(false);
                    this.isPreloadTextViewedSubject.next(false);
                })
            )
            .subscribe();
    }
}