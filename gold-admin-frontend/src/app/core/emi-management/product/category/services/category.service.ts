import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
	providedIn: 'root'
})
export class CategoryService {
	openModal = new BehaviorSubject<any>(false);
	openModal$ = this.openModal.asObservable();

	constructor(private http: HttpClient) { }

	getAllCategories(from?, to?, search?): Observable<any> {
		return this.http
			.get<any>(`/api/category?search=${search}&from=${from}&to=${to}`, { observe: 'response' })
			.pipe(map(response => response.body));
	}

	addCategory(data): Observable<any> {
		return this.http.post<any>(`/api/category`, data);
	}

	editCategory(id, data): Observable<any> {
		return this.http.patch<any>(`/api/category/` + id, data);
	}

	deleteCategory(id): Observable<any> {
		return this.http.delete<any>(`/api/category/` + id);
	}

	getMetalType(): Observable<any> {
		return this.http.get<any>(`/api/metal-type`);
	}

	getSingleCategory(id): Observable<any> {
		return this.http.get<any>(`/api/category/` + id);
	}
}
