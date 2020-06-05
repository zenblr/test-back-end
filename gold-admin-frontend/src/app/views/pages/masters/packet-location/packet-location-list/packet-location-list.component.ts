import { Component, OnInit, ViewChild } from '@angular/core';
import { Subject, Subscription, merge } from 'rxjs';
import { MatPaginator, MatDialog } from '@angular/material';
import { DataTableService } from '../../../../../core/shared/services/data-table.service';
import { map, takeUntil, tap, skip, distinctUntilChanged } from 'rxjs/operators';
import { PacketLocationDatasource } from '../../../../../core/masters/packet-location/datasources/packet-location.datasource'
import { PacketLocationService } from '../../../../../core/masters/packet-location/service/packet-location.service';
import { AddPacketLocationComponent } from '../add-packet-location/add-packet-location.component';
@Component({
  selector: 'kt-packet-location-list',
  templateUrl: './packet-location-list.component.html',
  styleUrls: ['./packet-location-list.component.scss']
})
export class PacketLocationListComponent implements OnInit {
  dataSource;
  displayedColumns = ['location', 'action'];
  result = []
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  unsubscribeSearch$ = new Subject();
  destroy$ = new Subject();
  searchValue = '';
  private subscriptions: Subscription[] = [];

  constructor(
    private dataTableService: DataTableService,
    private packetLocationService: PacketLocationService,
    public dialog: MatDialog,
  ) {
    this.packetLocationService.openModal$.pipe(
      map(res => {
        if (res) {
          this.addLocation();
        }
      }),
      takeUntil(this.destroy$)).subscribe();
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

    this.dataSource = new PacketLocationDatasource(this.packetLocationService);
    const entitiesSubscription = this.dataSource.entitySubject.pipe(
      skip(1),
      distinctUntilChanged()
    ).subscribe(res => {
      this.result = res;
    });
    this.subscriptions.push(entitiesSubscription);

    // this.dataSource.getHolidays(1, 25, this.searchValue);
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

    this.dataSource.getHolidays(from, to, this.searchValue);
  }

  addLocation() {
    const dialogRef = this.dialog.open(AddPacketLocationComponent, {
      data: { action: 'add' },
      width: '400px',
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadPage();
      }
      this.packetLocationService.openModal.next(false);
    });
  }

  editLocation(location) {
    console.log(location)
    const dialogRef = this.dialog.open(AddPacketLocationComponent,
      {
        data: { locationData: location, action: 'edit' },
        width: '400px'
      });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadPage();
      }
    });
  }

}

