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
}