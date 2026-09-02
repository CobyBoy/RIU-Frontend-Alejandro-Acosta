import { TestBed } from '@angular/core/testing';

import { HeroFormFacade } from './hero-form.facade';
import { Router } from '@angular/router';
import { HeroService } from './hero.service';
import { firstValueFrom, of, Subject } from 'rxjs';
import { CreateHero, Hero, UpdateHero } from '../models/hero.model';
import { HEROES_MOCK } from '../testing/hero-list.mock';
import { HERO_FEEDBACK } from '../models/hero-feedback';

describe('HeroFormFacade', () => {
  let facade: HeroFormFacade;
  let createSubject: Subject<Hero>;

  const createMock = vi.fn();
  const navigateMock = vi.fn();
  const getByIdMock = vi.fn();
  const updateMock = vi.fn();
  const getAllHeroesMock = vi.fn();

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
    getByIdMock.mockReset();
    updateMock.mockReset();
    getAllHeroesMock.mockReset();

    TestBed.configureTestingModule({
      providers: [
        HeroFormFacade,
        {
          provide: HeroService,
          useValue: {
            create: createMock,
            getById: getByIdMock,
            update: updateMock,
            getAllHeroes: getAllHeroesMock,
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

  describe('create', () => {
    it('should create a hero and set submitting while the request is pending', () => {
      facade.create(hero);

      expect(createMock).toHaveBeenCalledExactlyOnceWith(hero);
      expect(facade.submitting()).toBe(true);
      expect(facade.error()).toBeNull();
    });

    it('should navigate to heroes after creating a hero successfully', () => {
      facade.create(hero);

      createSubject.next({
        id: '1',
        ...hero,
      });
      createSubject.complete();

      expect(navigateMock).toHaveBeenCalledExactlyOnceWith(['/heroes']);
      expect(facade.submitting()).toBe(false);
    });

    it('should expose an error when hero creation fails', () => {
      facade.create(hero);

      createSubject.error(new Error('Create failed'));

      expect(facade.submitError()).toBe(HERO_FEEDBACK.createdFailed);
      expect(navigateMock).not.toHaveBeenCalled();
      expect(facade.submitting()).toBe(false);
    });

    it('should clear a previous error before creating again', () => {
      facade.create(hero);
      createSubject.error(new Error('Create failed'));

      expect(facade.submitError()).toBe(HERO_FEEDBACK.createdFailed);

      createSubject = new Subject<Hero>();
      createMock.mockReturnValue(createSubject.asObservable());

      facade.create(hero);

      expect(facade.submitError()).toBeNull();
      expect(facade.submitting()).toBe(true);
    });
  });

  it('should navigate to heroes when cancelling', () => {
    facade.cancel();

    expect(navigateMock).toHaveBeenCalledExactlyOnceWith(['/heroes']);
  });

  describe('load', () => {
    it('should load a hero by id', () => {
      const hero = HEROES_MOCK[0];
      const loadSubject = new Subject<Hero>();

      getByIdMock.mockReturnValue(loadSubject.asObservable());

      facade.load(hero.id);

      expect(getByIdMock).toHaveBeenCalledExactlyOnceWith(hero.id);
      expect(facade.loading()).toBe(true);
      expect(facade.error()).toBeNull();

      loadSubject.next(hero);
      loadSubject.complete();

      expect(facade.hero()).toEqual(hero);
      expect(facade.loading()).toBe(false);
    });

    it('should expose an error when loading a hero fails', () => {
      const loadSubject = new Subject<Hero>();

      getByIdMock.mockReturnValue(loadSubject.asObservable());

      facade.load('999');

      loadSubject.error(new Error('Load failed'));

      expect(facade.error()).toBe(HERO_FEEDBACK.loadHeroFailed);
      expect(facade.loading()).toBe(false);
    });

    it('should clear a previous error before loading again', () => {
      const firstSubject = new Subject<Hero>();

      getByIdMock.mockReturnValue(firstSubject.asObservable());

      facade.load('999');
      firstSubject.error(new Error('Load failed'));

      expect(facade.error()).toBe(HERO_FEEDBACK.loadHeroFailed);

      const secondSubject = new Subject<Hero>();

      getByIdMock.mockReturnValue(secondSubject.asObservable());

      facade.load(HEROES_MOCK[0].id);

      expect(facade.error()).toBeNull();
      expect(facade.loading()).toBe(true);
    });
  });

  describe('update', () => {
    it('should update a hero and set submitting while the request is pending', () => {
      const updateSubject = new Subject<Hero>();

      updateMock.mockReturnValue(updateSubject.asObservable());

      const changes: UpdateHero = {
        realName: 'Peter Parker',
      };

      facade.update('1', changes);

      expect(updateMock).toHaveBeenCalledExactlyOnceWith('1', changes);
      expect(facade.submitting()).toBe(true);
      expect(facade.error()).toBeNull();
    });

    it('should navigate to heroes after updating successfully', () => {
      const updateSubject = new Subject<Hero>();

      updateMock.mockReturnValue(updateSubject.asObservable());

      const changes: UpdateHero = {
        realName: 'Peter Parker',
      };

      facade.update('1', changes);

      updateSubject.next({
        ...HEROES_MOCK[0],
        ...changes,
      });
      updateSubject.complete();

      expect(navigateMock).toHaveBeenCalledExactlyOnceWith(['/heroes']);
      expect(facade.submitting()).toBe(false);
    });

    it('should expose an error when updating fails', () => {
      const updateSubject = new Subject<Hero>();

      updateMock.mockReturnValue(updateSubject.asObservable());

      facade.update('1', {
        realName: 'Peter Parker',
      });

      updateSubject.error(new Error('Update failed'));

      expect(facade.submitError()).toBe(HERO_FEEDBACK.updateFailed);
      expect(navigateMock).not.toHaveBeenCalled();
      expect(facade.submitting()).toBe(false);
    });
  });

  it('should identify duplicate names', async () => {
    getAllHeroesMock.mockReturnValue(of(HEROES_MOCK));

    const result = await firstValueFrom(facade.isNameTaken(' spider-man '));

    expect(result).toBe(true);
  });

  it('should allow the current hero name when it is excluded in edit mode', async () => {
    getAllHeroesMock.mockReturnValue(of(HEROES_MOCK));

    const result = await firstValueFrom(facade.isNameTaken('Spider-Man', HEROES_MOCK[0].id));

    expect(result).toBe(false);
  });
});
