import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  HttpInterceptorFn,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';

import { loadingInterceptor } from './loading.interceptor';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { LoadingService } from '../services/loading.service';
import { signal } from '@angular/core';

describe('loadingInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;
  let loadingService: LoadingService;

  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => loadingInterceptor(req, next));

  const isLoading = signal(false);

  const loadingServiceMock = {
    isLoading: isLoading.asReadonly(),
    start: vi.fn(() => isLoading.set(true)),
    stop: vi.fn(() => isLoading.set(false)),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: LoadingService,
          useValue: loadingServiceMock,
        },
        provideHttpClient(withInterceptors([loadingInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
    loadingService = TestBed.inject(LoadingService);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('should start loading when the request starts', () => {
    http.get('/api/heroes').subscribe();

    const request = httpTesting.expectOne('/api/heroes');

    expect(loadingService.isLoading()).toBe(true);
    request.flush([]);
  });

  it('should stop loading after a successful request', () => {
    http.get('/test').subscribe();

    const request = httpTesting.expectOne('/test');

    request.flush({});

    expect(loadingService.isLoading()).toBe(false);
  });

  it('should stop loading after a failed request', () => {
    http.get('/test').subscribe({
      error: () => {},
    });

    const request = httpTesting.expectOne('/test');

    request.flush('Server error', {
      status: 500,
      statusText: 'Internal Server Error',
    });

    expect(loadingService.isLoading()).toBe(false);
  });
});
