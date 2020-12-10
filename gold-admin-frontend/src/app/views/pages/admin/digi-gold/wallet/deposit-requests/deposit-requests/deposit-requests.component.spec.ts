import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DepositRequestsComponent } from './deposit-requests.component';

describe('DepositRequestsComponent', () => {
  let component: DepositRequestsComponent;
  let fixture: ComponentFixture<DepositRequestsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DepositRequestsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DepositRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
