import { Component, OnInit, ViewChild } from '@angular/core';
import { MyPacketsDatasource, MyPacketsService } from '../../../../../../core/loan-management';
import { merge, Subject, Subscription } from 'rxjs';
import { tap, takeUntil, skip, distinctUntilChanged, map } from 'rxjs/operators';
import { DataTableService } from '../../../../../../core/shared/services/data-table.service';
import { MatPaginator, MatDialog } from '@angular/material';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import { ToastrService } from 'ngx-toastr';
import { NgxPermissionsService } from 'ngx-permissions';
import { Router } from '@angular/router';
import { ViewPacketLogComponent } from '../view-packet-log/view-packet-log.component';
import { UpdateLocationComponent } from '../../../../../partials/components/update-location/update-location.component';
import { ViewPacketDialogComponent } from '../view-packet-dialog/view-packet-dialog.component';

@Component({
  selector: 'kt-my-packets',
  templateUrl: './my-packets.component.html',
  styleUrls: ['./my-packets.component.scss']
})
export class MyPacketsComponent implements OnInit {

  dataSource: MyPacketsDatasource;
  displayedColumns = ['customerId', 'customerName', 'loanId', 'loanAmount', 'internalBranch', 'partner', 'partnerBranch', 'currentLocation', 'viewPackets', 'actions'];
  leadsResult = []
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  destroy$ = new Subject();

  // Subscriptions
  private subscriptions: Subscription[] = [];
  private unsubscribeSearch$ = new Subject();
  searchValue = '';

  constructor(
    public dialog: MatDialog,
    private myPacketsService: MyPacketsService,
    private dataTableService: DataTableService,
    private toastr: ToastrService,
  ) { }

  ngOnInit() {
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

    this.subscriptions.push(searchSubscription)

    this.dataSource = new MyPacketsDatasource(this.myPacketsService);
    const entitiesSubscription = this.dataSource.entitySubject.pipe(
      skip(1),
      distinctUntilChanged()
    ).subscribe(res => {
      this.leadsResult = res;
    });
    this.subscriptions.push(entitiesSubscription);
    this.dataSource.loadpackets(this.searchValue, 1, 25);

  }

  ngOnDestroy() {
    this.subscriptions.forEach(el => el.unsubscribe());
    this.unsubscribeSearch$.next();
    this.unsubscribeSearch$.complete();
  }


  loadPackets() {
    if (this.paginator.pageIndex < 0 || this.paginator.pageIndex > (this.paginator.length / this.paginator.pageSize))
      return;
    let from = ((this.paginator.pageIndex * this.paginator.pageSize) + 1);
    let to = ((this.paginator.pageIndex + 1) * this.paginator.pageSize);

    this.dataSource.loadpackets(this.searchValue, from, to);
  }

  viewPackets(packet) {
    const dialogRef = this.dialog.open(ViewPacketDialogComponent,
      {
        data: { packetData: packet.masterLoan.packet },
        width: '400px',
      });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadPackets();
      }
    });
  }

  deliver(packet) {
    const queryParams = {
      id: packet.id
    }
    this.myPacketsService.deliver(queryParams).pipe(
      map(res => {
        // console.log(res)
        this.deliverModal(
          {
            id: packet.id,
            receiverType: res.data.receiverType,
            partnerBranchId: res.data.partnerBranchId,
            masterLoanId: res.data.masterLoanId,
          })
      }))
      .subscribe()
  }

  deliverModal(params) {

    const dialogRef = this.dialog.open(UpdateLocationComponent,
      {
        data: {
          deliver: true,
          id: params.id,
          receiverType: params.receiverType,
          partnerBranchId: params.partnerBranchId,
          masterLoanId: params.masterLoanId
        },
        width: '450px'
      });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadPackets();
      }
    });
  }

}
