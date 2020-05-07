import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {  BehaviorSubject } from 'rxjs';

import { HttpUtilsService, QueryParamsModel } from '../../../../../../app/core/_base/crud';
import { tap, catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SubCategoryService {

  constructor(private _http: HttpClient,
		private httpUtils: HttpUtilsService) { }

  public getSubCategoryList(from: number, to: number, search: string): Observable<any> {
		return this._http.get<any>(`http://173.249.49.7:9120/api/sub-category?from=${from}&to=${to}&search=${search}`).pipe(

			(tap(allMemberData => { 
				return allMemberData
			})),
			(catchError(error => {
				throw error;
			}))
		)
  }
  deleteSubCategory(id){
		return this._http.delete(`http://173.249.49.7:9120/api/sub-category/`+ id)

  }
  addNewSubCategory(data){
	return this._http.post<any>(`http://173.249.49.7:9120/api/sub-category`, data );
 }

  editSubCategory(data, id){
	return this._http.put<any>(`http://173.249.49.7:9120/api/sub-category/` + id, data);
 }
 
  getSingleSubCategory(id){
	return this._http.get(`http://173.249.49.7:9120/api/sub-category/`+ id);
 }
  getCategoryList(){
	return this._http.get(`http://173.249.49.7:9120/api/category/all-category`);
 }
}
