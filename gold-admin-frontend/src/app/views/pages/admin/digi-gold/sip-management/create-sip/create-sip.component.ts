import { Component, OnInit, OnDestroy, ViewChild, NgZone, ChangeDetectorRef, Inject } from '@angular/core';
import { ToastrComponent } from '../../../../../partials/components/toastr/toastr.component';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SipApplicationService } from '../../../../../../core/sip-management/sip-application';
import { from } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { map, tap, catchError } from "rxjs/operators";
import { ToastrService } from 'ngx-toastr';
import { SharedService } from '../../../../../../core/shared/services/shared.service';
import { MatDialog } from '@angular/material';
import { ImagePreviewDialogComponent } from '../../../../../partials/components/image-preview-dialog/image-preview-dialog.component';
import { PdfViewerComponent } from '../../../../../../views/partials/components/pdf-viewer/pdf-viewer.component';
import { finalize } from 'rxjs/operators';
@Component({
  selector: 'kt-create-sip',
  templateUrl: './create-sip.component.html',
  styleUrls: ['./create-sip.component.scss']
})
export class CreateSipComponent implements OnInit {

  createSipForm: FormGroup;
  imgEnable = false;
  title: string;
  sipStatus: any;
  cycleDate: any;
  investmentTenure: any;
  customerName: any;
  sipStatusDisable = false;
  id: any;
  metalType = [
		{ value: 'gold', name: 'Gold' },
		{ value: 'silver', name: 'Silver' },
  ];

  constructor(
    public dialogRef: MatDialogRef<CreateSipComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private ref: ChangeDetectorRef,
    private router: Router,
    private sipApplicationService: SipApplicationService,
    private toastr: ToastrService,
    private sharedService: SharedService,
    private dialog: MatDialog,
  
  ) { }

  ngOnInit() {
    this.initForm();
    this.setForm();
    this.getAllCycleDate();
    this.getAllInvestmentTenure();
  }
  setForm() {
    console.log(this.data)
    if (this.data.action == 'add') {
      this.title = 'Add SIP';


    }
    else if (this.data.action == 'edit') {
      this.sipStatusDisable = true;
      this.title = 'Edit SIP';
      this.getIndividual(this.data.sipCreateData.id);
      this.createSipForm.patchValue(this.data.sipCreateData);
      this.createSipForm.disable();
      this.controls.sipStatus.enable();
    }
  }

  initForm() {
    this.createSipForm = this.fb.group({
      id: [],
      customerName: ['', [Validators.required]],
      customerUniqueId: ['', [Validators.required]],
      applicationDate: [new Date(), [Validators.required]],
      mobileNumber: [, [Validators.required, Validators.pattern('^[6-9][0-9]{9}$')]],
      metalType: ['', [Validators.required]],
      sipInvestmentTenure: ['', [Validators.required]],
      sipCycleDate: ['', [Validators.required]],
      investmentAmount: ['', [Validators.required]],
      ecsFormImage: ['', [Validators.required]],
      uploadEcsFormImageName: [],
      uploadEcsFormImage: [],
      source: ['web'],
      customerId: [],
      sipStatus: []

     
    });
    this.createSipForm.valueChanges.subscribe(val => console.log(val));
  }

  get controls() {
    if (this.createSipForm) {
      return this.createSipForm.controls;
    }
  }
  action(event) {
    if (event) {
      this.submit();
    } else if (!event) {
      this.dialogRef.close();
    }
  }

  // jhol //

  fileUpload(event) {
    if (this.sharedService.fileValidator(event)) {
      console.log(this.controls.customerId.value);
      const params = {
        reason: 'ecsForm',
        customerId: this.controls.customerId.value
      }
      this.sharedService.uploadFile(event.target.files[0], params).pipe(
        map(res => {
          if (res) {
            this.controls.uploadEcsFormImageName.patchValue(event.target.files[0].name)
            this.controls.ecsFormImage.patchValue([res.uploadFile.path])
            this.controls.uploadEcsFormImage.patchValue(res.uploadFile.URL)
          }
        }),
        catchError(err => {
          if (err.error.message) this.toastr.error(err.error.message)
          throw err
        }),
   
        ).subscribe()
    } else {
      event.target.value = ''
    }
  }

  upload() {
     this.imgEnable = true;
  }

  remove() {
    this.controls.ecsFormImage.patchValue(null)
    this.controls.uploadEcsFormImage.patchValue(null)
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

  editImages(value) {
    this[value].nativeElement.click()
  }
  getIndividual(id) {
    this.sipApplicationService.getIndividual(id).pipe(
      map(res =>{
        this.sipStatus = res.SipData.sipNextStatus;
        this.createSipForm.patchValue(res.SipData.customer);
        this.controls.sipStatus.patchValue(res.SipData.sipStatus);
        this.controls.customerName.patchValue(res.SipData.customer.firstName +' '+ res.SipData.customer.lastName);
      })
      ).subscribe()   
      }


  getAllCycleDate() { 
    this.sipApplicationService.getAllCycleDate().pipe(
      map(res =>{
        this.cycleDate = res;
      })
      ).subscribe()   
  }

  getAllInvestmentTenure() {
    
    this.sipApplicationService.getAllInvestmentTenure().pipe(
      map(res =>{
        this.investmentTenure = res;
      })
      ).subscribe()   
  }
  
  inputNumber() {
    if (this.controls.mobileNumber.valid) {
     this.sipApplicationService.addMobile(this.controls.mobileNumber.value).pipe(
      map(res =>{
        this.customerName = res.firstName+ ' ' + res.lastName;
        this.controls.customerName.patchValue(this.customerName);
        this.controls.customerUniqueId.patchValue(res.customerUniqueId)
        this.controls.customerId.patchValue(res.id)   
      })
      ).subscribe()   
    }
  }

  submit() {
    if (this.createSipForm.invalid) {
      this.createSipForm.markAllAsTouched();
      return;
    }

    if (this.data.action == 'add') {
      this.sipApplicationService.addSipApplication(this.createSipForm.value).subscribe(res => {
        if (res) {
          const msg = 'SIP Application Created Sucessfully';
          this.toastr.success(msg);
          this.dialogRef.close(true);
        }
      });
    }
    else {
      this.sipStatusDisable = false;
      this.sipApplicationService.updateIndividual(this.data.sipCreateData.id, this.createSipForm.value).subscribe(res => {
        if (res) {
          const msg = 'Sip Cycle Date Added Successfully';
          this.toastr.success(msg);
          this.dialogRef.close(true);
        }
      });
    }  
  }
}
