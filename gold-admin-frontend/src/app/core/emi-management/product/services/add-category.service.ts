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

  public getAllBulkUploadStatus(from: number, to: number, search: string): Observable<any> {
		return this._http.get<any>(`/api/bulk-upload?from=${from}&to=${to}&search=${search}`).pipe(

			(tap(allMemberData => {
				return allMemberData
			})),
			(catchError(error => {
				throw error;
			}))
		)
	}
}
