import { Component, OnInit, ViewChild } from '@angular/core';
import { ShopService } from '../../../../../core/broker';
import { ActivatedRoute, Router } from "@angular/router";
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { ToastrComponent } from '../../../../partials/components/toastr/toastr.component';

@Component({
  selector: 'kt-cancel-order',
  templateUrl: './cancel-order.component.html',
  styleUrls: ['./cancel-order.component.scss']
})
export class CancelOrderComponent implements OnInit {
  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;

  orderId: any;
  orderData: any;
  value: string = "Cancel Order";
  confirmFlag: boolean = true;
  cancelForm: FormGroup;
  isMandatory: boolean = true;
  referenceCode: any;
  constructor(
    private shopService: ShopService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router
  ) { }

  ngOnInit() {
    this.orderId = this.route.snapshot.params.id;
    this.shopService.getCancelDetails(this.orderId).subscribe(res => {
      this.orderData = res;
      this.formInitialize()
    })
  }

  formInitialize() {
    this.cancelForm = this.fb.group({
      customerBankName: ['', Validators.compose([Validators.required, Validators.pattern('^[a-zA-Z \-\']+')])],
      customerAccountNo: ['', Validators.compose([Validators.required, Validators.pattern('^[0-9]*[1-9][0-9]*$')])],
      ifscCode: ['', Validators.compose([Validators.required, Validators.pattern('A-Za-z]{4}[a-zA-Z0-9]{7}')])],
      passbookId: [null],
      checkCopyId: [null],
      otp: [null],
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

  removeImage(data) {
    if (data.fieldName == "passbookCopy") {
      this.cancelForm.controls["passbookId"].patchValue("");
    } else if (data.fieldName == "checkCopy") {
      this.cancelForm.controls["checkCopyId"].patchValue("");
    }
  }

  getOtp() {
    if (this.cancelForm.invalid) {
      this.cancelForm.markAllAsTouched();
      return;
    }

    let params = {
      orderId: this.orderId
    }

    this.shopService.getOtp(params).subscribe(res => {
      this.confirmFlag = false;
      this.value = "Confirm OTP";
      this.referenceCode = res.referenceCode;
    })
  }

  confirmOtp() {
    this.controls.otp.setValidators([Validators.required]);
    this.controls.otp.updateValueAndValidity();
    if (this.cancelForm.invalid) {
      this.cancelForm.markAllAsTouched();
      return;
    }

    let params = {
      customerBankName: this.controls.customerBankName.value,
      customerAccountNo: this.controls.customerAccountNo.value,
      ifscCode: this.controls.ifscCode.value,
      passbookId: this.controls.passbookId.value,
      checkCopyId: this.controls.checkCopyId.value,
      otp: this.controls.otp.value,
      referenceCode: this.referenceCode,
    }

    this.shopService.updateCancelOrder(this.orderId, params).subscribe(
      res => {
        this.toastr.successToastr("Order Cancelled Successfully");
        this.router.navigate(["/broker/orders"]);
      },
      error => {
        this.toastr.errorToastr(error.error);
      })
  }
}
