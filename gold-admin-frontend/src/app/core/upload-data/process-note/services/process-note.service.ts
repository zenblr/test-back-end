import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class ProcessNoteService {

  constructor(private http: HttpClient, private toastr: ToastrService) { }

  uploadProcessNote(fd): Observable<any> {
    return this.http.post<any>(`/api/process-note`, { processNote: fd }).pipe(map(res => res),
      catchError(err => {
        if (err.error.message) this.toastr.error(err.error.message)
        throw err
      }));
  }

  getProcessNote(): Observable<any> {
    return this.http.get<any>(`/api/process-note`).pipe(map(res => res),
      catchError(err => {
        if (err.error.message) this.toastr.error(err.error.message)
        throw err
      }));;
  }

  deleteProcessNote(id): Observable<any> {
    return this.http.delete<any>(`/api/process-note/${id}`).pipe(map(res => res),
      catchError(err => {
        if (err.error.message) this.toastr.error(err.error.message)
        throw err
      }));;

  }
}
