import { computed, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private readonly _pendingRequests = signal(0);

  readonly isLoading = computed(() => this._pendingRequests() > 0);

  start(): void {
    this._pendingRequests.update((value) => value + 1);
  }

  stop(): void {
    this._pendingRequests.update((value) => Math.max(0, value - 1));
  }
}
