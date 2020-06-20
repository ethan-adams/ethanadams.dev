import 'package:flutter/material.dart';
import 'package:ethanadamsdev_flutter/utilities/constants.dart';

//CURRENTLY UNUSED
class Projects extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      height: 600,
      child: Material(
        elevation: 6,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: EdgeInsets.all(30),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.start,
                crossAxisAlignment: CrossAxisAlignment.baseline,
                textBaseline: TextBaseline.alphabetic,
                children: [
                  Container(
                    margin: EdgeInsets.symmetric(horizontal: 30, vertical: 10),
                    child: Text(
                      'ABOUT ME',
                      textAlign: TextAlign.left,
                      style: kHeadline,
                    ),
                  ),
                  Container(
                    width: 400,
                    height: 400,
                    child: Text(
                      'Software Engineer with 3 years experience leading cross-functional teams. Skilled in full-stack development across mobile and web platforms. Experienced in AI development for both business needs and experimental research. Focused on expanding my knowledge through the development and deployment of meaningful projects. ',
                    ),
                  ),
                  Row(
                    children: [
                      MaterialButton(
                        child: Text('Contact me'),
                        color: Colors.orange,
                        onPressed: () {
                          print('contact!');
                        },
                        elevation: 6,
                      ),
                      SizedBox(width: 20),
                      MaterialButton(
                        child: Text('See my resume'),
                        color: Colors.orange,
                        onPressed: () {
                          print('resume!');
                        },
                        elevation: 6,
                      ),
                    ],
                  ),
                ],
              ),
            ),
            Container(
              width: 400,
              child: Material(
                elevation: 6,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(30)),
                child: Image.asset('images/gencyber.JPG'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
