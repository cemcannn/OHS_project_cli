import { TestBed } from '@angular/core/testing';

import { DirectorateService } from './directorate.service';

describe('DirectorateService', () => {
  let service: DirectorateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DirectorateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
