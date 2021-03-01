import { Injectable } from '@angular/core';
import { map, catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CampaignListService {

  constructor(private http: HttpClient, private toastr: ToastrService) { }

  getCampaignList(data): Observable < any > {
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
    if (data && data.isCampaign) {
      reqParams.isCampaign = data.isCampaign;
    }
  
    return this.http.get<any>(`/api/customer/campaign-list`, { params: reqParams })
      .pipe(map(res => res),
        catchError(err => {
          if (err.error.message) this.toastr.error(err.error.message)
          throw (err)
        })
      );
  }
}
