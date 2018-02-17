# Albian Command

An application to monitor your Creatures 2 norns

![Screenshot of Creatures tab](https://raw.githubusercontent.com/skerit/albian_command/master/images/screenshot_001.png "Creatures tab")

## Warning

This is an early version of the application, please make backups of your worlds & norns before using it.

## Features

* Automatically name new creatures
* Make creatures remember their name
* Monitor creatures in the Creatures tab
* Pickup a creature
* Teleport a creature to a favourite location
* Teach the entire language to a creature (but have it remember its own name)
* S16 sprite browser
* Name manager
* Game speed changer

## Project history

I started this application back in 2016, after only a few days of initial development it was largely forgotten about until februari of 2018.

It took an entire week of development to reach a usable state, version 0.1.0 was released on the 17th of februari 2018.

I chose to use NW.JS v0.14.7 because it was the only version that still supported Windows XP. I mainly play Creatures 2 in a Windows XP VM, it's also the lowest supported version of the GOG release.

**Albian Command** is actually split into 2 parts: this NW.JS frontend and the [creatures](https://github.com/skerit/creatures) library written in JavaScript & VB6.

Yes, you read that correct: the creatures library uses a VB6 executable to interface with the Creatures 2 application. The source code is also fully available in that repository.

## Project future

I hope to add many more features, like:

* Egg & pregnancy management
* Automatic exporting & importing of creatures
* Some sort of crash management (because we all know C2 likes to crash)
* A possible C2 "warp" implementation

## Author

You can follow me on twitter: [![Twitter](http://i.imgur.com/wWzX9uB.png)@skeriten](https://www.twitter.com/skeriten)

## License

GPL-3.0