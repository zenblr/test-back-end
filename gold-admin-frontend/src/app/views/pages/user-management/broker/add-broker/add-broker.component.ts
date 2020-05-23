import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { BrokerService } from '../../../../../core/user-management/broker';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { SharedService } from '../../../../../core/shared/services/shared.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { map, catchError, finalize } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { StoreService } from '../../../../../core/user-management/store';

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
      this.title = 'Edit Broker'
      this.brokerFrom.patchValue(this.data.broker)
      this.getCities()
      this.getStore()
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
      imgName: [''],
      userId: [],
    })

    // this.controls.imgName.disable()
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

  getFileInfo(event) {
    var name = event.target.files[0].name
    var ext = name.split('.')
    if (ext[ext.length - 1] == 'jpg' || ext[ext.length - 1] == 'png' || ext[ext.length - 1] == 'jpeg') {
      this.sharedService.uploadFile(event.target.files[0]).pipe(
        map(res => {
          this.brokerFrom.controls.imgName.patchValue(event.target.files[0].name)
          this.brokerFrom.controls.panCard.patchValue(res.uploadFile.URL)
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
