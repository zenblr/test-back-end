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
		return this.http.get<any>(`http://173.249.49.7:9120/api/category?search=${search}&from=${from}&to=${to}`);
	}

	addCategory(data): Observable<any> {
		return this.http.post<any>(`http://173.249.49.7:9120/api/category`, data);
	}

	editCategory(id, data): Observable<any> {
		return this.http.patch<any>(`http://173.249.49.7:9120/api/category/` + id, data);
	}

	deleteCategory(id): Observable<any> {
		return this.http.delete<any>(`http://173.249.49.7:9120/api/category/` + id);
	}

	getMetalType(): Observable<any> {
		return this.http.get<any>(`http://173.249.49.7:9120/api/metal-type`);
	}

	getSingleCategory(id): Observable<any> {
		return this.http.get<any>(`http://173.249.49.7:9120/api/category/` + id);
	}
}
