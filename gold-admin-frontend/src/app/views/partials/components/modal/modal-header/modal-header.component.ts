import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'kt-modal-header',
  templateUrl: './modal-header.component.html',
  styleUrls: ['./modal-header.component.scss']
})
export class ModalHeaderComponent implements OnInit {

  @Input() title;
  @Input() noTitleCase: boolean;
  @Output() action = new EventEmitter();


  constructor() { }

  ngOnInit() {
  }

  closeModal() {
    this.action.emit(false);
  }

}
