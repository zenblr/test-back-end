import { Component, OnInit, Inject, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { PartnerService } from '../../../../core/user-management/partner/services/partner.service';
import { map, catchError } from 'rxjs/operators';
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

  viewLoading: boolean
  csvForm: FormGroup;
  billingForm: FormGroup;
  partnerData: [] = []
  file: any;
  loading:boolean = false;

  constructor(private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddSchemeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private partnerService: PartnerService,
    private laonSettingService: LoanSettingsService,
    private _toastr: ToastrService,
    private ref: ChangeDetectorRef) { }

  ngOnInit() {
    this.initForm()
    this.partner()
  }

  partner() {
    this.viewLoading = true
    this.partnerService.getAllPartner('', 1, 50).pipe(
      map(res => {
        this.partnerData = res.data;
        this.viewLoading = false;
        this.ref.detectChanges();
        console.log(this.partnerData)
      }), catchError(err => {
        this.viewLoading = false;
        this._toastr.error('Some thing went wrong')
        this.ref.detectChanges();
        throw (err)
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
      partnerId: ['', Validators.required],
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
      this.loading = true;
      this.laonSettingService.saveScheme(this.billingForm.value).pipe(
        map((res) => {
          if (res.message == 'schemes created') {
            this._toastr.success('Scheme Created Sucessfully');
            this.dialogRef.close(res);
          }
        }),catchError(err => {
          this.loading = false;
          this._toastr.error('Some thing went wrong')
          this.ref.detectChanges();
          throw (err)
        })).subscribe()
    } else if (this.tabGroup.selectedIndex == 1) {
      if (this.csvForm.invalid) {
        this.csvForm.markAllAsTouched()
        return
      }
      this.loading = true;
      var fb = new FormData()
      fb.append('schemecsv', this.file)
      fb.append('partnerId', this.csvForm.controls.partnerId.value)
      this.laonSettingService.uplaodCSV(fb).pipe(
        map((res) => {
          if (res.message == 'schemes created') {
            this._toastr.success('Scheme Created Sucessfully');
            this.dialogRef.close(res);
          }
        }), catchError(err => {
          this.loading = false;
          this._toastr.error('Some thing went wrong')
          this.ref.detectChanges();
          throw (err)
        })).subscribe()
    }
  }

  getFileInfo(event) {
    var reader = new FileReader()
    console.log(event)
    if (event.target.files[0].type == "text/csv") {
      this.file = event.target.files[0];
      this.csvForm.get('csv').patchValue(event.target.files[0].name);
    }
  }
}
