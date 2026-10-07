import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';

export type BackendStatus = 'UP' | 'DOWN';

/** Reports whether the backend is reachable and healthy (Spring Actuator health endpoint). */
@Injectable({ providedIn: 'root' })
export class SystemStatusService {
  private readonly http = inject(HttpClient);

  backendStatus(): Observable<BackendStatus> {
    return this.http.get<{ status: string }>('/actuator/health').pipe(
      map((health) => (health.status === 'UP' ? 'UP' : 'DOWN')),
      catchError(() => of<BackendStatus>('DOWN')),
    );
  }
}
