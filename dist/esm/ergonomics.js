import { NativeGeocoder } from './index';
export async function reverseGeocode(options) {
    const { results } = await NativeGeocoder.reverseGeocode(options);
    return results ?? [];
}
export async function forwardGeocode(options) {
    const { results } = await NativeGeocoder.forwardGeocode(options);
    return results ?? [];
}
export async function forwardSuggest(options) {
    const { results } = await NativeGeocoder.forwardSuggest(options);
    return results ?? [];
}
