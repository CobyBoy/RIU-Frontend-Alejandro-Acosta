import { TestBed } from '@angular/core/testing';

import { HeroService } from './hero.service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Hero } from '../models/hero.model';
import { provideHttpClient } from '@angular/common/http';
import { API_URL } from '../../../core/config/api.token';
import { firstValueFrom } from 'rxjs';

describe('Hero', () => {
  let service: HeroService;
  let httpTesting: HttpTestingController;

  const apiUrl = 'https://test-api';

  const heroes: Hero[] = [
    {
      id: 1,
      name: 'Spider-Man',
      realName: 'Peter Benjamin Parker',
      link: 'https://www.marvel.com/characters/spider-man-peter-parker',
      imgUrl: 'http://marvel.com/characters/54/spider-man',
    },
    {
      id: 2,
      name: 'CAPTAIN MARVEL',
      realName: 'Carol Danvers',
      link: 'https://www.marvel.com/characters/captain-marvel-carol-danvers',
      imgUrl: 'http://marvel.com/characters/9/captain_marvel',
    },
  ];

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
      request.flush(heroes);

      await expect(result).resolves.toEqual(heroes);
      httpTesting.verify();
    });
  });
});
