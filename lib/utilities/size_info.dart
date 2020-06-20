import 'package:flutter/widgets.dart';
import 'package:ethanadamsdev_flutter/utilities/enums.dart';

class SizingInformation {
  final Orientation orientation;
  final ScreenType deviceType;
  final Size screenSize;
  final Size localWidgetSize;

  SizingInformation({
    this.orientation,
    this.deviceType,
    this.screenSize,
    this.localWidgetSize,
  });

  @override
  String toString() {
    return 'Orientation:$orientation DeviceType:$deviceType ScreenSize:$screenSize LocalWidgetSize:$localWidgetSize';
  }
}
