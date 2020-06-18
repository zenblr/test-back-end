import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { API_ENDPOINT } from '../../../../app.constant';

@Injectable({
    providedIn: "root",
})
export class CheckoutCustomerService {

    constructor(private http: HttpClient) { }

    getExistingCustomer(mobileNumber): Observable<any> {
        return this.http.get<any>(API_ENDPOINT + `api/customer/` + mobileNumber);
    }

    findExistingCustomer(data): Observable<any> {
        return this.http.post<any>(API_ENDPOINT + `api/customer`, data);
    }

    generateOTP(data): Observable<any> {
        return this.http.post<any>(API_ENDPOINT + `api/order/send-otp`, data);
    }

    verifyOTP(data): Observable<any> {
        return this.http.post<any>(API_ENDPOINT + `api/order/verify-otp`, data);
    }

    placeOrder(data): Observable<any> {
        return this.http.post<any>(API_ENDPOINT + `api/order/place`, data);
    }
}