import { TestBed } from '@angular/core/testing';

import { FacturesService } from './factures.service';

describe('FacturesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FacturesService = TestBed.get(FacturesService);
    expect(service).toBeTruthy();
  });
});
