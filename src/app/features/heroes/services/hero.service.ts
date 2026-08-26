import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CreateHero, Hero, UpdateHero } from '../models/hero.model';
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

  getById(id: string): Observable<Hero> {
    return this.httpClient.get<Hero>(`${this.apiUrl}/${id}`);
  }

  create(hero: CreateHero): Observable<Hero> {
    return this.httpClient.post<Hero>(`${this.apiUrl}`, hero);
  }

  update(id: string, updatedHero: UpdateHero): Observable<Hero> {
    return this.httpClient.patch<Hero>(`${this.apiUrl}/${id}`, updatedHero);
  }

  delete(id: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrl}/${id}`);
  }
}
