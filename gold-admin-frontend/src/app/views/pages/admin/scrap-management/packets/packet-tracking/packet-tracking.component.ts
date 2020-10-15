import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { Subscription, merge, Subject, from } from 'rxjs';
import { tap, distinctUntilChanged, skip, takeUntil, map } from 'rxjs/operators';
import { DataTableService } from '../../../../../../core/shared/services/data-table.service';
import { ScrapPacketTrackingDatasource, ScrapPacketTrackingService } from '../../../../../../core/scrap-management'
// import { AssignPacketsComponent } from '../assign-packets/assign-packets.component';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import { ToastrService } from 'ngx-toastr';
import { NgxPermissionsService } from 'ngx-permissions';
import { ScrapUpdateLocationComponent } from '../../../../../partials/components/scrap-update-location/scrap-update-location.component';
import { Router } from '@angular/router';
import { OrnamentsComponent } from '../../../../../partials/components/ornaments/ornaments.component';
import { ViewPacketLogComponent } from '../view-packet-log/view-packet-log.component';

@Component({
  selector: 'kt-packet-tracking',
  templateUrl: './packet-tracking.component.html',
  styleUrls: ['./packet-tracking.component.scss']
})
export class PacketTrackingComponent implements OnInit {
  dataSource: ScrapPacketTrackingDatasource;
  displayedColumns = ['userName', 'mobileNumber', 'customerId', 'customerName', 'scrapId', 'scrapAmount', 'internalBranch', 'currentLocation', 'status', 'elapseTime', 'actions'];
  leadsResult = [];
  customerConfirmationArr = [];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  destroy$ = new Subject();
  filter$ = new Subject();
  queryParamsData = {
    from: 1,
    to: 25,
    search: '',
    status: '',
  }
  private subscriptions: Subscription[] = [];
  private unsubscribeSearch$ = new Subject();
  filteredDataList = {};

  constructor(
    public dialog: MatDialog,
    private scrapPacketTrackingService: ScrapPacketTrackingService,
    private dataTableService: DataTableService,
    private layoutUtilsService: LayoutUtilsService,
    private toastr: ToastrService,
    private ngxPermissionService: NgxPermissionsService,
    private router: Router,
    private ref: ChangeDetectorRef
  ) {
    this.scrapPacketTrackingService.openModal$.pipe(
      map(res => {
        if (res) {
          this.assignPackets();
        }
      }),
      takeUntil(this.destroy$)).subscribe();

    this.scrapPacketTrackingService.applyFilter$
      .pipe(takeUntil(this.filter$))
      .subscribe((res) => {
        if (Object.entries(res).length) {
          this.applyFilter(res);
        }
      });
  }

  ngOnInit() {
    const permission = this.ngxPermissionService.permissions$.subscribe(res => {
      if (!(res.packetEdit || res.packetDelete))
        this.displayedColumns.splice(3, 1)
    })
    this.subscriptions.push(permission);
    const paginatorSubscriptions = merge(this.paginator.page).pipe(
      tap(() => {
        this.loadPackets();
      })
    )
      .subscribe();
    this.subscriptions.push(paginatorSubscriptions);

    const searchSubscription = this.dataTableService.searchInput$.pipe(takeUntil(this.unsubscribeSearch$))
      .subscribe(res => {
        this.queryParamsData.search = res;
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

    this.dataSource.loadpackets(this.queryParamsData);

    this.getcustomerConfirmation();
  }

  ngAfterContentChecked() {
    this.ref.detectChanges();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(el => el.unsubscribe());
    this.destroy$.next();
    this.destroy$.complete();
    this.filter$.next();
    this.filter$.complete();
    this.unsubscribeSearch$.next();
    this.unsubscribeSearch$.complete();
    this.scrapPacketTrackingService.applyFilter.next({});
  }

  applyFilter(data) {
    this.queryParamsData.status = data.data.packetTracking;
    this.dataSource.loadpackets(this.queryParamsData);
    this.filteredDataList = data.list;
  }

  loadPackets() {
    if (this.paginator.pageIndex < 0 || this.paginator.pageIndex > (this.paginator.length / this.paginator.pageSize))
      return;
    let from = ((this.paginator.pageIndex * this.paginator.pageSize) + 1);
    let to = ((this.paginator.pageIndex + 1) * this.paginator.pageSize);

    this.dataSource.loadpackets(this.queryParamsData);
  }

  getcustomerConfirmation() {
    this.customerConfirmationArr = [
      {
        "name": "Yes",
        "value": "yes"
      },
      {
        "name": "No",
        "value": "no"
      }
    ];
  }

  assignPackets() {
    // const dialogRef = this.dialog.open(AssignPacketsComponent, {
    //   data: { action: 'add' },
    //   width: '400px'
    // });
    // dialogRef.afterClosed().subscribe(res => {
    //   if (res) {
    //     this.loadPackets();
    //   }
    //   this.scrapPacketTrackingService.openModal.next(false);
    // });
  }

  updatePacket(packet) {
    const isNotAllowed = this.checkForPartnerBranchIn(packet);
    if (isNotAllowed) {
      return;
    }
    if (packet.scrapStageId === 11) {
      const dialogRef = this.dialog.open(ScrapUpdateLocationComponent,
        {
          data: { packetData: packet.scrapPacketDetails[0].scrapPackets, action: 'edit', stage: packet.scrapStageId },
          width: '450px'
        });
      dialogRef.afterClosed().subscribe(res => {
        if (res) {
          this.loadPackets();
        }
      });
    } else {
      const dialogRef = this.dialog.open(ScrapUpdateLocationComponent,
        {
          data: { packetData: packet.scrapPacketDetails[0].scrapPackets, action: 'edit', isOut: true },
          width: '450px'
        });
      dialogRef.afterClosed().subscribe(res => {
        if (res) {
          this.loadPackets();
        }
      });
    }
  }

  viewPacketLog(packet) {
    const dialogRef = this.dialog.open(ViewPacketLogComponent,
      {
        data: { packetData: packet, action: 'edit' },
        width: '90%',
      });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadPackets();
      }
    });
  }

  deletePacket(_item) {
    const role = _item;
    const _title = 'Delete Packet';
    const _description = 'Are you sure to permanently delete this packet?';
    const _waitDesciption = 'Packet is deleting...';
    const _deleteMessage = `Packet has been deleted`;
    console.log(role.id)
    const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.scrapPacketTrackingService.deletePacket(role.id).subscribe(successDelete => {
          this.toastr.success(_deleteMessage);
          this.loadPackets();
        },
          errorDelete => {
            this.toastr.error(errorDelete.error.message);
          });
      }
    });
  }

  ornaments(packet) {
    const scrapId = packet.scrapPacketDetails[0].scrapId;
    this.scrapPacketTrackingService.viewPackets({ scrapId }).pipe(map(res => {
      this.dialog.open(OrnamentsComponent, {
        data: {
          scrapModal: true,
          modalData: res.data.scrapPacketDetails[0].scrapPackets,
          scrapId: res.data.scrapPacketDetails[0].scrapId,
          finalScrapAmountAfterMelting: res.data.finalScrapAmountAfterMelting,
          customerScrapOrnamentsDetails: res.data.meltingOrnament,
          customerConfirmationArr: this.customerConfirmationArr,
          packetView: true
        },
        width: '90%'
      });
    }
    )).subscribe();
  }

  checkForPartnerBranchIn(packet) {
    const lastIndex = packet.locationData[packet.locationData.length - 1];
    const id = lastIndex.scrapPacketLocation.id;
    const isNotAllowed = id == 3 || id == 1 ? true : false;
    return isNotAllowed;
  }

  colorCodeEntry(packet) {
    const locationData = packet.locationData
    const currentLocation = locationData[locationData.length - 1]
    const colorClass = currentLocation.status == 'complete' || currentLocation.scrapPacketLocation.id === 3 ? 'text-success' : 'text-danger'
    return colorClass
  }
}
