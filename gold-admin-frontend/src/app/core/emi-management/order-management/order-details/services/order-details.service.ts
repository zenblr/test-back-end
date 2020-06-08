import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { map, tap, catchError } from "rxjs/operators";
import { ExcelService, PdfService } from "../../../../_base/crud";
import { API_ENDPOINT } from '../../../../../app.constant';

@Injectable({
	providedIn: "root",
})
export class OrderDetailsService {
	exportExcel = new BehaviorSubject<any>(false);
	exportExcel$ = this.exportExcel.asObservable();

	applyFilter = new BehaviorSubject<any>({});
	applyFilter$ = this.applyFilter.asObservable();

	dropdownValue = new BehaviorSubject<any>({});
	dropdownValue$ = this.dropdownValue.asObservable();

	buttonValue = new BehaviorSubject<any>({});
	buttonValue$ = this.buttonValue.asObservable();

	button = new BehaviorSubject<any>(0);
	button$ = this.button.asObservable();

	constructor(
		private http: HttpClient,
		private excelService: ExcelService,
		private pdfService: PdfService
	) { }

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
		return this.http.get<any>(API_ENDPOINT + `api/order`, {
			params: reqParams,
		});
	}

	getOrderTrackingLog(id): Observable<any> {
		return this.http.get<any>(
			API_ENDPOINT + `api/order/order-tracking-log/${id}`
		);
	}

	getOrderDetails(id): Observable<any> {
		return this.http.get<any>(
			API_ENDPOINT + `api/order/details/${id}`
		);
	}

	getOrderLogistic(): Observable<any> {
		return this.http.get<any>(
			API_ENDPOINT + `api/order/logistic`
		);
	}

	editOrderStatus(data, id): Observable<any> {
		return this.http.put<any>(
			API_ENDPOINT + `api/order/order-status/${id}`,
			data
		);
	}

	reportExport(): Observable<any> {
		return this.http
			.get(API_ENDPOINT + `api/order/order-report`, {
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

	getProforma(id): Observable<any> {
		return this.http
			.get(
				API_ENDPOINT + `api/order/order-proforma-invoice/${id}`,
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
							"Proforma_" + Date.now()
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
			.get(API_ENDPOINT + `api/order/order-contract/${id}`, {
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

	getLabel(params): Observable<any> {
		return this.http
			.post("http://173.249.49.7:9120/api/order/label", params, {
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
							"Label_" + Date.now()
						);
					},
					(error) => console.log(error)
				),
				catchError((err) => {
					return null;
				})
			);
	}

	getMainfest(params): Observable<any> {
		return this.http
			.post("http://173.249.49.7:9120/api/mainfest", params, {
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
							"Manifest_" + Date.now()
						);
					},
					(error) => console.log(error)
				),
				catchError((err) => {
					return null;
				})
			);
	}

	getDeliMainfest(params): Observable<any> {
		return this.http
			.post(
				"http://173.249.49.7:9120/api/mainfest/deli-mainfest",
				params,
				{
					responseType: "arraybuffer",
				}
			)
			.pipe(
				map((res) => {
					return res;
				}),
				tap(
					(data) => {
						this.excelService.saveAsExcelFile(
							data,
							"DeliManifest_" + Date.now()
						);
					},
					(error) => console.log(error)
				),
				catchError((err) => {
					return null;
				})
			);
	}

	getUninsuredMainfest(params): Observable<any> {
		return this.http
			.post(
				"http://173.249.49.7:9120/api/mainfest/uninsured-mainfest",
				params,
				{
					responseType: "arraybuffer",
				}
			)
			.pipe(
				map((res) => {
					return res;
				}),
				tap(
					(data) => {
						this.excelService.saveAsExcelFile(
							data,
							"UninsuredManifest_" + Date.now()
						);
					},
					(error) => console.log(error)
				),
				catchError((err) => {
					return null;
				})
			);
	}

	getCancelOrderPrice(orderId): Observable<any> {
		return this.http.get(API_ENDPOINT + 'api/cancel-order/admin-cancel-order-price/' + orderId)
	}

	updateCancelOrder(id, data): Observable<any> {
		return this.http.put(API_ENDPOINT + 'api/cancel-order/admin-cancel-order/' + id, data)
	}
}
