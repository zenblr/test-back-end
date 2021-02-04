import { map, catchError, finalize } from 'rxjs/operators';
import { BaseDataSource } from '../../../_base/crud';
import { BehaviorSubject, of } from 'rxjs';
import { DepositService } from '../services/deposit.service';

export class DepositDatasource extends BaseDataSource {

    private loadingSubject = new BehaviorSubject<boolean>(false);
    private isPreloadTextViewedSubject = new BehaviorSubject<boolean>(true);

    public loading$ = this.loadingSubject.asObservable();
    public isPreloadTextViewed$ = this.isPreloadTextViewedSubject.asObservable();

    constructor(private depositService: DepositService) {
        super();
    }

    getDepositList(data) {
        this.loadingSubject.next(true);

        this.depositService.getDepositList(data)
            .pipe(
                map(           
                    deposit => {
                    // console.log(deposit);
                        this.paginatorTotalSubject.next(deposit.count);
                        this.entitySubject.next(deposit.data);
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