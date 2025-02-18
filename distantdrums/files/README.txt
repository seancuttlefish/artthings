Distant Dums
============

- The main Raspberry Pi is called "iot.local" aka Bass Pi. This plays the bass video and synchronises other videos and lighting. This video hosts the MQTT server for messaging.
- The other Pi is called "treble.local" aka Treble Pi.
- The Bass Pi opens "http://iot.local/bass.html" in Chromium in kiosk mode.
- The Treble Pi opens "http://treble.local/treble.html" in Chromium in kiosk mode. 
- To the play the videos, the web browsers needed "iot.local" adding to in Settings>Site Settings>Content>Sound. This enables audio playing of sound.

Control Panel

- The control panel can be opened using a mobile phone or computer connected to the "distantdrums" WiFi network (password 76645558) and entering the address "http://iot.local".
- Press "hello" to get all components to identify themselves.
- Press "play" to start the playback. The system will only play if the Bass Pi, Treble Pi and Scroller are online.
- Press "stop" to stop the playback.

Updating Files

- Connect to "smb://iot.local" file server as a guest to update the "bass.mp4" and "cues.json" files.
- Connect to "smb://treble.local" file server to update the "treble.mp4" file.
- Restart the Bass Pi and Treble Pi.

Start Up Sequence

- Switch on the Monitors, WiFi router, Scroller.
- Wait 10 seconds for router to start.
- Switch on the Bass Pi.
- Wait 10 seconds for Pi to start.
- Switch on the Treble Pi.
- Wait 20 seconds for Pi to start.
- Connect to the network on your mobile phone and to to the control panel.
= Press "hello" to see if "bass", "treble" and scroller are ready.
- When they are press "play".

Switch of Sequence

- Everything can go off at the same time.

Technology

- TP Link WiFi Router (distantdrums)
- Bass Pi 4B: Apache 2, Mosquitto MQTT (with websockets enabled), Samba, nodejs.
- Treble Pi 3A+: Apache 2, Samba.
- Scroller: WeMOS D1, 32x8 neopixel panels.
