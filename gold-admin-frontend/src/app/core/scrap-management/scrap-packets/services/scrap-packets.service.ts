import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class ScrapPacketsService {

  disableBtn = new BehaviorSubject<any>(false);
  disableBtn$ = this.disableBtn.asObservable();

  openModal = new BehaviorSubject<any>(false);
  openModal$ = this.openModal.asObservable();

  buttonValue = new BehaviorSubject<any>(false);
  buttonValue$ = this.buttonValue.asObservable();

  applyFilter = new BehaviorSubject<any>({});
  applyFilter$ = this.applyFilter.asObservable();

  constructor(private http: HttpClient, private toastr: ToastrService) { }

  uploadPackets(packetImages, scrapId): Observable<any> {
    let data = { ...packetImages, ...scrapId }
    return this.http.post(`/api/scrap/scrap-process/add-packet-images/`, data).pipe(
      map(res => res)
    );
  }

  getScrapPacketsAvailable(): Observable<any> {
    return this.http.get(`/api/scrap/packet/available-packet`).pipe(
      map(res => res)
    );
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
    return this.http.get(`/api/scrap/packet`, { params: reqParams }).pipe(
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
    return this.http.get<any>(`api/internal-branch?from=1&to=-1`);
  }

  assignAppraiserToPacket(data): Observable<any> {
    return this.http.put<any>(`api/scrap/packet/assign-appraiser`, data).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message);
        throw (err);
      })
    );
  }

  uplaodCSV(data): Observable<any> {
    return this.http.post('api/scrap/upload-packets-file', data).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message)
        throw (err)
      }))
  }
}
