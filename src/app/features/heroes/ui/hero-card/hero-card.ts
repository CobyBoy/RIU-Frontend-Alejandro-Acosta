import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Hero } from '../../models/hero.model';

@Component({
  selector: 'app-hero-card',
  imports: [MatButtonModule, MatCardModule],
  templateUrl: './hero-card.html',
  styleUrl: './hero-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroCard {
  readonly hero = input.required<Hero>();
  readonly editRequested = output<number>();
  readonly deleteRequested = output<Hero>();

  onEdit(): void {
    this.editRequested.emit(this.hero().id);
  }

  onDelete(): void {
    this.deleteRequested.emit(this.hero());
  }
}
