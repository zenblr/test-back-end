import { catchError, finalize } from 'rxjs/operators';
// RxJS
import { map } from 'rxjs/operators';
// CRUD
import { BaseDataSource } from '../../../_base/crud';
import { BehaviorSubject, of } from 'rxjs';
import { BrokerService } from '../services/broker.service';

export class BrokerDatasource extends BaseDataSource {

    private loadingSubject = new BehaviorSubject<boolean>(false);
    private isPreloadTextViewedSubject = new BehaviorSubject<boolean>(true);

    public loading$ = this.loadingSubject.asObservable();
    public isPreloadTextViewed$ = this.isPreloadTextViewedSubject.asObservable();
    desserts: any;

    constructor(private brokerService: BrokerService) {
        super();
    }

    loadBrokers(search, from, to) {
        this.loadingSubject.next(true);
        this.brokerService.getBroker(search, from, to)
            .pipe(
                map(
                    broker => {
                        this.entitySubject.next(broker.data);
                        this.paginatorTotalSubject.next(broker.count);
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