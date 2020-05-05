// Angular
import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
// Material
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort, MatSnackBar, MatDialog } from '@angular/material';
// RXJS
import { debounceTime, distinctUntilChanged, tap, skip, take, delay, takeUntil, map } from 'rxjs/operators';
import { fromEvent, merge, Observable, of, Subscription, Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
// NGRX
import { Store } from '@ngrx/store';
// Services
// import { LayoutUtilsService, MessageType } from '../../../../../core/_base/crud';
// Models
// import { Role, RolesDataSource, RoleDeleted, RolesPageRequested } from '../../../../../core/auth';
// import { AppState } from '../../../../../core/reducers';
// import { QueryParamsModel } from '../../../../../core/_base/crud';
// import { ToastrComponent } from '../../../../../views/partials/components/toastr/toastr.component';
// import { DataTableService } from '../../../../../core/shared/services/data-table.service';
import { Router } from '@angular/router';
import { WalletPriceService, WalletPriceDatasource, WalletPriceModel } from '../../../../../../core/emi-management/config-details/wallet-price';
import { WalletPriceAddComponent } from '../wallet-price-add/wallet-price-add.component';

@Component({
  selector: 'kt-wallet-price-list',
  templateUrl: './wallet-price-list.component.html',
  styleUrls: ['./wallet-price-list.component.scss']
})
export class WalletPriceListComponent implements OnInit {

  private destroy$ = new Subject();

  constructor(
    public dialog: MatDialog,
    private walletPriceService: WalletPriceService
  ) {
    this.walletPriceService.openModal$.pipe(takeUntil(this.destroy$)).subscribe(res => {
      if (res) {
        this.addWalletPrice();
      }
    })
   }

  ngOnInit(): void {
  }

  /**
	 * Add Wallet Price
	 */
  addWalletPrice() {
    const dialogRef = this.dialog.open(WalletPriceAddComponent, { data: { action: 'add' }, width: '450px' });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        // this.loadPartnersPage();
      }
    })
    this.walletPriceService.openModal.next(false);
  }
}
