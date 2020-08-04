import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'kt-global-map',
  templateUrl: './global-map.component.html',
  styleUrls: ['./global-map.component.scss']
})
export class GlobalMapComponent implements OnInit {

  panelOpenState:boolean;
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
  constructor() { }

  ngOnInit() {
  }

}
