import { catchError, finalize } from 'rxjs/operators';
// RxJS
import { map } from 'rxjs/operators';
// CRUD
import { BaseDataSource } from '../../../_base/crud';
import { BehaviorSubject, of } from 'rxjs';
import { RolesService } from '../services/roles.service';

export class RolesDatasource extends BaseDataSource {

    private loadingSubject = new BehaviorSubject<boolean>(false);
    private isPreloadTextViewedSubject = new BehaviorSubject<boolean>(true);

    public loading$ = this.loadingSubject.asObservable();
    public isPreloadTextViewed$ = this.isPreloadTextViewedSubject.asObservable();
    desserts: any;

    constructor(private rolesService: RolesService) {
        super();
    }

    loadRoles(search, from, to, fromDate, toDate, userId) {
        this.loadingSubject.next(true);
        this.desserts = [
            { name: 'Frozen yogurt', calories: 159, fat: 6, carbs: 24, protein: 4,id:1 },
            { name: 'Ice cream sandwich', calories: 237, fat: 9, carbs: 37, protein: 4,id:2 },
            { name: 'Eclair', calories: 262, fat: 16, carbs: 24, protein: 6,id:3 },
            { name: 'Cupcake', calories: 305, fat: 4, carbs: 67, protein: 4,id:2 },
            { name: 'Gingerbread', calories: 356, fat: 16, carbs: 49, protein: 4 ,id:1},
        ]


        this.entitySubject.next(this.desserts);
        this.paginatorTotalSubject.next(10);
        this.loadingSubject.next(false);
        this.isPreloadTextViewedSubject.next(false);

        // this.rolesService.getRoles(search, from, to, fromDate, toDate, userId)
        //     .pipe(
        //         map(
        //             report => {
        //                 this.entitySubject.next(this.desserts);
        //                 this.paginatorTotalSubject.next(10);
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