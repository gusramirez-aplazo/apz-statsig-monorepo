export type FeatureFlagWithConfig = {
  treatment: string;
  config: any | null;
};

export type FeatureConfiguration = {
  authorizationKey: string;
  devMode: boolean;
  env?: string;
  featuresPrefix?: string[];
  /**only required if devMode is true */
  fakeTreatments?: { [key: string]: string | FeatureFlagWithConfig };
  debbuger?: boolean;
  pathToBackup?: string;
  features?: any;
};

export type FeatureFlag = {
  value: boolean | string;
  config: any | null;
};

export type GuardConfiguration = {
  redirectPath: string | string[];
  featureName: string;
  isLoggedFeatureFlag: boolean;
};
