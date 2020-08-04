import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { MapsAPILoader } from '@agm/core';

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


  constructor(
    private mapsAPILoader: MapsAPILoader,
    private fb: FormBuilder,
  ) { }



  ngOnInit() {
    this.markers = [{ lat: 32.2432, lng: 77.1892 }]
    this.createForm()
    this.mapsAPILoader.load().then(() => {
      this.geoCoder = new google.maps.Geocoder;
    });
  }

  createForm() {
    this.mapReport = this.fb.group({
      mapDate: [new Date(), Validators.required]
    })
  }

}
