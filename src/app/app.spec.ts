import { ComponentFixture, TestBed } from '@angular/core/testing';
import { App } from './app';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { LoadingService } from './core/services/loading.service';

describe('App', () => {
  let fixture: ComponentFixture<App>;
  const isLoading = signal(false);

  const loadingServiceMock = {
    isLoading: isLoading.asReadonly(),
  };

  beforeEach(async () => {
    isLoading.set(false);

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        {
          provide: LoadingService,
          useValue: loadingServiceMock,
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(App);
    fixture.detectChanges();
  });

  it('should not show the loading indicator initially', () => {
    const progressBar = fixture.nativeElement.querySelector('mat-progress-bar');

    expect(progressBar).toBeNull();
  });

  it('should show the loading indicator while loading', () => {
    isLoading.set(true);
    fixture.detectChanges();

    const progressBar = fixture.nativeElement.querySelector('mat-progress-bar');

    expect(progressBar).not.toBeNull();
  });

  it('should hide the loading indicator when loading finishes', () => {
    isLoading.set(true);
    fixture.detectChanges();

    isLoading.set(false);
    fixture.detectChanges();

    const progressBar = fixture.nativeElement.querySelector('mat-progress-bar');

    expect(progressBar).toBeNull();
  });
});
