import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { ToastrComponent } from '../../partials/components/toastr/toastr.component';
import { Subscription, merge, Subject } from 'rxjs';
import { tap, distinctUntilChanged, skip, takeUntil, map } from 'rxjs/operators';
import { AddLeadComponent } from './add-lead/add-lead.component';
import { DataTableService } from '../../../core/shared/services/data-table.service';
import { Router } from '@angular/router';
import { LeadManagementDatasource } from '../../../core/lead-management/datasources/lead.datasources';
import { LeadService } from '../../../core/lead-management/services/lead.service';

@Component({
  selector: 'kt-lead-management',
  templateUrl: './lead-management.component.html',
  styleUrls: ['./lead-management.component.scss']
})
export class LeadManagementComponent implements OnInit {

  dataSource: LeadManagementDatasource;
  displayedColumns = ['fullName', 'mobile', 'pan', 'internalBranch', 'state', 'city', 'pincode', 'date', 'status', 'kyc', 'actions'];
  leadsResult = []
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  // Filter fields
  // @ViewChild('searchInput', { static: true }) searchInput: ElementRef;
  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
  destroy$ = new Subject();

  // Subscriptions
  private subscriptions: Subscription[] = [];

  stageName = 'lead'
  private unsubscribeSearch$ = new Subject();
  searchValue = '';

  constructor(
    public dialog: MatDialog,
    private leadService: LeadService,
    private dataTableService: DataTableService,
    private router: Router
  ) {
    this.leadService.openModal$.pipe(
      map(res => {
        if (res) {
          this.addLead();
        }
      }),
      takeUntil(this.destroy$)).subscribe();
  }

  ngOnInit() {

    const paginatorSubscriptions = merge(this.paginator.page).pipe(
      tap(() => this.loadLeadsPage())
    ).subscribe();
    this.subscriptions.push(paginatorSubscriptions);


    const searchSubscription = this.dataTableService.searchInput$.pipe(takeUntil(this.unsubscribeSearch$))
      .subscribe(res => {
        this.searchValue = res;
        this.paginator.pageIndex = 0;
        this.loadLeadsPage();
      });

    // Init DataSource
    this.dataSource = new LeadManagementDatasource(this.leadService);
    const entitiesSubscription = this.dataSource.entitySubject.pipe(
      skip(1),
      distinctUntilChanged()
    ).subscribe(res => {
      this.leadsResult = res;
    });
    this.subscriptions.push(entitiesSubscription);

    // First load
    // this.loadLeadsPage();

    this.dataSource.loadLeads(1, 25, this.searchValue, this.stageName);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(el => el.unsubscribe());
    this.unsubscribeSearch$.next();
    this.unsubscribeSearch$.complete();
    this.destroy$.next();
    this.destroy$.complete();
  }


  loadLeadsPage() {
    if (this.paginator.pageIndex < 0 || this.paginator.pageIndex > (this.paginator.length / this.paginator.pageSize))
      return;
    let from = ((this.paginator.pageIndex * this.paginator.pageSize) + 1);
    let to = ((this.paginator.pageIndex + 1) * this.paginator.pageSize);

    this.dataSource.loadLeads(from, to, this.searchValue, this.stageName);
  }

  addLead() {
    // console.log(event);
    const dialogRef = this.dialog.open(AddLeadComponent, {
      data: { action: 'add' },
      width: '500px'
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadLeadsPage();
      }
      this.leadService.openModal.next(false);
    });
  }

  editLead(role) {
    const dialogRef = this.dialog.open(AddLeadComponent,
      {
        data: { id: role.id, action: 'edit' },
        width: '500px'
      });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadLeadsPage();
      }
    });
  }

  goToKyc(data) {
    // console.log(data)
    this.router.navigate(['/kyc-setting'], { queryParams: { mob: data } });
  }
}
