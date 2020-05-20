import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, tap, catchError } from 'rxjs/operators';
import { ExcelService } from '../../../../_base/crud/services/excel.service';

@Injectable({
  providedIn: 'root'
})
export class UserDetailsService {

  constructor(private http: HttpClient, private excelService: ExcelService) { }

  getAllUserDetails(from?, to?, search?): Observable<any> {
    return this.http.get<any>(`http://173.249.49.7:9120/api/user?search=${search}&from=${from}&to=${to}`);
  }
}
