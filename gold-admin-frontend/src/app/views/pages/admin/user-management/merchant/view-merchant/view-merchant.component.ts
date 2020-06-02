import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AddBrokerComponent } from '../../broker/add-broker/add-broker.component';
import { MerchantService } from '../../../../../../core/user-management/merchant';
import { catchError, map } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'kt-view-merchant',
  templateUrl: './view-merchant.component.html',
  styleUrls: ['./view-merchant.component.scss']
})
export class ViewMerchantComponent implements OnInit {

  merchant: any

  constructor(
    public dialogRef: MatDialogRef<AddBrokerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private merchatService: MerchantService,
    private toast: ToastrService
  ) { }

  ngOnInit() {
 
    this.merchatService.getMerchantById(this.data.userId).pipe(
      map(res => {
        this.merchant = res
      }), catchError(err => {
        this.toast.error(err.error.error)
        throw err
      })).subscribe()
  }

  action(event){
    this.dialogRef.close()
  }

}
