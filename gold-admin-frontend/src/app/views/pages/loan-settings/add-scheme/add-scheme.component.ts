import { Component, OnInit, Inject, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { PartnerService } from '../../../../core/user-management/partner/services/partner.service';
import { map } from 'rxjs/operators';

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
    private partnerService: PartnerService) { }

  ngOnInit() {
    this.initForm()
    this.partner()
  }

  partner() {
    this.partnerService.getAllPartner().pipe(
      map(res => {
        this.partnerData = res.data;
      })
    ).subscribe()
  }


  initForm() {
    this.billingForm = this.fb.group({
      test: ['', Validators.required],
      amount1: ['', Validators.required],
      amount2: ['', Validators.required],
      RIM30: ['', Validators.required],
      RIM90: ['', Validators.required],
      RIM180: ['', Validators.required],
      RIA30: ['', Validators.required],
      RIA90: ['', Validators.required],
      RIA180: ['', Validators.required],
      partner: ['', Validators.required]
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
    } else if (this.tabGroup.selectedIndex == 1) {
      if (this.csvForm.invalid) {
        this.csvForm.markAllAsTouched()
      }
    }
  }

  getFileInfo(event) {
    var reader = new FileReader()
    console.log(event)
    this.csvForm.get('csv').patchValue(event.target.files[0].name);

  }
}
