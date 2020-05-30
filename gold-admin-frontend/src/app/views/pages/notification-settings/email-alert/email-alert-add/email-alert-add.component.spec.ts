import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailAlertAddComponent } from './email-alert-add.component';

describe('EmailAlertAddComponent', () => {
  let component: EmailAlertAddComponent;
  let fixture: ComponentFixture<EmailAlertAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmailAlertAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailAlertAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
