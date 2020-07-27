import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class ScrapPacketsService {
  openModal = new BehaviorSubject<any>(false);
  openModal$ = this.openModal.asObservable();

  constructor(private http: HttpClient, private toastr: ToastrService) { }

  uploadPackets(packetImages, masterLoanId): Observable<any> {
    let data = { ...packetImages, ...masterLoanId }
    return this.http.post(`/api/loan-process/add-packet-images/`, data).pipe(
      map(res => res)
    );
  }

  getPacketsAvailable(): Observable<any> {
    return this.http.get(`/api/scrap/packet/available-packet`).pipe(
      map(res => res)
    );
  }

  getpackets(search, from, to): Observable<any> {
    return this.http.get(`/api/scrap/packet?search=${search}&from=${from}&to=${to}`).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message);
        throw (err);
      })
    );
  }

  addPacket(data): Observable<any> {
    return this.http.post<any>(`/api/scrap/packet`, data).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message);
        throw (err);
      })
    );
  }

  updatePacket(id, data): Observable<any> {
    return this.http.put<any>(`/api/scrap/packet/${id}`, data).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message);
        throw (err);
      })
    );
  }

  deletePacket(id): Observable<any> {
    return this.http.delete<any>(`/api/scrap/packet/${id}`).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message);
        throw (err);
      })
    );
  }

  getInternalBranhces(): Observable<any> {
    return this.http.get<any>(`api/internal-branch`);
  }
}
