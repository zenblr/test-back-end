import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { API_ENDPOINT } from '../../../../app.constant';

@Injectable({
	providedIn: "root",
})
export class DashboardService {

	constructor(private http: HttpClient) { }

	getBrokerDashboard(): Observable<any> {
		return this.http.get<any>(API_ENDPOINT + `api/dashboard/broker-dashboard`);
	}

	getAllOrders(event?: any): Observable<any> {
		const reqParams: any = {};
		if (event && event.from) {
			reqParams.from = event.from;
		}
		if (event && event.to) {
			reqParams.to = event.to;
		}
		return this.http.get<any>(API_ENDPOINT + `api/dashboard/todays-booked-order`, {
			params: reqParams,
		});
	}

	getAllOverDueOrders(event?: any): Observable<any> {
		const reqParams: any = {};
		if (event && event.from) {
			reqParams.from = event.from;
		}
		if (event && event.to) {
			reqParams.to = event.to;
		}
		return this.http.get<any>(API_ENDPOINT + `api/dashboard/over-due-order`, {
			params: reqParams,
		});
	}
}