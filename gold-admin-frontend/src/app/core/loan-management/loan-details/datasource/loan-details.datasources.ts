import { catchError, finalize } from 'rxjs/operators';
// RxJS
import { map } from 'rxjs/operators';
// CRUD
import { BaseDataSource } from '../../../_base/crud';
import { BehaviorSubject, of } from 'rxjs';
import { LoanDetailsService } from '../service/loan-details.service';

export class LoanDetailsDatasource extends BaseDataSource {

    private loadingSubject = new BehaviorSubject<boolean>(false);
    private isPreloadTextViewedSubject = new BehaviorSubject<boolean>(true);

    public loading$ = this.loadingSubject.asObservable();
    public isPreloadTextViewed$ = this.isPreloadTextViewedSubject.asObservable();

    constructor(private loanDetailsService: LoanDetailsService) {
        super();
    }

    loadDetailsLoans(from, to, search) {
    //     this.loadingSubject.next(true);
    //     this.loanDetailsService.getAplliedLoans(from, to, search)
    //         .pipe(
    //             map(
    //                 loan => {
    //                     this.paginatorTotalSubject.next(loan.count);
    //                     this.entitySubject.next(loan.appliedLoanDetails);
    //                 }
    //             ),
    //             catchError(() => of([])),
    //             finalize(() => {
    //                 this.loadingSubject.next(false);
    //                 this.isPreloadTextViewedSubject.next(false);
    //             })
    //         )
    //         .subscribe();
    }

}