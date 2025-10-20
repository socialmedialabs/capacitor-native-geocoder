import { WebPlugin } from '@capacitor/core';
export class NativeGeocoderWeb extends WebPlugin {
    async reverseGeocode(_options) {
        return Promise.reject(this.unimplemented('NativeGeocoder is not available on Web.'));
    }
    async forwardGeocode(_options) {
        return Promise.reject(this.unimplemented('NativeGeocoder is not available on Web.'));
    }
    async forwardSuggest(_options) {
        return Promise.resolve({ results: [] });
    }
}
