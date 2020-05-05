import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { WalletPriceService } from '../../../../../../core/emi-management/config-details/wallet-price';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { SharedService } from '../../../../../../core/shared/services/shared.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrComponent } from '../../../../../../views/partials/components/toastr/toastr.component';

@Component({
  selector: 'kt-wallet-price-add',
  templateUrl: './wallet-price-add.component.html',
  styleUrls: ['./wallet-price-add.component.scss']
})
export class WalletPriceAddComponent implements OnInit {
  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
  title: string;
  walletPriceForm: FormGroup;
  viewLoading: boolean = false;
  isMandatory = false

  constructor(
    public dialogRef: MatDialogRef<WalletPriceAddComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private sharedService: SharedService,
    private fb: FormBuilder,
    private walletPriceService: WalletPriceService,
  ) { }

  ngOnInit() {
    this.initForm();
    this.setForm();
    console.log(this.data);
  }

  initForm() {
    this.walletPriceForm = this.fb.group({
      walletGoldPrice: ['', Validators.required],
      walletSilverPrice: ['', Validators.required],
      forwordCostThreeMonth: ['', Validators.required],
      forwordCostSixMonth: ['', Validators.required],
      forwordCostNineMonth: ['', Validators.required],
      gst: ['', Validators.required],
      excixeDuty: ['', Validators.required],
      cancelValue: ['', Validators.required],
    })
  }

  get controls() {
    if (this.walletPriceForm)
      return this.walletPriceForm.controls;
  }

  setForm() {
    switch (this.data.action) {
      case 'add': this.title = 'Add Wallet Price';
        this.isMandatory = true;
        break;
      case 'edit': this.title = 'Edit Wallet Price';
        this.isMandatory = true;
        // this.getPartnerById(this.data.partnerId);
        break;
      default:
    }
  }

  action(event: Event) {
    if (event) {
      this.onSubmit();
    } else if (!event) {
      this.dialogRef.close();
    }
  }

  onSubmit() {
    if (this.walletPriceForm.invalid) {
      this.walletPriceForm.markAllAsTouched();
      return
    }
    // console.log(this.branchForm.value);
    const walletPriceData = this.walletPriceForm.value;
    const id = this.controls.id.value;

    if (this.data.action == 'edit') {
      this.walletPriceService.updateWalletPrice(id, walletPriceData).subscribe(res => {
        // console.log(res);
        if (res) {
          const msg = 'Branch Updated Sucessfully';
          this.toastr.successToastr(msg);
          this.dialogRef.close(true);
        }
      },
        error => {
          console.log(error.error.message);
          const msg = error.error.message;
          this.toastr.errorToastr(msg);
        });

    } else {
      this.walletPriceService.addWalletPrice(walletPriceData).subscribe(res => {
        // console.log(res);
        if (res) {
          const msg = 'Branch Added Successfully';
          this.toastr.successToastr(msg);
          this.dialogRef.close(true);
        }
      },
        error => {
          console.log(error.error.message);
          const msg = error.error.message;
          this.toastr.errorToastr(msg);
        });
    }

  }

  onAlertClose($event) {
    // this.hasFormErrors = false;
  }
}
