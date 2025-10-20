# Changelog

## 2.0.0 - 2024-10-20

- **Breaking:** TypeScript-API auf Optionsobjekte umgestellt (`reverseGeocode({ lat, lon, ... })` usw.).
- iOS: Deployment Target ≥ 15, Contacts.framework + formatierte Adressen, Locale-Optionen und Forward-Suggest-Warteschlange überarbeitet.
- Android: `targetSdk = 34`, resilientere Fehlerbehandlung, Locale-Paser mit Language-Tags.
- Build & Packaging: `@capacitor/core` wird nicht mehr gebündelt, README/License aktualisiert, npm-Paket beinhaltet nur notwendige Artefakte.
- Diverse Hilfsfunktionen (`src/ergonomics`) und Web-Shim an neue Signaturen angepasst.

## 1.0.2 - 2024-??-??

- Ausgangsversion für Capacitor 7 mit grundlegenden Native-Geocode-Funktionen.
