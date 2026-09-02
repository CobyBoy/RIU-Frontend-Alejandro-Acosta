import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Hero } from '../../models/hero.model';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-confirm-delete-dialog',
  imports: [MatButtonModule, MatDialogModule],
  templateUrl: './confirm-delete-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDeleteDialog {
  readonly hero = inject<Hero>(MAT_DIALOG_DATA);
}
