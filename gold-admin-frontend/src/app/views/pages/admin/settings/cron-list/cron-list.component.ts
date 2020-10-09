import { Component, OnInit, ViewChild } from '@angular/core';
import { Subject, Subscription, merge } from 'rxjs';
import { KaratDetailsDataSource } from '../../../../../core/loan-setting/karat-details/datasource/karat-details.datasource'
import { MatPaginator, MatDialog, MatSort } from '@angular/material';
import { ToastrService } from 'ngx-toastr';
import { map } from 'lodash';
import { DataTableService } from '../../../../../core/shared/services/data-table.service';
import { Role } from '../../../../../core/auth';
import { LayoutUtilsService, MessageType } from '../../../../../core/_base/crud';
import { CronListService} from '../../../../../core/cron-list/services/cron-list.service'
import { CronListDatasource} from '../../../../../core/cron-list/datasources/cron-list.datasource'
import { takeUntil, tap, skip, distinctUntilChanged } from 'rxjs/operators';
// import { AddKaratDetailsComponent } from '../add-karat-details/add-karat-details.component';
import { NgxPermissionsService } from 'ngx-permissions';
@Component({
  selector: 'kt-cron-list',
  templateUrl: './cron-list.component.html',
  styleUrls: ['./cron-list.component.scss']
})
export class CronListComponent implements OnInit {
  dataSource;
  displayedColumns = ['cronType', 'date','startTime','endTime','processingTime','status','message','notes'];
  result = []
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  unsubscribeSearch$ = new Subject();
  destroy$ = new Subject();
  searchValue = '';
  private subscriptions: Subscription[] = [];
  private filter$ = new Subject();
  queryParamsData = {
    from: 1,
    to: 25,
    search: '',
    status: '',
    product: '',
  }
  filteredDataList: any = {};

  constructor(
    private dataTableService: DataTableService,
    private cronListService: CronListService,
    public dialog: MatDialog,
    private toastr: ToastrService,
    private layoutUtilsService: LayoutUtilsService

  ) {
    this.cronListService.applyFilter$
    .pipe(takeUntil(this.filter$))
    .subscribe((res) => {
      if (Object.entries(res).length) {
        this.applyFilter(res);
      }
    });
  }

  ngOnInit() {
    const paginatorSubscriptions = merge(this.paginator.page).pipe(
      tap(() => this.loadPage())
    ).subscribe();
    this.subscriptions.push(paginatorSubscriptions);


    const searchSubscription = this.dataTableService.searchInput$.pipe(takeUntil(this.unsubscribeSearch$))
      .subscribe(res => {
        this.searchValue = res;
        this.paginator.pageIndex = 0;
        this.loadPage();
      });

    this.dataSource = new CronListDatasource(this.cronListService);
    const entitiesSubscription = this.dataSource.entitySubject.pipe(
      skip(1),
      distinctUntilChanged()
    ).subscribe(res => {
      this.result = res;
    });
    this.subscriptions.push(entitiesSubscription);
    this.dataSource.getCronList(this.searchValue,1,25)

    // this.dataSource.getpacketsTrackingDetails(1, 25, this.searchValue);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(el => el.unsubscribe());
    this.unsubscribeSearch$.next();
    this.unsubscribeSearch$.complete();
    this.destroy$.next();
    this.destroy$.complete();
  }


  loadPage() {
    if (this.paginator.pageIndex < 0 || this.paginator.pageIndex > (this.paginator.length / this.paginator.pageSize))
      return;
    let from = ((this.paginator.pageIndex * this.paginator.pageSize) + 1);
    let to = ((this.paginator.pageIndex + 1) * this.paginator.pageSize);

    this.dataSource.getCronList(this.queryParamsData);
  }

  applyFilter(data) {
    console.log(data);
    this.queryParamsData.status = data.data.cronStatus;
    this.queryParamsData.product = data.data.product;
    this.dataSource.getCronList(this.queryParamsData);
    this.filteredDataList = data.list;
  }

  // addLocation() {
  //   const dialogRef = this.dialog.open(AddPacketLocationComponent, {
  //     data: { action: 'add' },
  //     width: '400px',
  //   });
  //   dialogRef.afterClosed().subscribe(res => {
  //     if (res) {
  //       this.loadPage();
  //     }
  //     this.cronListService.openModal.next(false);
  //   });
  // }

  // editLocation(location) {
  //   const dialogRef = this.dialog.open(AddPacketLocationComponent,
  //     {
  //       data: { locationData: location, action: 'edit' },
  //       width: '400px'
  //     });
  //   dialogRef.afterClosed().subscribe(res => {
  //     if (res) {
  //       this.loadPage();
  //     }
  //   });
  // }

  // deleteLocation(_item) {
  //   const role = _item;
  //   const _title = 'Delete Packet Location';
  //   const _description = 'Are you sure you want to permanently delete this Packet Location?';
  //   const _waitDesciption = 'Packet Location is deleting...';
  //   const _deleteMessage = `Packet Location has been deleted`;
  //   const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
  //   dialogRef.afterClosed().subscribe(res => {
  //     if (res) {
  //       this.cronListService.deletepacketLocation(role.id).subscribe(successDelete => {
  //         this.toastr.success(_deleteMessage);
  //         this.loadPage();
  //       },
  //         errorDelete => {
  //           this.toastr.error(errorDelete.error.message);
  //         });
  //     }
  //   });
  // }

}

