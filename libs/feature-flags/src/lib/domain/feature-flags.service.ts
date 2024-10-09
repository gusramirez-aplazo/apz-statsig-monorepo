import { Observable } from 'rxjs';
import { FeatureFlag } from '../feature-flags.interface';

export abstract class FeatureFlagsService {
  abstract getLoggedFeature$(
    featureName: string
  ): Observable<FeatureFlag | null>;
  abstract setLoggedAttributes(
    attrubutes: Record<string, unknown>
  ): Promise<void>;
  abstract startLoggedClient(userId: string): Promise<void>;
  abstract finishLoggedClient(): void;
  abstract start(): Promise<void>;
}
