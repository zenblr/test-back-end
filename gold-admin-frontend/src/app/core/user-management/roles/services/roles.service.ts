import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { RolesModel } from '../models/rolesmodel';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class RolesService {

  openModal = new BehaviorSubject<any>(false);
  openModal$ = this.openModal.asObservable();
  roles = { desserts: [] }
  constructor(private http: HttpClient, private toastr: ToastrService) { }


  getRoles(search, from, to): Observable<any> {
    return this.http.get(`/api/role?search=${search}&from=${from}&to=${to}`).pipe(map(
      res => res
    ))
  }

  getCloneRole(): Observable<any> {
    return this.http.get(`/api/role/all-role`).pipe(
      map(res => res
      ))
  }

  getModule(id): Observable<any> {
    return this.http.get(`/api/role/module/${id}`).pipe(
      map(res => res
      ))
  }
  getAllModule(): Observable<any> {
    return this.http.get(`/api/modules`).pipe(
      map(res => res
      ))
  }
  getAllProducts(): Observable<any> {
    return this.http.get(`/api/product`).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message) this.toastr.error(err.error.message);
        throw (err);
      }))
  }

  editRole(id, value): Observable<any> {
    return this.http.put(`/api/role/${id}`, value).pipe(
      map(res => res
      ))
  }

  addRole(value): Observable<any> {
    return this.http.post(`/api/role`, value).pipe(
      map(res => res
      ))
  }

  deleteRole(id): Observable<any> {
    return this.http.delete(`/api/role/${id}`).pipe(
      map(res => res
      ))
  }
}
