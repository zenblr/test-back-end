import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { MatPaginator, MatSort, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Subscription, merge, Subject, from } from 'rxjs';
import { tap, distinctUntilChanged, skip, takeUntil, map } from 'rxjs/operators';
import { DataTableService } from '../../../../../../core/shared/services/data-table.service';
import { ScrapPacketTrackingDatasource, ScrapPacketTrackingService } from '../../../../../../core/scrap-management'
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import { ToastrService } from 'ngx-toastr';
import { NgxPermissionsService } from 'ngx-permissions';

@Component({
  selector: 'kt-view-packet-log',
  templateUrl: './view-packet-log.component.html',
  styleUrls: ['./view-packet-log.component.scss']
})
export class ViewPacketLogComponent implements OnInit {
  dataSource: ScrapPacketTrackingDatasource;
  displayedColumns = ['location', 'updatedBy', 'handover', 'internalBranch', 'courier', 'podNumber', 'date', 'time', 'timeTaken'];
  leadsResult = []
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  destroy$ = new Subject();
  private subscriptions: Subscription[] = [];
  private unsubscribeSearch$ = new Subject();
  searchValue = '';
  modalData: any;
  masterLoanId: any;
  loanId: any;
  scrapId: any;

  constructor(
    public dialog: MatDialog,
    private scrapPacketTrackingService: ScrapPacketTrackingService,
    private dataTableService: DataTableService,
    public dialogRef: MatDialogRef<ViewPacketLogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private layoutUtilsService: LayoutUtilsService,
    private toastr: ToastrService,
    private ngxPermissionService: NgxPermissionsService
  ) {

  }

  ngOnInit() {
    this.setValue()

    const paginatorSubscriptions = merge(this.paginator.page).pipe(
      tap(() => {
        this.loadPackets();
      })
    )
      .subscribe();
    this.subscriptions.push(paginatorSubscriptions);

    const searchSubscription = this.dataTableService.searchInput$.pipe(takeUntil(this.unsubscribeSearch$))
      .subscribe(res => {
        this.searchValue = res;
        this.paginator.pageIndex = 0;
        this.loadPackets();
      });

    // Init DataSource
    this.dataSource = new ScrapPacketTrackingDatasource(this.scrapPacketTrackingService);
    const entitiesSubscription = this.dataSource.entitySubject.pipe(
      skip(1),
      distinctUntilChanged()
    ).subscribe(res => {
      this.leadsResult = res;
    });
    this.subscriptions.push(entitiesSubscription);

    // First load
    // this.loadLeadsPage();

    this.dataSource.loadpacketsLog(this.scrapId, 1, 25);

  }

  setValue() {
    //console.log(this.data.packetData.customerLoan[0].id,'loanId')
    //console.log(this.data.packetData.id)
    this.modalData = this.data.packetData;
    this.scrapId = this.data.packetData.id;
    // this.loanId = this.data.packetData.customerLoan[0].id
  }

  ngOnDestroy() {
    this.subscriptions.forEach(el => el.unsubscribe());
    this.unsubscribeSearch$.next();
    this.unsubscribeSearch$.complete();
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPackets() {
    if (this.paginator.pageIndex < 0 || this.paginator.pageIndex > (this.paginator.length / this.paginator.pageSize))
      return;
    let from = ((this.paginator.pageIndex * this.paginator.pageSize) + 1);
    let to = ((this.paginator.pageIndex + 1) * this.paginator.pageSize);

    this.dataSource.loadpacketsLog(this.scrapId, from, to);
  }

  action(event) {
    if (!event)
      this.dialogRef.close()
  }
}
