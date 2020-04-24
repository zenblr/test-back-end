import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'kt-permissions',
  templateUrl: './permissions.component.html',
  styleUrls: ['./permissions.component.scss']
})
export class PermissionsComponent implements OnInit {
  panelOpenState = false;
  permissions = [{ title: "Gold Loan",expand :false}, { title: "Gold Emi",expand :true }]

  constructor() { }

  ngOnInit() {
  }

}
