import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {  BehaviorSubject } from 'rxjs';

import { HttpUtilsService, QueryParamsModel } from '../../../../../app/core/_base/crud';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AddCategoryService {

  constructor(private _http: HttpClient,
		private httpUtils: HttpUtilsService) { }

  public getCategoryList(from: number, to: number, search: string): Observable<any> {
		return this._http.get<any>(`http://173.249.49.7:9120/api/category?from=${from}&to=${to}&search=${search}`).pipe(

			(tap(allMemberData => {
				return allMemberData
			})),
			(catchError(error => {
				throw error;
			}))
		)
	}
	deleteCategory(id){
		return this._http.delete(`http://173.249.49.7:9120/api/category/`+ id)
	}

	addNewCategory(data){
		return this._http.post<any>(`http://173.249.49.7:9120/api/category`, data );
	}

	editCategory(data, id){

		return this._http.patch<any>(`http://173.249.49.7:9120/api/category/` + id, data);
	}
	getSingleCategory(id){
		return this._http.get(`http://173.249.49.7:9120/api/category/`+ id);
	}
	getMetalList(){
		return this._http.get(`http://173.249.49.7:9120/api/metal-type`);
	}
}
