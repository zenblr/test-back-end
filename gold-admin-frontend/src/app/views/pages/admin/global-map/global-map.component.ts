import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { GlobalMapService } from '../../../../core/global-map/global-map.service'
import { DatePipe } from '@angular/common';

@Component({
  selector: 'kt-global-map',
  templateUrl: './global-map.component.html',
  styleUrls: ['./global-map.component.scss'],
  providers: [DatePipe]
})
export class GlobalMapComponent implements OnInit {

  panelOpenState: boolean;
  latitude: number = 18.969050;
  longitude: number = 72.821180;
  mapType = 'roadmap';
  globalMapDate: any;
  private geoCoder;
  address: string = '';
  mapReport: FormGroup;
  markers: any[] = [];
  infoToggle: any[] = [];
  currentIndex;
  previousIndex
  date: FormControl = new FormControl(new Date());
  mapInfo: any;
  packetInfo: any;

  constructor(
    private globalMapService: GlobalMapService,
    private datePipe: DatePipe,
    private ref: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.getGlobalMapInfo();

  }
  getGlobalMapInfo() {
    console.log(this.date.value)
    let date = this.date.value;
    date = this.datePipe.transform(date, 'yyyy-MM-dd');
    this.globalMapService.globalMapInfo(date).subscribe(res => {
      this.mapInfo = res.data;
      this.packetInfo = res.data;
      this.markers = []
      if (res.data && res.data.length) {
        for (const iterator of res.data) {
          for (const data of iterator) {
            const { latitude: lat, longitude: lng, trackingTime, trackingDate, address, masterLoanId } = data
            const { firstName, lastName } = data.user
            const { loanUniqueId } = data.customerLoan
            for (const packet of data.customerLoan.packet) {
              const { packetUniqueId } = packet

              this.markers.push({ lat, lng, trackingTime, trackingDate, address, masterLoanId, isVisible: true, firstName, lastName, loanUniqueId, packetUniqueId });
            }

          }
          this.infoToggle = new Array(this.markers.length).fill(true);
          console.log(this.infoToggle)
          console.log(this.markers)
        }
      }
      else {
        this.markers = []
      }
      this.ref.detectChanges()
    });
    // this.getGlobalMapPacketInfo(date);
  }

  getGlobalMapPacketInfo(date) {
    this.globalMapService.globalMapPacketInfo(date).subscribe(res => {
      this.packetInfo = res.data;
      this.markers = []
      if (res.data && res.data.length) {
        for (const iterator of res.data) {
          const { latitude: lat, longitude: lng, trackingTime, trackingDate, address, masterLoanId } = iterator
          const { firstName, lastName } = iterator.user
          const { loanUniqueId } = iterator.customerLoan
          for (const packet of iterator.customerLoan.packet) {
            const { packetUniqueId } = packet

            this.markers.push({ lat, lng, trackingTime, trackingDate, address, masterLoanId, isVisible: true, firstName, lastName, loanUniqueId, packetUniqueId });
          }



        }
        this.infoToggle = new Array(this.markers.length).fill(true);
        console.log(this.infoToggle)
        console.log(this.markers)
      } else {
        this.markers = []
      }
      this.ref.detectChanges()
    });
  }

  clickedMarker(latitude, longitude, index) {

    for (let i = 0; i < this.markers.length; i++) {
      if (i != index){
        this.infoToggle[i] = true
      }
      else{
        this.infoToggle[index] = !this.infoToggle[index]
    }
  }


    this.ref.detectChanges()
    // this.currentIndex = index;
    // if (this.previousIndex == this.currentIndex) {
    //   for (let i = 0; i < this.markers.length; i++) {
    //     this.markers[i].isVisible = true
    //     this.infoToggle[i] = false
    //   }
    //   this.previousIndex = -1;
    // }
    // else {
    //   for (let i = 0; i < this.markers.length; i++) {
    //     if (this.currentIndex == i) {
    //       this.infoToggle[i] = true
    //       this.markers[i].isVisible = true
    //     }
    //     else {
    //       this.infoToggle[i] = false
    //       this.markers[i].isVisible = false
    //     }
    //     this.previousIndex = this.currentIndex
    //   }
    // }

  }

}
