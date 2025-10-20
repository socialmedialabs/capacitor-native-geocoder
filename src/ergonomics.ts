import { NativeGeocoder } from './index';
import type {
  ForwardGeocodeOptions,
  ForwardSuggestOptions,
  NativeGeocoderResult,
  ReverseGeocodeOptions,
} from './definitions';

export async function reverseGeocode(
  options: ReverseGeocodeOptions,
): Promise<NativeGeocoderResult[]> {
  const { results } = await NativeGeocoder.reverseGeocode(options);
  return results ?? [];
}

export async function forwardGeocode(
  options: ForwardGeocodeOptions,
): Promise<NativeGeocoderResult[]> {
  const { results } = await NativeGeocoder.forwardGeocode(options);
  return results ?? [];
}

export async function forwardSuggest(
  options: ForwardSuggestOptions,
): Promise<NativeGeocoderResult[]> {
  const { results } = await NativeGeocoder.forwardSuggest(options);
  return results ?? [];
}
