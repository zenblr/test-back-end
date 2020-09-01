import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SharedService } from '../../../../../../core/shared/services/shared.service';
import { map, catchError, finalize } from 'rxjs/operators';
import { UserBankService } from '../../../../../../core/kyc-settings/services/user-bank.service';
import { UserDetailsService } from '../../../../../../core/kyc-settings';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'kt-user-banks',
  templateUrl: './user-banks.component.html',
  styleUrls: ['./user-banks.component.scss']
})
export class UserBanksComponent implements OnInit {

  @Output() next: EventEmitter<any> = new EventEmitter<any>();
  bankForm: FormGroup;
  customerDetails = this.userDetailsService.userData;
  // customerDetails = { customerId: 1, customerKycId: 2 }
  file: any;
  passBookImage = [];
  @ViewChild("signature", { static: false }) signature;

  constructor(private fb: FormBuilder, private sharedService: SharedService,
    private userBankService: UserBankService, private userDetailsService: UserDetailsService,
    private ref: ChangeDetectorRef, private toastr: ToastrService) {
    
  }

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.bankForm = this.fb.group({
      customerId: [this.customerDetails.customerId],
      customerKycId: [this.customerDetails.customerKycId],
      bankName: ['', [Validators.required]],
      bankBranchName: ['', [Validators.required]],
      accountType: ['', [Validators.required]],
      accountHolderName: ['', [Validators.required]],
      accountNumber: ['', [Validators.required]],
      ifscCode: ['', [Validators.required, Validators.pattern('[A-Za-z]{4}[a-zA-Z0-9]{7}')]],
      passbookProof: [],
      passbookProofImage: [],
    })
  }

  getFileInfo(event) {
    if (this.passBookImage.length < 2) {
      this.file = event.target.files[0];
      var name = event.target.files[0].name
      var ext = name.split('.')
      if (ext[ext.length - 1] == 'jpg' || ext[ext.length - 1] == 'png' || ext[ext.length - 1] == 'jpeg') {
       
        this.sharedService.uploadFile(this.file).pipe(
          map(res => {
            this.passBookImage.push(res.uploadFile.URL);
            this.bankForm.patchValue({ passbookProof: this.passBookImage });

            this.bankForm.get('passbookProofImage').patchValue(event.target.files[0].name);
            this.ref.detectChanges();
           
          }), catchError(err => {
            this.toastr.error(err.error.message);
            throw err
          }), finalize(() => {
            this.signature.nativeElement.value = ''
          })).subscribe();
        this.ref.detectChanges();
      } else {
        this.toastr.error('Upload Valid File Format');
      }
    } else {
      this.toastr.error('Cannot upload more than two images');
    }
    
  }

  submit() {
   

    if (this.bankForm.invalid) {
      this.bankForm.markAllAsTouched()
      return
    }


    this.bankForm.patchValue({ passbookProof: this.passBookImage });
   
    const basicForm = this.bankForm.value;
    this.userBankService.bankDetails(basicForm).pipe(
      map(res => {
       
        if (res) {
          this.next.emit(true);
        }
      }),
      finalize(() => {
        // this.bankForm.get('passbookProof').patchValue(this.file.name);
        
      })
    ).subscribe();

  }

  removeImages(index) {
    this.passBookImage.splice(index, 1);
  
    this.bankForm.get('passbookProof').patchValue('');
    this.bankForm.get('passbookProofImage').patchValue('');
  }

  get controls() {
    return this.bankForm.controls;
  }
}
