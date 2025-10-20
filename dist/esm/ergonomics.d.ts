import type { ForwardGeocodeOptions, ForwardSuggestOptions, NativeGeocoderResult, ReverseGeocodeOptions } from './definitions';
export declare function reverseGeocode(options: ReverseGeocodeOptions): Promise<NativeGeocoderResult[]>;
export declare function forwardGeocode(options: ForwardGeocodeOptions): Promise<NativeGeocoderResult[]>;
export declare function forwardSuggest(options: ForwardSuggestOptions): Promise<NativeGeocoderResult[]>;
