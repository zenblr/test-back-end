import { catchError, finalize } from 'rxjs/operators';
// RxJS
import { map } from 'rxjs/operators';
// CRUD
import { BaseDataSource } from '../../../_base/crud';
import { BehaviorSubject, of } from 'rxjs';
import { InternalUserBranchService } from '../services/internal-user-branch.service';

export class InternalUserBranchDatasource extends BaseDataSource {

    private loadingSubject = new BehaviorSubject<boolean>(false);
    private isPreloadTextViewedSubject = new BehaviorSubject<boolean>(true);

    public loading$ = this.loadingSubject.asObservable();
    public isPreloadTextViewed$ = this.isPreloadTextViewedSubject.asObservable();
    desserts: any;

    constructor(private internalUserBranchService: InternalUserBranchService) {
        super();
    }

    loadInternalBranch(search, from, to) {

        this.internalUserBranchService.getInternalBranch(search, from, to)
            .pipe(
                map(
                    branch => {
                        this.entitySubject.next(branch.data);
                        this.paginatorTotalSubject.next(branch.count);
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