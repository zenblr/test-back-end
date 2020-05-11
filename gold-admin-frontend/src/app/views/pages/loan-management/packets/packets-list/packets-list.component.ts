import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { Subscription, merge, Subject, from } from 'rxjs';
import { tap, distinctUntilChanged, skip, takeUntil, map } from 'rxjs/operators';
import { DataTableService } from '../../../../../core/shared/services/data-table.service';
import { PacketsDatasource, PacketsService } from '../../../../../core/loan-management'
import { AssignPacketsComponent } from '../assign-packets/assign-packets.component';
@Component({
  selector: 'kt-packets-list',
  templateUrl: './packets-list.component.html',
  styleUrls: ['./packets-list.component.scss']
})
export class PacketsListComponent implements OnInit {
  dataSource: PacketsDatasource;
  displayedColumns = ['customerID', 'loanId', 'packetId', 'actions'];
  leadsResult = []
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  // Filter fields
  // @ViewChild('searchInput', { static: true }) searchInput: ElementRef;
  // @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
  destroy$ = new Subject();

  // Subscriptions
  private subscriptions: Subscription[] = [];
  private unsubscribeSearch$ = new Subject();
  searchValue = '';

  constructor(
    public dialog: MatDialog,
    private packetsService: PacketsService,
    private dataTableService: DataTableService
  ) {
    this.packetsService.openModal$.pipe(
      map(res => {
        if (res) {
          this.assignPackets();
        }
      }),
      takeUntil(this.destroy$)).subscribe();
  }

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

    // Init DataSource
    this.dataSource = new PacketsDatasource(this.packetsService);
    const entitiesSubscription = this.dataSource.entitySubject.pipe(
      skip(1),
      distinctUntilChanged()
    ).subscribe(res => {
      this.leadsResult = res;
    });
    this.subscriptions.push(entitiesSubscription);

    // First load
    // this.loadLeadsPage();

    this.dataSource.loadpackets(this.searchValue, 1, 25);

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

    this.dataSource.loadpackets(this.searchValue, from, to);
  }

  assignPackets() {
    // console.log(event);
    const dialogRef = this.dialog.open(AssignPacketsComponent, {
      data: { action: 'add' },
      width: '400px'
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadPackets();
      }
      this.packetsService.openModal.next(false);
    });
  }

  editLead(role) {
    const dialogRef = this.dialog.open(AssignPacketsComponent,
      {
        data: { packetData: role, action: 'edit' },
        width: '400px'
      });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadPackets();
      }
    });
  }


}