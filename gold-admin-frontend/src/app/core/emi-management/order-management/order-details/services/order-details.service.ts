import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { map, tap, catchError } from "rxjs/operators";
import { ExcelService, PdfService } from "../../../../_base/crud";

@Injectable({
	providedIn: "root",
})
export class OrderDetailsService {
	exportExcel = new BehaviorSubject<any>(false);
	exportExcel$ = this.exportExcel.asObservable();

	applyFilter = new BehaviorSubject<any>({});
	applyFilter$ = this.applyFilter.asObservable();

	buttonValue = new BehaviorSubject<any>({});
	buttonValue$ = this.buttonValue.asObservable();

	button = new BehaviorSubject<any>({});
	button$ = this.button.asObservable();

	constructor(
		private http: HttpClient,
		private excelService: ExcelService,
		private pdfService: PdfService
	) {}

	getAllOrderDetails(event?: any): Observable<any> {
		const reqParams: any = {};
		if (event && event.from) {
			reqParams.from = event.from;
		}
		if (event && event.to) {
			reqParams.to = event.to;
		}
		if (event && event.search) {
			reqParams.search = event.search;
		}
		if (event && event.weight) {
			reqParams.weight = event.weight;
		}
		if (event && event.paymentType) {
			reqParams.paymentType = event.paymentType;
		}
		if (event && event.orderCurrentStatus) {
			reqParams.orderCurrentStatus = event.orderCurrentStatus;
		}
		return this.http.get<any>(`http://173.249.49.7:9120/api/order`, {
			params: reqParams,
		});
	}

	getOrderTrackingLog(id): Observable<any> {
		return this.http.get<any>(
			`http://173.249.49.7:9120/api/order/order-tracking-log/${id}`
		);
	}

	getOrderDetails(id): Observable<any> {
		return this.http.get<any>(
			`http://173.249.49.7:9120/api/order/details/${id}`
		);
	}

	getOrderLogistic(): Observable<any> {
		return this.http.get<any>(
			`http://173.249.49.7:9120/api/order/logistic`
		);
	}

	editOrderStatus(data, id): Observable<any> {
		return this.http.put<any>(
			`http://173.249.49.7:9120/api/order/order-status/${id}`,
			data
		);
	}

	reportExport(): Observable<any> {
		return this.http
			.get(`http://173.249.49.7:9120/api/order/order-report`, {
				responseType: "arraybuffer",
			})
			.pipe(
				map((res) => {
					return res;
				}),
				tap(
					(data) => {
						this.excelService.saveAsExcelFile(
							data,
							"OrderReport_" + Date.now()
						);
					},
					(error) => console.log(error)
				),
				catchError((err) => {
					return null;
				})
			);
	}

	getPerforma(id): Observable<any> {
		return this.http
			.get(
				`http://173.249.49.7:9120/api/order/order-proforma-invoice/${id}`,
				{ responseType: "arraybuffer" }
			)
			.pipe(
				map((res) => {
					return res;
				}),
				tap(
					(data) => {
						this.pdfService.saveAsPdfFile(
							data,
							"Performa_" + Date.now()
						);
					},
					(error) => console.log(error)
				),
				catchError((err) => {
					return null;
				})
			);
	}

	getContract(id): Observable<any> {
		return this.http
			.get(`http://173.249.49.7:9120/api/order/order-contract/${id}`, {
				responseType: "arraybuffer",
			})
			.pipe(
				map((res) => {
					return res;
				}),
				tap(
					(data) => {
						this.pdfService.saveAsPdfFile(
							data,
							"Contract_" + Date.now()
						);
					},
					(error) => console.log(error)
				),
				catchError((err) => {
					return null;
				})
			);
	}
}
