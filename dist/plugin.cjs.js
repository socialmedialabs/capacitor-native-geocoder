'use strict';

var core = require('@capacitor/core');

const NativeGeocoder = core.registerPlugin('NativeGeocoder', {
    web: () => Promise.resolve().then(function () { return web; }).then(m => new m.NativeGeocoderWeb()),
});

class NativeGeocoderWeb extends core.WebPlugin {
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

var web = /*#__PURE__*/Object.freeze({
    __proto__: null,
    NativeGeocoderWeb: NativeGeocoderWeb
});

exports.NativeGeocoder = NativeGeocoder;
