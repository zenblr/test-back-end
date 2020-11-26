import { map, catchError, finalize } from 'rxjs/operators';
import { BaseDataSource } from '../../../_base/crud';
import { BehaviorSubject, of } from 'rxjs';
import { SipApplicationService } from '../services/sip-application.service';

export class SipApplicationDatasource extends BaseDataSource {

    private loadingSubject = new BehaviorSubject<boolean>(false);
    private isPreloadTextViewedSubject = new BehaviorSubject<boolean>(true);

    public loading$ = this.loadingSubject.asObservable();
    public isPreloadTextViewed$ = this.isPreloadTextViewedSubject.asObservable();

    constructor(private sipApplicationService: SipApplicationService) {
        super();
    }

    getSipApplication(from, to, search) {
        this.loadingSubject.next(true);

        // this.entitySubject.next(this.leads); // delete this

        this.sipApplicationService.getSipApplication(from, to, search)
            .pipe(
                map(
                    report => {
                        this.paginatorTotalSubject.next(report.count);
                        this.entitySubject.next(report.sipApplicationData);
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