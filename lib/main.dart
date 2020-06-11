import 'package:ethanadamsdev_flutter/bio.dart';
import 'package:flutter/material.dart';

void main() => runApp(EthanWeb());

class EthanWeb extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      theme: ThemeData.dark(),
      home: Scaffold(
        body: Column(
          children: [
            // TODO: Refactor this mess of a UI
            Row(
              children: <Widget>[
                Stack(
                  children: <Widget>[
                    Container(
                      margin: EdgeInsets.all(10),
                      width: 110,
                      height: 110,
                      decoration: BoxDecoration(
                        color: Colors.black,
                        shape: BoxShape.circle,
                      ),
                    ),
                    Container(
                      margin: EdgeInsets.all(15),
                      child: CircleAvatar(
                        radius: 50,
                        backgroundImage: AssetImage('images/vectorProf.png'),
                      ),
                    ),
                  ],
                ),
                Column(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Ethan Adams (WIP)',
                      style: TextStyle(
                        fontFamily: 'Source Sans Pro',
                        fontSize: 30,
                      ),
                    ),
                    Text(
                      'SOFTWARE ENGINEER',
                      style: TextStyle(
                        fontFamily: 'Source Sans Pro',
                        fontSize: 20,
                        color: Colors.grey,
                      ),
                    ),
                  ],
                ),
              ],
            ),
            // Main Container starts here
            Expanded(
              child: Container(
                margin: EdgeInsets.all(15),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(10),
                  color: Colors.grey.shade900,
                ),
                child: Bio(),
              ),
            )
          ],
        ),
      ),
    );
  }
}
