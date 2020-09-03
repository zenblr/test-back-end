import { catchError, finalize } from 'rxjs/operators';
// RxJS
import { map } from 'rxjs/operators';
// CRUD
import { BaseDataSource } from '../../../../_base/crud';
import { BehaviorSubject, of } from 'rxjs';
import { LocationService } from '../services/location.service';
import { GlobalMapService } from '../../../../../core/global-map/global-map.service';

export class LocationDatasource extends BaseDataSource {

    private loadingSubject = new BehaviorSubject<boolean>(false);
    private isPreloadTextViewedSubject = new BehaviorSubject<boolean>(true);

    public loading$ = this.loadingSubject.asObservable();
    public isPreloadTextViewed$ = this.isPreloadTextViewedSubject.asObservable();

    constructor(
        private locationService: LocationService,
        private globalMapService:GlobalMapService) {
        super();
    }

    loadpacketsLocation(queryParams) {
        if(queryParams.fromWhere == 'globalMap'){
            this.loadingSubject.next(true);
        this.locationService.globalMapLocation(queryParams)
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
        }else{
            this.loadingSubject.next(true);
            this.locationService.getLocation(queryParams)
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
}