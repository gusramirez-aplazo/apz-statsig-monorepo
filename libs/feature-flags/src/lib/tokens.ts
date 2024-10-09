import { InjectionToken } from '@angular/core';
import { FeatureConfiguration } from './feature-flags.interface';

export const FEATURES_CONFIG = new InjectionToken<FeatureConfiguration>(
  'APLAZO_FEATURES_CONFIG'
);
