import 'package:flutter/material.dart';

class Bio extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Card(
          margin: EdgeInsets.all(30),
          child: Container(
            height: 400,
            width: 400,
            margin: EdgeInsets.all(15),
            child: Text(
              'Software Engineer with 3 years experience leading cross-functional teams. Skilled in full-stack development across mobile and web platforms. Experienced in AI development for both business needs and experimental research. Focused on expanding my knowledge through the development and deployment of meaningful projects. ',
              style: TextStyle(
                fontSize: 18,
                fontFamily: 'Source Sans Pro',
              ),
            ),
          ),
        ),
      ],
    );
  }
}
