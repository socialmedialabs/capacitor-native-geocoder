import { WebPlugin } from '@capacitor/core';
import type {
  CapacitorNativeGeocoderPlugin,
  ForwardGeocodeOptions,
  ForwardSuggestOptions,
  GeocoderResponse,
  ReverseGeocodeOptions,
} from './definitions';

export class NativeGeocoderWeb
  extends WebPlugin
  implements CapacitorNativeGeocoderPlugin
{
  async reverseGeocode(_options: ReverseGeocodeOptions): Promise<GeocoderResponse> {
    return Promise.reject(
      this.unimplemented('NativeGeocoder is not available on Web.'),
    );
  }

  async forwardGeocode(_options: ForwardGeocodeOptions): Promise<GeocoderResponse> {
    return Promise.reject(
      this.unimplemented('NativeGeocoder is not available on Web.'),
    );
  }

  async forwardSuggest(_options: ForwardSuggestOptions): Promise<GeocoderResponse> {
    return Promise.resolve({ results: [] });
  }
}
