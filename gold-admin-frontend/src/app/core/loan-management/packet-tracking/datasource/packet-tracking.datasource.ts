import { catchError, finalize } from 'rxjs/operators';
// RxJS
import { map } from 'rxjs/operators';
// CRUD
import { BaseDataSource } from '../../../_base/crud';
import { BehaviorSubject, of } from 'rxjs';
import { PacketTrackingService } from '../services/packet-tracking.service';

export class PacketTrackingDatasource extends BaseDataSource {

    private loadingSubject = new BehaviorSubject<boolean>(false);
    private isPreloadTextViewedSubject = new BehaviorSubject<boolean>(true);

    public loading$ = this.loadingSubject.asObservable();
    public isPreloadTextViewed$ = this.isPreloadTextViewedSubject.asObservable();

    public currentLocation = new BehaviorSubject<any>(null);
    public currentLocation$ = this.currentLocation.asObservable();

    constructor(private loanManagementService: PacketTrackingService) {
        super();
    }

    loadpackets(queryParamsData) {
        this.loadingSubject.next(true);
        this.loanManagementService.getpackets(queryParamsData)
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

    loadpacketsLog(masterLoanId, loanId, from, to) {
        this.loadingSubject.next(true);
        this.loanManagementService.getPacketLog(masterLoanId, loanId, from, to)
            .pipe(
                map(
                    report => {
                        this.paginatorTotalSubject.next(report.count);
                        this.entitySubject.next(report.data);
                        this.currentLocation.next(report.lastLocation)
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