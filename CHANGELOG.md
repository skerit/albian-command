## 0.1.6 (2018-04-22)

* Remove "chrome-extension:/" bit from error logs
* Add `reuse_names` setting, which will reuse names once they all have been used once
* Turn game speed scrollbar into an numeric input
* Autoscroll the log output
* Get previously set speed of the creatures application

## 0.1.5 (2018-03-26)

* Don't pause eggs when there are 0 creatures
* Upgrade `creatures` to v0.2.5
* Don't use `alert` for uncaught errors, just log them
* Add log type to log window

## 0.1.4 (2018-03-26)

* Add autosave feature for `blueberry4$` users
* Add `unpause_eggs` feature
* Turn "Toggle Powerups" into "Enable Powerups"
* Add `keep_powerups_enabled` settings, because they revert back to their original state after a manual save
* Add action to line up all eggs by the incubator
* Add action & setting for backing up creatures
* Upgrade `creatures` to v0.2.4

## 0.1.3 (2018-03-17)

* Add ability to send warps to off-line users
* Add a log tab
* Enable setting a preferred port

## 0.1.2 (2018-03-15)

* When opening a new world the current world name will be updated
* Creatures that are no longer in the world will now be removed from the list correctly
* If no peers are on-line you won't get an error when trying to warp a creature
* Many fixes (See `creatures` library v0.2.2)
* Show better errors when exporting/importing
* Add setting to connect over a preferred port
* Fix not being able to register a username once connected
* Fix error where the program would block when a creature's name starts with a non alphabetical character
* Add (very basic) CAOS tool
* Add ability to toggle the powerups to the settings page
* Clicking on the same creature/egg row will hide the actions row
* Added Creature select action
* Fix certain s16 sprites being too big on first show (object-fit bug)
* Add action to infect creature with random bacteria
* Add action to force ageing of creature

## 0.1.1 (2018-03-12)

* Add "Export all" and "Import all" general creatures actions
* Add `import_duplicate_moniker_creature` setting, which defaults to false
* Added `Egg` tab, including hatch, pause & resume actions
* Add pregnancy actions
* Add drive & general status of a creature
* Added P2P warp implementation

## 0.1.0 (2018-02-17)

* Initial release
