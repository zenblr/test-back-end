import { catchError, finalize } from 'rxjs/operators';
// RxJS
import { map } from 'rxjs/operators';
// CRUD
import { BaseDataSource } from '../../_base/crud';
import { BehaviorSubject, of } from 'rxjs';
import { TransactionService } from '../services/transaction.service';

export class TransactionDatasource extends BaseDataSource {

    private loadingSubject = new BehaviorSubject<boolean>(false);
    private isPreloadTextViewedSubject = new BehaviorSubject<boolean>(true);

    public loading$ = this.loadingSubject.asObservable();
    public isPreloadTextViewed$ = this.isPreloadTextViewedSubject.asObservable();

    constructor(private transactionService: TransactionService) {
        super();
    }

    loadTransactions(data) {
        this.loadingSubject.next(true);
        this.transactionService.getTransaction(data)
            .pipe(
                map(
                    transaction => {
                        this.paginatorTotalSubject.next(transaction.count);
                        this.entitySubject.next(transaction.data);
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