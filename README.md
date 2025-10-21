# capacitor-native-geocoder

[![npm version](https://img.shields.io/npm/v/@socialmedialabs/capacitor-native-geocoder.svg)](https://www.npmjs.com/package/@socialmedialabs/capacitor-native-geocoder)
[![npm downloads](https://img.shields.io/npm/dm/@socialmedialabs/capacitor-native-geocoder.svg)](https://www.npmjs.com/package/@socialmedialabs/capacitor-native-geocoder)
[![license](https://img.shields.io/github/license/socialmedialabs/capacitor-native-geocoder)](./LICENSE)
[![platforms](https://img.shields.io/badge/platforms-iOS%2015%2B%20%7C%20Android%2034%2B-green)](#)

Native geocoding (Apple CLGeocoder / Android `android.location.Geocoder`) for Capacitor 7.

- ✅ Capacitor 7 compatible (`@capacitor/core` peer dependency)
- ✅ Android API 34 ready (`GeocodeListener` on API 33+)
- ✅ iOS Deployment Target ≥ 15, bundled MapKit + Contacts
- ✅ Forward/Reverse Geocoding + Suggest (Autocomplete)

> ℹ️ A `forwardSuggestPlaces` endpoint is planned for a future version. The current API is prepared for it but intentionally does not expose the method yet.

## Installation

```bash
npm install @socialmedialabs/capacitor-native-geocoder
```

Then sync native platforms:

```bash
npx cap sync
```

## Quick Start

```ts
import { NativeGeocoder } from '@socialmedialabs/capacitor-native-geocoder';

const { results } = await NativeGeocoder.forwardGeocode({
  address: 'Brandenburg Gate, Berlin',
  maxResults: 3,
});
console.log(results);
```

### Android

1. Ensure your `android/capacitor.settings.gradle` contains the correct include path. If you use the generator, Cap Sync handles this automatically:
   ```groovy
   include ':capacitor-native-geocoder'
   project(':capacitor-native-geocoder').projectDir = new File('../node_modules/capacitor-native-geocoder/android')
   ```
2. Make sure your app project sets both `compileSdk` and `targetSdk` to **34**.

### iOS

1. Ensure your Xcode project uses iOS **15.0** or higher as deployment target.
2. After each sync: `cd ios && pod install`.

## TypeScript API

```ts
import { NativeGeocoder } from 'capacitor-native-geocoder';

const { results } = await NativeGeocoder.reverseGeocode({
  lat: 52.52,
  lon: 13.405,
  maxResults: 3,
  defaultLocale: 'de_DE',
});
```

### Methods

| Method | Description |
| ------ | ----------- |
| `reverseGeocode(options)` | Coordinates → addresses. |
| `forwardGeocode(options)` | Address → coordinates (multiple results possible). |
| `forwardSuggest(options)` | Autocomplete suggestions; returns precise coordinates on iOS (where available) and Geocoder-based approximations on Android. |

### Options

```ts
interface ReverseGeocodeOptions {
  lat: number;
  lon: number;
  useLocale?: boolean;
  defaultLocale?: string;
  maxResults?: number; // 1..5
}

interface ForwardGeocodeOptions {
  address: string;
  useLocale?: boolean;
  defaultLocale?: string;
  maxResults?: number; // 1..5
}

interface ForwardSuggestOptions {
  query?: string;
  address?: string; // fallback for existing integrations
  useLocale?: boolean;
  defaultLocale?: string;
  maxResults?: number; // 1..5
}
```

All methods return:

```ts
type GeocoderResponse = {
  results: NativeGeocoderResult[];
};
```

`NativeGeocoderResult` includes latitude/longitude, country, postal code, administrative levels, street metadata, optional points of interest, and a formatted display label.

### Web Platform

`reverseGeocode` and `forwardGeocode` are not available on the Web and will throw `UNIMPLEMENTED`.
`forwardSuggest` returns an empty array, allowing autocomplete-based UI to gracefully degrade.

## Error Handling

- Android returns an empty array on no result. Network or geocoder issues are logged and surfaced as empty lists.
- iOS distinguishes between “no result” (empty list) and actual errors.
- Both platforms clamp `maxResults` to between 1 and 5.
- Locale: default is the device language. Set `useLocale: false` to enforce a neutral (English) lookup.

## Development

```bash
npm run build
# runs clean → tsc → rollup
```

Before publishing:

1. Update the version in `package.json` and `CapacitorNativeGeocoder.podspec`.
2. Run `npm run build`, verify the output with `npm pack`.
3. Update changelog and create git tag.

## License

MIT © socialmedialabs.de
