import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { API_ENDPOINT } from '../../../app.constant';

@Injectable({
    providedIn: "root",
})
export class DashboardService {

    constructor(private http: HttpClient) { }

    getDashboard(event?): Observable<any> {
        const reqParams: any = {};
        if (event && event.from) {
            reqParams.from = event.from;
        }
        if (event && event.to) {
            reqParams.to = event.to;
        }
        return this.http.get<any>(API_ENDPOINT + `api/dashboard`, {
            params: reqParams,
        });
    }
}