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

  uploadDocuments(details, scrapIds): Observable<any> {
    let data = { ...details, ...scrapIds }
    return this.http.post(`/api/scrap/scrap-process/scrap-documents`, data).pipe(
      map(res => res)
    )
  }

  getCustomerAcknowledgementPdf(id): Observable<any> {
    return this.http.get(`/api/scrap/scrap-process/get-customer-acknowledgement?scrapId=${id}`,
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

  getPurchaseVoucherPdf(id): Observable<any> {
    return this.http.get(`/api/scrap/scrap-process/get-purchase-voucher?scrapId=${id}`,
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

  quickPay(details): Observable<any> {
    return this.http.post(`/api/scrap/scrap-process/quick-pay`, details).pipe(
      map(res => res)
    )
  }
}
