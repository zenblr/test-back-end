import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { tap, catchError, map } from 'rxjs/operators';

@Injectable({
	providedIn: 'root'
})
export class ProductService {
	applyFilter = new BehaviorSubject<any>({});
	applyFilter$ = this.applyFilter.asObservable();

	constructor(private http: HttpClient) { }

	getAllProducts(event?: any): Observable<any> {
		const reqParams: any = {};
		if (event && event.search) {
			reqParams.search = event.search;
		}
		if (event && event.categoryId) {
			reqParams.categoryId = event.categoryId;
		}
		if (event && event.subCategoryId) {
			reqParams.subCategoryId = event.subCategoryId;
		}
		if (event && event.selectedGrade) {
			reqParams.grade = event.selectedGrade;
		}
		if (event && event.priceFrom) {
			reqParams.priceFrom = event.priceFrom;
		}
		if (event && event.priceTo) {
			reqParams.priceTo = event.priceTo;
		}
		return this.http.get<any[]>(`http://173.249.49.7:9120/api/products`, { params: reqParams });
	}

	editProduct(id, data): Observable<any> {
		return this.http.put<any>(`http://173.249.49.7:9120/api/products/` + id, data);
	}

	deleteProduct(id): Observable<any> {
		return this.http.delete<any>(`http://173.249.49.7:9120/api/products/` + id);
	}

	getSingleProduct(id): Observable<any> {
		return this.http.get<any>(`http://173.249.49.7:9120/api/products/` + id);
	}

	deleteProductImage(id): Observable<any> {
		return this.http.delete<any>(`http://173.249.49.7:9120/api/products/image/` + id);
	}
}