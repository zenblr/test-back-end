import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SmsAlertAddComponent } from './sms-alert-add.component';

describe('SmsAlertAddComponent', () => {
  let component: SmsAlertAddComponent;
  let fixture: ComponentFixture<SmsAlertAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SmsAlertAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SmsAlertAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
