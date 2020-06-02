import { Component, OnInit, ChangeDetectorRef, Input, EventEmitter, Output, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SharedService } from '../../../../../../core/shared/services/shared.service';
import { map, catchError, finalize } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'kt-bank-details',
  templateUrl: './bank-details.component.html',
  styleUrls: ['./bank-details.component.scss']
})
export class BankDetailsComponent implements OnInit, OnChanges {

  @ViewChild('passbook',{static:false}) passbook
  @Input() details;
  @Output() bankFormEmit: EventEmitter<any> = new EventEmitter();
  @Input() disable
  @Input() action
  @Input() totalAmt
  @Input() next
  bankForm: FormGroup;
  passbookImg: any = [];
  constructor(
    public toastr:ToastrService,
    public ref: ChangeDetectorRef,
    public fb: FormBuilder,
    public sharedService:SharedService
  ) {
    this.initForm()
  }

  ngOnInit() {

  }



  ngOnChanges(changes: SimpleChanges) {
    if (changes.details) {
      if (changes.action.currentValue == 'add') {
        this.bankForm.patchValue(changes.details.currentValue.customerKycBank[0])
      } else if (changes.action.currentValue == 'edit') {
        this.bankForm.patchValue(changes.details.currentValue.loanBankDetail)
        this.ref.markForCheck()
      }

      this.bankFormEmit.emit(this.bankForm);
    }
    if(changes.totalAmt){
      if(changes.totalAmt.currentValue > '200000'){
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
      paymentType:['',Validators.required],
      bankName: [],
      accountNumber: [],
      ifscCode: [],
      accountType: [],
      accountHolderName: [],
      bankBranchName: [],
      passbookProof: [[]],
      passbookProofImage:['']
    })
    // this.bankForm.disable()
  }

  getFileInfo(event) {
    if (this.controls.passbookProof.value.length < 2) {
      var name = event.target.files[0].name
      var ext = name.split('.')
      if (ext[ext.length - 1] == 'jpg' || ext[ext.length - 1] == 'png' || ext[ext.length - 1] == 'jpeg') {
        this.sharedService.uploadFile(event.target.files[0]).pipe(
          map(res => {
            this.passbookImg.push(res.uploadFile.URL);
            this.bankForm.patchValue({ passbookProof: this.passbookImg });
            this.bankForm.get('passbookProofImage').patchValue(event.target.files[0].name);
            this.ref.detectChanges();
            console.log(this.bankForm.value);
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
    this.passbookImg.splice(index, 1);
    console.log(this.passbookImg)
    this.bankForm.get('passbookProof').patchValue(this.passbookImg);
    this.bankForm.get('passbookProofImage').patchValue('');
  }

  get controls() {
    if (this.bankForm)
      return this.bankForm.controls
  }

  nextAction(){
    if(this.bankForm.invalid){
      this.bankForm.markAllAsTouched();
      return
    }
    this.next.emit(5)
  }

}
