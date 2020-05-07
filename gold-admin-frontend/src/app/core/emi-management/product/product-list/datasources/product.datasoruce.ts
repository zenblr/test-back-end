import { catchError, finalize } from 'rxjs/operators';
// RxJS
import {map } from 'rxjs/operators';
// CRUD

import { BehaviorSubject, Observable, of } from 'rxjs';
import {ProductService} from '../services/product.service';
import { BaseDataSource } from '../../../../../core/_base/crud/index';

export class ProductDatasource extends BaseDataSource {
    private loadingSubject = new BehaviorSubject<boolean>(false);
    private isPreloadTextViewedSubject = new BehaviorSubject<boolean>(true);
    public loading$ = this.loadingSubject.asObservable();
    public isPreloadTextViewed$ = this.isPreloadTextViewedSubject.asObservable();
    constructor(
        private service: ProductService
    ) {
        super();
    }
 
    getAllProductListData(from: number, to: number,search?:string){ 
        this.loadingSubject.next(true);
        this.service.getProductList(from,to,search)
        .pipe(
            map(
                data=>{
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
