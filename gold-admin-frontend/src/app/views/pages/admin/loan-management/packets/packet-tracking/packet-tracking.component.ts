import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { Subscription, merge, Subject, from } from 'rxjs';
import { tap, distinctUntilChanged, skip, takeUntil, map } from 'rxjs/operators';
import { DataTableService } from '../../../../../../core/shared/services/data-table.service';
import { PacketTrackingDatasource, PacketTrackingService } from '../../../../../../core/loan-management'
import { AssignPacketsComponent } from '../assign-packets/assign-packets.component';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import { ToastrService } from 'ngx-toastr';
import { NgxPermissionsService } from 'ngx-permissions';
import { UpdateLocationComponent } from '../update-location/update-location.component';
import { ViewPacketLogComponent } from '../view-packet-log/view-packet-log.component';
import { Router } from '@angular/router';
import { OrnamentsComponent } from '../../../../../partials/components/ornaments/ornaments.component';

@Component({
  selector: 'kt-packet-tracking',
  templateUrl: './packet-tracking.component.html',
  styleUrls: ['./packet-tracking.component.scss']
})
export class PacketTrackingComponent implements OnInit {
  dataSource: PacketTrackingDatasource;
  displayedColumns = ['userName', 'customerId', 'customerName', 'loanId', 'loanAmount', 'internalBranch', 'currentLocation', 'actions'];
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
    private packetTrackingService: PacketTrackingService,
    private dataTableService: DataTableService,
    private layoutUtilsService: LayoutUtilsService,
    private toastr: ToastrService,
    private ngxPermissionService: NgxPermissionsService,
    private router: Router
  ) {
    this.packetTrackingService.openModal$.pipe(
      map(res => {
        if (res) {
          this.assignPackets();
        }
      }),
      takeUntil(this.destroy$)).subscribe();
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
        this.searchValue = res;
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
      this.packetTrackingService.openModal.next(false);
    });
  }

  updatePacket(packet) {
    // console.log(packet)
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
    console.log(packet)
    const dialogRef = this.dialog.open(ViewPacketLogComponent,
      {
        data: { packetData: packet, action: 'edit' },
        width: '80%',
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
        console.log(res);
        this.packetTrackingService.deletePacket(role.id).subscribe(successDelete => {
          this.toastr.success(_deleteMessage);
          this.loadPackets();
        },
          errorDelete => {
            this.toastr.error(errorDelete.error.message);
          });
      }
      // this.store.dispatch(new RoleDeleted({ id: _item.id }));
      // this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
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

}
