import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { BrokerService } from '../../../../../../core/user-management/broker';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { SharedService } from '../../../../../../core/shared/services/shared.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { map, catchError, finalize } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { StoreService } from '../../../../../../core/user-management/store';

@Component({
  selector: 'kt-add-broker',
  templateUrl: './add-broker.component.html',
  styleUrls: ['./add-broker.component.scss']
})
export class AddBrokerComponent implements OnInit {

  title: string;
  states: any[] = [];
  citys: any[] = [];
  brokerFrom: FormGroup;
  merchants: any[] = [];
  status: any[] = [];
  store: any;
  formData: FormData;

  constructor(
    public dialogRef: MatDialogRef<AddBrokerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private sharedService: SharedService,
    private fb: FormBuilder,
    private brokerService: BrokerService,
    private toast: ToastrService,
    private ref: ChangeDetectorRef,
    private storeService: StoreService
  ) { }

  ngOnInit() {
    this.status = this.data.status
    this.initForm();
    this.getStates();
    this.getMerchant();
    this.setTitle()

  }

  setTitle() {
    console.log(this.data)
    if (this.data.action == 'add') {
      this.title = 'Add Broker'
    } else if (this.data.action == 'edit') {
      this.title = 'Update Broker'
      this.getBrokerById()
    } else {
      this.title = 'View Broker';
      this.brokerFrom.patchValue(this.data.broker)
      this.getCities()
      this.getStore()
      this.brokerFrom.disable();
    }
    console.log(this.controls.approvalStatusId.value)
  }

  initForm() {
    this.brokerFrom = this.fb.group({
      merchantId: ['', Validators.required],
      storeId: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      mobileNumber: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      address: ['', Validators.required],
      stateId: ['', Validators.required],
      cityId: ['', Validators.required],
      pinCode: ['', Validators.required],
      approvalStatusId: ['', Validators.required],
      panCardNumber: ['', Validators.pattern('^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$')],
      nameOnPanCard: [''],
      panCard: [''],
      panCardImg: [''],
      imgName: [''],
      userId: [],
      ifscCode: ['', [Validators.required, Validators.pattern('[A-Za-z]{4}[a-zA-Z0-9]{7}')]],
      bankName: ['', [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z\-\\s]*$')]],
      bankBranch: ['', [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z\-\\s]*$')]],
      accountHolderName: ['', [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z\-\\s]*$')]],
      accountNumber: ['', Validators.required],
      passbookStatementChequeId: [],
      passbookImg: [],
      passbookImgName: ['', Validators.required]
    })

    // this.controls.imgName.disable()
  }

  getBrokerById() {
    this.brokerService.getBrokerById(this.data.broker).subscribe(res => {
      this.brokerFrom.patchValue(res)
      this.patchValueOfBroker(res)
      this.getCities()
      this.getStore()
    })
  }

  patchValueOfBroker(broker) {
    this.brokerFrom.patchValue({
      firstName: broker.user.firstName,
      lastName: broker.user.lastName,
      mobileNumber: broker.user.mobileNumber,
      email: broker.user.email,
      address: broker.user.address[0].address,
      stateId: broker.user.address[0].stateId,
      cityId: broker.user.address[0].cityId,
      pinCode: broker.user.address[0].postalCode,
      nameOnPanCard: broker.nameOnPanCard,
      panCard: broker.nameOnPanCard,
      passbookStatementChequeId: broker.passbookStatementCheque,
    })

    if (broker.passbookStatementChequeDetails) {
      this.brokerFrom.patchValue({
        passbookImgName: broker.passbookStatementChequeDetails.filename,
        passbookImg:broker.passbookStatementChequeDetails.url,
      })
    }

    if (broker.panCardDetails) {
      this.brokerFrom.patchValue({
        imgName: broker.panCardDetails.filename,
        panCardImg:broker.panCardDetails.url,
      })
    }
  }

  get controls() {
    if (this.brokerFrom)
      return this.brokerFrom.controls
  }

  getStates() {
    this.sharedService.getStates().pipe(map(
      res => {
        this.states = res.message;
      }
    )).subscribe()
  }

  getMerchant() {

    this.brokerService.getAllMerchant().pipe(
      map(res => {
        this.merchants = res
      }), catchError(err => {
        this.toast.error("Error", err.error.message)
        // this.toast.error(err.error.message,"Error")
        throw err
      }), finalize(() => {
        this.ref.detectChanges()
      })
    ).subscribe()

  }

  getCities() {

    this.sharedService.getCities(this.controls.stateId.value).pipe(map(
      res => {
        this.citys = res.message;
      }
    )).subscribe()

  }

  getStore() {
    this.storeService.getStoreByMerchant(this.controls.merchantId.value).pipe(
      map(res => {
        this.store = res
      })).subscribe()
  }


  action(event: Event) {

    if (event) {
      this.submit()
    } else if (!event) {
      this.dialogRef.close()
    }

  }

  getFileInfo(event, type) {
    var name = event.target.files[0].name
    var ext = name.split('.')
    if (ext[ext.length - 1] == 'jpg' || ext[ext.length - 1] == 'png' || ext[ext.length - 1] == 'jpeg') {
      this.formData = new FormData();
      this.formData.append("avatar", event.target.files[0]);
      this.sharedService.fileUpload(this.formData).pipe(
        map(res => {

          if (type == 'pan') {
            this.brokerFrom.controls.imgName.patchValue(event.target.files[0].name)
            this.brokerFrom.controls.panCard.patchValue(res.uploadFile.id)
            this.brokerFrom.controls.panCardImg.patchValue(res.uploadFile.URL)
          } else {
            this.brokerFrom.controls.passbookImgName.patchValue(event.target.files[0].name)
            this.brokerFrom.controls.passbookStatementChequeId.patchValue(res.uploadFile.id)
            this.brokerFrom.controls.passbookImg.patchValue(res.uploadFile.URL)
          }

        }), catchError(err => {
          this.toast.error(err.error.message);
          throw err
        })
      ).subscribe()
    } else {
      this.toast.error('Upload Valid File Format');
    }

  }

  submit() {
    if (this.brokerFrom.invalid) {
      this.brokerFrom.markAllAsTouched();
      return
    }

    this.controls.cityId.patchValue(parseInt(this.controls.cityId.value))
    this.controls.stateId.patchValue(parseInt(this.controls.stateId.value))
    this.controls.pinCode.patchValue(parseInt(this.controls.pinCode.value))
    this.controls.approvalStatusId.patchValue(parseInt(this.controls.approvalStatusId.value))
    this.controls.merchantId.patchValue(parseInt(this.controls.merchantId.value))

    if (this.data.action == 'add') {
      this.brokerService.addBroker(this.brokerFrom.value).pipe(
        map(res => {
          this.toast.success(res.message);
          this.dialogRef.close(res);
        }), catchError(err => {
          this.toast.error(err.error.message);
          throw err
        })
      ).subscribe()
    } else {
      this.brokerService.updateBroker(this.brokerFrom.value).pipe(
        map(res => {
          this.toast.success(res.message);
          this.dialogRef.close(res);
        }), catchError(err => {
          this.toast.error(err.error.message);
          throw err
        })
      ).subscribe()
    }

  }

}
