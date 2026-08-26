import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-hero-list',
  imports: [],
  templateUrl: './hero-list.html',
  styleUrl: './hero-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroList {}
