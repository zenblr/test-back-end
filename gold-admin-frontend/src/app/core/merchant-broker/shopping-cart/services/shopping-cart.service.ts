import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { API_ENDPOINT } from '../../../../app.constant';

@Injectable({
    providedIn: "root",
})
export class ShoppingCartService {

    constructor(private http: HttpClient) { }

    getCart(): Observable<any> {
        return this.http.get<any>(API_ENDPOINT + `api/cart`);
    }
}