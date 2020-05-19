import { Component, OnInit, Inject, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { SharedService } from '../../../../../../core/shared/services/shared.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { ToastrComponent } from '../../../../../../views/partials/components/toastr/toastr.component';

@Component({
  selector: 'kt-refund-management-edit',
  templateUrl: './refund-management-edit.component.html',
  styleUrls: ['./refund-management-edit.component.scss']
})
export class RefundManagementEditComponent implements OnInit {
  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
  constructor(  public dialogRef: MatDialogRef<RefundManagementEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,) { }

  ngOnInit() {
  }
  action(event: Event) {
    if (event) {
      this.onSubmit()
    } else if (!event) {
      this.dialogRef.close()
    }
  }

  onSubmit(){
    
  }
}
