import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { map, tap, catchError } from "rxjs/operators";
import { ExcelService } from "../../../../_base/crud/services/excel.service";

@Injectable({
	providedIn: "root",
})
export class DepositDetailsService {
	exportExcel = new BehaviorSubject<any>(false);
	exportExcel$ = this.exportExcel.asObservable();

	applyFilter = new BehaviorSubject<any>({});
	applyFilter$ = this.applyFilter.asObservable();

	constructor(private http: HttpClient, private excelService: ExcelService) { }

	getAllDepositDetails(event?: any): Observable<any> {
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
		if (event && event.paymentRecievedDate) {
			reqParams.paymentRecievedDate = event.paymentRecievedDate;
		}
		if (event && event.paymentType) {
			reqParams.paymentType = event.paymentType;
		}
		if (event && event.orderCurrentStatus) {
			reqParams.orderCurrentStatus = event.orderCurrentStatus;
		}
		return this.http.get<any>(
			`http://173.249.49.7:9120/api/deposit-details`,
			{
				params: reqParams,
			}
		);
	}

	reportExport(): Observable<any> {
		return this.http
			.get(
				`http://173.249.49.7:9120/api/deposit-details/deposit-details-report`,
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
				),
				catchError((err) => {
					return null;
				})
			);
	}
}
