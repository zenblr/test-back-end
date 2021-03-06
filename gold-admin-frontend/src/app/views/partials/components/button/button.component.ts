import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";

@Component({
	selector: "kt-button",
	templateUrl: "./button.component.html",
	styleUrls: ["./button.component.scss"],
})
export class ButtonComponent implements OnInit {
	@Input() value;
	@Input() type;
	@Input() myClass;
	@Input() isDisabled;
	@Output() action = new EventEmitter();
	@Input() notTitleCase ;
	constructor() {}

	ngOnInit() {}
	actionPerformed() {
		this.action.emit(this.value);
	}
}
