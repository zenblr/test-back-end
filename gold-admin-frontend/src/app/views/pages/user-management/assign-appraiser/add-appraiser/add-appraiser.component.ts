import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { BranchService } from '../../../../../core/user-management/branch/services/branch.service';
import { SharedService } from '../../../../../core/shared/services/shared.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { ToastrComponent } from '../../../../../views/partials/components/toastr/toastr.component';
import { PartnerService } from '../../../../../core/user-management/partner/services/partner.service';

@Component({
  selector: 'kt-add-appraiser',
  templateUrl: './add-appraiser.component.html',
  styleUrls: ['./add-appraiser.component.scss']
})
export class AddAppraiserComponent implements OnInit {
  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
  branchForm: FormGroup;
  states: any;
  cities: any;
  partners = [];
  editData = false;
  viewOnly = false;
  viewLoading: boolean = false;
  title: string;

  constructor(
    public dialogRef: MatDialogRef<AddAppraiserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private sharedService: SharedService,
    private fb: FormBuilder,
    private branchService: BranchService,
    private partnerService: PartnerService
  ) { }

  ngOnInit() {

    this.formInitialize();
    this.setForm()
    this.getAllPartners();
    this.getStates();

  }

  setForm() {
    if (this.data.action == 'add') {
      this.title = 'Add Appraiser'

    } else if (this.data.action == 'edit') {
      this.title = 'Edit Appraiser'
      this.getPartnerById(this.data.partnerId);
    } else {
      this.title = 'View Appraiser'
      this.branchForm.disable();
      this.getPartnerById(this.data.partnerId);
    }
  }

  formInitialize() {
    this.branchForm = this.fb.group({
      id: [''],
      name: ['', [Validators.required]],
      partnerId: ['', [Validators.required]],
    });
  }

  getAllPartners() {
    this.partnerService.getAllPartnerWithoutPagination().subscribe(res => {
      this.partners = res.data;
    })
  }

  getStates() {
    this.sharedService.getStates().subscribe(res => {
      this.states = res.message;
    },
      error => {
      });
  }

  getCities() {
    const stateId = this.controls.stateId.value;
    this.sharedService.getCities(stateId).subscribe(res => {
      this.cities = res.message;
    },
      error => {
      });
  }

  getPartnerById(id) {
    this.viewLoading = true
    this.branchService.getBranchById(id).subscribe(res => {
      console.log(res);
      this.branchForm.patchValue(res);
      this.getCities()
    },
      error => {
        console.log(error.error.message);
      });
  }

  // getter for controls

  get controls() {
    return this.branchForm.controls;
  }

  action(event: Event) {
    if (event) {
      this.onSubmit()
    } else if (!event) {
      this.dialogRef.close()
    }
  }

  onSubmit() {
    if (this.branchForm.invalid) {
      this.branchForm.markAllAsTouched()
      return
    }
    // console.log(this.branchForm.value);
    const partnerData = this.branchForm.value;
    const id = this.controls.id.value;

    if (this.data.action == 'edit') {
      this.branchService.updateBranch(id, partnerData).subscribe(res => {
        // console.log(res);
        if (res) {
          const msg = 'Branch Updated Sucessfully';
          this.toastr.successToastr(msg);
          this.dialogRef.close(true);
        }
      },
        error => {
          console.log(error.error.message);
          const msg = error.error.message;
          this.toastr.errorToastr(msg);
        });

    } else {
      this.branchService.addBranch(partnerData).subscribe(res => {
        // console.log(res);
        if (res) {
          const msg = 'Partner Added Successfully';
          this.toastr.successToastr(msg);
          this.dialogRef.close(true);
        }
      },
        error => {
          console.log(error.error.message);
          const msg = error.error.message;
          this.toastr.errorToastr(msg);
        });
    }

  }

  onAlertClose($event) {
    // this.hasFormErrors = false;
  }

}
