import { Component, OnInit, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";
import { OrderDetailsService } from "../../../../../../core/emi-management/order-management/order-details/services/order-details.service";
import { Observable } from "rxjs";

@Component({
	selector: "kt-order-details-view",
	templateUrl: "./order-details-view.component.html",
	styleUrls: ["./order-details-view.component.scss"],
})
export class OrderDetailsViewComponent implements OnInit {
	viewLoading = false;
	title: string;
	orderTrackingLogs$: Observable<[]>;

	constructor(
		public dialogRef: MatDialogRef<OrderDetailsViewComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private orderDetailsService: OrderDetailsService
	) {}

	ngOnInit() {
		if (this.data.action == "view") {
			this.title = "Order Logs";
			this.getOrderTrackingLog(this.data.orderId);
		}
	}

	getOrderTrackingLog(id) {
		this.viewLoading = true;
		this.orderTrackingLogs$ = this.orderDetailsService.getOrderTrackingLog(
			id
		);
	}

	action(event: Event) {
		if (!event) {
			this.dialogRef.close();
		}
	}

	// downloadFile(data: any) {
	// 	const blob = new Blob([data], { type: "text/csv/jpeg/png" });
	// 	const url = window.URL.createObjectURL(blob);
	// 	window.open(url);
	// }
}
