import 'package:flutter/material.dart';
import 'package:audioplayers/audio_cache.dart';

void main() => runApp(EthanWeb());

class EthanWeb extends StatelessWidget {

  void playSound(int inSoundNum) {
    final player = AudioCache();
    player.play('note$inSoundNum.wav');
  }

  Widget buildKey({Color inColor, int soundNum}) {
    return Expanded(
      child: FlatButton(
        color: inColor,
        onPressed: () {
          playSound(soundNum);
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        appBar: AppBar(
          title: Text("Ethan Adams (WIP)"),
          backgroundColor: Colors.black,
        ),
        backgroundColor: Colors.black,
        body: SafeArea(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: <Widget>[
              buildKey(inColor: Colors.red, soundNum: 1),
              buildKey(inColor: Colors.orange, soundNum: 2),
              buildKey(inColor: Colors.yellow, soundNum: 3),
              buildKey(inColor: Colors.green, soundNum: 4),
              buildKey(inColor: Colors.teal, soundNum: 5),
              buildKey(inColor: Colors.blue, soundNum: 6),
              buildKey(inColor: Colors.purple, soundNum: 7),

            ],
          ),
        ),
      ),
    );
  }
}


