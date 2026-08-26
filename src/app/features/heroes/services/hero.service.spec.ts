import { TestBed } from '@angular/core/testing';

import { HeroService } from './hero.service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Hero } from '../models/hero.model';
import { provideHttpClient } from '@angular/common/http';
import { API_URL } from '../../../core/config/api.token';
import { firstValueFrom } from 'rxjs';
import { HEROES_MOCK } from '../testing/hero-list.mock';

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
      httpTesting.verify();
    });

    it('should request a hero by id', async () => {
      const hero = HEROES_MOCK[0];
      const resultPromise = firstValueFrom(service.getById(hero.id));
      const request = httpTesting.expectOne(`${apiUrl}/heroes/${hero.id}`);

      expect(request.request.method).toBe('GET');
      request.flush(hero);
      await expect(resultPromise).resolves.toEqual(hero);
    });

    it('should propagate a not found error', async () => {
      const resultPromise = firstValueFrom(service.getById(999));
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
});
