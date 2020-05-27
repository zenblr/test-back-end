import { Component, OnInit, EventEmitter, HostListener, ChangeDetectorRef, Input, OnChanges, SimpleChanges, ChangeDetectionStrategy, Output } from '@angular/core';
import { Router } from '@angular/router';
import { CustomerManagementService } from '../../../../core/customer-management';

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

  customers: number[] = []
  viewLoading: boolean = false
  count: any;
  constructor(
    private customerService: CustomerManagementService,
    private ref: ChangeDetectorRef,
    private router: Router) {
    window.scrollTo(0, 0)
  }

  @HostListener('window:scroll', [])
  onWindowScoll() {
    console.log(Math.floor(this.getScrollXY()[1] + window.innerHeight))
    if (this.getDocHeight() === Math.floor(this.getScrollXY()[1] + window.innerHeight)) {
      if (this.count < this.page.to) {
        let data = {
          from: this.page.from + 20,
          to: this.page.to + 20,
          search: this.page.search
        }
        this.pagination.emit(data)
      }
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.page) {
      console.log(this.page)
    }
    if (changes.data) {
      Array.prototype.push.apply(this.customers, changes.data.currentValue)
      // this.customers.push()
    }
  }
  ngOnInit() {
    this.customerService.customer$.subscribe(res => {
      if (res)
        this.count = res.count
    })
    // this.customers = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    // console.log(this.customerData)
  }


  getDocHeight() {
    const D = document;
    console.log(Math.max(
      D.body.scrollHeight, D.documentElement.scrollHeight,
      D.body.offsetHeight, D.documentElement.offsetHeight,
      D.body.clientHeight, D.documentElement.clientHeight
    ))
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
    console.log(scrOfY)
    return [scrOfX, scrOfY];
  }

  viewDetails(id: number) {
    this.router.navigate(['/customer-management/customer-list/' + id])
  }
}
