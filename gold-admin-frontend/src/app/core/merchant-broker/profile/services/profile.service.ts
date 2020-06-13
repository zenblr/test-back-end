import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { map, tap, catchError } from "rxjs/operators";
import { API_ENDPOINT } from '../../../../app.constant';

@Injectable({
    providedIn: "root",
})
export class ProfileService {
    constructor(
        private http: HttpClient,
    ) { }

    getProfileDetails(): Observable<any> {
        return this.http.get(API_ENDPOINT + `api/Broker/broker-detail`)
    }

    changePassword(data): Observable<any> {
        return this.http.post(API_ENDPOINT + `api/auth/change-password`, data)
    }

    updatePanDetails(data): Observable<any> {
        return this.http.put(API_ENDPOINT + `api/Broker/update-broker-pandetails`, data)
    }

}