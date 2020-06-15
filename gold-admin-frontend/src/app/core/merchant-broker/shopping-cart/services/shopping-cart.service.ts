import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { API_ENDPOINT } from '../../../../app.constant';

@Injectable({
    providedIn: "root",
})
export class ShoppingCartService {
    cartCount = new BehaviorSubject(0);
    cartCount$ = this.cartCount.asObservable();

    constructor(private http: HttpClient) { }

    getCart(): Observable<any> {
        return this.http.get<any>(API_ENDPOINT + `api/cart`);
    }

    deleteCartItem(cartId): Observable<any> {
        return this.http.delete<any>(API_ENDPOINT + `api/cart/` + cartId);
    }

    getCheckoutCart(): Observable<any> {
        return this.http.get<any>(API_ENDPOINT + `api/cart/check-out-cart`);
    }

    updateCartItemQuantity(id, data): Observable<any> {
        return this.http.put<any>(API_ENDPOINT + `api/cart/` + id, data);
    }

    orderVerifyBlock(data): Observable<any> {
        return this.http.post<any>(API_ENDPOINT + `api/order/verify-block`, data);
    }
}