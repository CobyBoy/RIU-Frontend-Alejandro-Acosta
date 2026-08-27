import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { HeroService } from './hero.service';
import { Router } from '@angular/router';
import { CreateHero, Hero, UpdateHero } from '../models/hero.model';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable()
export class HeroFormFacade {
  private readonly heroService = inject(HeroService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);

  readonly hero = signal<Hero | null>(null);
  readonly loading = signal(false);
  

  create(hero: CreateHero): void {
    this.submitting.set(true);
    this.error.set(null);

    this.heroService
      .create(hero)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.submitting.set(false)),
      )
      .subscribe({
        next: () => {
          void this.router.navigate(['/heroes']);
        },
        error: () => {
          this.error.set('No se pudo crear el heroe.');
        },
      });
  }

  load(id: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.heroService
      .getById(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: (hero) => {
          this.hero.set(hero);
        },
        error: () => {
          this.error.set('No se pudo cargar el heroe.');
        },
      });
  }

  update(id: string, changes: UpdateHero): void {
    this.submitting.set(true);
    this.error.set(null);

    this.heroService
      .update(id, changes)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.submitting.set(false)),
      )
      .subscribe({
        next: () => {
          this.router.navigate(['/heroes']);
        },
        error: () => {
          this.error.set('No se pudo actualizar el heroe.');
        },
      });
  }

  cancel(): void {
    this.router.navigate(['/heroes']);
  }
}
