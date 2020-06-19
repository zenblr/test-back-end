import { catchError, finalize } from 'rxjs/operators';
// RxJS
import { map } from 'rxjs/operators';
import { BaseDataSource } from '../../_base/crud';
import { BehaviorSubject, of } from 'rxjs';
import { EmailAlertService } from '../services/email-alert.service';

export class EmailAlertDatasource extends BaseDataSource {

    private loadingSubject = new BehaviorSubject<boolean>(false);
    private isPreloadTextViewedSubject = new BehaviorSubject<boolean>(true);

    public loading$ = this.loadingSubject.asObservable();
    public isPreloadTextViewed$ = this.isPreloadTextViewedSubject.asObservable();

    constructor(private emailAlertService: EmailAlertService) {
        super();
    }

    leads = [
        { id: 1, fullName: 'Nimap', customerId: '102321', mobile: '8989234617', pan: 'ABCDE1234F', state: 'MAHARASHTRA', city: 'mumbai', date: new Date(), time: '11.55', status: 'approve' },
        { id: 1, fullName: 'Nimap', customerId: '102321', mobile: '8989234617', pan: 'ABCDE1234F', state: 'MAHARASHTRA', city: 'mumbai', date: new Date(), time: '11.55', status: 'approve' },

        { id: 1, fullName: 'Nimap', customerId: '102321', mobile: '8989234617', pan: 'ABCDE1234F', state: 'MAHARASHTRA', city: 'mumbai', date: new Date(), time: '11.55', status: 'approve' },
        { id: 1, fullName: 'Nimap', customerId: '102321', mobile: '8989234617', pan: 'ABCDE1234F', state: 'MAHARASHTRA', city: 'mumbai', date: new Date(), time: '11.55', status: 'approve' },
        { id: 1, fullName: 'Nimap', customerId: '102321', mobile: '8989234617', pan: 'ABCDE1234F', state: 'MAHARASHTRA', city: 'mumbai', date: new Date(), time: '11.55', status: 'approve' },
        { id: 1, fullName: 'Nimap', customerId: '102321', mobile: '8989234617', pan: 'ABCDE1234F', state: 'MAHARASHTRA', city: 'mumbai', date: new Date(), time: '11.55', status: 'approve' },
        { id: 1, fullName: 'Nimap', customerId: '102321', mobile: '8989234617', pan: 'ABCDE1234F', state: 'MAHARASHTRA', city: 'mumbai', date: new Date(), time: '11.55', status: 'approve' },
        { id: 1, fullName: 'Nimap', customerId: '102321', mobile: '8989234617', pan: 'ABCDE1234F', state: 'MAHARASHTRA', city: 'mumbai', date: new Date(), time: '11.55', status: 'approve' },
        { id: 1, fullName: 'Nimap', customerId: '102321', mobile: '8989234617', pan: 'ABCDE1234F', state: 'MAHARASHTRA', city: 'mumbai', date: new Date(), time: '11.55', status: 'approve' },
        { id: 1, fullName: 'Nimap', customerId: '102321', mobile: '8989234617', pan: 'ABCDE1234F', state: 'MAHARASHTRA', city: 'mumbai', date: new Date(), time: '11.55', status: 'approve' },
    ];



    loadLeads(from, to, search, stageName) {
        this.loadingSubject.next(true);

        this.entitySubject.next(this.leads); // delete this

        // this.emailAlertService.getAllEmails(from, to, search, stageName)
        //     .pipe(
        //         map(
        //             report => {
        //                 this.paginatorTotalSubject.next(report.count);
        //                 this.entitySubject.next(report.data);
        //             }
        //         ),
        //         catchError(() => of([])),
        //         finalize(() => {
        //             this.loadingSubject.next(false);
        //             this.isPreloadTextViewedSubject.next(false);
        //         })
        //     )
        //     .subscribe();
    }

}