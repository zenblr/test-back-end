import { Component, OnInit, Inject, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { PartnerService } from '../../../../core/user-management/partner/services/partner.service';
import { map } from 'rxjs/operators';
import { LoanSettingsService } from '../../../../core/loan-setting';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'kt-add-scheme',
  templateUrl: './add-scheme.component.html',
  styleUrls: ['./add-scheme.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddSchemeComponent implements OnInit {

  @ViewChild('tabGroup', { static: false }) tabGroup;


  csvForm: FormGroup;
  billingForm: FormGroup;
  partnerData: [] = []

  constructor(private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddSchemeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private partnerService: PartnerService,
    private laonSettingService: LoanSettingsService,
    private _toastr: ToastrService, ) { }

  ngOnInit() {
    this.initForm()
    this.partner()
  }

  partner() {
    this.partnerService.getAllPartner().pipe(
      map(res => {
        this.partnerData = res;
      })
    ).subscribe()
  }


  initForm() {
    this.billingForm = this.fb.group({
      schemeAmountStart: ['', Validators.required],
      schemeAmountEnd: ['', Validators.required],
      interestRateThirtyDaysMonthly: ['', Validators.required],
      interestRateNinetyDaysMonthly: ['', Validators.required],
      interestRateOneHundredEightyDaysMonthly: ['', Validators.required],
      interestRateThirtyDaysAnnually: ['', Validators.required],
      interestRateNinetyDaysAnnually: ['', Validators.required],
      interestRateOneHundredEightyDaysAnnually: ['', Validators.required],
      partnerId: ['', Validators.required]
    })

    this.csvForm = this.fb.group({
      partnerCSV: ['', Validators.required],
      csv: ['', Validators.required]
    })
    // this.csvForm.get('csv').re()
  }

  action(event: Event) {
    if (event) {
      this.submit()
    } else if (!event) {
      this.dialogRef.close()
    }
  }

  submit() {
    if (this.tabGroup.selectedIndex == 0) {
      if (this.billingForm.invalid) {
        this.billingForm.markAllAsTouched()
        return
      }
      this.laonSettingService.saveScheme(this.billingForm.value).pipe(
        map((res) => {
          if (res.message == 'sucess') {
            this._toastr.success('Scheme Saved Sucessfully');
          }
        })).subscribe()
    } else if (this.tabGroup.selectedIndex == 1) {
      if (this.csvForm.invalid) {
        this.csvForm.markAllAsTouched()
      }
      var fb = new FormData()
      fb.append
      this.laonSettingService.uplaodCSV(this.csvForm.value).pipe(
        map((res) => {
          if (res.message == 'sucess') {
            this._toastr.success('Scheme Saved Sucessfully');
          }
        })).subscribe()
    }
  }

  getFileInfo(event) {
    var reader = new FileReader()
    console.log(event)
    if (event.target.files[0].type == "text/csv") {
      this.csvForm.get('csv').patchValue(event.target.files[0].name);
      
    }
  }
}
