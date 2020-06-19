import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanRepaymentAddComponent } from './loan-repayment-add.component';

describe('LoanRepaymentAddComponent', () => {
  let component: LoanRepaymentAddComponent;
  let fixture: ComponentFixture<LoanRepaymentAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoanRepaymentAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoanRepaymentAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
