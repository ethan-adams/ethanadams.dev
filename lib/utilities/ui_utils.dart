import 'package:flutter/material.dart';
import 'package:ethanadamsdev_flutter/utilities/enums.dart';

ScreenType getDeviceType(MediaQueryData mediaQuery) {
  var orientation = mediaQuery.orientation;

  double deviceWidth = 0;

  if (orientation == Orientation.landscape) {
    deviceWidth = mediaQuery.size.height;
  } else {
    deviceWidth = mediaQuery.size.width;
  }

  if (deviceWidth > 950) {
    return ScreenType.Desktop;
  }

  if (deviceWidth > 600) {
    return ScreenType.Tablet;
  }

  return ScreenType.Mobile;
}