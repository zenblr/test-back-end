import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HolidayService {

  openModal = new BehaviorSubject<any>(false);
  openModal$ = this.openModal.asObservable();

  constructor(private http: HttpClient, private toastr: ToastrService) { }

  getHolidays(from, to, search): Observable<any> {
    return this.http.get<any>(`/api/customer?search=${search}&from=${from}&to=${to}`);
  }
}
