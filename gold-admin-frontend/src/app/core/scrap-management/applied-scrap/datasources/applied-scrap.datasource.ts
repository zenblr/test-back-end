import { catchError, finalize } from 'rxjs/operators';
import { map } from 'rxjs/operators';
import { BaseDataSource } from '../../../_base/crud';
import { BehaviorSubject, of } from 'rxjs';
import { AppliedScrapService } from '../services/applied-scrap.service';

export class AppliedScrapDatasource extends BaseDataSource {

    private loadingSubject = new BehaviorSubject<boolean>(false);
    private isPreloadTextViewedSubject = new BehaviorSubject<boolean>(true);

    public loading$ = this.loadingSubject.asObservable();
    public isPreloadTextViewed$ = this.isPreloadTextViewedSubject.asObservable();

    constructor(private appliedScrapService: AppliedScrapService) {
        super();
    }

    loadAppliedScraps(data) {
        this.loadingSubject.next(true);
        this.appliedScrapService.getAppliedScraps(data)
            .pipe(
                map(
                    loan => {
                        this.paginatorTotalSubject.next(loan.count);
                        this.entitySubject.next(loan.appliedScrapDetails);
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