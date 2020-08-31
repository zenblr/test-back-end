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

    sortValue = new BehaviorSubject<any>('');
    sortValue$ = this.sortValue.asObservable();

    sortType = new BehaviorSubject<any>('');
    sortType$ = this.sortType.asObservable();

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
        if (event && event.sort) {
            reqParams.sort = event.sort;
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

    getOrderDetails(id): Observable<any> {
        return this.http.get(API_ENDPOINT + 'api/order/' + id)
    }

    getEmiAmount(data): Observable<any> {
        return this.http.post(API_ENDPOINT + 'api/order/pay-emi/amount', data)
    }

    payEMI(data): Observable<any> {
        return this.http.post(API_ENDPOINT + 'api/emi-details/pay-emi-by-order', data)
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