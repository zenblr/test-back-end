import { map, catchError, finalize } from 'rxjs/operators';
import { BaseDataSource } from '../../../_base/crud';
import { BehaviorSubject, of } from 'rxjs';
import { SipInvestmentTenureService } from '../services/sip-investment-tenure.service';

export class SipInvestmentTenureDatasource extends BaseDataSource {

    private loadingSubject = new BehaviorSubject<boolean>(false);
    private isPreloadTextViewedSubject = new BehaviorSubject<boolean>(true);

    public loading$ = this.loadingSubject.asObservable();
    public isPreloadTextViewed$ = this.isPreloadTextViewedSubject.asObservable();

    constructor(private sipInvestmentTenureService: SipInvestmentTenureService) {
        super();
    }

    getInvestmentTenure(from, to, search) {
        this.loadingSubject.next(true);

        // this.entitySubject.next(this.leads); // delete this

        this.sipInvestmentTenureService.getInvestmentTenure(from, to, search)
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