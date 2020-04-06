import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'kt-modal-header',
  templateUrl: './modal-header.component.html',
  styleUrls: ['./modal-header.component.scss']
})
export class ModalHeaderComponent implements OnInit {

  @Input() title;

  constructor() { }

  ngOnInit() {
  }

}
