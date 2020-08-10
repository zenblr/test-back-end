import { catchError, finalize } from 'rxjs/operators';
import { map } from 'rxjs/operators';
import { BaseDataSource } from '../../../_base/crud';
import { BehaviorSubject, of } from 'rxjs';
import { CustomerManagementService } from '../services/customer-management.service';

export class CustomerManagementDatasource extends BaseDataSource {

    private loadingSubject = new BehaviorSubject<boolean>(false);
    private isPreloadTextViewedSubject = new BehaviorSubject<boolean>(true);

    public loading$ = this.loadingSubject.asObservable();
    public isPreloadTextViewed$ = this.isPreloadTextViewedSubject.asObservable();

    constructor(private customerManagementService: CustomerManagementService) {
        super();
    }

    loadList(from, to, search) {
        this.loadingSubject.next(true);
        this.customerManagementService.getList(from, to, search)
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