import { ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChange, SimpleChanges, ViewRef } from '@angular/core';
import { TimeElapsedPipe } from '../../../../core/_base/layout';

@Component({
  selector: 'kt-elapsed-time',
  templateUrl: './elapsed-time.component.html',
  styleUrls: ['./elapsed-time.component.scss']
})
export class ElapsedTimeComponent implements OnInit, OnDestroy, OnChanges {
  @Input() startTime
  totalTime: any;
  interval: NodeJS.Timeout;

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
}