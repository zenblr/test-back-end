import { Component, OnInit } from '@angular/core';
import { LogisticPartnerService } from '../../../../../core/emi-management/logistic-partner/service/logistic-partner.service';
import { map } from 'rxjs/operators';
import { FormGroup } from '@angular/forms';
@Component({
  selector: 'kt-add-logistic-partner',
  templateUrl: './add-logistic-partner.component.html',
  styleUrls: ['./add-logistic-partner.component.scss']
})
export class AddLogisticPartnerComponent implements OnInit {

  logisticPartnerForm: FormGroup;


  ngOnInit() {
  }

}
