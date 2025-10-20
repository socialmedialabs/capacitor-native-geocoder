import Capacitor
import Contacts
import Foundation
import MapKit

@objc(NativeGeocoderPlugin)
public class NativeGeocoderPlugin: CAPPlugin, MKLocalSearchCompleterDelegate {

    private var completer: MKLocalSearchCompleter?
    private var suggestSeq = 0
    private var suggestMaxResults = 5
    private var pendingSuggestCall: CAPPluginCall?
    private var pendingSuggestTimeout: DispatchWorkItem?

    @objc(reverseGeocode:)
    public func reverseGeocode(_ call: CAPPluginCall) {
        CAPLog.print("NativeGeocoder.reverseGeocode called")
        guard let lat = call.getDouble("lat"), let lon = call.getDouble("lon") else {
            call.reject("Missing coordinates")
            return
        }

        let maxResults = clampMaxResults(call.getInt("maxResults"))
        let useLocale = call.getBool("useLocale", true)
        let locale = resolveLocale(useLocale: useLocale, defaultLocale: call.getString("defaultLocale"))

        let location = CLLocation(latitude: lat, longitude: lon)
        let geocoder = CLGeocoder()
        geocoder.reverseGeocodeLocation(location, preferredLocale: locale) { placemarks, error in
            if let err = error as NSError? {
                if err.domain == kCLErrorDomain {
                    switch err.code {
                    case CLError.geocodeFoundNoResult.rawValue,
                         CLError.geocodeCanceled.rawValue:
                        call.resolve(["results": []])
                        return
                    default:
                        call.reject(err.localizedDescription)
                        return
                    }
                }
                call.reject(err.localizedDescription)
                return
            }

            let results = (placemarks ?? [])
                .prefix(maxResults)
                .map { self.mapPlacemark($0, fallbackName: nil) }
            call.resolve(["results": results])
        }
    }

    @objc(forwardGeocode:)
    public func forwardGeocode(_ call: CAPPluginCall) {
        CAPLog.print("NativeGeocoder.forwardGeocode called")
        let raw = call.getString("address") ?? call.getString("query")
        guard let address = raw?.trimmingCharacters(in: .whitespacesAndNewlines),
              address.isEmpty == false
        else {
            call.reject("Missing address")
            return
        }

        let maxResults = clampMaxResults(call.getInt("maxResults"))
        let request = MKLocalSearch.Request()
        if #available(iOS 13.0, *) {
            request.resultTypes = [.address, .pointOfInterest]
        }
        request.naturalLanguageQuery = address

        let search = MKLocalSearch(request: request)
        search.start { response, error in
            guard error == nil, let items = response?.mapItems else {
                call.resolve(["results": []])
                return
            }
            let results = items
                .prefix(maxResults)
                .map { item in
                    self.mapPlacemark(item.placemark, fallbackName: item.name ?? address)
                }
            call.resolve(["results": results])
        }
    }

    @objc(forwardSuggest:)
    public func forwardSuggest(_ call: CAPPluginCall) {
        CAPLog.print("NativeGeocoder.forwardSuggest called")
        let raw = call.getString("query") ?? call.getString("address")
        guard let trimmed = raw?.trimmingCharacters(in: .whitespacesAndNewlines),
              trimmed.isEmpty == false
        else {
            call.reject("Missing query")
            return
        }

        suggestMaxResults = clampMaxResults(call.getInt("maxResults"))

        DispatchQueue.main.async {
            self.pendingSuggestTimeout?.cancel()
            self.pendingSuggestTimeout = nil
            self.pendingSuggestCall = call

            self.suggestSeq &+= 1
            let sequence = self.suggestSeq

            self.completer?.delegate = nil
            self.completer = nil

            let completer = MKLocalSearchCompleter()
            completer.delegate = self
            if #available(iOS 13.0, *) {
                completer.resultTypes = [.address, .pointOfInterest]
            }
            self.completer = completer
            completer.queryFragment = trimmed

            let timeout = DispatchWorkItem { [weak self] in
                guard let self = self else { return }
                guard sequence == self.suggestSeq else { return }
                guard let call = self.pendingSuggestCall else { return }
                self.pendingSuggestCall = nil
                call.resolve(["results": []])
            }
            self.pendingSuggestTimeout = timeout
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.8, execute: timeout)
        }
    }

    public func completer(_ completer: MKLocalSearchCompleter, didFailWithError error: Error) {
        CAPLog.print("NativeGeocoder.forwardSuggest failure: \(error.localizedDescription)")
        guard completer === self.completer else { return }
        pendingSuggestTimeout?.cancel()
        pendingSuggestTimeout = nil
        guard let call = pendingSuggestCall else { return }
        pendingSuggestCall = nil
        call.resolve(["results": []])
    }

    public func completerDidUpdateResults(_ completer: MKLocalSearchCompleter) {
        CAPLog.print("NativeGeocoder.forwardSuggest updated")
        guard completer === self.completer else { return }
        pendingSuggestTimeout?.cancel()
        guard let call = pendingSuggestCall else { return }

        let completions = completer.results
        guard completions.isEmpty == false else {
            pendingSuggestTimeout?.cancel()
            pendingSuggestTimeout = nil
            pendingSuggestCall = nil
            call.resolve(["results": []])
            return
        }

        let slice = completions.prefix(suggestMaxResults)
        var remaining = slice.count
        var collected: [[String: Any]] = []
        let sequence = suggestSeq

        func finishIfDone() {
            guard remaining == 0 else { return }
            guard sequence == self.suggestSeq, completer === self.completer else { return }
            guard let pending = self.pendingSuggestCall else { return }
            self.pendingSuggestTimeout?.cancel()
            self.pendingSuggestTimeout = nil
            self.pendingSuggestCall = nil
            pending.resolve(["results": collected])
        }

        for completion in slice {
            if #available(iOS 13.0, *) {
                let request = MKLocalSearch.Request(completion: completion)
                let search = MKLocalSearch(request: request)
                search.start { response, error in
                    DispatchQueue.main.async {
                        guard sequence == self.suggestSeq, completer === self.completer else { return }
                        if error == nil, let item = response?.mapItems.first {
                            let fallback = item.name ?? self.completionLabel(completion)
                            collected.append(self.mapPlacemark(item.placemark, fallbackName: fallback))
                        }
                        remaining -= 1
                        finishIfDone()
                    }
                }
            } else {
                DispatchQueue.main.async {
                    guard sequence == self.suggestSeq, completer === self.completer else { return }
                    var obj: [String: Any] = [:]
                    obj["latitude"] = NSNull()
                    obj["longitude"] = NSNull()
                    obj["countryCode"] = NSNull()
                    obj["countryName"] = NSNull()
                    obj["postalCode"] = NSNull()
                    obj["administrativeArea"] = NSNull()
                    obj["subAdministrativeArea"] = NSNull()
                    obj["locality"] = NSNull()
                    obj["subLocality"] = NSNull()
                    obj["thoroughfare"] = NSNull()
                    obj["subThoroughfare"] = NSNull()
                    obj["areasOfInterest"] = []
                    obj["formattedAddress"] = self.completionLabel(completion)
                    collected.append(obj)
                    remaining -= 1
                    finishIfDone()
                }
            }
        }
    }

    private func clampMaxResults(_ raw: Int?) -> Int {
        guard let raw = raw else { return 5 }
        return max(1, min(raw, 5))
    }

    private func resolveLocale(useLocale: Bool, defaultLocale: String?) -> Locale {
        if useLocale, let identifier = sanitizedLocaleIdentifier(from: defaultLocale) {
            return Locale(identifier: identifier)
        }
        if useLocale {
            return Locale.current
        }
        return Locale(identifier: "en_US")
    }

    private func sanitizedLocaleIdentifier(from value: String?) -> String? {
        guard let value = value, value.isEmpty == false else {
            return nil
        }
        return value.replacingOccurrences(of: "_", with: "-")
    }

    private func mapPlacemark(_ placemark: CLPlacemark, fallbackName: String?) -> [String: Any] {
        var obj: [String: Any] = [:]
        obj["latitude"] = placemark.location?.coordinate.latitude
        obj["longitude"] = placemark.location?.coordinate.longitude
        obj["countryCode"] = placemark.isoCountryCode
        obj["countryName"] = placemark.country
        obj["postalCode"] = placemark.postalCode
        obj["administrativeArea"] = placemark.administrativeArea
        obj["subAdministrativeArea"] = placemark.subAdministrativeArea
        obj["locality"] = placemark.locality
        obj["subLocality"] = placemark.subLocality
        obj["thoroughfare"] = placemark.thoroughfare
        obj["subThoroughfare"] = placemark.subThoroughfare
        obj["areasOfInterest"] = placemark.areasOfInterest ?? []
        obj["formattedAddress"] = formatAddress(for: placemark, fallback: fallbackName)
        return obj
    }

    private func formatAddress(for placemark: CLPlacemark?, fallback: String?) -> String {
        if let postal = placemark?.postalAddress {
            let formatted = CNPostalAddressFormatter.string(from: postal, style: .mailingAddress)
            return formatted
                .split(whereSeparator: { $0.isNewline })
                .joined(separator: ", ")
        }
        if let name = placemark?.name, name.isEmpty == false {
            return name
        }
        if let fallback = fallback, fallback.isEmpty == false {
            return fallback
        }
        return ""
    }

    private func completionLabel(_ completion: MKLocalSearchCompletion) -> String {
        guard completion.subtitle.isEmpty == false else { return completion.title }
        return "\(completion.title), \(completion.subtitle)"
    }
}
