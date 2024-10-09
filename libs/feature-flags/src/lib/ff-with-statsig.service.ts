import { inject, Injectable } from '@angular/core';
import * as sCore from '@statsig/client-core';
import { StatsigClient, StatsigOptions } from '@statsig/js-client';
import {
  BehaviorSubject,
  defer,
  delayWhen,
  filter,
  lastValueFrom,
  map,
  Observable,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { FeatureFlagsService } from './domain/feature-flags.service';
import { FeatureFlag } from './feature-flags.interface';
import { FEATURES_CONFIG } from './tokens';

const factoryStatsig = async (apiKey: string, env?: string) => {
  console.log(sCore);
  console.log(sCore.NetworkParam);
  const user: sCore.StatsigUser = {};
  const level = sCore.LogLevel.Debug;
  const options: StatsigOptions = {
    environment: {
      tier: env ?? 'development',
    },
    logLevel: level,
    disableCompression: true,
    disableLogging: true,
    disableStatsigEncoding: true,
    disableStorage: true,
  };

  try {
    const client = await new StatsigClient(apiKey, user, options);

    client.initializeAsync();

    console.log('Statsig client initialized');

    return client;
  } catch (error) {
    console.error('Error initializing Statsig client', error);
    throw error;
  }
};

@Injectable({ providedIn: 'root' })
export class FFWithStatsig implements FeatureFlagsService {
  readonly #config = inject(FEATURES_CONFIG);

  #instance: StatsigClient;

  readonly #isStarted$ = new BehaviorSubject<boolean>(false);
  readonly #isLoggedReady$ = new BehaviorSubject<boolean>(false);

  isServiceStarted$: Observable<boolean>;

  getLoggedFeature$(featureName: string): Observable<FeatureFlag | null> {
    return this.#isLoggedReady$.pipe(
      filter(Boolean),
      delayWhen(() => this.#isStarted$),
      switchMap(() =>
        defer(() =>
          this.#instance.updateUserAsync({
            custom: {
              timestamp: Date.now(),
            },
          })
        )
      ),
      map(() => ({
        // Gates are always CLOSED or OFF (think return false;) by default.
        value: this.#instance.checkGate(featureName),
        config: null,
      })),
      tap((f) => {
        console.log('get logged from observable', f);

        console.log(
          'get logged feature',
          featureName,
          this.#instance.getFeatureGate(featureName),
          this.#instance.checkGate(featureName)
        );
      })
    );
  }
  async setLoggedAttributes(attributes: any): Promise<void> {
    await lastValueFrom(this.#isStarted$.pipe(filter(Boolean), take(1)));

    try {
      if (attributes && Object.keys(attributes).length > 0) {
        await this.#instance.updateUserAsync({
          custom: {
            ...attributes,
            timestamp: Date.now(),
          },
        });
      }
    } catch (error) {
      console.error('Error setting attributes', error);
    }
  }
  async startLoggedClient(userId: string): Promise<void> {
    await lastValueFrom(this.#isStarted$.pipe(filter(Boolean), take(1)));

    await this.#instance.updateUserAsync({
      userID: userId,
      custom: {
        timestamp: Date.now(),
      },
    });

    this.#isLoggedReady$.next(true);
  }
  finishLoggedClient(): void {
    this.#instance.updateUserAsync({ userID: 'anonymous' });
  }
  async start(): Promise<void> {
    try {
      this.#instance = await factoryStatsig(
        this.#config.authorizationKey,
        this.#config.env
      );

      this.#isStarted$.next(true);
    } catch (error) {
      console.error('Error initializing Statsig client', error);
    }
  }
}
