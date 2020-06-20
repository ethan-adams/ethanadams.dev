import 'package:url_launcher/url_launcher.dart';

class WebHandler {
  String url;
  WebHandler({this.url});

  launchURL() async {
    if (await canLaunch(url)) {
      await launch(url);
    } else {
      throw 'Could not launch $url';
    }
  }
}