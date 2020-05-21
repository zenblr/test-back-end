import {
	Component,
	OnInit,
	Inject,
	ViewChild,
	ChangeDetectorRef,
} from "@angular/core";
import { Validators, FormBuilder, FormGroup } from "@angular/forms";
import { SharedService } from "../../../../../../core/shared/services/shared.service";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";
import { ToastrComponent } from "../../../../../../views/partials/components/toastr/toastr.component";
import {
	RefundManagementDatasource,
	RefundManagementModel,
	RefundManagementService,
} from "../../../../../../core/emi-management/order-management";
@Component({
	selector: "kt-refund-management-view",
	templateUrl: "./refund-management-view.component.html",
	styleUrls: ["./refund-management-view.component.scss"],
})
export class RefundManagementViewComponent implements OnInit {
	@ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
	refundData: any;
	viewLoading = false;
	title: string;
	isMandatory = false;
	constructor(
		public dialogRef: MatDialogRef<RefundManagementViewComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private refundManagementService: RefundManagementService,
		private ref: ChangeDetectorRef
	) {}

	ngOnInit() {
		this.setForm();
	}

	action(event: Event) {
		if (event) {
		} else if (!event) {
			this.dialogRef.close();
		}
	}
	setForm() {
		this.title = "View Refund";
		this.getSingleRefundData(this.data.refundId);
	}

	getSingleRefundData(refundId) {
		this.viewLoading = true;
		this.refundManagementService.getSingleRefund(refundId).subscribe(
			(res) => {
				console.log(res);
				this.refundData = res;
				// this.productForm.patchValue(res);
				// this.productForm.controls['price'].patchValue(res.productPrice[0].finalProductPrice);
				this.ref.detectChanges();
			},
			(err) => {
				console.log(err);
			}
		);
	}
}
