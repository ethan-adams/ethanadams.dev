import 'package:flutter/material.dart';
import 'package:ethanadamsdev_flutter/constants.dart';
//CURRENTLY UNUSED
class ImageCard extends StatelessWidget {
  final Widget child;

  ImageCard({this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      child: child,
      margin: EdgeInsets.all(15),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(10),
        color: kCardColor,
      ),
    );
  }
}
