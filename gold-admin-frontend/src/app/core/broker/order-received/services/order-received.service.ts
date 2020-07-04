import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { API_ENDPOINT } from '../../../../app.constant';

@Injectable({
    providedIn: "root",
})
export class OrderReceivedService {

    constructor(private http: HttpClient) { }

    getOrderDetailByBlockid(blockid): Observable<any> {
        return this.http.get<any>(API_ENDPOINT + `api/order/order-detail-by-blockid/` + blockid);
    }
}