// Angular
import { Component, OnInit, Inject, ChangeDetectionStrategy, OnDestroy, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DialogData } from '../../../../material/popups-and-modals/dialog/dialog.component';
import { SharedService } from '../../../../../../core/shared/services/shared.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
// Services
import { PartnerService } from '../../../../../../core/user-management/partner/services/partner.service';
import { ToastrService } from 'ngx-toastr';
import { ToastrComponent } from '../../../../../partials/components/toastr/toastr.component';

@Component({
  selector: 'kt-partner-add',
  templateUrl: './partner-add.component.html',
  styleUrls: ['./partner-add.component.scss']
})
export class PartnerAddComponent implements OnInit {

  // role: Role;
  // role$: Observable<Role>;
  // hasFormErrors = false;
  // viewLoading = false;
  // loadingAfterSubmit = false;
  // allPermissions$: Observable<Permission[]>;
  // rolePermissions: Permission[] = [];
  // // Private properties
  // private componentSubscriptions: Subscription;

  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
  partnerForm: FormGroup;
  states: any;
  cities: any;
  title: string;
  isMandatory = false

  constructor(
    public dialogRef: MatDialogRef<PartnerAddComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private sharedService: SharedService,
    private fb: FormBuilder,
    private partnerService: PartnerService,
  ) { }

  ngOnInit() {
    this.formInitialize();
    // this.getStates();

    if (this.data.action !== 'add') {
      this.getPartnerById(this.data['partnerId']);
      this.title = 'Edit Partner'
      this.isMandatory = true
    } else {
      this.title = 'Add Partner'
      this.isMandatory = true
    }
  }

  formInitialize() {
    this.partnerForm = this.fb.group({
      id: [''],
      name: ['', [Validators.required]],
      // partnerId: ['', [Validators.required]],
      commission: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      submitPacketInInternalBranch: [false]
      // state: ['', [Validators.required]],
      // city: ['', [Validators.required]],
      // address: ['', [Validators.required]],
    });
  }

  getStates() {
    this.sharedService.getStates().subscribe(res => {
      this.states = res.data;
    },
      error => {
        // console.error(error);
      });
  }

  async getCities(event) {

    const stateId = this.controls.state.value;

    let res = await this.sharedService.getCities(stateId)
    this.cities = res['data'];

  }

  getPartnerById(id) {
    this.partnerService.getPartnerById(id).subscribe(res => {

      this.partnerForm.patchValue(res);
    },
      error => {
        console.log(error.error.message);
      });
  }

  // getter for controls

  get controls() {
    return this.partnerForm.controls;
  }

  action(event: Event) {
    if (event) {
      this.onSubmit()
    } else if (!event) {
      this.dialogRef.close()
    }
  }

  onSubmit() {

    if (this.partnerForm.invalid) {
      this.partnerForm.markAllAsTouched()
      return
    }
    const partnerData = this.partnerForm.value;


    if (this.data.action == 'edit') {
      const id = this.controls.id.value;
      this.partnerService.updatePartner(id, partnerData).subscribe(res => {

        if (res) {
          const msg = 'Partner Updated Successfully';
          this.toastr.successToastr(msg);
          this.dialogRef.close(true);
        }
      },
        error => {
          //console.log(error.error.message);
          const msg = error.error.message;
          this.toastr.errorToastr(msg);
        });
    } else {
      this.partnerService.addPartner(partnerData).subscribe(res => {

        if (res) {
          const msg = 'Partner Added Successfully';
          this.toastr.successToastr(msg);
          this.dialogRef.close(true);
        }
      },
        error => {
          //console.log(error.error.message);
          const msg = error.error.message;
          this.toastr.errorToastr(msg);
        });
    }

    //   this.hasFormErrors = false;
    //   this.loadingAfterSubmit = false;
    //   /** check form */
    //   if (!this.isTitleValid()) {
    //     this.hasFormErrors = true;
    //     return;
    //   }
  }

  onAlertClose($event) {
    // this.hasFormErrors = false;
  }

  // getTitle(): string {
  //   if (this.role && this.role.id) {
  //     // tslint:disable-next-line:no-string-throw
  //     return `Edit role '${this.role.title}'`;
  //   }

  //   // tslint:disable-next-line:no-string-throw
  //   return 'New role';
  // }

  /**
   * Returns is title valid
   */
  // isTitleValid(): boolean {
  //   return (this.role && this.role.title && this.role.title.length > 0);
  // }

}
