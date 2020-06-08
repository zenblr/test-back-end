import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_ENDPOINT } from '../../../../../app.constant';
@Injectable({
	providedIn: 'root'
})
export class CategoryService {
	openModal = new BehaviorSubject<any>(false);
	openModal$ = this.openModal.asObservable();

	constructor(private http: HttpClient) { }

	getAllCategories(from?, to?, search?): Observable<any> {
		return this.http.get<any>(API_ENDPOINT + `api/category?search=${search}&from=${from}&to=${to}`);
	}

	addCategory(data): Observable<any> {
		return this.http.post<any>(API_ENDPOINT + `api/category`, data);
	}

	editCategory(id, data): Observable<any> {
		return this.http.patch<any>(API_ENDPOINT + `api/category/` + id, data);
	}

	deleteCategory(id): Observable<any> {
		return this.http.delete<any>(API_ENDPOINT + `api/category/` + id);
	}

	getMetalType(): Observable<any> {
		return this.http.get<any>(API_ENDPOINT + `api/metal-type`);
	}

	getSingleCategory(id): Observable<any> {
		return this.http.get<any>(API_ENDPOINT + `api/category/` + id);
	}
}
