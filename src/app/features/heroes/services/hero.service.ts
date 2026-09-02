import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CreateHero, Hero, UpdateHero } from '../models/hero.model';
import { API_URL } from '../../../core/config/api.token';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HeroService {
  private readonly _httpClient = inject(HttpClient);
  private readonly _apiUrl = `${inject(API_URL)}/heroes`;

  getAllHeroes(): Observable<Hero[]> {
    return this._httpClient.get<Hero[]>(this._apiUrl);
  }

  getById(id: string): Observable<Hero> {
    return this._httpClient.get<Hero>(`${this._apiUrl}/${id}`);
  }

  create(hero: CreateHero): Observable<Hero> {
    return this._httpClient.post<Hero>(`${this._apiUrl}`, hero);
  }

  update(id: string, updatedHero: UpdateHero): Observable<Hero> {
    return this._httpClient.patch<Hero>(`${this._apiUrl}/${id}`, updatedHero);
  }

  delete(id: string): Observable<void> {
    return this._httpClient.delete<void>(`${this._apiUrl}/${id}`);
  }

  searchByName(query: string): Observable<Hero[]> {
    const normalizedQuery = query.trim().toLowerCase();
    return this.getAllHeroes().pipe(
      map((heroes) => heroes.filter((hero) => hero.name.toLowerCase().includes(normalizedQuery))),
    );
  }
}
