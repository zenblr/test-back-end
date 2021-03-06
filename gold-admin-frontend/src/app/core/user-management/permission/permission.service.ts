import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  constructor(public http:HttpClient) { }

  getPermission(id):Observable<any>{
   return  this.http.get(`/api/permission/${id}`).pipe(
     map(res => res)
   )
  }

  updatePermission(permissions,roleId):Observable<any>{
    return this.http.post(`api/role/add-permissions`,{permissions,roleId}).pipe(
      map(res => res)
    )
  }
}
