import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { Subscription, merge, Subject, from } from 'rxjs';
import { tap, distinctUntilChanged, skip, takeUntil, map } from 'rxjs/operators';
import { DataTableService } from '../../../../../../core/shared/services/data-table.service';
import { PacketsDatasource, PacketsService } from '../../../../../../core/loan-management'
import { AssignPacketsComponent } from '../assign-packets/assign-packets.component';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import { ToastrService } from 'ngx-toastr';
import { NgxPermissionsService } from 'ngx-permissions';
import { SelectionModel } from '@angular/cdk/collections';
import { PacketAssignAppraiserComponent } from '../packet-assign-appraiser/packet-assign-appraiser.component';
@Component({
  selector: 'kt-packets-list',
  templateUrl: './packets-list.component.html',
  styleUrls: ['./packets-list.component.scss']
})
export class PacketsListComponent implements OnInit {
  dataSource: PacketsDatasource;
  displayedColumns = ['select', 'packetUniqueId', 'barcode', 'internalBranch', 'appraiserName', 'customerID', 'loanId', 'actions'];
  leadsResult = []
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  // Filter fields
  // @ViewChild('searchInput', { static: true }) searchInput: ElementRef;
  // @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
  destroy$ = new Subject();
  selection = new SelectionModel<any>(true, []);

  // Subscriptions
  private subscriptions: Subscription[] = [];
  private unsubscribeSearch$ = new Subject();
  private filter$ = new Subject();
  searchValue = '';
  queryParamsData = {
    from: 1,
    to: 25,
    search: '',
    packetAssigned: ''
  }
  filteredDataList: any = {};

  constructor(
    public dialog: MatDialog,
    private packetsService: PacketsService,
    private dataTableService: DataTableService,
    private layoutUtilsService: LayoutUtilsService,
    private toastr: ToastrService,
    private ngxPermissionService: NgxPermissionsService
  ) {
    this.packetsService.openModal$.pipe(
      map(res => { if (res) this.addPackets() }),
      takeUntil(this.destroy$)).subscribe();

    this.packetsService.buttonValue$.pipe(
      map(res => { if (res) this.assignAppraiser() }),
      takeUntil(this.destroy$)).subscribe();

    this.packetsService.applyFilter$
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
        this.searchValue = res;
        this.queryParamsData.search = res;
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

    this.dataSource.loadpackets(this.queryParamsData);

  }

  ngOnDestroy() {
    this.subscriptions.forEach(el => el.unsubscribe());
    this.unsubscribeSearch$.next();
    this.unsubscribeSearch$.complete();
    this.destroy$.next();
    this.destroy$.complete();
    this.filter$.next();
    this.filter$.complete();
    this.packetsService.applyFilter.next({});
    this.packetsService.disableBtn.next(false)
  }


  loadPackets() {
    if (this.paginator.pageIndex < 0 || this.paginator.pageIndex > (this.paginator.length / this.paginator.pageSize))
      return;
    this.queryParamsData.from = ((this.paginator.pageIndex * this.paginator.pageSize) + 1);
    this.queryParamsData.to = ((this.paginator.pageIndex + 1) * this.paginator.pageSize);

    this.dataSource.loadpackets(this.queryParamsData);
    this.selection.clear();

  }
  applyFilter(data) {
    //console.log(data.data.scheme);
    this.queryParamsData.packetAssigned = data.data.packets;
    this.filteredDataList = data.list;
    // console.log(this.filteredDataList)
    this.dataSource.loadpackets(this.queryParamsData);
    this.selection.clear();
  }

  addPackets() {
    const dialogRef = this.dialog.open(AssignPacketsComponent, {
      data: { action: 'add' },
      width: '600px'
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadPackets();
      }
      this.packetsService.openModal.next(false);
    });
  }

  editPacket(role) {
    const dialogRef = this.dialog.open(AssignPacketsComponent,
      {
        data: { packetData: role, action: 'edit' },
        width: '600px'
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
    // console.log(role.id)
    const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.packetsService.deletePacket(role.id).subscribe(successDelete => {
          this.toastr.success(_deleteMessage);
          this.loadPackets();
        },
          errorDelete => {
            this.toastr.error(errorDelete.error.message);
          });
      }
    });
  }

  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const totalAssignableLeads = this.leadsResult.filter(e => e.packetAssigned === false)
    const numRows = totalAssignableLeads.length;
    return numSelected === numRows;
  }

  masterToggle() {
    const totalAssignableLeads = this.leadsResult.filter(e => e.packetAssigned === false)
    if (this.selection.selected.length === totalAssignableLeads.length) {
      this.selection.clear();
    } else {
      this.leadsResult.forEach((row) => {
        if (!row.packetAssigned)
          this.selection.select(row)
      });
      this.checkForSameBranch()
    }
  }

  assignAppraiser() {
    // console.log(this.selection.selected)

    const { isAssignAppraiserValid, isBranchSame, isSelectionEmpty, isUsed } = this.checkForSameBranch()

    if (!isAssignAppraiserValid) {
      if (isSelectionEmpty) this.toastr.error('Select atleast 1 packet')
      if (!isBranchSame) this.toastr.error('Select packets from same branch')
      if (!isUsed) this.toastr.error('A packet has already been used')
      return
    }

    const dialogRef = this.dialog.open(PacketAssignAppraiserComponent, {
      data: { action: 'add', packetData: this.selection.selected },
      width: '500px'
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res) this.loadPackets();
      this.packetsService.buttonValue.next(false);
      this.selection.clear()
    });
  }

  checkForSameBranch() {
    const selectedPackets = this.selection.selected
    const isBranchSame = selectedPackets.every(e => e.internalUserBranch === selectedPackets[0].internalUserBranch)
    const isSelectionEmpty = this.selection.isEmpty()
    const isUsed = selectedPackets.every(e => e.packetAssigned === false)

    // isAppraiserSame
    const isAppraiserSame = selectedPackets.length && selectedPackets.every(e => e.appraiserId === selectedPackets[0].appraiserId)
    console.log(isAppraiserSame)
    const isAssignAppraiserValid = !(isSelectionEmpty) && isBranchSame && isUsed && isAppraiserSame ? true : false

    this.packetsService.disableBtn.next(!isAppraiserSame)

    return { isAssignAppraiserValid, isBranchSame, isSelectionEmpty, isUsed }
  }


}
