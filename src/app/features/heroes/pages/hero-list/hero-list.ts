import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { HeroService } from '../../services/hero.service';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
  catchError,
  combineLatest,
  debounce,
  distinctUntilChanged,
  filter,
  map,
  Observable,
  of,
  startWith,
  switchMap,
  timer,
} from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { HeroCard } from '../../ui/hero-card/hero-card';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Hero } from '../../models/hero.model';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDeleteDialog } from '../../ui/confirm-delete-dialog/confirm-delete-dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HERO_FEEDBACK } from '../../models/hero-feedback';

@Component({
  selector: 'app-hero-list',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    HeroCard,
    MatPaginatorModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './hero-list.html',
  styleUrl: './hero-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroList {
  private readonly _heroService = inject(HeroService);
  private readonly _router = inject(Router);
  private readonly _dialog = inject(MatDialog);
  private readonly _snackBar = inject(MatSnackBar);
  private readonly _destroyRef = inject(DestroyRef);

  readonly query = signal('');
  readonly page = signal(0);
  readonly pageSize = signal(4);
  readonly pageSizeOptions = [4, 8, 12];

  readonly pagedHeroes = computed(() => {
    const start = this.page() * this.pageSize();
    const end = start + this.pageSize();
    return this.heroes().slice(start, end);
  });

  readonly heroes = computed(() => this._state().heroes);
  readonly loading = computed(() => this._state().loading);
  readonly error = computed(() => this._state().error);

  readonly totalHeroes = computed(() => this.heroes().length);
  readonly refresh = signal(false);

  private readonly _refresh$ = toObservable(this.refresh);
  private readonly _query$ = toObservable(this.query).pipe(
    map((query) => query.trim()),
    distinctUntilChanged(),
    debounce((query) => (query ? timer(300) : of(0))),
  );

  private readonly _state = toSignal(
    combineLatest([this._query$, this._refresh$]).pipe(
      switchMap(([query]) =>
        this.loadHeroes(
          query ? this._heroService.searchByName(query) : this._heroService.getAllHeroes(),
        ),
      ),
    ),
    {
      initialValue: {
        heroes: [],
        loading: true,
        error: null,
      },
    },
  );

  private loadHeroes(
    request$: Observable<Hero[]>,
  ): Observable<{ heroes: Hero[]; loading: boolean; error: string | null }> {
    return request$.pipe(
      map((heroes) => ({ heroes, loading: false, error: null })),
      startWith({ heroes: [], loading: true, error: null }),
      catchError(() =>
        of({ heroes: [], loading: false, error: HERO_FEEDBACK.loadHeroesFailed }),
      ),
    );
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.page.set(0);
    this.query.set(input.value);
  }

  onEditRequested(id: string): void {
    this._router.navigate(['/heroes', id, 'edit']);
  }

  onDeleteRequested(hero: Hero): void {
    const dialogRef = this._dialog.open(ConfirmDeleteDialog, {
      data: hero,
    });

    dialogRef
      .afterClosed()
      .pipe(
        filter((confirmed) => confirmed),
        switchMap(() => {
          return this._heroService.delete(hero.id);
        }),
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe({
        next: () => {
          this.showFeedback(HERO_FEEDBACK.deleted);
          this.page.set(0);
          this.refresh.update((value) => !value);
        },
        error: () => {
          this.showFeedback(HERO_FEEDBACK.deleteFailed);
        },
      });
  }

  onPageChange(event: PageEvent) {
    this.page.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  clearSearch(): void {
    this.query.set('');
  }

  private showFeedback(message: string) {
    this._snackBar.open(message, undefined, {
      duration: 4000,
    });
  }
}
