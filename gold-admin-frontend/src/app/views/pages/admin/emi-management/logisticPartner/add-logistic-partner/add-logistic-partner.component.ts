import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { LogisticPartnerService } from '../../../../../../core/emi-management/logistic-partner/service/logistic-partner.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ToastrComponent } from '../../../../../partials/components/toastr/toastr.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'kt-add-logistic-partner',
  templateUrl: './add-logistic-partner.component.html',
  styleUrls: ['./add-logistic-partner.component.scss']
})
export class AddLogisticPartnerComponent implements OnInit {
  // @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;

  logisticPartnerForm: FormGroup;
  title: string;
  isMandatory= false;
  

  constructor(
    public dialogRef: MatDialogRef<AddLogisticPartnerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private logisticPartnerSerivice: LogisticPartnerService,
    private toast:ToastrService
  ) { }
  ngOnInit() {
    this.formInitialize();
    if (this.data.action !== 'add') {
      this.getLogisticPartnerById(this.data['partnerId']);
      this.title = 'Edit Logistic Partner'
      this.isMandatory= true
    }else{
      this.title = 'Add Logistic Partner'
      this.isMandatory = true
    }
  }
  formInitialize() {
    this.logisticPartnerForm = this.fb.group({
      id: [''],
      name: ['', [Validators.required]],

    });
  }
  // }
  getLogisticPartnerById(id) {
    this.logisticPartnerSerivice.getLogisticPartnerById(id).subscribe(res => {
      this.logisticPartnerForm.patchValue(res);
    },
      error => {
        // console.log(error.error.message);
      })
  }

  get controls() {
    return this.logisticPartnerForm.controls;
  }
  action(event: Event) {
    if (event) {
      this.onSubmit()
    }
    else if (!event) {
      this.dialogRef.close()
    }
  }
  onSubmit() {
    if (this.logisticPartnerForm.invalid) {
      this.logisticPartnerForm.markAllAsTouched()
      return
    }
    const partnerData = this.logisticPartnerForm.value;

    if(this.data.action=='edit'){
      const id=this.controls.id.value;
      this.logisticPartnerSerivice.updateLogisticPartner(id,partnerData).subscribe(res=>{
        if(res){
          const msg= ' Logistic Partner Updated SuccessFully'
          this.toast.success(msg);
          this.dialogRef.close(true);
        
        }
      });
      }
      else{
        this.logisticPartnerSerivice.addLogisticPartner(partnerData).subscribe(res=>{
          if(res)
          {
            const msg=' Logistic Partner added successFully';
            this.toast.success(msg);
            this.dialogRef.close(true);
            // console.log(res.message)
          }
        })
      }
    }

  }



