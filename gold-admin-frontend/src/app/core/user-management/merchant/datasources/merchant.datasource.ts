import { catchError, finalize } from 'rxjs/operators';
// RxJS
import { map } from 'rxjs/operators';
// CRUD
import { BaseDataSource } from '../../../_base/crud';
import { BehaviorSubject, of } from 'rxjs';
import { MerchantService } from '../services/merchant.service';

export class MerchantDatasource extends BaseDataSource {

    private loadingSubject = new BehaviorSubject<boolean>(false);
    private isPreloadTextViewedSubject = new BehaviorSubject<boolean>(true);

    public loading$ = this.loadingSubject.asObservable();
    public isPreloadTextViewed$ = this.isPreloadTextViewedSubject.asObservable();
    desserts: any;

    constructor(private merchantService: MerchantService) {
        super();
    }

    loadMerchant(search, from, to) {
        this.loadingSubject.next(true);

        this.merchantService.getMerchant(search, from, to)
            .pipe(
                map(
                    merchant => {
                        this.entitySubject.next(merchant.data);
                        this.paginatorTotalSubject.next(merchant.count);
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