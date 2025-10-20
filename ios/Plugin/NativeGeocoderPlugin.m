#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>
CAP_PLUGIN(NativeGeocoderPlugin, "NativeGeocoder",
  CAP_PLUGIN_METHOD(reverseGeocode, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(forwardGeocode, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(forwardSuggest, CAPPluginReturnPromise);
)
