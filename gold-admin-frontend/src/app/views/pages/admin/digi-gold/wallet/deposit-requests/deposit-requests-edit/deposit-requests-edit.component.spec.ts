import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DepositRequestsEditComponent } from './deposit-requests-edit.component';

describe('DepositRequestsEditComponent', () => {
  let component: DepositRequestsEditComponent;
  let fixture: ComponentFixture<DepositRequestsEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DepositRequestsEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DepositRequestsEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
