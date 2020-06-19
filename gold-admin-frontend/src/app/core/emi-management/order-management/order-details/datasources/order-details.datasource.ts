import { catchError, finalize } from "rxjs/operators";
import { map } from "rxjs/operators";
import { BehaviorSubject, of } from "rxjs";
import { BaseDataSource } from "../../../../_base/crud";
import { OrderDetailsService } from "../../order-details/services/order-details.service";

export class OrderDetailsDatasource extends BaseDataSource {
	private loadingSubject = new BehaviorSubject<boolean>(false);
	private isPreloadTextViewedSubject = new BehaviorSubject<boolean>(true);

	public loading$ = this.loadingSubject.asObservable();
	public isPreloadTextViewed$ = this.isPreloadTextViewedSubject.asObservable();

	constructor(private orderDetailsService: OrderDetailsService) {
		super();
	}

	loadOrderDetails(data) {
		this.loadingSubject.next(true);

		this.orderDetailsService
			.getAllOrderDetails(data)
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
