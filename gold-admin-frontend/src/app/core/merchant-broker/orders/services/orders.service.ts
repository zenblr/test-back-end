import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { map, tap, catchError } from "rxjs/operators";
import { ExcelService, PdfService } from "../../../_base/crud";
import { API_ENDPOINT } from '../../../../app.constant';

@Injectable({
	providedIn: "root",
})
export class OrdersService {
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
		return this.http.get<any>(API_ENDPOINT + `api/order/merchant-order`, {
			params: reqParams,
		});
	}
}
