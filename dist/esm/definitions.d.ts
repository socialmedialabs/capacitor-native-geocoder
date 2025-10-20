export interface NativeGeocoderResult {
    latitude?: number;
    longitude?: number;
    countryCode?: string | null;
    countryName?: string | null;
    postalCode?: string | null;
    administrativeArea?: string | null;
    subAdministrativeArea?: string | null;
    locality?: string | null;
    subLocality?: string | null;
    thoroughfare?: string | null;
    subThoroughfare?: string | null;
    areasOfInterest?: string[] | null;
    formattedAddress?: string | null;
}
export interface NativeGeocoderOptions {
    useLocale?: boolean;
    defaultLocale?: string;
    maxResults?: number;
}
export interface ReverseGeocodeOptions extends NativeGeocoderOptions {
    lat: number;
    lon: number;
}
export interface ForwardGeocodeOptions extends NativeGeocoderOptions {
    address: string;
}
export interface ForwardSuggestOptions extends NativeGeocoderOptions {
    /**
     * Natural language query to use for autocomplete.
     * If `query` is omitted the native layer will fall back to `address`.
     */
    query?: string;
    /**
     * Address-style query string used on platforms that only
     * receive `address`. Kept for backwards compatibility.
     */
    address?: string;
}
export interface GeocoderResponse {
    results: NativeGeocoderResult[];
}
export interface CapacitorNativeGeocoderPlugin {
    reverseGeocode(options: ReverseGeocodeOptions): Promise<GeocoderResponse>;
    forwardGeocode(options: ForwardGeocodeOptions): Promise<GeocoderResponse>;
    forwardSuggest(options: ForwardSuggestOptions): Promise<GeocoderResponse>;
}
