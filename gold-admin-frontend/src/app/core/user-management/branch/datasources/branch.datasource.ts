import { catchError, finalize } from 'rxjs/operators';
// RxJS
import { map } from 'rxjs/operators';
// CRUD
import { BaseDataSource } from '../../../_base/crud';
import { BehaviorSubject, of } from 'rxjs';
import { BranchService } from '../services/branch.service';

export class BranchDatasource extends BaseDataSource {

    private loadingSubject = new BehaviorSubject<boolean>(false);
    private isPreloadTextViewedSubject = new BehaviorSubject<boolean>(true);

    public loading$ = this.loadingSubject.asObservable();
    public isPreloadTextViewed$ = this.isPreloadTextViewedSubject.asObservable();

    constructor(private branchService: BranchService) {
        super();
    }

    loadBranches(from, to, fromDate, search, toDate, userId) {
        this.loadingSubject.next(true);

        this.branchService.getAllBranch(from, to, fromDate, search, toDate, userId)
            .pipe(
                map(
                    report => {
                        this.paginatorTotalSubject.next(report['length']);
                        this.entitySubject.next(report);
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