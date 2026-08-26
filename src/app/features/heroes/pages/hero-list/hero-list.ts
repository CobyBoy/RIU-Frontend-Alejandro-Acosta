import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HeroService } from '../../services/hero.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, filter, finalize, map, of, startWith, switchMap } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { HeroCard } from '../../ui/hero-card/hero-card';
import { MatPaginatorModule } from '@angular/material/paginator';
import { Hero } from '../../models/hero.model';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDeleteDialog } from '../../ui/confirm-delete-dialog/confirm-delete-dialog';

@Component({
  selector: 'app-hero-list',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    HeroCard,
    MatPaginatorModule,
    RouterLink,
    MatButtonModule,
  ],
  templateUrl: './hero-list.html',
  styleUrl: './hero-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroList {
  private readonly heroService = inject(HeroService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  readonly query = signal('');
  readonly page = signal(0);
  readonly pageSize = 5;
  readonly pagedHeroes = computed(() => {
    const start = this.page() * this.pageSize;
    const end = start + this.pageSize;
    return this.heores().slice(start, end);
  });

  readonly heores = computed(() => this.state().heroes);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);

  readonly totalHeroes = computed(() => this.heores().length);
  readonly refresh = signal(false);
  readonly deleting = signal(false);
  readonly deleteError = signal<string | null>(null);

  private readonly state = toSignal(
    toObservable(this.refresh).pipe(
      switchMap(() =>
        this.heroService.getAllHeroes().pipe(
          map((heroes) => ({ heroes, loading: false, error: null })),
          startWith({ heroes: [], loading: true, error: null }),
          catchError(() =>
            of({ heroes: [], loading: false, error: 'No se pudieron cargar los heroes.' }),
          ),
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

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.query.set(input.value);
  }

  onEditRequested(id: string): void {
    this.router.navigate(['/heroes', id, 'edit']);
  }

  onDeleteRequested(hero: Hero): void {
    const dialogRef = this.dialog.open(ConfirmDeleteDialog, {
      data: hero,
    });

    dialogRef
      .afterClosed()
      .pipe(
        filter((confirmed) => confirmed),
        switchMap(() => {
          this.deleting.set(true);
          this.deleteError.set(null);
          return this.heroService.delete(hero.id).pipe(finalize(() => this.deleting.set(false)));
        }),
      )
      .subscribe({
        next: () => { this.refresh.update((value) => !value); },
        error: () => { this.deleteError.set('No se pudo eliminar el heroe.'); },
      });
  }
}
