import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkUploadReportComponent } from './bulk-upload-report.component';

describe('BulkUploadReportComponent', () => {
  let component: BulkUploadReportComponent;
  let fixture: ComponentFixture<BulkUploadReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BulkUploadReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkUploadReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
