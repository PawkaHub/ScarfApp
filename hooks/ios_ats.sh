#!/bin/bash

echo "Adjusting plist for App Transport Security exception."
val=$(/usr/libexec/plistbuddy -c "add NSAppTransportSecurity:NSExceptionDomains:firebaseio.com:NSIncludesSubdomains bool true" platforms/ios/New/New-Info.plist 2>/dev/null)
val=$(/usr/libexec/plistbuddy -c "add NSAppTransportSecurity:NSExceptionDomains:firebaseio.com:NSThirdPartyExceptionRequiresForwardSecrecy bool false" platforms/ios/New/New-Info.plist 2>/dev/null)
echo "Done"