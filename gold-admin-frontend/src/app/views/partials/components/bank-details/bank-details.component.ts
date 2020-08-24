import { Component, OnInit, ChangeDetectorRef, Input, EventEmitter, Output, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SharedService } from '../../../../core/shared/services/shared.service';
import { map, catchError, finalize } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { LoanApplicationFormService } from '../../../../core/loan-management';
import { ScrapApplicationFormService } from '../../../../core/scrap-management';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { PdfViewerComponent } from '../pdf-viewer/pdf-viewer.component';
import { ImagePreviewDialogComponent } from '../image-preview-dialog/image-preview-dialog.component';

@Component({
  selector: 'kt-bank-details',
  templateUrl: './bank-details.component.html',
  styleUrls: ['./bank-details.component.scss']
})
export class BankDetailsComponent implements OnInit, OnChanges {

  @Input() masterAndLoanIds
  @Input() scrapIds
  @ViewChild('passbook', { static: false }) passbook
  @Input() details;
  @Output() bankFormEmit: EventEmitter<any> = new EventEmitter();
  @Input() disable
  @Input() action
  @Input() finalLoanAmt
  @Input() finalScrapAmt
  @Output() next: EventEmitter<any> = new EventEmitter();
  @Input() showButton
  @Input() accountHolderName
  bankForm: FormGroup;
  passbookImg: any = [];
  passbookImgId: any = []
  passbookImgFileName: any = []
  url: any;
  constructor(
    public toastr: ToastrService,
    public ref: ChangeDetectorRef,
    public fb: FormBuilder,
    public dialog: MatDialog,
    public sharedService: SharedService,
    public loanFormService: LoanApplicationFormService,
    public scrapApplicationFormService: ScrapApplicationFormService,
    private router: Router
  ) {
    this.initForm()
    this.url = this.router.url.split("/")[3]
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.details) {
      if (changes.action.currentValue == 'edit') {
        if (changes.details.currentValue && changes.details.currentValue.loanBankDetail) {
          this.bankForm.patchValue(changes.details.currentValue.loanBankDetail)
          // let passbookProofImage = changes.details.currentValue.loanBankDetail.passbookProofImage
          // this.bankForm.controls.passbookProofImage.patchValue(passbookProofImage.map(ele => ele.passbookProof.URL))
          // this.bankForm.controls.passbookProof.patchValue(passbookProofImage.map(ele => ele.passbookProof.id))
          // this.bankForm.controls.passbookProofImageName.patchValue(passbookProofImage[0].passbookProof.originalname)
          this.ref.markForCheck()
        }
        if (changes.details.currentValue && changes.details.currentValue.scrapBankDetails) {
          this.bankForm.patchValue(changes.details.currentValue.scrapBankDetails)
          this.ref.markForCheck()
        }
        if (changes.details.currentValue) {
          let name = changes.details.currentValue.customer.firstName + " " + changes.details.currentValue.customer.lastName
          this.bankForm.patchValue({ accountHolderName: name })
        }
      }
    }

    if (changes.accountHolderName && changes.accountHolderName.currentValue) {
      this.bankForm.patchValue({ accountHolderName: changes.accountHolderName.currentValue })
    }

    if (changes.finalLoanAmt) {
      if (Number(changes.finalLoanAmt.currentValue) > 200000) {
        this.controls.paymentType.patchValue('bank')
        this.controls.paymentType.disable()
      }
    }

    if (changes.finalScrapAmt) {
      if (Number(changes.finalScrapAmt.currentValue) > 200000) {
        this.controls.paymentType.patchValue('bank')
        this.controls.paymentType.disable()
      }
    }

    if (this.disable) {
      this.bankForm.disable()
    }
  }

  initForm() {
    this.bankForm = this.fb.group({
      paymentType: ['', Validators.required],
      finalScrapAmountAfterMelting: [],
      bankName: [, [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z\-\\s]*$')]],
      accountNumber: [, [Validators.required, Validators.pattern('^(?=.*\\d)(?=.*[1-9]).{3,21}$')]],
      ifscCode: ['', [Validators.required, Validators.pattern('[A-Za-z]{4}[a-zA-Z0-9]{7}')]],
      accountType: [],
      accountHolderName: [, [Validators.required, Validators.pattern("^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$")]],
      bankBranchName: [, [Validators.required]],
      passbookProof: [[], [Validators.required]],
      passbookProofImage: [[]],
      passbookProofImageName: ['']
    })
    // this.bankForm.disable()
  }

  setValidation(event) {
    // if (event.target.value == 'bank') {
    //   this.controls.bankName.setValidators([Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z\-\\s]*$')]);
    //   this.controls.accountNumber.setValidators([Validators.required]);
    //   this.controls.ifscCode.setValidators([Validators.required, Validators.pattern('[A-Za-z]{4}[a-zA-Z0-9]{7}')]);
    //   this.controls.accountHolderName.setValidators([Validators.required]);
    //   this.controls.bankBranchName.setValidators([Validators.required]);
    //   this.controls.passbookProof.setValidators([Validators.required]);
    // } else if (event.target.value == 'cash') {
    //   Object.keys(this.bankForm.controls).forEach(key => {
    //     if (key != 'paymentType') {
    //       this.bankForm.controls[key].reset();
    //       this.bankForm.controls[key].clearValidators();
    //     }
    //     if (key == 'passbookProof') {
    //       this.bankForm.controls[key].patchValue([])
    //     }
    //   });
    // }
    // Object.keys(this.bankForm.controls).forEach(key => {
    //   this.bankForm.controls[key].updateValueAndValidity();
    // });
  }

  getFileInfo(event) {
    if (this.controls.passbookProof.value.length < 2) {
      var name = event.target.files[0].name
      var ext = name.split('.')
      if (ext[ext.length - 1] == 'jpg' || ext[ext.length - 1] == 'png' || ext[ext.length - 1] == 'jpeg' || ext[ext.length - 1] == 'pdf') {
        let params;
        if (this.scrapIds) {
          params = {
            reason: 'customerPasbookDetails',
            scrapId: this.scrapIds.scrapId
          }
        } else {
          params = {
            reason: 'loan',
            masterLoanId: this.masterAndLoanIds.masterLoanId
          }
        }
        this.sharedService.uploadFile(event.target.files[0], params).pipe(
          map(res => {
            this.passbookImg.push(res.uploadFile.URL);
            this.passbookImgId.push(res.uploadFile.path);
            this.passbookImgFileName.push(res.uploadFile.originalname)
            this.bankForm.patchValue({ passbookProofImage: this.passbookImg });
            this.bankForm.patchValue({ passbookProof: this.passbookImgId });
            this.bankForm.patchValue({ passbookProofImageName: this.passbookImgFileName[this.passbookImgFileName.length - 1] });
            this.ref.detectChanges();
          }), catchError(err => {
            // this.toastr.error(err.error.message);
            throw err
          }), finalize(() => {
            this.passbook.nativeElement.value = ''
          })).subscribe();
        this.ref.detectChanges();
      } else {
        this.toastr.error('Upload Valid File Format');
      }
    } else {
      this.toastr.error('Cannot upload more than two images');
    }

  }

  removeImages(index) {
    //console.log(index)
    this.passbookImgId.splice(index, 1);
    this.passbookImg.splice(index, 1)
    this.passbookImgFileName.splice(index, 1)
    this.bankForm.get('passbookProof').patchValue(this.passbookImgId);
    this.bankForm.get('passbookProofImage').patchValue(this.passbookImg);
    this.bankForm.get('passbookProofImageName').patchValue(this.passbookImgFileName[this.passbookImgFileName.length - 1]);
    this.ref.detectChanges();
  }

  preview(value) {
    var ext = value.split('.')
    if (ext[ext.length - 1] == 'pdf') {
      this.dialog.open(PdfViewerComponent, {
        data: {
          pdfSrc: value,
          page: 1,
          showAll: true
        },
        width: "80%"
      })
    } else {
      this.dialog.open(ImagePreviewDialogComponent, {
        data: {
          images: [value],
          index: 0
        },
        width: "auto"
      })
    }
  }

  get controls() {
    if (this.bankForm)
      return this.bankForm.controls
  }

  nextAction() {

    if (this.disable) {
      this.next.emit(5)
      return
    }

    let data
    if (this.controls.paymentType.value == "bank") {
      if (this.bankForm.invalid) {
        this.bankForm.markAllAsTouched()
        return
      }
    } else {
      if (this.controls.paymentType.invalid) {
        this.controls.paymentType.markAsTouched();
        return
      }
      this.bankForm.reset()
      this.bankForm.controls.paymentType.patchValue('cash')
      this.bankForm.controls.passbookProof.patchValue([])
      this.bankForm.controls.passbookProofImage.patchValue([])
    }
    this.controls.paymentType.enable()
    data = this.bankForm.value

    if (this.scrapIds) {
      this.scrapApplicationFormService.submitBank(data, this.scrapIds).pipe(
        map(res => {
          if (Number(this.finalScrapAmt) > 200000) {
            this.controls.paymentType.disable()
          }
          let stage = res.scrapCurrentStage
          stage = Number(stage) - 1;
          this.next.emit(stage)
        })).subscribe()
    } else {
      this.loanFormService.submitBank(data, this.masterAndLoanIds).pipe(
        map(res => {
          if (Number(this.finalLoanAmt) > 200000) {
            this.controls.paymentType.disable()
          }
          this.next.emit(5)
        })).subscribe()
    }
  }

}
