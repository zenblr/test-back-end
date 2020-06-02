import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { BrokerService } from '../../../../../../core/user-management/broker';
import { StoreService } from '../../../../../../core/user-management/store';
import { map, catchError } from 'rxjs/operators';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'kt-create-store',
  templateUrl: './create-store.component.html',
  styleUrls: ['./create-store.component.scss']
})
export class CreateStoreComponent implements OnInit {

  merchant = []
  merchantId = new FormControl('', Validators.required)
  constructor(
    public dialogRef: MatDialogRef<CreateStoreComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private brokerService: BrokerService,
    private storeService: StoreService,
    private toastService: ToastrService
  ) { }

  ngOnInit() {
    this.getMerchant()
  }

  getMerchant() {
    this.brokerService.getAllMerchant().pipe(
      map(res => {
        this.merchant = res
      })
    ).subscribe()
  }
  action(event) {
    if (event) {
      this.storeService.createStore(this.merchantId.value).pipe(
        map(res => {
          this.dialogRef.close(res)
        }), catchError(err => {
          this.toastService.error(err.error.message);
          throw err;
        })).subscribe()
    } else {
      this.dialogRef.close()
    }
  }
}
