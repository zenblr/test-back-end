import { catchError, finalize } from 'rxjs/operators';
// RxJS
import {map } from 'rxjs/operators';
// CRUD

import { BehaviorSubject, Observable, of } from 'rxjs';
import {AddCategoryService} from '../services/add-category.service';
import { BaseDataSource } from '../../../../../core/_base/crud/index';

export class AddCategoryDatasource extends BaseDataSource {
    private loadingSubject = new BehaviorSubject<boolean>(false);
    private isPreloadTextViewedSubject = new BehaviorSubject<boolean>(true);
    public loading$ = this.loadingSubject.asObservable();
    public isPreloadTextViewed$ = this.isPreloadTextViewedSubject.asObservable();
    constructor(
        private service: AddCategoryService
    ) {
        super();
    }
     
    getAllCategoryData(from: number, to: number,search?:string){ 
       this.loadingSubject.next(true);
       this.service.getCategoryList(from,to,search)
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
