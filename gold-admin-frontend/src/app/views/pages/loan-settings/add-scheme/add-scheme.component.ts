import { Component, OnInit, Inject, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { PartnerService } from '../../../../core/user-management/partner/services/partner.service';
import { map, catchError, finalize } from 'rxjs/operators';
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
  file: any;

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

    this.partnerService.getAllPartner('', 1, 50).pipe(
      map(res => {
        this.partnerData = res.data;
        this.ref.detectChanges();
        console.log(this.partnerData)
      }), catchError(err => {
        this._toastr.error('Some thing went wrong')
        this.ref.detectChanges();
        throw (err)
      })
    ).subscribe()
  }


  initForm() {
    this.billingForm = this.fb.group({
      schemeName: ['', [Validators.required]],
      schemeAmountStart: ['', [Validators.required, Validators.pattern('(?<![\\d.])(\\d{1,2}|\\d{0,2}\\.\\d{1,2})?(?![\\d.])')]],
      schemeAmountEnd: ['', [Validators.required, Validators.pattern('(?<![\\d.])(\\d{1,2}|\\d{0,2}\\.\\d{1,2})?(?![\\d.])')]],
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
    this.csvForm.controls.csv.disable()
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
      console.log(this.billingForm.value);

      if (this.billingForm.invalid) {
        this.billingForm.markAllAsTouched()
        return
      }

      let fromValue = this.billingForm.get('schemeAmountStart').value * 100000;
      fromValue = +(fromValue);
      Math.ceil(fromValue);
      let toValue = this.billingForm.get('schemeAmountEnd').value * 100000;
      toValue = +(toValue);
      Math.ceil(toValue);
      console.log(fromValue, toValue)
      this.billingForm.patchValue({ schemeAmountStart: fromValue, schemeAmountEnd: toValue });

      console.log(this.billingForm.value);

      let partnerArray = [];
      partnerArray.push(this.billingForm.get('partnerId').value);
      this.billingForm.patchValue({ partnerId: partnerArray });

      this.laonSettingService.saveScheme(this.billingForm.value).pipe(
        map((res) => {
          this._toastr.success('Scheme Created Sucessfully');
          this.dialogRef.close(res);
        }), catchError(err => {
          this._toastr.error('Some thing went wrong')
          this.ref.detectChanges();
          throw (err)
        }),
        finalize(() => {
          this.billingForm.patchValue({ schemeAmountStart: (fromValue / 100000), schemeAmountEnd: (toValue / 100000) });
        })).subscribe()
    } else if (this.tabGroup.selectedIndex == 1) {
      if (this.csvForm.invalid) {
        this.csvForm.markAllAsTouched()
        return
      }
      var fb = new FormData()
      fb.append('schemecsv', this.file)
      fb.append('partnerId', this.csvForm.controls.partnerId.value)
      this.laonSettingService.uplaodCSV(fb).pipe(
        map((res) => {
          this._toastr.success('Scheme Created Sucessfully');
          this.dialogRef.close(res);
        }), catchError(err => {

          this.ref.detectChanges();
          throw (err)
        })).subscribe()
    }
  }

  getFileInfo(event) {
    this.file = event.target.files[0];
    var ext = event.target.files[0].name.split('.');
    if (ext[ext.length - 1] != 'csv') {
      this._toastr.error('Please upload csv file');
      this.csvForm.controls.csv.markAsTouched()
      return
    }
    this.csvForm.get('csv').patchValue(event.target.files[0].name);

  }
}
