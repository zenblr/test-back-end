import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AddLogisticPartnerComponent } from '../add-logistic-partner/add-logistic-partner.component';
import { LogisticPartnerService } from '../../../../../core/emi-management/logistic-partner/service/logistic-partner.service';
import { map, takeUntil, skip, distinctUntilChanged, tap } from 'rxjs/operators';
import { Subject, Subscription, merge } from 'rxjs';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { LogisticPartnerDataSource} from '../../../../../core/emi-management/logistic-partner/datasource/logistic-partner.datasource';
import { DataTableService } from '../../../../../core/shared/services/data-table.service';
import { Role } from '../../../../../core/auth';
 import { ToastrComponent } from '../../../../../views/partials/components';
// import { BranchModel } from 'src/app/core/user-management/branch/models/branch.model';
import { LayoutUtilsService, MessageType } from '../../../../../core/_base/crud';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'kt-list-logistic-partner',
  templateUrl: './list-logistic-partner.component.html',
  styleUrls: ['./list-logistic-partner.component.scss']
})
export class ListLogisticPartnerComponent implements OnInit {
  destroy$ = new Subject();
  private subscriptions: Subscription[] = [];
  private logisticPartner:any=[];
  dataSource: LogisticPartnerDataSource;
  private unsubscribeSearch$ = new Subject();
  searchValue = '';
 /**
  * @param layoutUtilsService:LayoutUtilsService
  */
  displayedColumns = ['name','actions'];
  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild('sort1', { static: true }) sort: MatSort;
  partnerService: any;
 
  constructor(public dialog: MatDialog, private logisticPartnerService: LogisticPartnerService,    private dataTableService: DataTableService,    private layoutUtilsService: LayoutUtilsService,
    private toast:ToastrService

    ) {
    
      this.logisticPartnerService.openModal$.pipe(
        map(res => {
          if (res) {
            this.addRole();
          }
        }),
        takeUntil(this.destroy$)).subscribe();
  
  }
 
  ngOnInit() {
    const sortSubscription = this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    this.subscriptions.push(sortSubscription);
  
    const paginatorSubscriptions = merge(this.sort.sortChange, this.paginator.page).pipe(
      tap(() => {
        this.loadBranchPage();
      })
    )
      .subscribe();
    this.subscriptions.push(paginatorSubscriptions);

    const searchSubscription = this.dataTableService.searchInput$.pipe(takeUntil(this.unsubscribeSearch$))
    .subscribe(res => {
      this.searchValue = res;
      this.paginator.pageIndex = 0;
      this.loadBranchPage();
    });

    // this.dataSource.paginator = this.paginator;
    this.dataSource = new LogisticPartnerDataSource(this.logisticPartnerService);
    const entitiesSubscription = this.dataSource.entitySubject.pipe(
      skip(1),
      distinctUntilChanged()
    ).subscribe(res => {
      this.logisticPartner = res;
    });
    this.subscriptions.push(entitiesSubscription);
    this.dataSource.loadLogisticPartners(1, 25, '');

  }
  ngOnDestroy() {
    this.subscriptions.forEach(el => el.unsubscribe());
    this.destroy$.next();
    this.destroy$.complete();
    this.unsubscribeSearch$.next();
    this.unsubscribeSearch$.complete();
  }


  loadBranchPage() {
    if (this.paginator.pageIndex < 0 || this.paginator.pageIndex > (this.paginator.length / this.paginator.pageSize))
      return;
    let from = ((this.paginator.pageIndex * this.paginator.pageSize) + 1);
    let to = ((this.paginator.pageIndex + 1) * this.paginator.pageSize);

    this.dataSource.loadLogisticPartners(from, to, this.searchValue);
  }
   /** ACTIONS */
	/**
	 * Delete role
	 *
	 * @param _item: Role
	 */
  deleteRole(_item: Role) {
    const role = _item;
    const _title = 'Delete  Logistic Partner';
    const _description = 'Are you sure to permanently delete this logistic partner?';
    const _waitDesciption = ' Logistic Partner is deleting.';
    const _deleteMessage = ` Logistic Partner has been deleted`;

    const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        console.log(res);
        this.logisticPartnerService.deleteLogisticPartner(role.id).subscribe(successDelete => {
          this.toast.success(_deleteMessage);
          this.loadBranchPage();
        },
          errorDelete => {
            this.toastr.errorToastr(errorDelete.error.message);
          });
      }
    });
  }



  addRole(): void {
      const dialogRef = this.dialog.open(AddLogisticPartnerComponent, {
         data: { action: 'add' }, width: '450px' });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadBranchPage();
      }
    })
    this.logisticPartnerService.openModal.next(false);
  }
  /**
	 * Edit role
	 *
	 * @param role: Role
	 */
    editRole(role: Role) {
      const _saveMessage = `Role successfully has been saved.`;
      const _messageType = role.id ? MessageType.Update : MessageType.Create;
      const dialogRef = this.dialog.open(AddLogisticPartnerComponent, {
        data: { partnerId: role.id, action: 'edit' },
        width: '450px'
      });
      dialogRef.afterClosed().subscribe(res => {
        if (res) {
          this.loadBranchPage();
        }
      });
    
}
// export interface PeriodicElement {
//   name: string;
//   position: number;
//   weight: number;
//   symbol: string;
// }

// const ELEMENT_DATA: PeriodicElement[] = [
//   {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
//   {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
//   {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
//   {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
//   {position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
//   {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C'},
//   {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N'},
//   {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O'},
//   {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F'},
//   {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne'},
//   {position: 11, name: 'Sodium', weight: 22.9897, symbol: 'Na'},
//   {position: 12, name: 'Magnesium', weight: 24.305, symbol: 'Mg'},
//   {position: 13, name: 'Aluminum', weight: 26.9815, symbol: 'Al'},
//   {position: 14, name: 'Silicon', weight: 28.0855, symbol: 'Si'},
//   {position: 15, name: 'Phosphorus', weight: 30.9738, symbol: 'P'},
//   {position: 16, name: 'Sulfur', weight: 32.065, symbol: 'S'},
//   {position: 17, name: 'Chlorine', weight: 35.453, symbol: 'Cl'},
//   {position: 18, name: 'Argon', weight: 39.948, symbol: 'Ar'},
//   {position: 19, name: 'Potassium', weight: 39.0983, symbol: 'K'},
//   {position: 20, name: 'Calcium', weight: 40.078, symbol: 'Ca'},
// ];
}