import {
  APP_INITIALIZER,
  EnvironmentProviders,
  makeEnvironmentProviders,
} from '@angular/core';
import { FeatureFlagsService } from './domain/feature-flags.service';
import { FeatureConfiguration } from './feature-flags.interface';
import { FFWithStatsig } from './ff-with-statsig.service';
import { FEATURES_CONFIG } from './tokens';

export function featureFlagsFactory(
  service: FeatureFlagsService
): () => Promise<void> {
  return async () => {
    await service.start();
    return;
  };
}

export function provideFrontFeatureFlags(
  initialConfig: FeatureConfiguration
): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: FeatureFlagsService,
      useClass: FFWithStatsig,
    },

    {
      provide: FEATURES_CONFIG,
      useValue: initialConfig,
    },

    {
      provide: APP_INITIALIZER,
      useFactory: featureFlagsFactory,
      deps: [FeatureFlagsService],
      multi: true,
    },
  ]);
}
