import { Component, OnInit } from '@angular/core';
import { GoldRateService } from '../../../../../core/upload-data/gold-rate/gold-rate.service';
import { FormControl, Validators } from '@angular/forms';
import { finalize, map } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'kt-gold-rate',
  templateUrl: './gold-rate.component.html',
  styleUrls: ['./gold-rate.component.scss']
})
export class GoldRateComponent implements OnInit {

  goldRate = new FormControl(null, Validators.required);
  goldInfo;
  gold: any;
  constructor(
    public goldRateService: GoldRateService,
    public toastr: ToastrService
  ) { }

  ngOnInit() {
    this.getGoldRate();
    this.goldRateLog()

  }
  goldRateLog() {
    this.goldRateService.getGoldRateLog().subscribe(res => {
      if(res && res.data.length){
      this.goldInfo = res.data
      let gold = this.goldInfo[0].goldRate
      console.log(gold)
      this.goldRate.patchValue(gold)
      this.goldRateService.goldRate.next(gold);
      }
    })
  }

  updateGoldRate() {
    if (this.goldRate.invalid) {
      this.goldRate.markAsTouched()
      return
    }

    this.goldRateService.updateGoldRate({ goldRate: this.goldRate.value }).pipe(
      map(res => {
        if (res) {
          this.toastr.success('Gold Rate Updated Sucessfully');
          this.goldRateService.goldRate.next(this.goldRate.value);
          // this.getGoldRate();
          this.goldRateLog();
        }
      }),
      // catchError(err => {
      // this.toastr.errorToastr('Please try Again');
      //   throw err
      // }),
      finalize(() => {
      })
    ).subscribe();
  }

  getGoldRate() {
    this.goldRateService.getGoldRate().pipe(
      map(res => {
        // this.gold = res.goldRate;
        this.goldRate.patchValue(res.goldRate)

      })).subscribe()
  }
}
