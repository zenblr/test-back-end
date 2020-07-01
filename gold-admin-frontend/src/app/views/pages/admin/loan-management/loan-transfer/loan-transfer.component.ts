import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../../../../core/shared/services/shared.service';

@Component({
  selector: 'kt-loan-transfer',
  templateUrl: './loan-transfer.component.html',
  styleUrls: ['./loan-transfer.component.scss']
})
export class LoanTransferComponent implements OnInit {

  branchManager: { value: string; name: string; }[];

  constructor(
    private sharedService:SharedService
  ) {
    this.sharedService.getStatus().subscribe(res => {
      this.branchManager = res.bm
    })
   }

  ngOnInit() {
  }

  

}
