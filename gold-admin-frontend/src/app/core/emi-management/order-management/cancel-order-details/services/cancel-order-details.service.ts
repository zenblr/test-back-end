import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { map, tap, catchError } from "rxjs/operators";
import { ExcelService } from "../../../../_base/crud/services/excel.service";
import { PdfService } from "../../../../_base/crud/services/pdf.service";
import { API_ENDPOINT } from "../../../../../app.constant";
@Injectable({
	providedIn: "root",
})
export class CancelOrderDetailsService {
	exportExcel = new BehaviorSubject<any>(false);
	exportExcel$ = this.exportExcel.asObservable();

	applyFilter = new BehaviorSubject<any>({});
	applyFilter$ = this.applyFilter.asObservable();

	constructor(
		private http: HttpClient,
		private excelService: ExcelService,
		private pdfService: PdfService
	) { }

	getAllCancelOrderDetails(event?: any): Observable<any> {
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
		if (event && event.cancelDate) {
			reqParams.cancelDate = event.cancelDate;
		}
		if (event && event.merchantName) {
			reqParams.merchantName = event.merchantName;
		}
		return this.http.get<any>(API_ENDPOINT + `api/cancel-order`, {
			params: reqParams,
		});
	}

	reportExport(event?: any): Observable<any> {
		const reqParams: any = {};
		if (event && event.cancelDate) {
			reqParams.cancelDate = event.cancelDate;
		}
		if (event && event.merchantName) {
			reqParams.merchantId = event.merchantName;
		}
		return this.http
			.get(
				API_ENDPOINT + `api/cancel-order/cancel-order-report`,
				{ responseType: "arraybuffer", params: reqParams, }
			)
			.pipe(
				map((res) => {
					return res;
				}),
				tap(
					(data) => {
						this.excelService.saveAsExcelFile(
							data,
							"CancelOrderReport_" + Date.now()
						);
					},
					(error) => console.log(error)
				),
				catchError((err) => {
					return null;
				})
			);
	}

	getReceipt(id): Observable<any> {
		return this.http
			.get(
				API_ENDPOINT + `api/cancel-order/cancel-receipt/${id}`,
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
							"CancellationReceipt_" + Date.now()
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
