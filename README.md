# Sound Control

This is Sound Control, a
[WebExtension](https://developer.mozilla.org/en-US/Add-ons/WebExtensions)
to manage browser tabs that play audio.

Features:
* View all tabs that are currently playing sound
* Jump to any of those tabs
* Mute / unmute any tab

## Installation

TBA

## Development

Set yourself up with [NodeJS](http://nodejs.org/)
and [yarn](https://yarnpkg.com/). Install all the things:

    yarn install

Start the source builder in your terminal:

    npm run build

## Development in Firefox

Make sure you have
[Firefox Nightly](https://www.mozilla.org/en-US/firefox/channel/desktop/)
installed, open a new terminal window, and type this to
launch the extension:

    npm start

Nightly isn't required but `npm start` currently defaults to using it.

## Development in Chrome

* Open Chrome
* Go to Window > Extensions
* Tick the box for Developer mode
* Click 'Load unpacked extension...'
* Select the `sound-control/extension` folder

Anytime you edit the source code it will automatically reload in Firefox.
You may have to press command-R to reload it in Chrome depending on what you
changed.

## Icons

The icon for this extension is provided by [icons8](https://icons8.com/).
