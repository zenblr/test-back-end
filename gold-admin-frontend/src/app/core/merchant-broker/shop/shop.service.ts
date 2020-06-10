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
        return this.http.get('http://173.249.49.7:9120/api/products/product-by-subcategory', {
            params: reqParams,
        })
    }
}