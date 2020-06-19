import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanDisbursementAddComponent } from './loan-disbursement-add.component';

describe('LoanDisbursementAddComponent', () => {
  let component: LoanDisbursementAddComponent;
  let fixture: ComponentFixture<LoanDisbursementAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoanDisbursementAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoanDisbursementAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
