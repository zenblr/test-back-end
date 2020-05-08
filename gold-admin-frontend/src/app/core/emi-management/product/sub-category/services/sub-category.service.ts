import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

import { HttpUtilsService, QueryParamsModel } from '../../../../../../app/core/_base/crud';
import { tap, catchError, map } from 'rxjs/operators';

@Injectable({
	providedIn: 'root'
})
export class SubCategoryService {

	constructor(
		private http: HttpClient,
		private httpUtils: HttpUtilsService
	) { }

	getSubCategoryList(from: number, to: number, search: string): Observable<any> {
		return this.http.get<any>(`/api/sub-category?from=${from}&to=${to}&search=${search}`).pipe(

			(tap(allMemberData => {
				return allMemberData
			})),
			(catchError(error => {
				throw error;
			}))
		)
	}

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
