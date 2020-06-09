// Angular
import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, OnDestroy } from '@angular/core';

import { MatPaginator, MatSort, MatSnackBar, MatDialog } from '@angular/material';
// RXJS
import { debounceTime, distinctUntilChanged, tap, skip, take, delay, takeUntil, map } from 'rxjs/operators';
import { fromEvent, merge, Observable, of, Subscription, Subject } from 'rxjs';
// NGRX

// Services
import { LayoutUtilsService, MessageType } from '../../../../../../core/_base/crud';
// Models

import { PartnerAddComponent } from '../partner-add/partner-add.component';
import { PartnerDatasource } from '../../../../../../core/user-management/partner/datasources/partner.datasource';
import { PartnerService } from '../../../../../../core/user-management/partner/services/partner.service';
import { PartnerModel } from '../../../../../../core/user-management/partner/models/partner.model';
import { ToastrComponent } from '../../../../../partials/components/toastr/toastr.component';
import { DataTableService } from '../../../../../../core/shared/services/data-table.service';
import { Router } from '@angular/router';

// Components
// import { RoleEditDialogComponent } from '../role-edit/role-edit.dialog.component';

@Component({
  selector: 'kt-partner-list',
  templateUrl: './partner-list.component.html',
  styleUrls: ['./partner-list.component.scss']
})
export class PartnerListComponent implements OnInit {

  // Table fields
  dataSource: PartnerDatasource;
  displayedColumns = ['partnerId', 'name', 'commission', 'actions'];
  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
 
  // Filter fields
  @ViewChild('searchInput', { static: true }) searchInput: ElementRef;
  

  // Subscriptions
  private subscriptions: Subscription[] = [];
  partnerResult: PartnerModel[] = [];
  private destroy$ = new Subject();
  private unsubscribeSearch$ = new Subject();

  searchValue = '';
	/**
	 * Component constructor
	 *
	 * 
	 * 
	 */
  constructor(
    
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    private layoutUtilsService: LayoutUtilsService,
    private partnerService: PartnerService,
    private dataTableService: DataTableService,
    private router: Router
  ) {
    this.partnerService.openModal$.pipe(takeUntil(this.destroy$)).subscribe(res => {
      if (res) {
        this.addRole()
      }
    })
  }

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
  ngOnInit() {

    const paginatorSubscriptions = merge(this.paginator.page).pipe(
			tap(() => this.loadPartnersPage())
		).subscribe();
    this.subscriptions.push(paginatorSubscriptions);

    const searchSubscription = this.dataTableService.searchInput$.pipe(takeUntil(this.unsubscribeSearch$))
      .subscribe(res => {
        this.searchValue = res;
        this.paginator.pageIndex = 0;
        this.loadPartnersPage();
      });

    // Init DataSource
    this.dataSource = new PartnerDatasource(this.partnerService);
    // console.log(this.dataSource);
    const entitiesSubscription = this.dataSource.entitySubject.pipe(
      skip(1),
      distinctUntilChanged()
    ).subscribe(res => {
      this.partnerResult = res;
    });
    this.subscriptions.push(entitiesSubscription);

    this.dataSource.loadPartners(this.searchValue, 1, 25, '', '', '');
  }

	/**
	 * On Destroy
	 */
  ngOnDestroy() {
    this.subscriptions.forEach(el => el.unsubscribe());
    this.destroy$.next();
    this.destroy$.complete();
    this.unsubscribeSearch$.next();
    this.unsubscribeSearch$.complete();
  }


  loadPartnersPage() {
    if (this.paginator.pageIndex < 0 || this.paginator.pageIndex > (this.paginator.length / this.paginator.pageSize))
      return;
    let from = ((this.paginator.pageIndex * this.paginator.pageSize) + 1);
    let to = ((this.paginator.pageIndex + 1) * this.paginator.pageSize);

    this.dataSource.loadPartners(this.searchValue, from, to, '', '', '');
  }



	/**
	 * Returns object for filter
	 */
  filterConfiguration(): any {
    const filter: any = {};
    const searchText: string = this.searchInput.nativeElement.value;
    filter.title = searchText;
    return filter;
  }

  /** ACTIONS */
	/**
	 * Delete role
	 *
	 * @param _item: Role
	 */
  deleteRole(_item) {
    const role = _item;
    const _title = 'Delete Partner';
    const _description = 'Are you sure to permanently delete this partner?';
    const _waitDesciption = 'Partner is deleting...';
    const _deleteMessage = `Partner has been deleted`;

    const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        console.log(res);
        this.partnerService.deletePartner(role.id).subscribe(successDelete => {
          this.toastr.successToastr(_deleteMessage);
          this.loadPartnersPage();
        },
          errorDelete => {
            this.toastr.errorToastr(errorDelete.error.message);
          });
      }
    });
  }


	/**
	 * Add role
	 */
  addRole() {
    const dialogRef = this.dialog.open(PartnerAddComponent, { data: { action: 'add' }, width: '450px' });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadPartnersPage();
      }
    })
    this.partnerService.openModal.next(false);
  }

	/**
	 * Edit role
	 *
	 * @param role: Role
	 */
  editRole(role) {
    const _saveMessage = `Role successfully has been saved.`;
    const _messageType = role.id ? MessageType.Update : MessageType.Create;
    const dialogRef = this.dialog.open(PartnerAddComponent, {
      data: { partnerId: role.id, action: 'edit' },
      width: '450px'
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadPartnersPage();
      }
    });
  }

  viewRole(role) {
    const dialogRef = this.dialog.open(PartnerAddComponent, {
      data: { partnerId: role.id, action: 'view' },
      width: '450px'
    });

    dialogRef.afterClosed().subscribe(res => {
      if (!res) {
        return;
      }
    });
  }

  viewSchemes(id:number) {
    this.router.navigate(['/admin/user-management/partner/view-schemes/',id])
  }

}
