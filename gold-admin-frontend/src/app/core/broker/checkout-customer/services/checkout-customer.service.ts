import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { API_ENDPOINT } from '../../../../app.constant';

@Injectable({
    providedIn: "root",
})
export class CheckoutCustomerService {

    constructor(private http: HttpClient) { }

    findExistingCustomer(data): Observable<any> {
        return this.http.post<any>(API_ENDPOINT + `api/customer`, data);
    }

    generateOTPAdmin(data): Observable<any> {
        return this.http.post<any>(API_ENDPOINT + `api/order/send-otp-admin`, data);
    }

    verifyOTP(data): Observable<any> {
        return this.http.post<any>(API_ENDPOINT + `api/order/verify-otp`, data);
    }

    placeOrder(data): Observable<any> {
        return this.http.post<any>(API_ENDPOINT + `api/order/place`, data);
    }
}