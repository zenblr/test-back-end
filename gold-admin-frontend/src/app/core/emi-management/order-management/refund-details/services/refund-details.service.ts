import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { map, tap, catchError } from "rxjs/operators";
import { ExcelService } from "../../../../_base/crud/services/excel.service";
import { API_ENDPOINT } from "../../../../../app.constant";
@Injectable({
	providedIn: "root",
})
export class RefundDetailsService {
	exportExcel = new BehaviorSubject<any>(false);
	exportExcel$ = this.exportExcel.asObservable();

	constructor(private http: HttpClient, private excelService: ExcelService) { }

	getAllRefundManagement(from?, to?, search?): Observable<any> {
		return this.http.get<any>(
			API_ENDPOINT + `api/cancel-refund?search=${search}&from=${from}&to=${to}`
		);
	}

	getSingleRefund(id): Observable<any> {
		return this.http.get<any>(
			API_ENDPOINT + `api/cancel-refund/` + id
		);
	}
	updateRefundStatus(data, id): Observable<any> {
		return this.http.put<any>(
			API_ENDPOINT + `api/cancel-refund/${id}`,
			data
		);
	}
	reportExport(): Observable<any> {
		return this.http
			.get(API_ENDPOINT + `api/emi-details/emi-report`, {
				responseType: "arraybuffer",
			})
			.pipe(
				map((res) => {
					return res;
				}),
				tap(
					(data) => {
						this.excelService.saveAsExcelFile(data, "EMIReport_" + Date.now());
					},
					(error) => console.log(error)
				),
				catchError((err) => {
					return null;
				})
			);
	}
}
