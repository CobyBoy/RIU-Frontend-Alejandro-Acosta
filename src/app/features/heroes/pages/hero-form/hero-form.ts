import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { CreateHero } from '../../models/hero.model';
import { HeroFormFacade } from '../../services/hero-form.facade';

@Component({
  selector: 'app-hero-form',
  imports: [ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './hero-form.html',
  styleUrl: './hero-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroForm {
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  readonly facade = inject(HeroFormFacade);

  readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    realName: ['', [Validators.required, Validators.minLength(3)]],
    imageUrl: ['', [Validators.required]],
    link: [''],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.facade.create(this.createNewHero());
  }

  private createNewHero(): CreateHero {
    const formValue = this.form.getRawValue();
    return {
      name: formValue.name.trim(),
      realName: formValue.realName.trim(),
      link: formValue.link.trim(),
      imageUrl: formValue.imageUrl.trim(),
    };
  }

  onCancel(): void {
    this.facade.cancel();
  }
}
