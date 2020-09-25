import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class PacketTrackingService {

  openModal = new BehaviorSubject<any>(false);
  openModal$ = this.openModal.asObservable();

  applyFilter = new BehaviorSubject<any>({});
  applyFilter$ = this.applyFilter.asObservable();

  constructor(public http: HttpClient, private toastr: ToastrService) { }

  uploadPackets(packageImageData, loanId): Observable<any> {
    return this.http.post(`/api/loan-process/add-packet-images/`, { packageImageData, loanId }).pipe(
      map(res => res)
    )
  }

  getPacketsAvailable(): Observable<any> {
    return this.http.get(`/api/packet/available-packet`).pipe(
      map(res => res)
    )
  }

  getpackets(data): Observable<any> {
    const reqParams: any = {};
    if (data && data.from) {
      reqParams.from = data.from;
    }
    if (data && data.to) {
      reqParams.to = data.to;
    }
    if (data && data.search) {
      reqParams.search = data.search;
    }
    if (data && data.status) {
      reqParams.status = data.status;
    }
    return this.http.get(`/api/packet-tracking/tracking-details`, { params: reqParams }).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message);
        throw (err);
      })
    )
  }

  getPacketLog(masterLoanId, loanId, from, to): Observable<any> {
    return this.http.get(`/api/packet-tracking/view-log?masterLoanId=${masterLoanId}&loanId=${loanId}&from=${from}&to=${to}`).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message);
        throw (err);
      })
    )
  }

  addPacket(data): Observable<any> {
    return this.http.post<any>(`/api/packet`, data).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message);
        throw (err);
      })
    );
  }

  updatePacket(id, data): Observable<any> {
    return this.http.put<any>(`/api/packet/${id}`, data).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message);
        throw (err);
      })
    );
  }

  deletePacket(id): Observable<any> {
    return this.http.delete<any>(`/api/packet?id=${id}&isActive=${false}`).pipe(
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

  viewPackets(data): Observable<any> {
    return this.http.get<any>(`api/packet-tracking/view-packets`, { params: data }).pipe(map(res => res),
      catchError(err => {
        if (err.error.message) this.toastr.error(err.error.message)
        throw (err)
      }));
  }
}
