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
			.get<any>(`http://173.249.49.7:9120/api/products?search=${search}&from=${from}&to=${to}`, { observe: 'response' })
			.pipe(map(response => response.body));
	}

	deleteProduct(id) {
		return this.http.delete(`http://173.249.49.7:9120/api/products/` + id)
	}

	getSingleProduct(id) {
		return this.http.get(`http://173.249.49.7:9120/api/products/` + id);
	}

	editProduct(data, id) {
		return this.http.put<any>(`http://173.249.49.7:9120/api/products/` + id, data);
	}
}