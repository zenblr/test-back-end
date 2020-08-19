import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { PartReleaseApprovalService } from '../../../../../core/funds-approvals/jewellery-release-approval/part-release-approval/services/part-release-approval.service';
import { ToastrService } from 'ngx-toastr';
import { map } from 'rxjs/operators';
import { PartReleaseFinalService } from '../../../../../core/funds-approvals/jewellery-release-final/part-release-final/services/part-release-final.service';
import { FullReleaseApprovalService } from '../../../../../core/funds-approvals/jewellery-release-approval/full-release-approval/services/full-release-approval.service';

@Component({
  selector: 'kt-update-status',
  templateUrl: './update-status.component.html',
  styleUrls: ['./update-status.component.scss']
})
export class UpdateStatusComponent implements OnInit {

  updateStatusForm: FormGroup
  amountStatus = ['completed', 'pending', 'rejected']
  partReleaseStatus = ['released', 'pending']
  jewelleryReleaseFinal: boolean;

  constructor(
    private fb: FormBuilder,
    private partReleaseApprovalService: PartReleaseApprovalService,
    private partReleaseFinalService: PartReleaseFinalService,
    private toastr: ToastrService,
    public dialogRef: MatDialogRef<UpdateStatusComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fullReleaseApprovalService: FullReleaseApprovalService,
  ) { }

  ngOnInit() {
    this.initForm()
    if (this.data.value) this.patchForm(this.data.value)
  }

  initForm() {
    this.updateStatusForm = this.fb.group({
      partReleaseId: [],
      fullReleaseId: [],
      customerId: [, [Validators.required]],
      loanId: [, [Validators.required]],
      loanAmount: ['', [Validators.required]],
      outstandingAmount: ['', [Validators.required]],
      releaseAmount: ['', [Validators.required]],
      interestAmount: ['', [Validators.required]],
      penalInterest: ['', [Validators.required]],
      payableAmount: ['', [Validators.required]],
      amountStatus: ['', [Validators.required]],
      partReleaseStatus: ['', [Validators.required]],
      appraiserReason: ['']
    })

    if (this.data.name === 'jewelleryReleaseFinal') {
      this.controls.amountStatus.disable()
    } else {
      this.controls.partReleaseStatus.disable()
    }
  }

  patchForm(data) {
    this.updateStatusForm.patchValue(data)
    const loanIdArr = data.masterLoan.customerLoan.map(e => e.loanUniqueId)
    this.updateStatusForm.patchValue({
      partReleaseId: data.id,
      fullReleaseId: data.id,
      customerId: data.masterLoan.loanPersonalDetail.customerUniqueId,
      loanAmount: data.masterLoan.finalLoanAmount,
      outstandingAmount: data.masterLoan.outstandingAmount,
      loanId: loanIdArr.join(', ')
    })

    if (!data.appraiserReason) {
      this.updateStatusForm.patchValue({
        partReleaseStatus: ''
      })
    }

    for (const key in this.controls) {
      if (this.controls.hasOwnProperty(key)) {
        if (!(key == 'amountStatus' || key == 'partReleaseId' || key == 'partReleaseStatus' || key == 'appraiserReason' || key == 'fullReleaseId')) this.controls[key].disable()
      }
    }
  }

  get controls() {
    return this.updateStatusForm.controls
  }

  closeModal() {
    this.dialogRef.close()
  }

  action(event) {
    if (event) {
      this.submit()
    } else if (!event) {
      this.closeModal()
    }
  }

  commentValidation(event) {
    if (this.data.name == 'jewelleryReleaseFinal') {
      if (event.target.value != 'released') {
        this.setAppraiserReason()
      } else {
        this.resetAppraiserReason()
      }
    }
  }

  setAppraiserReason() {
    this.controls.appraiserReason.reset()
    this.updateStatusForm.controls.appraiserReason.setValidators([Validators.required])
    this.updateStatusForm.controls.appraiserReason.updateValueAndValidity()
  }

  resetAppraiserReason() {
    this.updateStatusForm.controls.appraiserReason.reset()
    this.updateStatusForm.controls.appraiserReason.clearValidators()
    this.updateStatusForm.controls.appraiserReason.updateValueAndValidity()
  }

  submit() {
    if (this.updateStatusForm.invalid) return this.updateStatusForm.markAllAsTouched()

    console.log(this.updateStatusForm.value)

    switch (this.data.name) {
      case 'jewelleryReleaseFinal':
        this.partReleaseFinalService.upateStatus(this.updateStatusForm.value).pipe(map(res => {
          if (res) this.toastr.success('Status Updated Successfully')
          this.dialogRef.close(true)
        })).subscribe()

        break;


      case 'jewelleryReleaseApproval':
        this.partReleaseApprovalService.updateAmountStatus(this.updateStatusForm.value).pipe(map(res => {
          if (res) this.toastr.success('Status Updated Successfully')
          this.dialogRef.close(true)
        })).subscribe()

        break;

      case 'fullReleaseApproval':
        this.fullReleaseApprovalService.updateAmountStatus(this.updateStatusForm.value).pipe(map(res => {
          if (res) this.toastr.success('Status Updated Successfully')
          this.dialogRef.close(true)
        })).subscribe()

        break;

      default:
        break;
    }

    // if (this.data.name === 'jewelleryReleaseFinal') {
    //   this.partReleaseFinalService.upateStatus(this.updateStatusForm.value).pipe(map(res => {
    //     if (res) this.toastr.success('Status Updated Successfully')
    //     this.dialogRef.close(true)
    //   })).subscribe()
    // } else {
    //   this.partReleaseApprovalService.updateAmountStatus(this.updateStatusForm.value).pipe(map(res => {
    //     if (res) this.toastr.success('Status Updated Successfully')
    //     this.dialogRef.close(true)
    //   })).subscribe()
    // }


  }
}
