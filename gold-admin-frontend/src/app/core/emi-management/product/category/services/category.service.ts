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

	// public getCategoryList(from: number, to: number, search: string): Observable<any> {
	// 	return this.http.get<any>(`/api/category?from=${from}&to=${to}&search=${search}`).pipe(
	// 		(map(allMemberData => {
	// 			return allMemberData
	// 		})),
	// 		(catchError(error => {
	// 			throw error;
	// 		}))
	// 	)
	// }

	deleteCategory(id) {
		return this.http.delete(`/api/category/` + id)
	}

	addNewCategory(data) {
		return this.http.post<any>(`/api/category`, data);
	}

	editCategory(data, id) {

		return this.http.patch<any>(`/api/category/` + id, data);
	}

	getSingleCategory(id) {
		return this.http.get(`/api/category/` + id);
	}
	
	getMetalList() {
		return this.http.get(`/api/metal-type`);
	}
}
