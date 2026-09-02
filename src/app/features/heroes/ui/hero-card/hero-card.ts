import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Hero } from '../../models/hero.model';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-hero-card',
  imports: [MatButtonModule, MatCardModule, NgOptimizedImage],
  templateUrl: './hero-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroCard {
  readonly hero = input.required<Hero>();
  readonly editRequested = output<string>();
  readonly deleteRequested = output<Hero>();
  readonly priority = input(false);

  onEdit(): void {
    this.editRequested.emit(this.hero().id);
  }

  onDelete(): void {
    this.deleteRequested.emit(this.hero());
  }
}
