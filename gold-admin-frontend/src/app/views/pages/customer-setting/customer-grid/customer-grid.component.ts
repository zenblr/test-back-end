import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'kt-customer-grid',
  templateUrl: './customer-grid.component.html',
  styleUrls: ['./customer-grid.component.scss']
})
export class CustomerGridComponent implements OnInit {

  customers: number[] = []
  viewLoading: boolean = true
  constructor(private ref: ChangeDetectorRef,
    private router: Router) {
    window.scrollTo(0, 0)
  }

  @HostListener('window:scroll', [])
  onWindowScoll() {

    if (this.getDocHeight() === this.getScrollXY()[1] + window.innerHeight) {
      this.viewLoading = true
      setTimeout(() => {
        let array = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        Array.prototype.push.apply(this.customers, array)
        console.log(this.customers)
        this.ref.detectChanges()
        this.viewLoading = false;
      }, 5000);

    }
  }
  ngOnInit() {
    this.customers = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
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
    this.router.navigate(['/customer-setting/customer-list/' + id])
  }
}
