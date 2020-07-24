import { map, catchError, finalize } from 'rxjs/operators';
import { BaseDataSource } from '../../../../_base/crud';
import { BehaviorSubject, of } from 'rxjs';
import { PartReleaseApprovalService } from '../services/part-release-approval.service';

export class PartReleaseApprovalDatasource extends BaseDataSource {

    private loadingSubject = new BehaviorSubject<boolean>(false);
    private isPreloadTextViewedSubject = new BehaviorSubject<boolean>(true);

    public loading$ = this.loadingSubject.asObservable();
    public isPreloadTextViewed$ = this.isPreloadTextViewedSubject.asObservable();

    constructor(private partReleaseApprovalService: PartReleaseApprovalService) {
        super();
    }

    getPartReleaseList(from, to, search) {
        this.loadingSubject.next(true);

        this.partReleaseApprovalService.getPartReleaseList(from, to, search)
            .pipe(
                map(
                    report => {
                        this.paginatorTotalSubject.next(report.count);
                        this.entitySubject.next(report.data);
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