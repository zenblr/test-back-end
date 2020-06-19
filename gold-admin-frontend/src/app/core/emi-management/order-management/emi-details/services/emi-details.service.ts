import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { map, tap, catchError } from "rxjs/operators";
import { ExcelService, PdfService } from "../../../../_base/crud";
import { API_ENDPOINT } from "../../../../../app.constant";
@Injectable({
	providedIn: "root",
})
export class EmiDetailsService {
	exportExcel = new BehaviorSubject<any>(false);
	exportExcel$ = this.exportExcel.asObservable();

	applyFilter = new BehaviorSubject<any>({});
	applyFilter$ = this.applyFilter.asObservable();

	constructor(
		private http: HttpClient,
		private excelService: ExcelService,
		private pdfService: PdfService
	) { }

	getAllEmiDetails(event?: any): Observable<any> {
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
		if (event && event.orderemistatus) {
			reqParams.orderemistatus = event.orderemistatus;
		}
		return this.http.get<any>(API_ENDPOINT + `api/emi-details`, {
			params: reqParams,
		});
	}

	getEmiDetails(id): Observable<any> {
		return this.http
			.get(API_ENDPOINT + `api/emi-details/${id}`);
	}

	reportExport(event?: any): Observable<any> {
		const reqParams: any = {};
		if (event && event.orderemistatus) {
			reqParams.orderemistatus = event.orderemistatus;
		}
		return this.http
			.get(API_ENDPOINT + `api/emi-details/emi-report`, {
				responseType: "arraybuffer", params: reqParams,
			})
			.pipe(
				map((res) => {
					return res;
				}),
				tap(
					(data) => {
						this.excelService.saveAsExcelFile(
							data,
							"EMIReport_" + Date.now()
						);
					},
					(error) => console.log(error)
				),
				catchError((err) => {
					return null;
				})
			);
	}

	emiReceipt(id): Observable<any> {
		return this.http
			.get(API_ENDPOINT + `api/order/emi-receipt/${id}`, {
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
							"EMIReceipt_" + Date.now()
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
