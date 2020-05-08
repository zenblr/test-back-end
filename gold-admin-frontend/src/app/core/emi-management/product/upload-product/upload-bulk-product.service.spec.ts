import { TestBed } from '@angular/core/testing';

import { UploadBulkProductService } from './upload-bulk-product.service';

describe('UploadBulkProductService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UploadBulkProductService = TestBed.get(UploadBulkProductService);
    expect(service).toBeTruthy();
  });
});
