import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LoanSettingsService } from '../../../../../core/loan-setting';
import { ToastrService } from 'ngx-toastr';
import { map } from 'rxjs/operators';
import { InternalUserBranchService } from '../../../../../core/user-management/internal-user-branch'

@Component({
  selector: 'kt-rpg-edit',
  templateUrl: './rpg-edit.component.html',
  styleUrls: ['./rpg-edit.component.scss']
})
export class RpgEditComponent implements OnInit {
  internalBranches: any;
  title: string;
  constructor(public dialogRef: MatDialogRef<RpgEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private loanSettingService: LoanSettingsService,
    private toast: ToastrService,
    private internalUserBranchService: InternalUserBranchService) { }

  rpgEditForm: FormGroup

  ngOnInit() {
    //console.log(this.data)
    this.rpgEditForm = this.fb.group({
      id: [],
      rpg: ['', Validators.required],
      schemeName: [],
      multiSelect: [[], Validators.required],
      internalBranchId: []
    });
    this.data.scheme.internalBranchId = this.data.scheme.internalBranches.map(e => e.id);
    this.data.scheme.multiSelect = { multiSelect: this.data.scheme.internalBranches };
    this.rpgEditForm.patchValue(this.data.scheme);
    this.getInternalBranchList();
    if (this.data.action) {
      this.title = (this.data.action == 'edit') ? 'Edit Scheme Details' : 'View Scheme Details';
      if(this.data.action == 'view'){
        this.rpgEditForm.disable();
      }
    }

  }
  ngAfterViewInit() {
    this.rpgEditForm.controls.multiSelect.valueChanges.subscribe(res => {
      if (res && res.multiSelect.length == 0) {
        this.rpgEditForm.controls.multiSelect.patchValue(null)
      }
    })
  }

  getInternalBranchList() {
    this.internalUserBranchService.getInternalBranch('', 1, -1).pipe(
      map(res => {
        this.internalBranches = res.data
      }),
    ).subscribe()
  }

  onSubmit() {
    if (this.rpgEditForm.invalid) {
      this.rpgEditForm.markAllAsTouched()
      return
    }
    const internalBranchIdArr = this.rpgEditForm.controls.multiSelect.value.multiSelect.map(e => e.id)
    this.rpgEditForm.controls.internalBranchId.patchValue(internalBranchIdArr);
    this.loanSettingService.editRpg(this.rpgEditForm.value).subscribe(res => {
      this.toast.success("Updated")
      this.dialogRef.close(res)

    })
  }

  action(event: Event) {
    if (event) {
      this.onSubmit()
    }
    else if (!event) {
      this.dialogRef.close()
    }
  }
}
