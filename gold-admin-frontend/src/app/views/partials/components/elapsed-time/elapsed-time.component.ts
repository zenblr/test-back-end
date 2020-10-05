import { ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChange, SimpleChanges, ViewRef } from '@angular/core';
import { TimeElapsedPipe } from '../../../../core/_base/layout';

@Component({
  selector: 'kt-elapsed-time',
  templateUrl: './elapsed-time.component.html',
  styleUrls: ['./elapsed-time.component.scss']
})
export class ElapsedTimeComponent implements OnInit, OnDestroy, OnChanges {
  @Input() startTime;
  @Input() locationTracking = 'init';
  totalTime: any;
  interval: NodeJS.Timeout;
  countTime = 5;
  permittedInterval = 1; //minutes
  showAlert: boolean;
  lastSyncTime: string;
  previousSyncTime: string;
  currentSyncTime: string;

  constructor(
    private ref: ChangeDetectorRef
  ) { }

  ngOnInit() {
  }

  ngOnChanges(changes) {
    this.change(changes.startTime.currentValue)
    this.interval = setInterval(() => {
      this.change(changes.startTime.currentValue)
      if (!(this.ref as ViewRef).destroyed) {
        this.ref.detectChanges();
      }
    }, 1000)
    this.trackLocation()
  }

  change(mindate: Date | string) {
    let timeDifference = new Date().getTime() - new Date(mindate).getTime();
    this.totalTime = this.msToTime(timeDifference)
  }

  msToTime(seconds) {
    var milliseconds = seconds % 1000;
    seconds = (seconds - milliseconds) / 1000;
    var secs = seconds % 60;
    seconds = (seconds - secs) / 60;
    var minutes = seconds % 60;
    var hours = (seconds - minutes) / 60;
    return hours.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0')
  }

  ngOnDestroy() {
    clearInterval(this.interval)
  }

  trackLocation() {
    if (!this.previousSyncTime) return this.previousSyncTime = this.locationTracking

    this.currentSyncTime = this.locationTracking

    if (this.previousSyncTime == this.currentSyncTime) {
      // setTimeout(() => {
      this.showAlert = true
      // }, this.permittedInterval * 60000)
    } else {
      this.showAlert = false
      this.previousSyncTime = this.currentSyncTime
    }

  }
}
