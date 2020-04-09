import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router'

@Component({
  selector: 'kt-customer-details',
  templateUrl: './customer-details.component.html',
  styleUrls: ['./customer-details.component.scss']
})
export class CustomerDetailsComponent implements OnInit {

  loans: number[] = []
  constructor(private rout: ActivatedRoute) { }

  ngOnInit() {
    this.loans = [1, 1, 1, 1];
    let id = this.rout.snapshot.params.id
    console.log(id)
  }

}
