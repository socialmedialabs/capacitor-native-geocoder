import { WebPlugin } from '@capacitor/core';
import type { CapacitorNativeGeocoderPlugin, ForwardGeocodeOptions, ForwardSuggestOptions, GeocoderResponse, ReverseGeocodeOptions } from './definitions';
export declare class NativeGeocoderWeb extends WebPlugin implements CapacitorNativeGeocoderPlugin {
    reverseGeocode(_options: ReverseGeocodeOptions): Promise<GeocoderResponse>;
    forwardGeocode(_options: ForwardGeocodeOptions): Promise<GeocoderResponse>;
    forwardSuggest(_options: ForwardSuggestOptions): Promise<GeocoderResponse>;
}
