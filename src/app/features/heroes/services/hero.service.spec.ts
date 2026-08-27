import { TestBed } from '@angular/core/testing';

import { HeroService } from './hero.service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CreateHero, Hero, UpdateHero } from '../models/hero.model';
import { provideHttpClient } from '@angular/common/http';
import { API_URL } from '../../../core/config/api.token';
import { firstValueFrom } from 'rxjs';
import { HEROES_MOCK } from '../testing/hero-list.mock';
import { HERO_FEEDBACK } from '../models/hero-feedback';

describe('Hero', () => {
  let service: HeroService;
  let httpTesting: HttpTestingController;

  const apiUrl = 'https://test-api';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        HeroService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_URL, useValue: apiUrl },
      ],
    });
    service = TestBed.inject(HeroService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllHeroes', () => {
    it('should return all heroes', async () => {
      const result = firstValueFrom(service.getAllHeroes());
      const request = httpTesting.expectOne(`${apiUrl}/heroes`);

      expect(request.request.method).toBe('GET');
      request.flush(HEROES_MOCK);

      await expect(result).resolves.toEqual(HEROES_MOCK);
    });
  });

  describe('getById', () => {
    it('should request a hero by id', async () => {
      const hero = HEROES_MOCK[0];
      const resultPromise = firstValueFrom(service.getById(hero.id));
      const request = httpTesting.expectOne(`${apiUrl}/heroes/${hero.id}`);

      expect(request.request.method).toBe('GET');
      request.flush(hero);
      await expect(resultPromise).resolves.toEqual(hero);
    });

    it('should propagate a not found error', async () => {
      const resultPromise = firstValueFrom(service.getById('999'));
      const request = httpTesting.expectOne(`${apiUrl}/heroes/999`);

      request.flush('Heroe no encontrado', {
        status: 404,
        statusText: 'Not Found',
      });

      await expect(resultPromise).rejects.toMatchObject({
        status: 404,
      });
    });
  });

  describe('create', () => {
    it('should create a hero', async () => {
      const newHero: CreateHero = {
        name: 'War Machine',
        realName: 'James Rhodes',
        link: 'https://www.marvel.com/characters/war-machine-james-rhodes',
        imageUrl: 'http://marvel.com/characters/1009/war_machine',
      };

      const createdHero: Hero = {
        id: '3',
        ...newHero,
      };

      const resultPromise = firstValueFrom(service.create(newHero));
      const request = httpTesting.expectOne(`${apiUrl}/heroes`);

      expect(request.request.method).toBe('POST');
      expect(request.request.body).toEqual(newHero);

      request.flush(createdHero);
      await expect(resultPromise).resolves.toEqual(createdHero);
    });

    it('should propagate an error when creating a hero fails', async () => {
      const newHero: CreateHero = {
        name: 'War Machine',
        realName: 'James Rhodes',
        link: 'https://www.marvel.com/characters/war-machine-james-rhodes',
        imageUrl: 'http://marvel.com/characters/1009/war_machine',
      };

      const resultPromise = firstValueFrom(service.create(newHero));

      const request = httpTesting.expectOne(`${apiUrl}/heroes`);

      request.flush(HERO_FEEDBACK.createdFailed, {
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(resultPromise).rejects.toMatchObject({
        status: 500,
      });
    });
  });

  describe('update', () => {
    it('should update a hero', async () => {
      const changes: UpdateHero = {
        realName: 'Peter Parker',
      };

      const updatedHero: Hero = {
        ...HEROES_MOCK[0],
        ...changes,
      };

      const resultPromise = firstValueFrom(service.update(HEROES_MOCK[0].id, changes));

      const request = httpTesting.expectOne(`${apiUrl}/heroes/${HEROES_MOCK[0].id}`);

      expect(request.request.method).toBe('PATCH');
      expect(request.request.body).toEqual(changes);

      request.flush(updatedHero);

      await expect(resultPromise).resolves.toEqual(updatedHero);
    });

    it('should propagate an error when updating a hero fails', async () => {
      const changes: UpdateHero = {
        realName: 'Peter Parker',
      };

      const resultPromise = firstValueFrom(service.update('999', changes));

      const request = httpTesting.expectOne(`${apiUrl}/heroes/999`);

      request.flush(HERO_FEEDBACK.updateFailed, {
        status: 404,
        statusText: 'Not Found',
      });

      await expect(resultPromise).rejects.toMatchObject({
        status: 404,
      });
    });
  });

  describe('delete', () => {
    it('should delete a hero', async () => {
      const resultPromise = firstValueFrom(service.delete(HEROES_MOCK[0].id));
      const request = httpTesting.expectOne(`${apiUrl}/heroes/${HEROES_MOCK[0].id}`);

      expect(request.request.method).toBe('DELETE');
      request.flush(null);

      await expect(resultPromise).resolves.toBeNull();
    });

    it('should propagate an error when deleting a hero fails', async () => {
      const resultPromise = firstValueFrom(service.delete('999'));
      const request = httpTesting.expectOne(`${apiUrl}/heroes/999`);

      request.flush(HERO_FEEDBACK.deleteFailed, {
        status: 404,
        statusText: 'Not Found',
      });

      await expect(resultPromise).rejects.toMatchObject({
        status: 404,
      });
    });
  });

  describe('searchByName', () => {
    it('should search heroes case-insensitively', async () => {
      const resultPromise = firstValueFrom(service.searchByName('MA'));

      const request = httpTesting.expectOne(`${apiUrl}/heroes`);

      request.flush(HEROES_MOCK);

      const result = await resultPromise;

      expect(result.map((hero) => hero.name)).toEqual(['Spider-Man', 'Captain Marvel', 'Iron Man']);
    });
  });
});
