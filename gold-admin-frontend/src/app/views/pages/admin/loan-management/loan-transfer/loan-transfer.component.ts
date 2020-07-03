import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../../../../core/shared/services/shared.service';
import { CustomerClassificationService } from '../../../../../core/kyc-settings/services/customer-classification.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'kt-loan-transfer',
  templateUrl: './loan-transfer.component.html',
  styleUrls: ['./loan-transfer.component.scss']
})
export class LoanTransferComponent implements OnInit {

  branchManager: { value: string; name: string; }[];
  reasons:any [] = [];
  constructor(
    private custClassificationService:CustomerClassificationService,
    private sharedService:SharedService
  ) {
    this.sharedService.getStatus().subscribe(res => {
      this.branchManager = res.bm
    })
   }

  ngOnInit() {
  }

  getReasonsList() {
    this.custClassificationService.getReasonsList().pipe(
      map(res => {
        console.log(res)
        this.reasons = res.data;
      })
    ).subscribe()
  }

}
