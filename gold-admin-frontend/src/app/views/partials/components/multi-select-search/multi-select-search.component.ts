// Angular
import { Component, ChangeDetectionStrategy, Input, forwardRef, OnDestroy, } from "@angular/core";
import { FormGroup, FormBuilder, NG_VALUE_ACCESSOR, NG_VALIDATORS, FormControl, ControlValueAccessor, } from "@angular/forms";
import { Subscription } from "rxjs";

@Component({
	selector: "kt-multi-select-search",
	templateUrl: "./multi-select-search.component.html",
	styleUrls: ["./multi-select-search.component.scss"],
	changeDetection: ChangeDetectionStrategy.Default,
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => MultiSelectSearchComponent),
			multi: true,
		},
		{
			provide: NG_VALIDATORS,
			useExisting: forwardRef(() => MultiSelectSearchComponent),
			multi: true,
		},
	],
})
export class MultiSelectSearchComponent implements ControlValueAccessor, OnDestroy {
	@Input() items: Array<any>;
	@Input() multiple: boolean;
	@Input() bindLabel: string;
	@Input() bindValue: string;
	@Input() isClear: boolean = false;

	form: FormGroup;
	subscriptions: Subscription[] = [];

	get value() {
		return this.form.value;
	}

	set value(value) {
		this.form.setValue(value);
		this.onChange(value);
		this.onTouched();
	}

	constructor(private formBuilder: FormBuilder) {
		// create the inner form
		this.form = this.formBuilder.group({
			multiSelect: [""],
		});

		this.subscriptions.push(
			// any time the inner form changes update the parent of any change
			this.form.valueChanges.subscribe((value) => {
				this.onChange(value);
				this.onTouched();
			})
		);
	}

	ngOnChanges() {
		if (this.isClear) {
			this.form.reset();
		}
	}

	ngOnDestroy() {
		this.subscriptions.forEach((s) => s.unsubscribe());
	}

	onChange: any = () => { };
	onTouched: any = () => { };

	registerOnChange(fn) {
		this.onChange = fn;
	}

	writeValue(value) {
		if (value) {
			this.value = value;
		}
	}

	registerOnTouched(fn) {
		this.onTouched = fn;
	}

	// communicate the inner form validation to the parent form
	validate(_: FormControl) {
		return this.form.valid ? null : { value: { valid: false } };
	}
}