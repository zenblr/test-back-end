import { catchError, finalize } from 'rxjs/operators';
// RxJS
import { map } from 'rxjs/operators';
// CRUD
import { BaseDataSource } from '../../_base/crud';
import { BehaviorSubject, of } from 'rxjs';
import { SMSAlertService } from '../services/sms-alert.service';

export class SmsAlertDatasource extends BaseDataSource {

    private loadingSubject = new BehaviorSubject<boolean>(false);
    private isPreloadTextViewedSubject = new BehaviorSubject<boolean>(true);

    public loading$ = this.loadingSubject.asObservable();
    public isPreloadTextViewed$ = this.isPreloadTextViewedSubject.asObservable();

    constructor(private smsAlertService: SMSAlertService) {
        super();
    }

    // leads = [
    //     { id: 1, fullName: 'Nimap', customerId: '102321', mobile: '8989234617', pan: 'ABCDE1234F', state: 'MAHARASHTRA', city: 'mumbai', date: new Date(), time: '11.55', status: 'approve' },
    //     { id: 1, fullName: 'Nimap', customerId: '102321', mobile: '8989234617', pan: 'ABCDE1234F', state: 'MAHARASHTRA', city: 'mumbai', date: new Date(), time: '11.55', status: 'approve' },
    //     { id: 1, fullName: 'Nimap', customerId: '102321', mobile: '8989234617', pan: 'ABCDE1234F', state: 'MAHARASHTRA', city: 'mumbai', date: new Date(), time: '11.55', status: 'approve' },
    //     { id: 1, fullName: 'Nimap', customerId: '102321', mobile: '8989234617', pan: 'ABCDE1234F', state: 'MAHARASHTRA', city: 'mumbai', date: new Date(), time: '11.55', status: 'approve' },
    //     { id: 1, fullName: 'Nimap', customerId: '102321', mobile: '8989234617', pan: 'ABCDE1234F', state: 'MAHARASHTRA', city: 'mumbai', date: new Date(), time: '11.55', status: 'approve' },
    //     { id: 1, fullName: 'Nimap', customerId: '102321', mobile: '8989234617', pan: 'ABCDE1234F', state: 'MAHARASHTRA', city: 'mumbai', date: new Date(), time: '11.55', status: 'approve' },
    //     { id: 1, fullName: 'Nimap', customerId: '102321', mobile: '8989234617', pan: 'ABCDE1234F', state: 'MAHARASHTRA', city: 'mumbai', date: new Date(), time: '11.55', status: 'approve' },
    //     { id: 1, fullName: 'Nimap', customerId: '102321', mobile: '8989234617', pan: 'ABCDE1234F', state: 'MAHARASHTRA', city: 'mumbai', date: new Date(), time: '11.55', status: 'approve' },
    //     { id: 1, fullName: 'Nimap', customerId: '102321', mobile: '8989234617', pan: 'ABCDE1234F', state: 'MAHARASHTRA', city: 'mumbai', date: new Date(), time: '11.55', status: 'approve' },
    //     { id: 1, fullName: 'Nimap', customerId: '102321', mobile: '8989234617', pan: 'ABCDE1234F', state: 'MAHARASHTRA', city: 'mumbai', date: new Date(), time: '11.55', status: 'approve' },
    //     { id: 1, fullName: 'Nimap', customerId: '102321', mobile: '8989234617', pan: 'ABCDE1234F', state: 'MAHARASHTRA', city: 'mumbai', date: new Date(), time: '11.55', status: 'approve' },
    // ];

    loadAllSMSlert(from, to, search) {
        this.loadingSubject.next(true);

        this.smsAlertService.getAllSMSAlert(from, to, search)
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