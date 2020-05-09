
import { catchError, finalize } from 'rxjs/operators';
// RxJS
import { map } from 'rxjs/operators';
// CRUD
import { BaseDataSource } from '../../../_base/crud';
import { BehaviorSubject, of } from 'rxjs';
import { StoreService } from '../service/store.service';

export class StoreDatasource extends BaseDataSource {

    private loadingSubject = new BehaviorSubject<boolean>(false);
    private isPreloadTextViewedSubject = new BehaviorSubject<boolean>(true);

    public loading$ = this.loadingSubject.asObservable();
    public isPreloadTextViewed$ = this.isPreloadTextViewedSubject.asObservable();
    desserts: any;

    constructor(private storeService: StoreService) {
        super();
    }

    loadRoles(search, from, to) {
        

        this.storeService.getStore(search, from, to)
            .pipe(
                map(
                    store => {
                        this.entitySubject.next(store.data);
                        this.paginatorTotalSubject.next(store.count);
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