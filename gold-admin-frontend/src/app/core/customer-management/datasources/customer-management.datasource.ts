import { catchError, finalize } from 'rxjs/operators';
// RxJS
import { map } from 'rxjs/operators';
// CRUD
import { BaseDataSource } from '../../_base/crud';
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

    getCustomers(from, to, search) {
        this.loadingSubject.next(true);

        // this.entitySubject.next(this.leads); // delete this

        this.customerManagementService.getCustomers(from, to, search)
            .pipe(
                map(
                    customer => {
                        this.paginatorTotalSubject.next(customer.count);
                        this.entitySubject.next(customer.data);
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