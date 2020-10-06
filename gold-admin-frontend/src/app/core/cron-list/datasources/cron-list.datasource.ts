import { catchError, finalize } from 'rxjs/operators';
// RxJS
import { map } from 'rxjs/operators';
// CRUD
import { BaseDataSource } from '../../_base/crud';
import { BehaviorSubject, of } from 'rxjs';
import{ CronListService } from '../services/cron-list.service'

export class CronListDatasource extends BaseDataSource {

    private loadingSubject = new BehaviorSubject<boolean>(false);
    private isPreloadTextViewedSubject = new BehaviorSubject<boolean>(true);

    public loading$ = this.loadingSubject.asObservable();
    public isPreloadTextViewed$ = this.isPreloadTextViewedSubject.asObservable();

    constructor(private cronListService: CronListService) {
        super();
    }

 



    getCronList(params) {
        this.loadingSubject.next(true);

        // this.entitySubject.next(this.leads); // delete this

        this.cronListService.getCronList(params)
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