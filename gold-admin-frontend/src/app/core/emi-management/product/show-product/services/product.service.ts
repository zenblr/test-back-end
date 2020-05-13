import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { tap, catchError, map } from 'rxjs/operators';

@Injectable({
	providedIn: 'root'
})
export class ProductService {

	constructor(private http: HttpClient) { }

	getAllProducts(from?, to?, search?, fromDate?, toDate?, userId?): Observable<any> {
		return this.http
			.get<any>(`/api/products?search=${search}&from=${from}&to=${to}`, { observe: 'response' })
			.pipe(map(response => response.body));
	}

	editProduct(id, data): Observable<any> {
		return this.http.put<any>(`/api/products/` + id, data);
	}

	deleteProduct(id): Observable<any> {
		return this.http.delete<any>(`/api/products/` + id)
	}

	getSingleProduct(id): Observable<any> {
		return this.http.get<any>(`/api/products/` + id);
	}

	deleteProductImage(id): Observable<any> {
		return this.http.delete<any>(`/api/products/image/` + id)
	}
}