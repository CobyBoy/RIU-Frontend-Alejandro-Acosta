import { inject, Injectable, signal } from '@angular/core';
import { HeroService } from './hero.service';
import { Router } from '@angular/router';
import { CreateHero } from '../models/hero.model';
import { finalize } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HeroFormFacade {
  private readonly heroService = inject(HeroService);
  private readonly router = inject(Router);

  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);

  create(hero: CreateHero): void {
    this.submitting.set(true);
    this.error.set(null);

    this.heroService
      .create(hero)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => {
          void this.router.navigate(['/heroes']);
        },
        error: () => {
          this.error.set('No se pudo crear el heroe.');
        },
      });
  }

  cancel(): void {
    void this.router.navigate(['/heroes']);
  }
}
