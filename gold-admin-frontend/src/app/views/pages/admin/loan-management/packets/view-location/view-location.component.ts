import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { MapsAPILoader } from '@agm/core';
import { MapService } from '../../../../../../core/loan-management/view-location/map/services/map.service';
import { map } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

interface marker {
  lat: number;
  lng: number;
  draggable: boolean;
  userName: string;
  checkInTime: string;
  checkOutTime?: string;
  address: string;
  isVisible: boolean;
}

@Component({
  selector: 'kt-view-location',
  templateUrl: './view-location.component.html',
  styleUrls: ['./view-location.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewLocationComponent implements OnInit {

  selected: any = 0;
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
  masterLoanId: number;


  constructor(
    private mapsAPILoader: MapsAPILoader,
    private fb: FormBuilder,
    private mapService: MapService,
    private route: ActivatedRoute,
    private ref: ChangeDetectorRef
  ) { }



  ngOnInit() {
    this.route.paramMap.subscribe(res => this.masterLoanId = Number(res.get('id')));

    // this.markers = [{ lat: 32.2432, lng: 77.1892 }]
    this.createForm()
    this.mapsAPILoader.load().then(() => {
      this.geoCoder = new google.maps.Geocoder;
    });
  }

  createForm() {
    this.mapReport = this.fb.group({
      dateForMap: [new Date(), Validators.required],
      dateForLocation: [new Date(), Validators.required],
      masterLoanId: [, [Validators.required]]
    })

    this.mapReport.patchValue({ masterLoanId: this.masterLoanId });

    this.getMapReport()
  }

  getMapReport() {
    const params = {
      masterLoanId: this.mapReport.controls.masterLoanId.value,
      date: (this.mapReport.controls.dateForMap.value).toISOString(),
    }
    this.mapService.getMapReport(params).pipe(map(res => {
      if (res.data.length) {
        for (const iterator of res.data) {
          const { latitude: lat, longitude: lng, trackingTime, address } = iterator
          const { masterLoan } = iterator.packetTrackingMasterloan[0]
          this.markers.push({ lat, lng, trackingTime, address, masterLoan, isVisible: true })
        }
        this.infoToggle = new Array(this.markers.length).fill(false);
        console.log(this.markers)
      } else {
        this.markers = []
      }
      this.ref.detectChanges()
    })).subscribe()
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
