import { Component, OnInit, EventEmitter, HostListener, ChangeDetectorRef, Input, OnChanges, SimpleChanges, ChangeDetectionStrategy, Output } from '@angular/core';
import { Router } from '@angular/router';
import { CustomerManagementService } from '../../../../../core/customer-management';
import { takeUntil } from 'rxjs/operators';
import { DataTableService } from '../../../../../core/shared/services/data-table.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'kt-customer-grid',
  templateUrl: './customer-grid.component.html',
  styleUrls: ['./customer-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerGridComponent implements OnInit, OnChanges {

  @Input() page;
  @Input() data;
  @Output() pagination = new EventEmitter

  customers: any[] = []
  viewLoading: boolean = false
  count: any;
  searchValue: any;
  unsubscribeSearch$ = new Subject();
  constructor(
    private customerService: CustomerManagementService,
    private ref: ChangeDetectorRef,
    private router: Router,
    private dataTableService: DataTableService
  ) {
    window.scrollTo(0, 0)
  }

  @HostListener('window:scroll', [])
  onWindowScoll() {
    // console.log(this.getDocHeight(), Math.floor(this.getScrollXY()[1] + window.innerHeight))
    if (this.getDocHeight() === Math.floor(this.getScrollXY()[1] + window.innerHeight)) {
      if (this.count > this.page.to) {
        let data = {
          from: this.page.from,
          to: this.page.to + 20,
          search: this.searchValue ? this.searchValue : ''
        }
        this.pagination.emit(data)
      }
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.page) {
      // console.log(this.page)
    }
    if (changes.data) {
      this.customers = [];
      if (changes.data.currentValue == undefined) {
        this.customers = [];
      } else {
        Array.prototype.push.apply(this.customers, changes.data.currentValue)
        // this.customers.push()
      }
    }
  }
  ngOnInit() {
    this.customerService.customer$.subscribe(res => {
      if (res)
        this.count = res.count
    })

    const searchSubscription = this.dataTableService.searchInput$.pipe(takeUntil(this.unsubscribeSearch$))
      .subscribe(res => {
        // console.log(res)
        this.searchValue = res;

        let data = {
          from: 1,
          to: 20,
          search: this.searchValue
        }
        this.pagination.emit(data)
        // this.paginator.pageIndex = 0;
        // this.loadLeadsPage();
      });
    // this.customers = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    // console.log(this.customerData)
  }


  getDocHeight() {
    const D = document;

    return Math.max(
      D.body.scrollHeight, D.documentElement.scrollHeight,
      D.body.offsetHeight, D.documentElement.offsetHeight,
      D.body.clientHeight, D.documentElement.clientHeight
    );
  }
  getScrollXY() {
    let scrOfX = 0;
    let scrOfY = 0;
    if (typeof (window.pageYOffset) === 'number') {
      scrOfY = window.pageYOffset;
      scrOfX = window.pageXOffset;
    } else if (document.body && (document.body.scrollLeft || document.body.scrollTop)) {
      scrOfY = document.body.scrollTop;
      scrOfX = document.body.scrollLeft;
    } else if (document.documentElement && (document.documentElement.scrollLeft || document.documentElement.scrollTop)) {
      scrOfY = document.documentElement.scrollTop;
      scrOfX = document.documentElement.scrollLeft;
    }
    return [scrOfX, scrOfY];
  }

  viewDetails(id: number) {
    this.router.navigate(['/admin/customer-management/customer-list/' + id])
  }
}
