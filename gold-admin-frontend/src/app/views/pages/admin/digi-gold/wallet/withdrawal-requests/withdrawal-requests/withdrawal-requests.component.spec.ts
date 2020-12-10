import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WithdrawalRequestsComponent } from './withdrawal-requests.component';

describe('WithdrawalRequestsComponent', () => {
  let component: WithdrawalRequestsComponent;
  let fixture: ComponentFixture<WithdrawalRequestsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WithdrawalRequestsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WithdrawalRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
