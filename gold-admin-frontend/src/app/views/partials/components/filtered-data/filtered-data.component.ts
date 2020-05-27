import { Component, EventEmitter, Output, Input, ChangeDetectorRef, ViewChild, ElementRef, OnInit, OnChanges, AfterViewInit, SimpleChanges, OnDestroy } from "@angular/core";
import { NgbDropdownConfig, NgbDropdown } from "@ng-bootstrap/ng-bootstrap";
import { FormGroup, Validators, FormBuilder, FormArray, FormControl, } from "@angular/forms";
import { map, takeUntil, take } from "rxjs/operators";
import { Subscription, ReplaySubject, Subject } from "rxjs";
import { MatDatepickerInputEvent, MatSelect } from "@angular/material";
import { SharedService } from "../../../../core/shared/services/shared.service";

@Component({
	selector: "kt-filtered-data",
	templateUrl: "./filtered-data.component.html",
	styleUrls: ["./filtered-data.component.scss"],
})
export class FilteredDataComponent implements OnInit, OnDestroy {
	@Input() filteredList: any;
	subscriptions: Subscription[] = [];

	constructor(
		private fb: FormBuilder,
		private config: NgbDropdownConfig,
		private sharedService: SharedService,
		private ref: ChangeDetectorRef
	) { }

	ngOnInit() {
	}

	ngOnDestroy() {
		this.subscriptions.forEach((s) => s.unsubscribe());
	}
}
