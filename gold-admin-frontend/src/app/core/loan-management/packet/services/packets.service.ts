import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class PacketsService {

  disableBtn = new BehaviorSubject<any>(false);
  disableBtn$ = this.disableBtn.asObservable();

  openModal = new BehaviorSubject<any>(false);
  openModal$ = this.openModal.asObservable();

  buttonValue = new BehaviorSubject<any>(false);
  buttonValue$ = this.buttonValue.asObservable();

  applyFilter = new BehaviorSubject<any>({});
  applyFilter$ = this.applyFilter.asObservable();



  constructor(public http: HttpClient, private toastr: ToastrService) { }

  uploadPackets(packetImages, masterLoanId): Observable<any> {
    let data = { ...packetImages, ...masterLoanId }
    return this.http.post(`/api/loan-process/add-packet-images/`, data).pipe(
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
    if (data && data.packetAssigned) {
      reqParams.packetAssigned = data.packetAssigned;
    }
    return this.http.get(`/api/packet`, { params: reqParams }).pipe(
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

  assignAppraiserToPacket(data): Observable<any> {
    return this.http.put<any>(`api/packet/assign-appraiser`, data).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message);
        throw (err);
      })
    );
  }

  uplaodCSV(data): Observable<any> {
    return this.http.post('api/upload-packets-file', data).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message)
        throw (err)
      }))
  }
}


