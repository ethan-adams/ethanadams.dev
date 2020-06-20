import 'package:ethanadamsdev_flutter/utilities/ui_utils.dart';
import 'package:flutter/material.dart';
import 'package:ethanadamsdev_flutter/utilities/size_info.dart';

class BaseWidget extends StatelessWidget {
  final Widget Function(
      BuildContext context, SizingInformation sizingInformation) builder;
  const BaseWidget({Key key, this.builder}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    var mediaQuery = MediaQuery.of(context);
    var sizingInformation = SizingInformation(
      orientation: mediaQuery.orientation,
      deviceType: getDeviceType(mediaQuery),
      screenSize: mediaQuery.size,
    );
    return builder(context, sizingInformation);
  }
}