import { map, catchError, finalize } from 'rxjs/operators';
import { BaseDataSource } from '../../../../_base/crud';
import { BehaviorSubject, of } from 'rxjs';
import { FullReleaseApprovalService } from '../services/full-release-approval.service';

export class FullReleaseApprovalDatasource extends BaseDataSource {

    private loadingSubject = new BehaviorSubject<boolean>(false);
    private isPreloadTextViewedSubject = new BehaviorSubject<boolean>(true);

    public loading$ = this.loadingSubject.asObservable();
    public isPreloadTextViewed$ = this.isPreloadTextViewedSubject.asObservable();

    constructor(private fullReleaseApprovalService: FullReleaseApprovalService) {
        super();
    }

    getFullReleaseList(from, to, search) {
        this.loadingSubject.next(true);

        this.fullReleaseApprovalService.getFullReleaseList(from, to, search)
            .pipe(
                map(
                    report => {
                        this.paginatorTotalSubject.next(report.count);
                        this.entitySubject.next(report);
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