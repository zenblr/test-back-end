import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'kt-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent implements OnInit {

  @Input() value;
  @Input() type;
  @Output() action = new EventEmitter();
  constructor() { }

  ngOnInit() {
    
  }
  actionPerformed() {
    this.action.emit(true)
  }

}
