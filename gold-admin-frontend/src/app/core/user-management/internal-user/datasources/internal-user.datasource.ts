import { catchError, finalize } from 'rxjs/operators';
// RxJS
import { map } from 'rxjs/operators';
// CRUD
import { BaseDataSource } from '../../../_base/crud';
import { BehaviorSubject, of } from 'rxjs';
import { InternalUserService } from '../services/internal-user.service';

export class InternalUserDatasource extends BaseDataSource {

    private loadingSubject = new BehaviorSubject<boolean>(false);
    private isPreloadTextViewedSubject = new BehaviorSubject<boolean>(true);

    public loading$ = this.loadingSubject.asObservable();
    public isPreloadTextViewed$ = this.isPreloadTextViewedSubject.asObservable();
    desserts: any;

    constructor(private internalUserService: InternalUserService) {
        super();
    }

    loadUser(search, from, to) {
        this.loadingSubject.next(true);
        this.internalUserService.loadUser(search, from, to)
            .pipe(
                map(
                    user => {
                        this.entitySubject.next(user.data);
                        this.paginatorTotalSubject.next(user.count);
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