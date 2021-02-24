import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'kt-modal-footer',
  templateUrl: './modal-footer.component.html',
  styleUrls: ['./modal-footer.component.scss']
})
export class ModalFooterComponent implements OnInit {

  @Input() isDisabled: boolean;
  @Input() value
  @Output() action = new EventEmitter();
  @Input() hideCancel
  constructor() { }

  ngOnInit() {
  }

  onSubmit() {
    this.action.emit(true);
  }

  closeModal() {
    this.action.emit(false);
  }
}
