package com.capacitor_native_geocoder;

import android.location.Address;
import android.location.Geocoder;
import android.os.Build;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import android.util.Log;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.atomic.AtomicInteger;
import org.json.JSONArray;
import org.json.JSONObject;

@CapacitorPlugin(name = "NativeGeocoder")
public class NativeGeocoderPlugin extends Plugin {

  // Sequence for forwardSuggest soft-cancel: only the latest request may resolve
  private final AtomicInteger suggestSeq = new AtomicInteger(0);

  @PluginMethod
  public void reverseGeocode(PluginCall call) {
    Double lat = call.getDouble("lat");
    Double lon = call.getDouble("lon");

    if (lat == null || lon == null) {
      call.reject("Missing coordinates");
      return;
    }

    String defaultLocale = call.getString("defaultLocale");
    boolean useLocale = call.getBoolean("useLocale", true);
    int maxResults = call.getInt("maxResults", 5);
    if (maxResults < 1) maxResults = 1;
    if (maxResults > 5) maxResults = 5;

    Locale locale = resolveLocale(useLocale, defaultLocale);
    Geocoder geocoder = new Geocoder(getContext(), locale);
    // Effectively-final copies for lambda (for < SDK 33)
    final double la = lat;
    final double lo = lon;
    final int mRev = maxResults;

    if (Build.VERSION.SDK_INT >= 33) {
      geocoder.getFromLocation(
        lat,
        lon,
        maxResults,
        new Geocoder.GeocodeListener() {
          @Override
          public void onGeocode(List<Address> list) {
            resolveResults(call, list);
          }

          @Override
          public void onError(String message) {
            Log.w(
              getLogTag(),
              "Reverse geocode error: " + (message != null ? message : "unknown")
            );
            resolveEmptyResults(call);
          }
        }
      );
    } else {
      getBridge()
        .execute(() -> {
          try {
            List<Address> list = geocoder.getFromLocation(la, lo, mRev);
            resolveResults(call, list);
          } catch (Exception e) {
            Log.w(getLogTag(), "Reverse geocode error", e);
            resolveEmptyResults(call);
          }
        });
    }
  }

  @PluginMethod
  public void forwardGeocode(PluginCall call) {
    String address = call.getString("address");
    if (address == null || address.trim().isEmpty()) {
      call.reject("Missing address");
      return;
    }

    String defaultLocale = call.getString("defaultLocale");
    boolean useLocale = call.getBoolean("useLocale", true);
    int maxResults = call.getInt("maxResults", 5);
    if (maxResults < 1) maxResults = 1;
    if (maxResults > 5) maxResults = 5;

    Locale locale = resolveLocale(useLocale, defaultLocale);
    Geocoder geocoder = new Geocoder(getContext(), locale);
    // Effectively-final copies for lambda (for < SDK 33)
    final String a = address;
    final int mFwd = maxResults;

    if (Build.VERSION.SDK_INT >= 33) {
      geocoder.getFromLocationName(
        address,
        maxResults,
        new Geocoder.GeocodeListener() {
          @Override
          public void onGeocode(List<Address> list) {
            resolveResults(call, list);
          }

          @Override
          public void onError(String message) {
            Log.w(
              getLogTag(),
              "Forward geocode error: " + (message != null ? message : "unknown")
            );
            resolveEmptyResults(call);
          }
        }
      );
    } else {
      getBridge()
        .execute(() -> {
          try {
            List<Address> list = geocoder.getFromLocationName(
              a,
              mFwd
            );
            resolveResults(call, list);
          } catch (Exception e) {
            Log.w(getLogTag(), "Forward geocode error", e);
            resolveEmptyResults(call);
          }
        });
    }
  }


  @PluginMethod
  public void forwardSuggest(PluginCall call) {
    // Query parameter (suggest-style). Fallback to "address" for API parity.
    String query = call.getString("query");
    if (query == null || query.trim().isEmpty()) {
      query = call.getString("address");
    }
    if (query == null || query.trim().isEmpty()) {
      call.reject("Missing query");
      return;
    }

    String defaultLocale = call.getString("defaultLocale");
    boolean useLocale = call.getBoolean("useLocale", true);
    int maxResults = call.getInt("maxResults", 5);
    if (maxResults < 1) maxResults = 1;
    if (maxResults > 5) maxResults = 5;

    final String q = query;
    final int m = maxResults;
    final int mySeq = suggestSeq.incrementAndGet();

    forwardGeocodeWithGeocoder(call, useLocale, defaultLocale, q, m, mySeq);
  }

  private void forwardGeocodeWithGeocoder(PluginCall call, boolean useLocale, String defaultLocale, String q, int m, int mySeq) {
    Locale locale = resolveLocale(useLocale, defaultLocale);
    Geocoder geocoder = new Geocoder(getContext(), locale);
    if (Build.VERSION.SDK_INT >= 33) {
      geocoder.getFromLocationName(
        q,
        m,
        new Geocoder.GeocodeListener() {
          @Override
          public void onGeocode(List<Address> list) {
            if (mySeq != suggestSeq.get()) return;
            resolveResults(call, list);
          }

          @Override
          public void onError(String message) {
            if (mySeq != suggestSeq.get()) return;
            Log.w(
              getLogTag(),
              "Forward suggest error: " + (message != null ? message : "unknown")
            );
            resolveEmptyResults(call);
          }
        }
      );
    } else {
      getBridge().execute(() -> {
        try {
          java.util.List<Address> list = geocoder.getFromLocationName(q, m);
          if (mySeq != suggestSeq.get()) return;
          resolveResults(call, list);
        } catch (Exception e) {
          if (mySeq != suggestSeq.get()) return;
          Log.w(getLogTag(), "Forward suggest error", e);
          resolveEmptyResults(call);
        }
      });
    }
  }

  private void resolveResults(PluginCall call, List<Address> list) {
    JSObject ret = new JSObject();
    ret.put("results", mapList(list));
    call.resolve(ret);
  }

  private void resolveEmptyResults(PluginCall call) {
    resolveResults(call, Collections.emptyList());
  }

  private static JSONArray mapList(List<Address> list) {
    JSONArray out = new JSONArray();
    if (list != null) {
      for (Address a : list) out.put(mapAddress(a));
    }
    return out;
  }

  private static Locale resolveLocale(boolean useLocale, String defaultLocale) {
    if (useLocale && defaultLocale != null && !defaultLocale.trim().isEmpty()) {
      String tag = defaultLocale.replace('_', '-');
      Locale locale = Locale.forLanguageTag(tag);
      if (!locale.getLanguage().isEmpty()) {
        return locale;
      }
    }
    if (useLocale) return Locale.getDefault();
    return Locale.ENGLISH;
  }

  private static JSONObject mapAddress(Address a) {
    JSONObject o = new JSONObject();
    try {
      o.put("latitude", a.getLatitude());
      o.put("longitude", a.getLongitude());
      o.put("countryCode", a.getCountryCode());
      o.put("countryName", a.getCountryName());
      o.put("postalCode", a.getPostalCode());
      o.put("administrativeArea", a.getAdminArea());
      o.put("subAdministrativeArea", a.getSubAdminArea());
      o.put("locality", a.getLocality());
      o.put("subLocality", a.getSubLocality());
      o.put("thoroughfare", a.getThoroughfare());
      o.put("subThoroughfare", a.getSubThoroughfare());
      JSONArray aoi = new JSONArray();
      if (a.getFeatureName() != null) aoi.put(a.getFeatureName());
      o.put("areasOfInterest", aoi.length() > 0 ? aoi : JSONObject.NULL);
      String line0 = a.getAddressLine(0);
      o.put("formattedAddress", line0 != null ? line0 : JSONObject.NULL);
    } catch (Exception ignore) {}
    return o;
  }
}
