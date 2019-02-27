# artThings - The Internet of Art Things

The Internet of Art Things, or simply artThings (http://interactdigitalarts.uk/artthings), is an infrastructure for creating connected digital artworks. It allows artworks that use micro-controllers, computers and web bwowsers to exchange data to respond to sensors. artThings makes use of MQTT, a lightweight and flexible messaging system that works on many different types of device and network.

## Beginnings

The project began as a set of technologies used by artist Sean Clark (http://www.seanclark.me.uk) to enable his digital artworks to communicate with each other. When looking for a communication technology that could work across multiple platform he became aware of MQTT (https://mqtt.org). MQTT (Message Queuing Telemetry Transport) is an ISO standard (ISO/IEC PRF 20922) publish-subscribe-based messaging protocol. It works on top of the TCP/IP protocol. It is designed for connections with remote locations where a "small code footprint" is required or the network bandwidth is limited. The publish-subscribe messaging pattern requires a message broker (https://en.wikipedia.org/wiki/MQTT).

## Goals

The goal of the artThings project is to take the groundwork done by Sean Clark and produce an open infrastructure, based around MQTT, that can be used by other artists to enable their digital artworks to communicate and share information. We want artThings to be simple to use, work across multiple platforms and facilitate the creation of new and exciting forms of digital art.

A secondary goal is to set up a secure Mosquitto MQTT broker for use by artists and artworks using artThings. Such a server will allow artists to make use of artThings without having to set-up their own messaging server. Agreeing a standard approach to WiFi network sharing by artworks may also form part of this work.

## Roadmap

In order to achieve our goals we need to:

- Describe and share the current artThings technology under an open licence.
- Find artists and technologist who are interested in the project and want to sign up to help it develop futher.
- Define standards for message topics and payloads and agree a mechanism for extending these further.
- Develop code examples and boiler-plate code to help artists make use of the technology in their own work.
- Set-up/fund a shared MQTT broker (using Mosqitto) for use by artists using artThings.

## Your Next Step

Join the artThings community.
