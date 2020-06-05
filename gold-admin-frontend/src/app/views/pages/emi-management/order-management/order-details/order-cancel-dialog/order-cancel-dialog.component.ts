import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { ToastrComponent } from '../../../../../../views/partials/components/toastr/toastr.component';
import { ActivatedRoute, Router } from "@angular/router";
import { OrderDetailsService } from '../../../../../../core/emi-management/order-management';

@Component({
  selector: 'kt-order-cancel-dialog',
  templateUrl: './order-cancel-dialog.component.html',
  styleUrls: ['./order-cancel-dialog.component.scss']
})
export class OrderCancelDialogComponent implements OnInit {
  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
  cancelForm: FormGroup;
  title: string = 'Cancel Order';
  orderId: number;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private orderService: OrderDetailsService,
  ) { }

  ngOnInit() {
    this.orderId = this.route.snapshot.params.id;
    this.formInitialize();
    this.orderService.getCancelOrderPrice(this.orderId).subscribe(res => {
      this.cancelForm.controls["cancellationCharges"].patchValue(res.cancellationCharges);
    });
  }
  formInitialize() {
    this.cancelForm = this.fb.group({
      customerBankName: ['', Validators.required],
      customerAccountNo: ['', Validators.required],
      ifscCode: ['', Validators.required],
      cancellationCharges: ['', Validators.required],
      passbookId: [''],
      checkCopyId: ['']
    });
  }

  get controls() {
    return this.cancelForm.controls;
  }

  uploadImage(data) {
    if (data.fieldName == "passbookCopy") {
      this.cancelForm.controls["passbookId"].patchValue(
        data.uploadData.id
      );
    } else if (data.fieldName == "checkCopy") {
      this.cancelForm.controls["checkCopyId"].patchValue(
        data.uploadData.id
      );
    }
  }

  onSubmit() {
    if (this.cancelForm.invalid) {
      this.cancelForm.markAllAsTouched();
      return;
    }
    // console.log(this.cancelForm.value);
    this.orderService.updateCancelOrder(this.orderId, this.cancelForm.value).subscribe(
      res => {
        this.toastr.successToastr("Order Cancelled Successfully");
      }
    );
  }

}
