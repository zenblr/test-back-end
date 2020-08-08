import { Component, OnInit, ViewChild } from '@angular/core';
import { Subject, Subscription, merge } from 'rxjs';
import { MatPaginator, MatDialog } from '@angular/material';
import { DataTableService } from '../../../../../../core/shared/services/data-table.service';
import { map, takeUntil, tap, skip, distinctUntilChanged } from 'rxjs/operators';
import { LayoutUtilsService } from '../../../../../../core/_base/crud/utils/layout-utils.service';
import { ToastrService } from 'ngx-toastr';
import { OtherChargesDatasource } from '../../../../../../core/masters/other-charges/datasources/other-charges.datasource'
import { OtherChargesService } from '../../../../../../core/masters/other-charges/service/other-charges.service'
import { OtherChargesAddComponent } from "../other-charges-add/other-charges-add.component";

@Component({
  selector: 'kt-other-charges-list',
  templateUrl: './other-charges-list.component.html',
  styleUrls: ['./other-charges-list.component.scss']
})
export class OtherChargesListComponent implements OnInit {
  dataSource: OtherChargesDatasource;
  displayedColumns = ['otherCharges', 'action'];
  result = []
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  unsubscribeSearch$ = new Subject();
  destroy$ = new Subject();
  searchValue = '';
  private subscriptions: Subscription[] = [];
  constructor(
    private dataTableService: DataTableService,
    public dialog: MatDialog,
    private layoutUtilsService: LayoutUtilsService,
    private toastr: ToastrService,
    private otherChargesService: OtherChargesService

  ) {
    this.otherChargesService.openModal$.pipe(
      map(res => {
        if (res) {
          this.addOtherCharges();
        }
      }),
      takeUntil(this.destroy$)).subscribe();
  }

  ngOnInit() {
    // const paginatorSubscriptions = merge(this.paginator.page).pipe(
    //   tap(() => this.loadPage())
    // ).subscribe();
    // this.subscriptions.push(paginatorSubscriptions);


    const searchSubscription = this.dataTableService.searchInput$.pipe(takeUntil(this.unsubscribeSearch$))
      .subscribe(res => {
        this.searchValue = res;
        this.paginator.pageIndex = 0;
        this.loadPage();
      });

    this.dataSource = new OtherChargesDatasource(this.otherChargesService);
    const entitiesSubscription = this.dataSource.entitySubject.pipe(
      skip(1),
      distinctUntilChanged()
    ).subscribe(res => {
      this.result = res;
    });
    this.subscriptions.push(entitiesSubscription);
    this.dataSource.getAllOtherChrges(1, 25, this.searchValue);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(el => el.unsubscribe());
    this.unsubscribeSearch$.next();
    this.unsubscribeSearch$.complete();
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPage() {
    // if (this.paginator.pageIndex < 0 || this.paginator.pageIndex > (this.paginator.length / this.paginator.pageSize))
    //   return;
    // let from = ((this.paginator.pageIndex * this.paginator.pageSize) + 1);
    // let to = ((this.paginator.pageIndex + 1) * this.paginator.pageSize);
    this.dataSource.getAllOtherChrges(1, 25, this.searchValue);
  }

  addOtherCharges() {
    const dialogRef = this.dialog.open(OtherChargesAddComponent, {
      data: { action: 'add' },
      width: '450px',
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadPage();
      }
      this.otherChargesService.openModal.next(false);
    });
  }

  editDescription(item) {
    const dialogRef = this.dialog.open(OtherChargesAddComponent,
      {
        data: { descriptionData: item, action: 'edit' },
        width: '450px'
      });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadPage();
      }
    });
  }

  deleteDescription(item) {
    const role = item;
    const _title = 'Delete Other Charges';
    const _description = 'Are you sure you want to permanently delete this Other Charges?';
    const _waitDesciption = 'Other Charges is deleting...';
    const _deleteMessage = `Other Charges has been deleted`;
    const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.otherChargesService.deleteOtherCharges(item.id).subscribe(res => {
          this.toastr.success(_deleteMessage);
          this.loadPage();
        },
          errorDelete => {
            this.toastr.error(errorDelete.error.message);
          });
      }
    });
  }

}
