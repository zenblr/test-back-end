import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
	providedIn: 'root'
})
export class SubCategoryService {
	openModal = new BehaviorSubject<any>(false);
	openModal$ = this.openModal.asObservable();

	constructor(private http: HttpClient) { }

	getAllSubCategories(from?, to?, search?): Observable<any> {
		return this.http
			.get<any>(`http://173.249.49.7:9120/api/sub-category?search=${search}&from=${from}&to=${to}`, { observe: 'response' })
			.pipe(map(response => response.body));
	}

	addSubCategory(data): Observable<any> {
		return this.http.post<any>(`http://173.249.49.7:9120/api/sub-category`, data);
	}

	editSubCategory(id, data): Observable<any> {
		return this.http.put<any>(`http://173.249.49.7:9120/api/sub-category/` + id, data);
	}

	deleteSubCategory(id): Observable<any> {
		return this.http.delete<any>(`http://173.249.49.7:9120/api/sub-category/` + id)
	}

	getSingleSubCategory(id): Observable<any> {
		return this.http.get<any>(`http://173.249.49.7:9120/api/sub-category/` + id);
	}

	getAllCategory(): Observable<any> {
		return this.http.get<any>(`http://173.249.49.7:9120/api/category/all-category`);
	}

	getAllSubCategory(): Observable<any> {
		return this.http.get<any>(`http://173.249.49.7:9120/api/sub-category`);
	}
}
