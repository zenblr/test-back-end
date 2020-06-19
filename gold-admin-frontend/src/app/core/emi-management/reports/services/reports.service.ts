import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { map, tap, catchError } from "rxjs/operators";
import { ExcelService } from "../../../_base/crud/services/excel.service";
import { API_ENDPOINT } from '../../../../app.constant';

@Injectable({
	providedIn: "root",
})
export class ReportsService {
	constructor(private http: HttpClient, private excelService: ExcelService) { }

	getUserReport(event?: any): Observable<any> {
		return this.http
			.get(
				API_ENDPOINT + `api/customer/customer-by-merchant-id/` +
				event.merchantId +
				"/" +
				event.startDate +
				"/" +
				event.endDate,
				{ responseType: "arraybuffer" }
			)
			.pipe(
				map((res) => {
					return res;
				}),
				tap(
					(data) => {
						this.excelService.saveAsExcelFile(data, "UserReport_" + Date.now());
					},
					(error) => console.log(error)
				)
			);
	}

	getDepositReport(event?: any): Observable<any> {
		return this.http
			.get(
				API_ENDPOINT + `api/deposit-details/merchant-deposit-report/` +
				event.merchantId +
				"/" +
				event.startDate +
				"/" +
				event.endDate,
				{ responseType: "arraybuffer" }
			)
			.pipe(
				map((res) => {
					return res;
				}),
				tap(
					(data) => {
						this.excelService.saveAsExcelFile(
							data,
							"DepositReport_" + Date.now());
					},
					(error) => console.log(error)
				)
			);
	}

	getEmiReport(event?: any): Observable<any> {
		return this.http
			.get(
				API_ENDPOINT + `api/emi-details/emi-report-by-merchant/` +
				event.merchantId +
				"/" +
				event.startDate +
				"/" +
				event.endDate,
				{ responseType: "arraybuffer" }
			)
			.pipe(
				map((res) => {
					return res;
				}),
				tap(
					(data) => {
						this.excelService.saveAsExcelFile(data, "EMIReport_" + Date.now());
					},
					(error) => console.log(error)
				)
			);
	}
	getOrderReport(event?: any): Observable<any> {
		return this.http
			.get(
				API_ENDPOINT + `api/order/order-report-by-merchant/` +
				event.merchantId +
				"/" +
				event.statusId +
				"/" +
				event.startDate +
				"/" +
				event.endDate,
				{ responseType: "arraybuffer" }
			)
			.pipe(
				map((res) => {
					return res;
				}),
				tap(
					(data) => {
						this.excelService.saveAsExcelFile(data, "OrderReport_" + Date.now());
					},
					(error) => console.log(error)
				)
			);
	}
	getCancelReport(event?: any): Observable<any> {
		return this.http
			.get(
				API_ENDPOINT + `api/cancel-order/cancel-report-by-Merchantid/` +
				event.merchantId +
				"/" +
				event.startDate +
				"/" +
				event.endDate,
				{ responseType: "arraybuffer" }
			)
			.pipe(
				map((res) => {
					return res;
				}),
				tap(
					(data) => {
						this.excelService.saveAsExcelFile(
							data,
							"OrderCancelReport_" + Date.now());
					},
					(error) => console.log(error)
				)
			);
	}
	getProductReport(event?: any): Observable<any> {
		return this.http
			.get(
				API_ENDPOINT + `api/products/get-product-report`,
				{ responseType: "arraybuffer" }
			)
			.pipe(
				map((res) => {
					return res;
				}),
				tap(
					(data) => {
						this.excelService.saveAsExcelFile(
							data,
							"ProductReport_" + Date.now());
					},
					(error) => console.log(error)
				)
			);
	}
	getFranchiseReport(event?: any): Observable<any> {
		return this.http
			.get(
				API_ENDPOINT + `api/store/franchise-report/` +
				event.startDate +
				"/" +
				event.endDate,
				{ responseType: "arraybuffer" }
			)
			.pipe(
				map((res) => {
					return res;
				}),
				tap(
					(data) => {
						this.excelService.saveAsExcelFile(
							data,
							"FranchiseReport_" + Date.now());
					},
					(error) => console.log(error)
				)
			);
	}
}
