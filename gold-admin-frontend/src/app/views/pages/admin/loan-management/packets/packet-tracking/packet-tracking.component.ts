import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { Subscription, merge, Subject, from } from 'rxjs';
import { tap, distinctUntilChanged, skip, takeUntil, map } from 'rxjs/operators';
import { DataTableService } from '../../../../../../core/shared/services/data-table.service';
import { PacketTrackingDatasource, PacketTrackingService } from '../../../../../../core/loan-management'
import { AssignPacketsComponent } from '../assign-packets/assign-packets.component';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import { ToastrService } from 'ngx-toastr';
import { NgxPermissionsService } from 'ngx-permissions';
import { UpdateLocationComponent } from '../../../../../partials/components/update-location/update-location.component';
import { ViewPacketLogComponent } from '../view-packet-log/view-packet-log.component';
import { Router } from '@angular/router';
import { OrnamentsComponent } from '../../../../../partials/components/ornaments/ornaments.component';
import { SharedService } from '../../../../../../core/shared/services/shared.service';

@Component({
  selector: 'kt-packet-tracking',
  templateUrl: './packet-tracking.component.html',
  styleUrls: ['./packet-tracking.component.scss']
})
export class PacketTrackingComponent implements OnInit {
  dataSource: PacketTrackingDatasource;
  displayedColumns = ['userName', 'mobile', 'customerId', 'customerName', 'loanId', 'loanAmount', 'internalBranch', 'currentLocation', 'status', 'time', 'actions'];
  leadsResult = []
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  destroy$ = new Subject();
  filter$ = new Subject();
  queryParamsData = {
    from: 1,
    to: 25,
    search: '',
    status: '',
  }
  // Subscriptions
  private subscriptions: Subscription[] = [];
  private unsubscribeSearch$ = new Subject();
  filteredDataList = {};
  previousSyncArray: any[];
  currentSyncArray: any[];
  interval: NodeJS.Timeout;

  constructor(
    public dialog: MatDialog,
    private packetTrackingService: PacketTrackingService,
    private dataTableService: DataTableService,
    private layoutUtilsService: LayoutUtilsService,
    private toastr: ToastrService,
    private ngxPermissionService: NgxPermissionsService,
    private router: Router,
    private ref: ChangeDetectorRef,
    private sharedService: SharedService
  ) {
    this.packetTrackingService.openModal$.pipe(
      map(res => {
        if (res) {
          this.assignPackets();
        }
      }),
      takeUntil(this.destroy$)).subscribe();

    this.packetTrackingService.applyFilter$
      .pipe(takeUntil(this.filter$))
      .subscribe((res) => {
        if (Object.entries(res).length) {
          this.applyFilter(res);
        }
      });

    // this.sharedService.hideLoader.next(true)
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
    this.dataSource = new PacketTrackingDatasource(this.packetTrackingService);
    const entitiesSubscription = this.dataSource.entitySubject.pipe(
      skip(1),
      distinctUntilChanged()
    ).subscribe(res => {
      this.leadsResult = res;
    });
    this.subscriptions.push(entitiesSubscription);

    this.dataSource.loadpackets(this.queryParamsData);
    this.checkPacketTracking(this.leadsResult)

    // this.interval = setInterval(() => {
    //   this.dataSource.loadpackets(this.queryParamsData);
    //   this.checkPacketTracking(this.leadsResult)
    // }, 30000)

  }

  checkPacketTracking(packetList) {
    if (!this.previousSyncArray) {
      this.previousSyncArray = new Array(packetList.length).fill(null);
      return this.previousSyncArray = packetList.map(e => e.lastSyncTime)
      // return console.log(this.previousSyncArray)
    }

    this.currentSyncArray = new Array(packetList.length).fill(null);
    this.currentSyncArray = packetList.map(e => e.lastSyncTime)

    if (this.previousSyncArray != this.currentSyncArray) {
      this.previousSyncArray = this.currentSyncArray
    }
  }

  isTrackingDisabled(index) {
    if (!(this.previousSyncArray && this.currentSyncArray)) return

    return this.previousSyncArray[index] === this.currentSyncArray[index] ? true : false
  }

  ngAfterContentChecked() {
    this.ref.detectChanges();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(el => el.unsubscribe());
    this.unsubscribeSearch$.next();
    this.unsubscribeSearch$.complete();
    this.destroy$.next();
    this.destroy$.complete();
    clearInterval(this.interval)
    // this.sharedService.hideLoader.next(false)
  }

  applyFilter(data) {
    this.queryParamsData.status = data.data.packetTracking;
    this.dataSource.loadpackets(this.queryParamsData);
    this.filteredDataList = data.list;
  }

  loadPackets() {
    if (this.paginator.pageIndex < 0 || this.paginator.pageIndex > (this.paginator.length / this.paginator.pageSize))
      return;
    this.queryParamsData.from = ((this.paginator.pageIndex * this.paginator.pageSize) + 1);
    this.queryParamsData.to = ((this.paginator.pageIndex + 1) * this.paginator.pageSize);

    this.dataSource.loadpackets(this.queryParamsData);
  }

  assignPackets() {
    const dialogRef = this.dialog.open(AssignPacketsComponent, {
      data: { action: 'add' },
      width: '400px'
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadPackets();
      }
      this.packetTrackingService.openModal.next(false);
    });
  }

  updatePacket(packet) {
    // let lastIndex = packet.locationData[packet.locationData.length - 1]
    // if (lastIndex.packetLocation.id == 4 || lastIndex.packetLocation.id == 3) return

    const isNotAllowed = this.checkForPartnerBranchIn(packet)

    if (isNotAllowed) return

    if (packet.loanStageId === 11) {
      const dialogRef = this.dialog.open(UpdateLocationComponent,
        {
          data: { packetData: packet.loanPacketDetails[0].packets, action: 'edit', stage: packet.loanStageId },
          width: '450px'
        });
      dialogRef.afterClosed().subscribe(res => {
        if (res) {
          this.loadPackets();
        }
      });
    } else {
      const dialogRef = this.dialog.open(UpdateLocationComponent,
        {
          data: { packetData: packet.loanPacketDetails[0].packets, action: 'edit', isOut: true },
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
        this.packetTrackingService.deletePacket(role.id).subscribe(successDelete => {
          this.toastr.success(_deleteMessage);
          this.loadPackets();
        },
          errorDelete => {
            this.toastr.error(errorDelete.error.message);
          });
      }
    });
  }

  viewLocation(packet) {
    this.router.navigate([`/admin/loan-management/view-location/${packet.customerLoan[0].masterLoanId}`])
  }

  ornaments(packet) {
    const masterLoanId = packet.loanPacketDetails[0].masterLoanId
    this.packetTrackingService.viewPackets({ masterLoanId }).pipe(map(res => {
      this.dialog.open(OrnamentsComponent, {
        data: {
          modal: true,
          modalData: res.data[0].packets,
          packetView: true
        },
        width: '90%'
      })
    }
    )).subscribe()
  }

  checkForPartnerBranchIn(packet) {
    const lastIndex = packet.locationData[packet.locationData.length - 1]
    const id = lastIndex.packetLocation.id
    const isNotAllowed = id == 6 || id == 1 || id == 4 || id == 3 || id == 7 || packet.isLoanCompleted ? true : false
    return isNotAllowed
  }

  colorCodeEntry(packet) {
    const locationData = packet.locationData
    const currentLocation = locationData[locationData.length - 1]

    const colorClass = currentLocation.status == 'complete' ? currentLocation.packetLocation.id === 2 && packet.isLoanCompleted ? 'text-primary' : 'text-success' : currentLocation.status == 'incomplete' ? 'text-danger' : 'text-grey'
    return colorClass
  }
}
