import { TestBed } from '@angular/core/testing';

import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with loading false', () => {
    expect(service.isLoading()).toBe(false);
  })

  it('should start loading', () => {
    service.start();

    expect(service.isLoading()).toBe(true);
  });

  it('should stop loading', () => {
    service.start();
    service.stop();

    expect(service.isLoading()).toBe(false);
  });

});
