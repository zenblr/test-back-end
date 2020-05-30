import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { EmiDetailsService } from "../../../../../../core/emi-management/order-management";
@Component({
  selector: 'kt-emi-details-view',
  templateUrl: './emi-details-view.component.html',
  styleUrls: ['./emi-details-view.component.scss']
})
export class EmiDetailsViewComponent implements OnInit {
  title: string;
  orderData: any;
  constructor(
    public dialogRef: MatDialogRef<EmiDetailsViewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private emiDetailsService: EmiDetailsService
  ) { }

  ngOnInit() {
    this.emiDetailsService.getEmiDetails(this.data.orderId).subscribe(res => {
      this.orderData = res;
    });

    this.getTitle()
  }

  getTitle() {
    this.title = 'View Details'
  }

  action(event: Event) {
    if (event) {
      return;
    } else if (!event) {
      this.dialogRef.close()
    }
  }
}
