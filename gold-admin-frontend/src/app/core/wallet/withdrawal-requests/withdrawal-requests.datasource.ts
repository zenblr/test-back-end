import { map, catchError, finalize } from 'rxjs/operators';
import { BaseDataSource } from '../../_base/crud';
import { BehaviorSubject, of } from 'rxjs';
import { WithdrawalRequestsService } from '../withdrawal-requests/withdrawal-requests.service';

export class WithdrawalRequestsDatasource extends BaseDataSource {

    private loadingSubject = new BehaviorSubject<boolean>(false);
    private isPreloadTextViewedSubject = new BehaviorSubject<boolean>(true);

    public loading$ = this.loadingSubject.asObservable();
    public isPreloadTextViewed$ = this.isPreloadTextViewedSubject.asObservable();

    constructor(private withdrawalRequestsService: WithdrawalRequestsService) {
        super();
    }

    loadWithdrawalRequests(data) {
        this.loadingSubject.next(true);

        // this.entitySubject.next(this.leads); // delete this

        this.withdrawalRequestsService.getWithdrawalRequests(data)
            .pipe(
                map(
                    report => {
                        this.paginatorTotalSubject.next(report.count);
                        this.entitySubject.next(report.depositDetail);
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