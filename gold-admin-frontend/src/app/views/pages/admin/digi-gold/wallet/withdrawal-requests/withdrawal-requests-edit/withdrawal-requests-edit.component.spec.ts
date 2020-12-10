import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WithdrawalRequestsEditComponent } from './withdrawal-requests-edit.component';

describe('WithdrawalRequestsEditComponent', () => {
  let component: WithdrawalRequestsEditComponent;
  let fixture: ComponentFixture<WithdrawalRequestsEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WithdrawalRequestsEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WithdrawalRequestsEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
