import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { map, tap, catchError } from "rxjs/operators";
import { API_ENDPOINT } from '../../../app.constant';

@Injectable({
    providedIn: "root",
})
export class ShopService {
    toggle = new BehaviorSubject<any>('list');
    toggle$ = this.toggle.asObservable();
    constructor(
        private http: HttpClient,
    ) { }

    getSubCategory(): Observable<any> {
        return this.http.get(API_ENDPOINT + `api/category/shop-category`);
    }

    getProduct(event?): Observable<any> {
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
        if (event && event.subCategoryId) {
            reqParams.subCategoryId = event.subCategoryId;
        }
        return this.http.get(API_ENDPOINT + `api/products/product-by-subcategory`, {
            params: reqParams,
        })
    }

    getSingleProduct(id): Observable<any> {
        return this.http.get(API_ENDPOINT + 'api/products/' + id)
    }

    addToCart(data): Observable<any> {
        return this.http.post(API_ENDPOINT + 'api/cart', data)
    }

    getDetails(id): Observable<any> {
        return this.http.get(API_ENDPOINT + 'api/order/' + id)
    }

    getEmiAmount(data): Observable<any> {
        return this.http.post(API_ENDPOINT + 'api/order/pay-emi/amount', data)
    }

    emiTransaction(data): Observable<any> {
        return this.http.post(API_ENDPOINT + 'api/order/pay-emi', data)
    }

    getCancelDetails(id): Observable<any> {
        return this.http.get(API_ENDPOINT + 'api/cancel-order/' + id)
    }

    getOtp(data): Observable<any> {
        return this.http.post(API_ENDPOINT + 'api/cancel-order/send-otp', data)
    }

    updateCancelOrder(id, data): Observable<any> {
        return this.http.put(API_ENDPOINT + 'api/cancel-order/' + id, data)
    }
}