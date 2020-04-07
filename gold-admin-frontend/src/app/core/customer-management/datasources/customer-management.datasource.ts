import { catchError, finalize } from 'rxjs/operators';
// RxJS
import { map } from 'rxjs/operators';
// CRUD
import { BaseDataSource } from '../../_base/crud';
import { BehaviorSubject, of } from 'rxjs';
import { CustomerManagementService } from '../services/customer-management.service';

export class CustomerManagementDatasource extends BaseDataSource {

    private loadingSubject = new BehaviorSubject<boolean>(false);
    private isPreloadTextViewedSubject = new BehaviorSubject<boolean>(true);

    public loading$ = this.loadingSubject.asObservable();
    public isPreloadTextViewed$ = this.isPreloadTextViewedSubject.asObservable();

    constructor(private customerManagementService: CustomerManagementService) {
        super();
    }

    leads = [
        { fullName: 'Nimap', customerId: '102321', mobile: '8989234617', pan: 'ABCDE1234F', state: 'MAHARASHTRA', city: 'mumbai', date: new Date(), time: '11.55', status: 'approve' },
        { fullName: 'Nimap', customerId: '102321', mobile: '8989234617', pan: 'ABCDE1234F', state: 'MAHARASHTRA', city: 'mumbai', date: new Date(), time: '11.55', status: 'approve' },

        { fullName: 'Nimap', customerId: '102321', mobile: '8989234617', pan: 'ABCDE1234F', state: 'MAHARASHTRA', city: 'mumbai', date: new Date(), time: '11.55', status: 'approve' },
        { fullName: 'Nimap', customerId: '102321', mobile: '8989234617', pan: 'ABCDE1234F', state: 'MAHARASHTRA', city: 'mumbai', date: new Date(), time: '11.55', status: 'approve' },
        { fullName: 'Nimap', customerId: '102321', mobile: '8989234617', pan: 'ABCDE1234F', state: 'MAHARASHTRA', city: 'mumbai', date: new Date(), time: '11.55', status: 'approve' },
        { fullName: 'Nimap', customerId: '102321', mobile: '8989234617', pan: 'ABCDE1234F', state: 'MAHARASHTRA', city: 'mumbai', date: new Date(), time: '11.55', status: 'approve' },
        { fullName: 'Nimap', customerId: '102321', mobile: '8989234617', pan: 'ABCDE1234F', state: 'MAHARASHTRA', city: 'mumbai', date: new Date(), time: '11.55', status: 'approve' },
        { fullName: 'Nimap', customerId: '102321', mobile: '8989234617', pan: 'ABCDE1234F', state: 'MAHARASHTRA', city: 'mumbai', date: new Date(), time: '11.55', status: 'approve' },
        { fullName: 'Nimap', customerId: '102321', mobile: '8989234617', pan: 'ABCDE1234F', state: 'MAHARASHTRA', city: 'mumbai', date: new Date(), time: '11.55', status: 'approve' },
        { fullName: 'Nimap', customerId: '102321', mobile: '8989234617', pan: 'ABCDE1234F', state: 'MAHARASHTRA', city: 'mumbai', date: new Date(), time: '11.55', status: 'approve' },
        { fullName: 'Nimap', customerId: '102321', mobile: '8989234617', pan: 'ABCDE1234F', state: 'MAHARASHTRA', city: 'mumbai', date: new Date(), time: '11.55', status: 'approve' },
        { fullName: 'Nimap', customerId: '102321', mobile: '8989234617', pan: 'ABCDE1234F', state: 'MAHARASHTRA', city: 'mumbai', date: new Date(), time: '11.55', status: 'approve' },
        { fullName: 'Nimap', customerId: '102321', mobile: '8989234617', pan: 'ABCDE1234F', state: 'MAHARASHTRA', city: 'mumbai', date: new Date(), time: '11.55', status: 'approve' },
        { fullName: 'Nimap', customerId: '102321', mobile: '8989234617', pan: 'ABCDE1234F', state: 'MAHARASHTRA', city: 'mumbai', date: new Date(), time: '11.55', status: 'approve' },
        { fullName: 'Nimap', customerId: '102321', mobile: '8989234617', pan: 'ABCDE1234F', state: 'MAHARASHTRA', city: 'mumbai', date: new Date(), time: '11.55', status: 'approve' },
        { fullName: 'Nimap', customerId: '102321', mobile: '8989234617', pan: 'ABCDE1234F', state: 'MAHARASHTRA', city: 'mumbai', date: new Date(), time: '11.55', status: 'approve' },
        { fullName: 'Nimap', customerId: '102321', mobile: '8989234617', pan: 'ABCDE1234F', state: 'MAHARASHTRA', city: 'mumbai', date: new Date(), time: '11.55', status: 'approve' },
        { fullName: 'Nimap', customerId: '102321', mobile: '8989234617', pan: 'ABCDE1234F', state: 'MAHARASHTRA', city: 'mumbai', date: new Date(), time: '11.55', status: 'approve' },
        { fullName: 'Nimap', customerId: '102321', mobile: '8989234617', pan: 'ABCDE1234F', state: 'MAHARASHTRA', city: 'mumbai', date: new Date(), time: '11.55', status: 'approve' },
        { fullName: 'Nimap', customerId: '102321', mobile: '8989234617', pan: 'ABCDE1234F', state: 'MAHARASHTRA', city: 'mumbai', date: new Date(), time: '11.55', status: 'approve' },
        { fullName: 'Nimap', customerId: '102321', mobile: '8989234617', pan: 'ABCDE1234F', state: 'MAHARASHTRA', city: 'mumbai', date: new Date(), time: '11.55', status: 'approve' },
        { fullName: 'Nimap', customerId: '102321', mobile: '8989234617', pan: 'ABCDE1234F', state: 'MAHARASHTRA', city: 'mumbai', date: new Date(), time: '11.55', status: 'approve' },
        { fullName: 'Nimap', customerId: '102321', mobile: '8989234617', pan: 'ABCDE1234F', state: 'MAHARASHTRA', city: 'mumbai', date: new Date(), time: '11.55', status: 'approve' },
        { fullName: 'Nimap', customerId: '102321', mobile: '8989234617', pan: 'ABCDE1234F', state: 'MAHARASHTRA', city: 'mumbai', date: new Date(), time: '11.55', status: 'approve' },
        { fullName: 'Nimap', customerId: '102321', mobile: '8989234617', pan: 'ABCDE1234F', state: 'MAHARASHTRA', city: 'mumbai', date: new Date(), time: '11.55', status: 'approve' },
        { fullName: 'Nimap', customerId: '102321', mobile: '8989234617', pan: 'ABCDE1234F', state: 'MAHARASHTRA', city: 'mumbai', date: new Date(), time: '11.55', status: 'approve' },
        { fullName: 'Nimap', customerId: '102321', mobile: '8989234617', pan: 'ABCDE1234F', state: 'MAHARASHTRA', city: 'mumbai', date: new Date(), time: '11.55', status: 'approve' },
        { fullName: 'Nimap', customerId: '102321', mobile: '8989234617', pan: 'ABCDE1234F', state: 'MAHARASHTRA', city: 'mumbai', date: new Date(), time: '11.55', status: 'approve' },
        { fullName: 'Nimap', customerId: '102321', mobile: '8989234617', pan: 'ABCDE1234F', state: 'MAHARASHTRA', city: 'mumbai', date: new Date(), time: '11.55', status: 'approve' },
        { fullName: 'Nimap', customerId: '102321', mobile: '8989234617', pan: 'ABCDE1234F', state: 'MAHARASHTRA', city: 'mumbai', date: new Date(), time: '11.55', status: 'approve' },
        { fullName: 'Nimap', customerId: '102321', mobile: '8989234617', pan: 'ABCDE1234F', state: 'MAHARASHTRA', city: 'mumbai', date: new Date(), time: '11.55', status: 'approve' },
        { fullName: 'Nimap', customerId: '102321', mobile: '8989234617', pan: 'ABCDE1234F', state: 'MAHARASHTRA', city: 'mumbai', date: new Date(), time: '11.55', status: 'approve' },


    ];



    loadLeads(from, to, fromDate, search, toDate, userId) {
        this.loadingSubject.next(true);

        this.entitySubject.next(this.leads); // delete this

        // this.customerManagementService.getAllLeads(from, to, fromDate, search, toDate, userId)
        //     .pipe(
        //         map(
        //             report => {
        //                 // this.paginatorTotalSubject.next(report['length']);
        //                 // this.entitySubject.next(report);
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