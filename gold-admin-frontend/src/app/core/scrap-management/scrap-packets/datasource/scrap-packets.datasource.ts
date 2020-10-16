import { catchError, finalize } from 'rxjs/operators';
import { map } from 'rxjs/operators';
import { BaseDataSource } from '../../../_base/crud';
import { BehaviorSubject, of } from 'rxjs';
import { ScrapPacketsService } from '../services/scrap-packets.service';

export class ScrapPacketsDatasource extends BaseDataSource {

    private loadingSubject = new BehaviorSubject<boolean>(false);
    private isPreloadTextViewedSubject = new BehaviorSubject<boolean>(true);

    public loading$ = this.loadingSubject.asObservable();
    public isPreloadTextViewed$ = this.isPreloadTextViewedSubject.asObservable();

    constructor(private scrapPacketsService: ScrapPacketsService) {
        super();
    }

    loadpackets(data) {
        this.loadingSubject.next(true);
        this.scrapPacketsService.getpackets(data)
            .pipe(
                map(
                    report => {
                        this.paginatorTotalSubject.next(report.count);
                        this.entitySubject.next(report.packetDetails);
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