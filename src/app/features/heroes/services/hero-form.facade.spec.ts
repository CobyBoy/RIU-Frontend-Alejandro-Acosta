import { TestBed } from '@angular/core/testing';

import { HeroFormFacade } from './hero-form.facade';
import { provideRouter, Router } from '@angular/router';
import { HeroService } from './hero.service';
import { Subject } from 'rxjs';
import { CreateHero, Hero } from '../models/hero.model';

describe('HeroFormFacade', () => {
  let facade: HeroFormFacade;
  let createSubject: Subject<Hero>;

  const createMock = vi.fn();
  const navigateMock = vi.fn();

  const hero: CreateHero = {
    name: 'Spider-Man',
    realName: 'Peter Parker',
    imageUrl: '/images/spider-man.jpg',
  };

  beforeEach(() => {
    createSubject = new Subject<Hero>();

    createMock.mockReset();
    navigateMock.mockReset();
    createMock.mockReturnValue(createSubject.asObservable());
    navigateMock.mockResolvedValue(true);

    TestBed.configureTestingModule({
      providers: [
        HeroFormFacade,
        {
          provide: HeroService,
          useValue: {
            create: createMock,
          },
        },
        {
          provide: Router,
          useValue: {
            navigate: navigateMock,
          },
        },
      ],
    });
    facade = TestBed.inject(HeroFormFacade);
  });

  it('should be created', () => {
    expect(facade).toBeTruthy();
  });

  it('should start with submitting false and no error', () => {
    expect(facade.submitting()).toBe(false);
    expect(facade.error()).toBeNull();
  });

  it('should create a hero and set submitting while the request is pending', () => {
    facade.create(hero);

    expect(createMock).toHaveBeenCalledExactlyOnceWith(hero);
    expect(facade.submitting()).toBe(true);
    expect(facade.error()).toBeNull();
  });

  it('should navigate to heroes after creating a hero successfully', () => {
    facade.create(hero);

    createSubject.next({
      id: 1,
      ...hero,
    });
    createSubject.complete();

    expect(navigateMock).toHaveBeenCalledExactlyOnceWith(['/heroes']);
    expect(facade.submitting()).toBe(false);
  });

  it('should expose an error when hero creation fails', () => {
    facade.create(hero);

    createSubject.error(new Error('Create failed'));

    expect(facade.error()).toBe('No se pudo crear el heroe.');
    expect(navigateMock).not.toHaveBeenCalled();
    expect(facade.submitting()).toBe(false);
  });

  it('should clear a previous error before creating again', () => {
    facade.create(hero);
    createSubject.error(new Error('Create failed'));

    expect(facade.error()).toBe('No se pudo crear el heroe.');

    createSubject = new Subject<Hero>();
    createMock.mockReturnValue(createSubject.asObservable());

    facade.create(hero);

    expect(facade.error()).toBeNull();
    expect(facade.submitting()).toBe(true);
  });

  it('should navigate to heroes when cancelling', () => {
    facade.cancel();

    expect(navigateMock).toHaveBeenCalledExactlyOnceWith(['/heroes']);
  });
});
