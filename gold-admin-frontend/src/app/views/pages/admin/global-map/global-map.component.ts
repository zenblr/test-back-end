import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { GlobalMapService } from '../../../../core/global-map/global-map.service'
import { DatePipe } from '@angular/common';

interface marker {
  lat: any;
  lng: any;
  firstName: any;
  lastName: any;
  loanUniqueId: any;
  packetUniqueId: any;
  masterLoan: any;
  trackingTime:any;
  trackingDate:any;
  address:any;
  isVisible:boolean;
}


@Component({
  selector: 'kt-global-map',
  templateUrl: './global-map.component.html',
  styleUrls: ['./global-map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DatePipe]
})
export class GlobalMapComponent implements OnInit {

  icon: {url: '../../../../../assets/media/icons/ezgif.com-gif-maker.png', scaledSize: { width: 50, height: 50 }}
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
      let packets = []
      if (res.data && res.data.length) {
        for (const iterator of res.data) {
          const { latitude: lat, longitude: lng, trackingTime, trackingDate, address, masterLoanId } = iterator
          const { firstName, lastName } = iterator.user
          const { masterLoan } = iterator.packetTrackingMasterloan[0]

          let loanUniqueId = []
          let packets = []
          for (const data of iterator.packetTrackingMasterloan) {
            loanUniqueId.push(data.masterLoan.customerLoan[0].loanUniqueId)

            for (const packet of data.masterLoan.packet) {
              packets.push(packet.packetUniqueId)
            }
            var packetUniqueId = packets.join()
            var loan = loanUniqueId.join()
          }
          this.markers.push({ lat, lng, trackingTime, trackingDate, address, isVisible: true, firstName, lastName, loanUniqueId: loan, packetUniqueId, masterLoan });

        }
        this.infoToggle = new Array(this.markers.length).fill(true);
        console.log(this.infoToggle)
        console.log(this.markers)
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
          const { masterLoan } = iterator.packetTrackingMasterloan[0]

          let loanUniqueId = []
          let packets = []
          for (const data of iterator.packetTrackingMasterloan) {
            loanUniqueId.push(data.masterLoan.customerLoan[0].loanUniqueId)

            for (const packet of data.masterLoan.packet) {
              packets.push(packet.packetUniqueId)
            }
            var packetUniqueId = packets.join()
            var loan = loanUniqueId.join()
          }
          this.markers.push({ lat, lng, trackingTime, trackingDate, address, isVisible: true, firstName, lastName, loanUniqueId: loan, packetUniqueId, masterLoan });

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
      if (i != index) {
        this.infoToggle[i] = true
      }
      else {
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
