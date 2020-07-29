import { Component, OnInit, ChangeDetectorRef, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ScrapApplicationFormService } from "../../../../../core/scrap-management";
import { map, catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { OrnamentsService } from '../../../../../core/masters/ornaments/services/ornaments.service';

@Component({
  selector: 'kt-scrap-application-form',
  templateUrl: './scrap-application-form.component.html',
  styleUrls: ['./scrap-application-form.component.scss']
})
export class ScrapApplicationFormComponent implements OnInit {
  url: string
  id: number;
  disabledForm: boolean;
  totalAmount: number = 0;
  basic: any;
  bank: any;
  kyc: any;
  nominee: any;
  selected: number;
  intreset: any;
  approval: any;
  Ornaments: any;
  action: any;
  customerDetail: any;
  disabled = [false, true, true, true, true, true];
  scrapIds: any;
  ornamentType = [];
  finalLoanAmt: any;
  finalScrapAmt: any;
  fullAmount: any = 0;
  showButton: boolean = true;
  approvalFrom: boolean = false;
  accountHolderName: any;
  scrapStage: any;
  ornamentDetails: any;

  constructor(
    public ref: ChangeDetectorRef,
    public router: Router,
    public scrapApplicationFormService: ScrapApplicationFormService,
    public toast: ToastrService,
    public route: ActivatedRoute,
    public ornamentTypeService: OrnamentsService,
  ) {
    this.url = this.router.url.split('/')[3]
    this.id = this.route.snapshot.params.id
    if (this.id) {
      this.editApi();
    }
  }

  editId(event) {
    this.id = event
    this.editApi()
    setTimeout(() => {
      // this.action = 'add'
    }, 5000)
  }

  editApi() {
    this.scrapApplicationFormService.getScrapDataById(this.id).subscribe(res => {
      this.action = 'edit'
      this.customerDetail = res.customerScrap
      this.scrapIds = { scrapId: res.customerScrap.id }
      this.scrapStage = this.customerDetail.customerScrapCurrentStage
      this.ornamentDetails = res.customerScrap.ornamentType
      console.log(this.scrapStage)
      // this.totalAmount = res.data.totalEligibleAmt
      if (this.url == "packet-image-upload") {
        if (this.customerDetail.loanPacketDetails.length) {
          this.selected = 8;
        } else {
          this.selected = 6;
        }
        this.disabledForm = true;
      } else if (this.url == "view-loan") {
        this.disabledForm = true;
        this.showButton = false;
        this.approvalFrom = true;
        for (let index = 0; index < this.disabled.length; index++) {
          this.disabled[index] = false;
        }
      } else if (this.customerDetail.scrapStatusForAppraiser == 'approved') {
        this.showButton = true;
        this.disabledForm = true;
      } else {
        this.disabledForm = false;
      }
    })
  }

  ngOnInit() {
    this.getOrnamentType();
  }

  getOrnamentType() {
    this.ornamentTypeService.getOrnamentType(1, -1, '').pipe(
      map(res => {
        console.log(res);
        this.ornamentType = res.data;
      })
    ).subscribe();
  }

  scrap(event) {
    this.scrapIds = event
  }

  totalEligibleAmt(event) {
    this.totalAmount = event
  }

  fullAmt(event) {
    this.fullAmount = event
  }

  finalLoanAmount(event) {
    this.finalLoanAmt = event
  }

  finalScrapAmount(event) {
    this.finalScrapAmt = event
  }

  accountHolder(event) {
    this.accountHolderName = event
  }

  stage(event) {
    if (event)
      this.scrapStage = event
  }

  ornaments(event) {
    this.ornamentDetails = event
    this.scrapStage.id = 3;
    this.showButton = true;
    this.disabledForm = true;
    setTimeout(() => {
      this.next(6)
    }, 500)
  }

  disbursal(event) {
    this.scrapStage.id = event;
    setTimeout(() => {
      this.next(8)
    }, 500)
  }

  customerDetails(event) {
    this.scrapApplicationFormService.customerDetails(event.controls.customerUniqueId.value).pipe(
      map(res => {
        this.customerDetail = res.customerData
        for (let index = 0; index < this.disabled.length; index++) {
          if (index <= 2) {
            this.disabled[index] = false;
          }
        }
        this.scrapStage = this.customerDetail.customerScrapCurrentStage
        this.selected = 2;
      }),
      catchError(err => {
        this.toast.error(err.error.message)
        throw err;
      })
    ).subscribe()
  }

  total(event) {
    this.totalAmount = event
  }

  next(event) {
    if (event.index != undefined) {
      this.selected = event.index;
    } else {
      this.selected = event;
    }
    if (this.selected < 7) {
      for (let index = 0; index < this.disabled.length; index++) {
        if (this.url != "view-loan" && this.url != 'packet-image-upload') {
          if (this.selected >= index) {
            this.disabled[index] = false
          } else {
            this.disabled[index] = true
          }
        } else {
          this.disabled[index] = false
        }
      }
    }
    this.ref.detectChanges();
  }
}
