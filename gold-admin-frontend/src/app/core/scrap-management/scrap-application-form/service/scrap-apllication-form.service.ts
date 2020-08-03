import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import printJS from 'print-js';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class ScrapApplicationFormService {
  finalLoanAmount = new BehaviorSubject(0)
  finalLoanAmount$ = this.finalLoanAmount.asObservable()

  constructor(public http: HttpClient, private toastr: ToastrService) { }

  customerDetails(id): Observable<any> {
    return this.http.get(`/api/scrap/scrap-process/customer-scrap-details/${id}`).pipe(
      map(res => res)
    );
  }

  getScrapDataById(id: number): Observable<any> {
    return this.http.get(`/api/scrap/scrap-process/single-scrap?scrapId=${id}`).pipe(
      map(res => res)
    );
  }

  basicSubmit(details): Observable<any> {
    return this.http.post(`/api/scrap/scrap-process/basic-details`, details).pipe(
      map(res => res)
    );
  }

  submitOrnaments(scrapOrnaments, finalScrapAmount, scrapIds): Observable<any> {
    let data = {
      scrapOrnaments: scrapOrnaments,
      finalScrapAmount: finalScrapAmount,
      scrapId: scrapIds.scrapId,
    }
    return this.http.post(`/api/scrap/scrap-process/ornaments-details`, data).pipe(
      map(res => res)
    );
  }

  acknowledgementSubmit(details, scrapId): Observable<any> {
    let data = { ...details, ...scrapId }
    return this.http.post(`/api/scrap/scrap-process/acknowledgement-details`, data).pipe(
      map(res => res)
    );
  }

  submitMeltingOrnaments(scrapOrnament, eligibleScrapAmount, scrapId): Observable<any> {
    let data = { ...scrapOrnament, eligibleScrapAmount: eligibleScrapAmount, ...scrapId }
    return this.http.post(`/api/scrap/scrap-process/ornaments-melting-details`, data).pipe(
      map(res => res)
    );
  }

  submitBank(details, scrapIds): Observable<any> {
    let data = { ...details, ...scrapIds }
    return this.http.post(`/api/scrap/scrap-process/bank-details`, data).pipe(
      map(res => res)
    )
  }

  appraiserRating(details, scrapIds): Observable<any> {
    let data = { ...details, ...scrapIds }
    return this.http.post(`/api/scrap/scrap-process/appraiser-rating`, data).pipe(
      map(res => res)
    )
  }

  bmRating(details, scrapIds): Observable<any> {
    let data = { ...details, ...scrapIds }
    return this.http.post(`/api/scrap/scrap-process/bm-rating`, data).pipe(
      map(res => res)
    )
  }

  opsRating(details, scrapIds): Observable<any> {
    let data = { ...details, ...scrapIds }
    return this.http.post(`/api/scrap/scrap-process/ops-rating`, data).pipe(
      map(res => res),
    )
  }

  getLoanDataById(id: number): Observable<any> {
    return this.http.get(`/api/loan-process/single-loan?customerLoanId=${id}`).pipe(
      map(res => res)
    )
  }

  checkForLoanType(data): Observable<any> {
    return this.http.post(`/api/loan-process/check-loan-type`, data).pipe(
      map(res => res)
    )
  }

  getInterest(data): Observable<any> {
    return this.http.post(`/api/loan-process/interest-rate`, data).pipe(
      map(res => res)
    )
  }

  updateLoan(id, data): Observable<any> {
    return this.http.put(`/api/loan-process/change-loan-detail/${id}`, data).pipe(
      map(res => res)
    )
  }

  uploadDocuments(details, masterAndLoanIds): Observable<any> {
    let data = { ...details, ...masterAndLoanIds }
    return this.http.post(`/api/loan-process/loan-documents`, data).pipe(
      map(res => res)
    )
  }

  calculateFinalInterestTable(data): Observable<any> {
    return this.http.post('/api/loan-process/generate-interest-table', data).pipe(
      map(res => res)
    )
  }

  unsecuredTableGenration(form, paymentFrequency, tenure): Observable<any> {
    let data = {
      unsecuredSchemeAmount: form.unsecuredSchemeAmount,
      unsecuredSchemeId: form.unsecuredSchemeName,
      paymentFrequency: paymentFrequency,
      tenure: tenure
    }
    return this.http.post('/api/loan-process/generate-unsecured-interest-table', data).pipe(
      map(res => res)
    )
  }

  getPdf(id): Observable<any> {
    return this.http.get(`/api/loan-process/get-print-details?customerLoanId=${id}`,
      { responseType: "arraybuffer" }
    ).pipe(
      tap(res => {
        if (res) {
          var binary = '';
          var bytes = new Uint8Array(res);
          var len = bytes.byteLength;
          for (var i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          let base64 = (window.btoa(binary));
          printJS({ printable: base64, type: 'pdf', base64: true })
        }
      }))
  }

  applyLoanFromPartRelease(data): Observable<any> {
    return this.http.get(`/api/jewellery-release/apply-loan/${data.customerUniqueId}?partReleaseId=${data.partReleaseId}`).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message);
        throw (err);
      })
    )
  }
}
