import { map, catchError, finalize } from 'rxjs/operators';
import { BaseDataSource } from '../../../_base/crud';
import { BehaviorSubject, of } from 'rxjs';
import { SipCycleDateService } from '../services/sip-cycle-date.service';

export class SipCycleDateDatasource extends BaseDataSource {

    private loadingSubject = new BehaviorSubject<boolean>(false);
    private isPreloadTextViewedSubject = new BehaviorSubject<boolean>(true);

    public loading$ = this.loadingSubject.asObservable();
    public isPreloadTextViewed$ = this.isPreloadTextViewedSubject.asObservable();

    constructor(private sipCycleDateService: SipCycleDateService) {
        super();
    }

    getCycleDate(from, to, search, cycleDateStatus) {
        this.loadingSubject.next(true);

        // this.entitySubject.next(this.leads); // delete this

        this.sipCycleDateService.getCycleDate(from, to, search, cycleDateStatus)
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