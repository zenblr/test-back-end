import { Component, OnInit, ViewChild } from '@angular/core';
import { Subject, Subscription, merge } from 'rxjs';
import { MatPaginator, MatDialog } from '@angular/material';
import { DataTableService } from '../../../../../../core/shared/services/data-table.service';
import { map, takeUntil, tap, skip, distinctUntilChanged } from 'rxjs/operators';
import { PacketLocationDatasource } from '../../../../../../core/masters/packet-location/datasources/packet-location.datasource'
import { PacketLocationService } from '../../../../../../core/masters/packet-location/service/packet-location.service';
import { AddPacketLocationComponent } from '../add-packet-location/add-packet-location.component';
import { ToastrService } from 'ngx-toastr';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
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
    private toastr: ToastrService,
    private layoutUtilsService: LayoutUtilsService

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

    this.dataSource.getpacketsTrackingDetails(1, 25, this.searchValue);
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

    this.dataSource.getpacketsTrackingDetails(from, to, this.searchValue);
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

  deleteLocation(_item) {
    const role = _item;
    const _title = 'Delete Packet Location';
    const _description = 'Are you sure to permanently delete this Packet Location?';
    const _waitDesciption = 'Packet Location is deleting...';
    const _deleteMessage = `Packet Location has been deleted`;
    const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.packetLocationService.deletepacketLocation(role.id).subscribe(successDelete => {
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

