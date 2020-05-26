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
import { ToastrComponent } from "../../../../../partials/components/toastr/toastr.component";
import {
	RefundDetailsDatasource,
	RefundDetailsModel,
	RefundDetailsService,
} from "../../../../../../core/emi-management/order-management";
@Component({
	selector: "kt-refund-details-view",
	templateUrl: "./refund-details-view.component.html",
	styleUrls: ["./refund-details-view.component.scss"],
})
export class RefundDetailsViewComponent implements OnInit {
	@ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
	refundData: any;
	viewLoading = false;
	title: string;
	isMandatory = false;
	constructor(
		public dialogRef: MatDialogRef<RefundDetailsViewComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private refundDetailsService: RefundDetailsService,
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
		this.refundDetailsService.getSingleRefund(refundId).subscribe(
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
