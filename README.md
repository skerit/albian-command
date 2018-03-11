# Albian Command

An application to monitor your Creatures 2 norns

![Screenshot of Creatures tab](https://raw.githubusercontent.com/skerit/albian_command/master/images/screenshot_002.png "Creatures tab")

## Warning

This is an early version of the application, please make backups of your worlds & norns before using it.

## Features

* Automatically name new creatures
* Make creatures remember their name
* Pickup a creature
* Teleport a creature to a favourite location
* Teach the entire language to a creature (but have it remember its own name)
* S16 sprite browser
* Name manager
* Game speed changer
* Decentralized P2P warp implementation

<table>
  <tr>
    <td>
      You can observe your creatures in the <b>Creatures</b> tab. Actions include:
      <br><br>
      <ul>
        <li><b>Pickup</b> the creature with the hand
        <li><b>Teleport</b> the creature to a favourite location
        <li><b>Teach Language</b> will make the creature know the entire vocabulary + remember its correct name
        <li><b>Export</b> will export the creature to a predefined directory, making it show up in the <b>Stored</b> tab. It can also be <b>warped</b> from that tab
        <li><b>Inseminate</b> can be used to make a female creature pregnant
        <li><b>Pregnancy</b> options are available for pregnant creatures
      </ul>
      There is also the <b>Game speed</b> slider on the bottom left: it can be used to change the speed of the game.
    </td>
    <td>
      <img src="https://raw.githubusercontent.com/skerit/albian-command/master/images/screenshot_002.png">
      <br>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    </td>
  </tr>
  
  <tr>
    <td>
      <b>Stored</b> creatures (the ones you <i>Export</i> in the Creatures tab) can be sent to other <b>on-line</b> users.
      Just click the creature, click the <b>Warp to ...</b> button and select the recipient.
    </td>
    <td>
      <img src="https://raw.githubusercontent.com/skerit/albian-command/master/images/screenshot_003.png"  >
    </td>
  </tr>
  
  <tr>
    <td>
      Creatures <b>Warped</b> to you will end up on this tab.
      Click on the creature to see the optional message the sender added, and to <i>Import</i> it into your world.
    </td>
    <td>
      <img src="https://raw.githubusercontent.com/skerit/albian-command/master/images/screenshot_004.png"  >
    </td>
  </tr>
  
  <tr>
    <td>
      Certain settings can be changed in the settings tab.
    </td>
    <td>
      <img src="https://raw.githubusercontent.com/skerit/albian-command/master/images/screenshot_005.png"  >
    </td>
  </tr>
  
  <tr>
    <td>
      <i>Albian Command</i> comes with a bunch of names preloaded, but you can delete these or add your own.
    </td>
    <td>
      <img src="https://raw.githubusercontent.com/skerit/albian-command/master/images/screenshot_006.png"  >
    </td>
  </tr>
  
  <tr>
    <td>
      If you want to use the warp, you'll have to register a username on the <b>Network</b> tab. Once a username has been chosen, click on the <b>Register on the network</b> button to claim it. Then you will receive a long password/passphrase. This can never be changed, so keep it somewhere safe. If you lose it, you'll lose access to your chosen username.
    </td>
    <td>
      <img src="https://raw.githubusercontent.com/skerit/albian-command/master/images/screenshot_007.png" width=800 >
    </td>
  </tr>
</table>

## Project history

I started this application back in 2016, after only a few days of initial development it was largely forgotten about until februari of 2018.

It took an entire week of development to reach a usable state, version 0.1.0 was released on the 17th of februari 2018.

I chose to use NW.JS v0.14.7 because it was the only version that still supported Windows XP. I mainly play Creatures 2 in a Windows XP VM, it's also the lowest supported version of the GOG release.

**Albian Command** is actually split into 2 parts: this NW.JS frontend and the [creatures](https://github.com/skerit/creatures) library written in JavaScript & VB6.

Yes, you read that correct: the creatures library uses a VB6 executable to interface with the Creatures 2 application. The source code is also fully available in that repository.

## Project future

I hope to add many more features, like:

* Automatically unpausing eggs
* Automatic exporting & importing of creatures
* Warping to off-line users
* Contact lists
* Some sort of crash management (because we all know C2 likes to crash)

## Author

You can follow me on twitter: [![Twitter](http://i.imgur.com/wWzX9uB.png)@skeriten](https://www.twitter.com/skeriten)

## License

GPL-3.0