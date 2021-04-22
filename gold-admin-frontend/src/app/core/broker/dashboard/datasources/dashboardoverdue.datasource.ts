import { catchError, finalize } from "rxjs/operators";
import { map } from "rxjs/operators";
import { BehaviorSubject, of } from "rxjs";
import { BaseDataSource } from "../../../_base/crud";
import { DashboardService } from "../services/dashboard.service";

export class DashboardOverDueDatasource extends BaseDataSource {
	private loadingSubject = new BehaviorSubject<boolean>(false);
	private isPreloadTextViewedSubject = new BehaviorSubject<boolean>(true);

	public loading$ = this.loadingSubject.asObservable();
	public isPreloadTextViewed$ = this.isPreloadTextViewedSubject.asObservable();

	constructor(private dashboardService: DashboardService) {
		super();
	}

	loadOverDueOrder(data) {
		this.loadingSubject.next(true);

		this.dashboardService
			.getAllOverDueOrders(data)
			.pipe(
				map((report) => {
					this.paginatorTotalSubject.next(report.count);
					this.entitySubject.next(report.data);
				}),
				catchError(() => of([])),
				finalize(() => {
					this.loadingSubject.next(false);
					this.isPreloadTextViewedSubject.next(false);
				})
			)
			.subscribe();
	}
}
