import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { LoanSettingsService } from "../../../../core/loan-setting";
import { MatDialog } from "@angular/material"
import { AddSchemeComponent } from "../add-scheme/add-scheme.component"

@Component({
  selector: 'kt-loan-scheme',
  templateUrl: './loan-scheme.component.html',
  styleUrls: ['./loan-scheme.component.scss']
})
export class LoanSchemeComponent implements OnInit {

  schemes: String[] = []
  loader: boolean = true
  constructor(private loanSettingService: LoanSettingsService,
    private dialog: MatDialog) {
    this.loanSettingService.openModal$.subscribe(res => {
      if (res) {
        this.addScheme()
      }
    })
  }

  ngOnInit() {
    this.schemes = [
      "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1"
    ]
  }

  addScheme() {
    const dialogRef = this.dialog.open(AddSchemeComponent,{
      width: '650px'
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        // this.loadLeadsPage();
      }
      this.loanSettingService.openModal.next(false);
    });
  }

}
