import { map, catchError, finalize } from 'rxjs/operators';
import { BaseDataSource } from '../../../../_base/crud';
import { BehaviorSubject, of } from 'rxjs';
import { PartReleaseFinalService } from '../services/part-release-final.service';

export class PartReleaseFinalDatasource extends BaseDataSource {

    private loadingSubject = new BehaviorSubject<boolean>(false);
    private isPreloadTextViewedSubject = new BehaviorSubject<boolean>(true);

    public loading$ = this.loadingSubject.asObservable();
    public isPreloadTextViewed$ = this.isPreloadTextViewedSubject.asObservable();

    constructor(private partReleaseFinalService: PartReleaseFinalService) {
        super();
    }

    getPartReleaseList(from, to, search) {
        this.loadingSubject.next(true);

        this.partReleaseFinalService.getPartReleaseList(from, to, search)
            .pipe(
                map(
                    report => {
                        this.paginatorTotalSubject.next(report.count);
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