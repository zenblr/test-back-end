import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {  BehaviorSubject } from 'rxjs';

import { HttpUtilsService, QueryParamsModel } from '../../../../../../app/core/_base/crud';
import { tap, catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private _http: HttpClient,
		private httpUtils: HttpUtilsService) { }

  public getProductList(from: number, to: number, search: string): Observable<any> {
		return this._http.get<any>(`http://173.249.49.7:9120/api/products?from=${from}&to=${to}&search=${search}`).pipe(

			(tap(allMemberData => {
				return allMemberData
			})),
			(catchError(error => {
				throw error;
			}))
		)
  }
  
  deleteProduct(id){
		return this._http.delete(`http://173.249.49.7:9120/api/products/`+ id)
	}
	getSingleProduct(id){
		return this._http.get(`http://173.249.49.7:9120/api/products/`+ id);
	}
	editProduct(data, id){

		return this._http.patch<any>(`http://173.249.49.7:9120/api/products/` + id, data);
	}
}
