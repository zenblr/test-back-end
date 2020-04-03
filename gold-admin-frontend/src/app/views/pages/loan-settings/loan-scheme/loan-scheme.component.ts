import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'kt-loan-scheme',
  templateUrl: './loan-scheme.component.html',
  styleUrls: ['./loan-scheme.component.scss']
})
export class LoanSchemeComponent implements OnInit {

  schemes: String[] = []
  loader: boolean = true
  constructor(private ref: ChangeDetectorRef) { }

  ngOnInit() {
    this.schemes = [
      "1","1","1","1","1","1","1","1","1","1","1","1"
    ]
  }

}
