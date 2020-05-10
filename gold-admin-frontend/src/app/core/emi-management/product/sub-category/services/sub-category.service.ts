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
			.get<any>(`/api/sub-category?search=${search}&from=${from}&to=${to}`, { observe: 'response' })
			.pipe(map(response => response.body));
	}

	// getSubCategoryList(from: number, to: number, search: string): Observable<any> {
	// 	return this.http.get<any>(`/api/sub-category?from=${from}&to=${to}&search=${search}`).pipe(
	// 		(tap(allMemberData => {
	// 			return allMemberData
	// 		})),
	// 		(catchError(error => {
	// 			throw error;
	// 		}))
	// 	)
	// }

	deleteSubCategory(id) {
		return this.http.delete(`/api/sub-category/` + id)
	}

	addNewSubCategory(data) {
		return this.http.post<any>(`/api/sub-category`, data);
	}

	editSubCategory(data, id) {
		return this.http.put<any>(`/api/sub-category/` + id, data);
	}

	getSingleSubCategory(id) {
		return this.http.get(`/api/sub-category/` + id);
	}

	getCategoryList() {
		return this.http.get(`/api/category/all-category`);
	}

	getSubCategory(): Observable<any> {
		return this.http.get<any>(`/api/sub-category`);
	}
}
