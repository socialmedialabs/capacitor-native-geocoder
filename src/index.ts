import { registerPlugin } from '@capacitor/core';
import type { CapacitorNativeGeocoderPlugin } from './definitions';

export * from './definitions';

export const NativeGeocoder = registerPlugin<CapacitorNativeGeocoderPlugin>(
  'NativeGeocoder',
  {
    web: () => import('./web').then(m => new m.NativeGeocoderWeb()),
  },
);
