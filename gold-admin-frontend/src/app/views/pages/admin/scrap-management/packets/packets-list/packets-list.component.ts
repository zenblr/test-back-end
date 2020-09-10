import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { Subscription, merge, Subject, from } from 'rxjs';
import { tap, distinctUntilChanged, skip, takeUntil, map } from 'rxjs/operators';
import { DataTableService } from '../../../../../../core/shared/services/data-table.service';
import { ScrapPacketsDatasource, ScrapPacketsService } from '../../../../../../core/scrap-management';
import { AddPacketsComponent } from '../add-packets/add-packets.component';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import { ToastrService } from 'ngx-toastr';
import { NgxPermissionsService } from 'ngx-permissions';
import { SelectionModel } from '@angular/cdk/collections';
import { AssignAppraiserPacketsComponent } from '../assign-appraiser-packets/assign-appraiser-packets.component';

@Component({
  selector: 'kt-packets-list',
  templateUrl: './packets-list.component.html',
  styleUrls: ['./packets-list.component.scss']
})
export class PacketsListComponent implements OnInit {
  dataSource: ScrapPacketsDatasource;
  displayedColumns = ['select', 'packetUniqueId', 'barcode', 'internalBranch', 'appraiserName', 'customerID', 'scrapId', 'actions'];
  packetsResult = []
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  destroy$ = new Subject();
  selection = new SelectionModel<any>(true, []);
  private subscriptions: Subscription[] = [];
  private unsubscribeSearch$ = new Subject();
  searchValue = '';

  constructor(
    public dialog: MatDialog,
    private scrapPacketsService: ScrapPacketsService,
    private dataTableService: DataTableService,
    private layoutUtilsService: LayoutUtilsService,
    private toastr: ToastrService,
    private ngxPermissionService: NgxPermissionsService
  ) {
    this.scrapPacketsService.openModal$.pipe(
      map(res => { if (res) this.assignPackets() }),
      takeUntil(this.destroy$)).subscribe();

    this.scrapPacketsService.buttonValue$.pipe(
      map(res => { if (res) this.assignAppraiser() }),
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

    this.dataSource = new ScrapPacketsDatasource(this.scrapPacketsService);
    const entitiesSubscription = this.dataSource.entitySubject.pipe(
      skip(1),
      distinctUntilChanged()
    ).subscribe(res => {
      this.packetsResult = res;
    });
    this.subscriptions.push(entitiesSubscription);
    this.dataSource.loadpackets(this.searchValue, 1, 25);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(el => el.unsubscribe());
    this.unsubscribeSearch$.next();
    this.unsubscribeSearch$.complete();
    this.destroy$.next();
    this.destroy$.complete();
    this.scrapPacketsService.disableBtn.next(false)
  }

  loadPackets() {
    if (this.paginator.pageIndex < 0 || this.paginator.pageIndex > (this.paginator.length / this.paginator.pageSize))
      return;
    let from = ((this.paginator.pageIndex * this.paginator.pageSize) + 1);
    let to = ((this.paginator.pageIndex + 1) * this.paginator.pageSize);
    this.dataSource.loadpackets(this.searchValue, from, to);
  }

  assignPackets() {
    const dialogRef = this.dialog.open(AddPacketsComponent, {
      data: { action: 'add' },
      width: '600px'
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadPackets();
      }
      this.scrapPacketsService.openModal.next(false);
    });
  }

  editPacket(role) {
    const dialogRef = this.dialog.open(AddPacketsComponent,
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
    const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.scrapPacketsService.deletePacket(role.id).subscribe(successDelete => {
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
    const totalAssignablePackets = this.packetsResult.filter(e => e.packetAssigned === false)
    const numRows = totalAssignablePackets.length;
    return numSelected === numRows;
  }

  masterToggle() {
    const totalAssignablePackets = this.packetsResult.filter(e => e.packetAssigned === false)
    if (this.selection.selected.length === totalAssignablePackets.length) {
      this.selection.clear();
    } else {
      this.packetsResult.forEach((row) => {
        if (!row.packetAssigned)
          this.selection.select(row)
      });
      this.checkForSameBranch()
    }
  }

  assignAppraiser() {
    const { isAssignAppraiserValid, isBranchSame, isSelectionEmpty, isUsed } = this.checkForSameBranch()
    if (!isAssignAppraiserValid) {
      if (isSelectionEmpty) this.toastr.error('Select atleast 1 packet')
      if (!isBranchSame) this.toastr.error('Select packets from same branch')
      if (!isUsed) this.toastr.error('A packet has already been used')
      return
    }
    const dialogRef = this.dialog.open(AssignAppraiserPacketsComponent, {
      data: { action: 'add', packetData: this.selection.selected },
      width: '500px'
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res) this.loadPackets();
      this.scrapPacketsService.buttonValue.next(false);
      this.selection.clear()
    });
  }

  checkForSameBranch() {
    const selectedPackets = this.selection.selected
    const isBranchSame = selectedPackets.every(e => e.internalUserBranch === selectedPackets[0].internalUserBranch)
    const isSelectionEmpty = this.selection.isEmpty()
    const isUsed = selectedPackets.every(e => e.packetAssigned === false)
    const isAppraiserSame = selectedPackets.length && selectedPackets.every(e => e.appraiserId === selectedPackets[0].appraiserId)
    console.log(isAppraiserSame)
    const isAssignAppraiserValid = !(isSelectionEmpty) && isBranchSame && isUsed && isAppraiserSame? true : false
    this.scrapPacketsService.disableBtn.next(!isAppraiserSame)
    return { isAssignAppraiserValid, isBranchSame, isSelectionEmpty, isUsed }
  }
}
