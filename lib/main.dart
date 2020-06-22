import 'package:ethanadamsdev_flutter/views/bio.dart';
import 'package:ethanadamsdev_flutter/views/projects.dart';
import 'package:flutter/material.dart';
import 'package:ethanadamsdev_flutter/utilities/constants.dart';

void main() => runApp(EthanWeb());

class EthanWeb extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      theme: ThemeData(
        brightness: Brightness.light,
        primaryColor: Colors.red.shade900,
        accentColor: Colors.orangeAccent,

        fontFamily: 'Source Sans Pro',
        textTheme: TextTheme(
          headline1: kHeadline,
          bodyText2: kBodyText,
        ),
      ),
      darkTheme: ThemeData(
        brightness: Brightness.dark,
        primaryColor: Colors.blue,
        accentColor: Colors.orangeAccent,

        fontFamily: 'Source Sans Pro',
        textTheme: TextTheme(
          headline1: kHeadline,
          bodyText2: kBodyText,
        ),
      ),
      home: Scaffold(
        appBar: AppBar(
          title: Text(
            'Ethan Adams',
            style: TextStyle(
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        body: Center(
          child: FractionallySizedBox(
            widthFactor: 1.0,
            heightFactor: 1.0,
            child: ListView(
              padding: EdgeInsets.all(20),
              children: [
                Bio(),
                SizedBox(height: 20),
                //Projects(),
              ],
            ),
          ),
        ),
      ),
    );
  }
}