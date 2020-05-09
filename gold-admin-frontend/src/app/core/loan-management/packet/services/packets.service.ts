import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PacketsService {

  openModal = new BehaviorSubject<any>(false);
  openModal$ = this.openModal.asObservable();
  constructor(public http:HttpClient) { }

  getpackets(search,from,to):Observable<any>{
  return this.http.get(`/api/packets/?search=${search}&from=${from}&to=${to}`).pipe(
    map(res=> res)
  )
  }
}
