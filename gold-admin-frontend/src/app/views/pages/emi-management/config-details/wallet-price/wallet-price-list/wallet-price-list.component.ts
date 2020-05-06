// Angular
import { Component, OnInit } from '@angular/core';
// Material
import { MatDialog } from '@angular/material';
// RXJS
import { tap, takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
// Services
import { WalletPriceService } from '../../../../../../core/emi-management/config-details/wallet-price';
import { WalletPriceAddComponent } from '../wallet-price-add/wallet-price-add.component';

@Component({
  selector: 'kt-wallet-price-list',
  templateUrl: './wallet-price-list.component.html',
  styleUrls: ['./wallet-price-list.component.scss']
})
export class WalletPriceListComponent implements OnInit {
  walletPrice$: Observable<any>;
  walletPriceData: any;
  private destroy$ = new Subject();

  constructor(
    public dialog: MatDialog,
    private walletPriceService: WalletPriceService
  ) {
    this.walletPriceService.openModal$.pipe(takeUntil(this.destroy$)).subscribe(res => {
      if (res) {
        if (this.walletPriceData) {
          this.editWalletPrice(this.walletPriceData);
        } else {
          this.addWalletPrice();
        }
      }
    })
  }

  ngOnInit() {
    this.getWalletPrice();
  }

  getWalletPrice() {
    this.walletPrice$ = this.walletPriceService.getWalletPrice().pipe(tap(res => this.walletPriceData = res));
  }

  /**
	 * Add Wallet Price
	 */
  addWalletPrice() {
    const dialogRef = this.dialog.open(WalletPriceAddComponent, { data: { action: 'add' }, width: '550px' });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.getWalletPrice();;
      }
    })
    this.walletPriceService.openModal.next(false);
  }

  /**
	 * Edit Wallet Price
	 */
  editWalletPrice(walletPrice) {
    const dialogRef = this.dialog.open(WalletPriceAddComponent,
      {
        data: { data: walletPrice, action: 'edit' },
        width: '550px'
      });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.getWalletPrice();
      }
    });
  }
}
