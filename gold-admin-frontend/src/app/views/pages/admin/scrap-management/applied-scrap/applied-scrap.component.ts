import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { Subscription, merge, Subject, from } from 'rxjs';
import { tap, distinctUntilChanged, skip, takeUntil, map } from 'rxjs/operators';
import { DataTableService } from '../../../../../core/shared/services/data-table.service';
import { AppliedScrapDatasource, AppliedScrapService } from '../../../../../core/scrap-management';
import { Router } from '@angular/router';
import { SharedService } from '../../../../../core/shared/services/shared.service';
import { NgxPermissionsService } from 'ngx-permissions';

@Component({
  selector: 'kt-applied-scrap',
  templateUrl: './applied-scrap.component.html',
  styleUrls: ['./applied-scrap.component.scss']
})
export class AppliedScrapComponent implements OnInit {
  filteredDataList: any = {};
  userType: any
  dataSource: AppliedScrapDatasource;
  displayedColumns = ['fullName', 'customerID', 'mobile', 'pan', 'date', 'scrapAmount', 'appraisalApproval', 'bMApproval', 'oTApproval', 'actions', 'view'];
  leadsResult = []
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  queryParamsData = {
    from: 1,
    to: 25,
    search: '',
    cceStatus: '',
    kycStatus: '',
  }
  destroy$ = new Subject();
  private subscriptions: Subscription[] = [];
  private unsubscribeSearch$ = new Subject();
  searchValue = '';
  permission: any;
  filter$ = new Subject();
  
  constructor(
    public dialog: MatDialog,
    private appliedScrapService: AppliedScrapService,
    private dataTableService: DataTableService,
    private router: Router,
    private sharedService: SharedService,
    private ngxPermission: NgxPermissionsService
  ) {
    this.ngxPermission.permissions$.subscribe(res => {
      this.permission = res
      console.log(res)
    })

    this.appliedScrapService.applyFilter$
      .pipe(takeUntil(this.filter$))
      .subscribe((res) => {
        if (Object.entries(res).length) {
          this.applyFilter(res);
        }
      });
  }

  ngOnInit() {
    let res = this.sharedService.getDataFromStorage();
    this.userType = res.userDetails.userTypeId

    const paginatorSubscriptions = merge(this.paginator.page).pipe(
      tap(() => {
        this.loadAppliedScrapsPage();
      })
    )
      .subscribe();
    this.subscriptions.push(paginatorSubscriptions);

    const searchSubscription = this.dataTableService.searchInput$.pipe(takeUntil(this.unsubscribeSearch$))
      .subscribe(res => {
        this.searchValue = res;
        this.paginator.pageIndex = 0;
        this.loadAppliedScrapsPage();
      });

    this.dataSource = new AppliedScrapDatasource(this.appliedScrapService);
    const entitiesSubscription = this.dataSource.entitySubject.pipe(
      skip(1),
      distinctUntilChanged()
    ).subscribe(res => {
      this.leadsResult = res;
    });
    this.subscriptions.push(entitiesSubscription);
    this.dataSource.loadAppliedScraps(this.searchValue, 1, 25);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(el => el.unsubscribe());
    this.unsubscribeSearch$.next();
    this.unsubscribeSearch$.complete();
    this.destroy$.next();
    this.destroy$.complete();
    this.filter$.next();
    this.filter$.complete();
    this.appliedScrapService.applyFilter.next({});
    this.sharedService.closeFilter.next(true);
  }

  loadAppliedScrapsPage() {
    if (this.paginator.pageIndex < 0 || this.paginator.pageIndex > (this.paginator.length / this.paginator.pageSize))
      return;
    let from = ((this.paginator.pageIndex * this.paginator.pageSize) + 1);
    let to = ((this.paginator.pageIndex + 1) * this.paginator.pageSize);

    this.dataSource.loadAppliedScraps(this.searchValue, from, to);
  }

  applyFilter(data) {
    console.log(data)
    this.filteredDataList = data.list
  }

  editScrap(scrap) {
    console.log(scrap)
    if (scrap.scrapStage.id == 2 && this.permission.addBmRating) {
      this.navigate(scrap)
    }
    else if (scrap.scrapStage.id == 1 && this.permission.addAppraiserRating) {
      this.navigate(scrap)
    }
    else if (scrap.scrapStage.id == 7 && this.permission.addOpsRating) {
      this.navigate(scrap)
    }
    else if (scrap.scrapStage.id == 8 && this.permission.uploadDocuments) {
      this.packetImageUpload(scrap)
    }
    else if (scrap.scrapStage.id == 3 && this.permission.assignPacket) {
      this.packetImageUpload(scrap)
    }
    else if (scrap.scrapStage.id == 4 && this.permission.loanDisbursement) {
      this.packetImageUpload(scrap)
    }
  }

  navigate(scrap) {
    this.router.navigate(['/admin/scrap-management/scrap-buying-application-form', scrap.id])
  }

  packetImageUpload(scrap) {
    this.router.navigate(['/admin/scrap-management/packet-image-upload', scrap.id])
  }

  viewScrap(scrap) {
    this.router.navigate(['/admin/scrap-management/view-scrap', scrap.id])
  }

}
