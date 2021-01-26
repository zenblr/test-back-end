import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SipApplicationComponent } from './sip-application.component';

describe('SipApplicationComponent', () => {
  let component: SipApplicationComponent;
  let fixture: ComponentFixture<SipApplicationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SipApplicationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SipApplicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
