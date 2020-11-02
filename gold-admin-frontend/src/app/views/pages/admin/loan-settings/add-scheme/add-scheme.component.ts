import { Component, OnInit, Inject, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { PartnerService } from '../../../../../core/user-management/partner/services/partner.service';
import { map, catchError, finalize } from 'rxjs/operators';
import { LoanSettingsService } from '../../../../../core/loan-setting';
import { ToastrService } from 'ngx-toastr';
import { InternalUserBranchService } from '../../../../../core/user-management/internal-user-branch';

@Component({
  selector: 'kt-add-scheme',
  templateUrl: './add-scheme.component.html',
  styleUrls: ['./add-scheme.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddSchemeComponent implements OnInit {

  @ViewChild('tabGroup', { static: false }) tabGroup;

  csvForm: FormGroup;
  fillingForm: FormGroup;
  partnerData: [] = []
  file: any;
  schemeType = [{ value: 'secured', name: 'secured' }, { value: 'unsecured', name: 'unsecured' }]
  internalBranches: any;
  unsecuredSchemes: any[] = [];

  constructor(private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddSchemeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private partnerService: PartnerService,
    private laonSettingService: LoanSettingsService,
    private _toastr: ToastrService,
    private ref: ChangeDetectorRef,
    private internalUserBranchService: InternalUserBranchService
  ) { }

  ngOnInit() {
    this.getInternalBranchList()
    this.initForm()
    this.partner()
  }

  partner() {

    this.partnerService.getAllPartnerWithoutPagination().pipe(
      map(res => {
        this.partnerData = res.data;
        this.ref.detectChanges();
      }), catchError(err => {
        this._toastr.error('Some thing went wrong')
        this.ref.detectChanges();
        throw (err)
      })
    ).subscribe()
  }


  initForm() {
    this.fillingForm = this.fb.group({
      schemeName: ['', [Validators.required]],
      schemeAmountStart: ['', [Validators.required, Validators.pattern('(^100(\\.0{1,2})?$)|(^([1-9]([0-9])?|0)(\\.[0-9]{1,2})?$)')]],
      schemeAmountEnd: ['', [Validators.required, Validators.pattern('(^100(\\.0{1,2})?$)|(^([1-9]([0-9])?|0)(\\.[0-9]{1,2})?$)')]],
      partnerId: ['', Validators.required],
      schemeType: ['', [Validators.required]],
      processingChargeFixed: [, [Validators.required, Validators.min(0)]],
      processingChargePercent: [, [Validators.required, Validators.pattern('(^100(\\.0{1,2})?$)|(^([1-9]([0-9])?|0)(\\.[0-9]{1,2})?$)')]],
      // maximumPercentageAllowed: [, [Validators.required, Validators.pattern('(^100(\\.0{1,2})?$)|(^([1-9]([0-9])?|0)(\\.[0-9]{1,2})?$)')]],
      penalInterest: [, [Validators.required, Validators.pattern('(^100(\\.0{1,2})?$)|(^([1-9]([0-9])?|0)(\\.[0-9]{1,2})?$)')]],
      // isDefault: [false],
      isSplitAtBeginning: [false],
      unsecuredSchemeId: [],
      rpg: [],
      internalBranchId: [],
      multiSelect: [],
      isUnsecuredSchemeMapped: [false],
      isTopUp: [false],
      schemeInterest: this.fb.array([]),
    })

    this.csvForm = this.fb.group({
      partnerId: ['', Validators.required],
      csv: ['', Validators.required]
    })

    this.initSlabArray()
  }

  fromAndToValidation() {
    const controls = this.fillingForm.controls
    if (controls.schemeAmountEnd.valid && controls.schemeAmountStart.valid) {
      if (controls.schemeAmountStart.value > controls.schemeAmountEnd.value) {
        controls.schemeAmountStart.setErrors({ amt: true })
      } else {
        controls.schemeAmountStart.setErrors(null)

      }
    }
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

      if (this.fillingForm.invalid) {
        this.fillingForm.markAllAsTouched()
        return
      }
      if (this.fillingForm.controls.schemeType.value === 'secured') {
        const internalBranchIdArr = this.fillingForm.controls.multiSelect.value.multiSelect.map(e => e.id)
        this.fillingForm.controls.internalBranchId.patchValue(internalBranchIdArr)
      } else {
        this.fillingForm.controls.internalBranchId.patchValue([])
      }

      let fromValue = this.fillingForm.get('schemeAmountStart').value * 100000;
      fromValue = +(fromValue);
      Math.ceil(fromValue);
      let toValue = this.fillingForm.get('schemeAmountEnd').value * 100000;
      toValue = +(toValue);
      Math.ceil(toValue);
      this.fillingForm.patchValue({ schemeAmountStart: fromValue, schemeAmountEnd: toValue });


      let partnerArray = [];
      partnerArray.push(this.fillingForm.get('partnerId').value);
      this.fillingForm.patchValue({ partnerId: partnerArray });

      this.laonSettingService.saveScheme(this.fillingForm.value).pipe(
        map((res) => {
          this._toastr.success('Scheme Created Sucessfully');
          this.dialogRef.close(res);
        }), catchError(err => {
          this.ref.detectChanges();
          throw (err)
        }),
        finalize(() => {
          this.fillingForm.patchValue({ schemeAmountStart: (fromValue / 100000), schemeAmountEnd: (toValue / 100000) });
          partnerArray = [];
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

  setAsDefault(event) {
    if (this.fillingForm.controls.schemeType.valid && this.fillingForm.controls.schemeType.value == 'unsecured') {
      this.fillingForm.controls.isDefault.patchValue(event);
    }
  }

  setAsTopUpAllowed(event) {
    if (this.fillingForm.controls.schemeType.valid && this.fillingForm.controls.schemeType.value == 'secured') {
      this.fillingForm.controls.isTopUp.patchValue(event);
    }
  }

  get schemeInterest(): FormArray {
    return this.fillingForm.controls.schemeInterest as FormArray
  }

  newSlabRate(): FormGroup {
    return this.fb.group({
      days: [null, [Validators.required, Validators.min(0)]],
      interestRate: [null, [Validators.required, Validators.min(0)]]
    })
  }

  initSlabArray() {
    for (let index = 0; index < 3; index++) {
      this.schemeInterest.push(this.newSlabRate())
    }
  }

  addSlabRate() {
    this.schemeInterest.push(this.newSlabRate())
    this.scrollToBottom()
  }

  removeSlabRate() {
    this.schemeInterest.removeAt(this.schemeInterest.length - 1)
    this.scrollToBottom()
  }

  scrollToBottom() {
    setTimeout(() => {
      var container = document.getElementById('container')
      container.scrollTop = container.scrollHeight
    })
  }

  daysValidation(index: number) {
    let currentSlab; let previousSlab;

    if (index) {
      currentSlab = this.schemeInterest.at(index)
      previousSlab = this.schemeInterest.at(index - 1)
    } else {
      if (this.schemeInterest.at(index).get('days').value % 30 !== 0) {
        this.schemeInterest.at(index).get('days').setErrors({ 'incorrect': true })
      }
    }

    if (!currentSlab && !previousSlab) return

    const previousSlabControls = previousSlab.controls
    const currentSlabControls = currentSlab.controls

    if (previousSlabControls.days.value >= currentSlabControls.days.value || (currentSlabControls.days.value % 30 !== 0)) {
      currentSlabControls.days.setErrors({ 'incorrect': true })
    } else {
      currentSlabControls.days.setErrors(null)
    }

  }

  getInternalBranchList() {
    this.internalUserBranchService.getInternalBranch('', 1, -1).pipe(
      map(res => {
        this.internalBranches = res.data
      }),
    ).subscribe()
  }

  getUnsecuredSchemes() {
    if (!this.fillingForm.controls.isUnsecuredSchemeMapped.value) return

    const { partnerId, schemeType, schemeInterest } = this.fillingForm.controls
    if (partnerId.invalid || schemeType.value == 'unsecured' || schemeInterest.invalid) {
      return
    }

    const data = {
      partnerId: partnerId.value,
      schemeType: schemeType.value,
      schemeInterest: schemeInterest.value
    }
    this.laonSettingService.getUnsecuredSchemes(data).pipe(
      map(res => {
        this.unsecuredSchemes = res.data
        this.ref.detectChanges()
      }))
      .subscribe()
  }

  displayUnsecuredScheme() {
    if (!this.fillingForm.controls.isUnsecuredSchemeMapped.value) {
      this.fillingForm.controls.unsecuredSchemeId.patchValue(null)
    }
  }

}
