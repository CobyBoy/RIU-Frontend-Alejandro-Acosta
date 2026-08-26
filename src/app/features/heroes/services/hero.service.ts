import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CreateHero, Hero } from '../models/hero.model';
import { API_URL } from '../../../core/config/api.token';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HeroService {
  private readonly httpClient = inject(HttpClient);
  private readonly apiUrl = `${inject(API_URL)}/heroes`;

  getAllHeroes(): Observable<Hero[]> {
    return this.httpClient.get<Hero[]>(this.apiUrl);
  }

  getById(id: number): Observable<Hero> {
    return this.httpClient.get<Hero>(`${this.apiUrl}/${id}`);
  }

  create(hero: CreateHero): Observable<Hero> {
    return this.httpClient.post<Hero>(`${this.apiUrl}`, hero);
  }
}
