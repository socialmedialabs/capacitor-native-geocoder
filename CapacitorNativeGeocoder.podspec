Pod::Spec.new do |s|
  s.name             = 'CapacitorNativeGeocoder'
  s.version          = '2.0.0'
  s.summary          = 'Native geocoding for Capacitor (iOS/Android)'
  s.license          = { :type => 'MIT' }
  s.homepage         = 'https://github.com/socialmedialabs/capacitor-native-geocoder'
  s.author           = 'Social Media Labs'
  s.source           = { :path => '.' }
  s.source_files     = 'ios/Plugin/**/*.{swift,m,mm}'
  s.swift_version    = '5.7'
  s.ios.deployment_target = '15.0'
  s.frameworks = ['MapKit', 'Contacts']
  s.dependency 'Capacitor', '~> 7.0'
end
