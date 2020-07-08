import { map, catchError, finalize } from 'rxjs/operators';
import { BaseDataSource } from '../../../_base/crud';
import { BehaviorSubject, of } from 'rxjs';
import { OccupationService } from '../services/occupation.service';

export class OccupationDatasource extends BaseDataSource {

    private loadingSubject = new BehaviorSubject<boolean>(false);
    private isPreloadTextViewedSubject = new BehaviorSubject<boolean>(true);

    public loading$ = this.loadingSubject.asObservable();
    public isPreloadTextViewed$ = this.isPreloadTextViewedSubject.asObservable();

    constructor(private occupationService: OccupationService) {
        super();
    }

    getOccupations(from, to, search) {
        this.loadingSubject.next(true);

        this.occupationService.getOccupations(from, to, search)
            .pipe(
                map(
                    report => {
                        // this.paginatorTotalSubject.next(report.count);
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