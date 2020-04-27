import { catchError, finalize } from 'rxjs/operators';
// RxJS
import { map } from 'rxjs/operators';
// CRUD
import { BaseDataSource } from '../../../_base/crud';
import { BehaviorSubject, of } from 'rxjs';
import { AppraiserService } from '../services/appraiser.service';

export class AppraiserDatasource extends BaseDataSource {

    private loadingSubject = new BehaviorSubject<boolean>(false);
    private isPreloadTextViewedSubject = new BehaviorSubject<boolean>(true);

    public loading$ = this.loadingSubject.asObservable();
    public isPreloadTextViewed$ = this.isPreloadTextViewedSubject.asObservable();

    constructor(private appraiserService: AppraiserService) {
        super();
    }

    loadBranches(from, to, search) {
        this.loadingSubject.next(true);
        let data: any = [
            { 'customerId': '655656g', 'customerName': 'Nimap' },
            { 'customerId': '655656g', 'customerName': 'Nimap' },
            { 'customerId': '655656g', 'customerName': 'Nimap' },
            { 'customerId': '655656g', 'customerName': 'Nimap' },
            { 'customerId': '655656g', 'customerName': 'Nimap' },
            { 'customerId': '655656g', 'customerName': 'Nimap' },
            { 'customerId': '655656g', 'customerName': 'Nimap' },
            { 'customerId': '655656g', 'customerName': 'Nimap' },
            { 'customerId': '655656g', 'customerName': 'Nimap' },
            { 'customerId': '655656g', 'customerName': 'Nimap' },
        ]
        this.paginatorTotalSubject.next(10);
        this.entitySubject.next(data);
        this.loadingSubject.next(false);
        this.isPreloadTextViewedSubject.next(false);
        //     this.appraiserService.getAppraiser(from, to, search)
        //         .pipe(
        //             map(
        //                 report => {
        //                     this.paginatorTotalSubject.next(report.count);
        //                     this.entitySubject.next(report.data);
        //                 }
        //             ),
        //             catchError(() => of([])),
        //             finalize(() => {
        //                 this.loadingSubject.next(false);
        //                 this.isPreloadTextViewedSubject.next(false);
        //             })
        //         )
        //         .subscribe();
    }

}