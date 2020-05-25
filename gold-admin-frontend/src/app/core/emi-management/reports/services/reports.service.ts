import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { map, tap, catchError } from "rxjs/operators";
import { ExcelService } from "../../../_base/crud/services/excel.service";

@Injectable({
	providedIn: "root",
})
export class ReportsService {
	constructor(private http: HttpClient, private excelService: ExcelService) {}

	getUserReport(event?: any): Observable<any> {
		return this.http
			.get(
				`http://173.249.49.7:9120/api/customer/customer-by-merchant-id/` +
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
						this.excelService.saveAsExcelFile(data, "User Report");
					},
					(error) => console.log(error)
				)
			);
	}

	getDepositReport(event?: any): Observable<any> {
		return this.http
			.get(
				`http://173.249.49.7:9120/api/deposit-details/merchant-deposit-report/` +
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
							"DepositReport"
						);
					},
					(error) => console.log(error)
				)
			);
	}

	getEmiReport(event?: any): Observable<any> {
		return this.http
			.get(
				`http://173.249.49.7:9120/api/emi-details/emi-report-by-merchant/` +
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
						this.excelService.saveAsExcelFile(data, "EMI Report");
					},
					(error) => console.log(error)
				)
			);
	}
	getOrderReport(event?: any): Observable<any> {
		return this.http
			.get(
				`http://173.249.49.7:9120/api/order/order-report-by-merchant/` +
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
						this.excelService.saveAsExcelFile(data, "Order Report");
					},
					(error) => console.log(error)
				)
			);
	}
	getCancelReport(event?: any): Observable<any> {
		return this.http
			.get(
				`http://173.249.49.7:9120/api/cancel-order/cancel-report-by-Merchantid/` +
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
							"Order Cancel Report"
						);
					},
					(error) => console.log(error)
				)
			);
	}
	getProductReport(event?: any): Observable<any> {
		return this.http
			.get(
				`http://173.249.49.7:9120/api/products/merchant-product-price-report`,
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
							"Product Report"
						);
					},
					(error) => console.log(error)
				)
			);
	}
}
