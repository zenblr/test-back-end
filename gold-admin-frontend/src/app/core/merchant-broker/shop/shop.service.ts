import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { map, tap, catchError } from "rxjs/operators";

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
        return this.http.get('http://173.249.49.7:9120/api/category/shop-category')
    }

    getProduct(id?): Observable<any> {
        return this.http.get('http://173.249.49.7:9120/api/products/product-by-subcategory?' + id)
    }
}