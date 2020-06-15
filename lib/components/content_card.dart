import 'package:flutter/material.dart';

//CURRENTLY UNUSED
class ContentCard extends StatelessWidget {
  final Widget child;

  ContentCard({this.child});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          width: 400,
          margin: EdgeInsets.all(50),
          child: Material(
            child: child,
            elevation: 6,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(30),
            ),

            ),
        ),
      ],
    );
//      margin: EdgeInsets.all(15),
//      decoration: BoxDecoration(
//        borderRadius: BorderRadius.circular(10),
//        color: kCardColor,
//      ),
//    );
  }
}
