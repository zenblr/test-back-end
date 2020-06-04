import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { map, tap, catchError } from "rxjs/operators";

@Injectable({
    providedIn: "root",
})
export class ProfileService {
    constructor(
        private http: HttpClient,
    ) { }

    getProfileDetails(): Observable<any> {
        return this.http.get('http://173.249.49.7:9120/api/Broker/broker-detail')
    }

    changePassword(data): Observable<any> {
        return this.http.post('http://173.249.49.7:9120/api/Broker/broker-detail', data)
    }

}