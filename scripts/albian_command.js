/**
 * The Albian Command class
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
var ACom = Function.inherits('Develry.Creatures.Base', function AlbianCommand() {

	// capp is defined in the init.js file, but we make an alias here
	this.capp = capp;

	// Link to the worldname element
	this.$world_name = $('#worldname');

	// Link to the creatures table
	this.$list       = $('.creatures-list');

	// Link to the sidebar anchors
	this.$sidelinks  = $('.sidebar a');

	// Link to all the tab pages
	this.$tabs       = $('.tabpage');

	// Link to the speedvalue span
	this.$speed_val  = $('.speed-value');

	// Link to the speed range slider
	this.$speed      = $('.speed');

	// Default values
	this.speed = 1;

	this.init();
});

/**
 * Add a possible setting
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
ACom.setStatic(function addSetting(name, options) {

	if (!this.settings) {
		this.settings = {};
	}

	this.settings[name] = options;
});

/**
 * The name of the current world
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
ACom.setProperty('creatures_headers', ['picture', 'name', 'age', 'lifestage', 'status', 'n', 'drive', 'moniker']);

/**
 * The name of the current world
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
ACom.prepareProperty(function creature_options_row() {

	var row = document.createElement('tr'),
	    column = document.createElement('td'),
	    pick_up;

	// Indicate this is the actions row
	row.classList.add('actions-row');

	column.setAttribute('colspan', this.creatures_headers.length);
	row.appendChild(column);

	pick_up = this.createActionElement('Pickup', 'syst.s16', 7);
	pick_up.dataset.click_image_index = 6;

	column.appendChild(pick_up);

	return row;
});

/**
 * The name of the current world
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
ACom.setProperty(function world_name() {
	return this._world_name;
}, function setWorldName(name) {
	this._world_name = name;
	this.$world_name.text(name);
});

/**
 * The speed of the current world
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
ACom.setProperty(function speed() {
	return this._speed / 2;
}, function setSpeed(value) {

	var send_value = value * 2;

	// Remember the speed
	this._speed = value;

	// Set it in the span
	this.$speed_val.text(value + 'x');

	// And change the game speed (but not on the initial value)
	if (this._speed != null) {
		this.capp.setSpeed(send_value);
	}
});

/**
 * Get a database
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
ACom.setMethod(function getDatabase(name) {

	if (!this.dbs) {
		this.dbs = {};
	}

	if (!this.dbs[name]) {

		this.dbs[name] = new NeDB({
			filename : libpath.join(require('nw.gui').App.dataPath, name + '.db'),
			autoload : true
		});
	}

	return this.dbs[name];
});

/**
 * Get a creature
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
ACom.setMethod(function getCreature(id_or_moniker, callback) {
	return this.capp.getCreature(id_or_moniker, callback);
});

/**
 * Create an action element
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
ACom.setMethod(function createActionElement(title, s16_name, index) {

	var that = this,
	    wrapper_el = document.createElement('div'),
	    title_el = document.createElement('span'),
	    s16_el = document.createElement('s16-image'),
	    method_name;

	wrapper_el.appendChild(s16_el);
	wrapper_el.appendChild(title_el);
	wrapper_el.classList.add('action');

	if (index == null) {
		index = 0;
	}

	s16_el.s16 = s16_name;
	s16_el.image_index = index;
	title_el.textContent = title;

	method_name = 'do' + title.camelize() + 'Action';

	wrapper_el.addEventListener('mousedown', function onDown(e) {
		if (wrapper_el.dataset.click_image_index) {
			s16_el.image_index = wrapper_el.dataset.click_image_index;
		}
	});

	wrapper_el.addEventListener('click', function onClick(e) {
		if (typeof that[method_name] == 'function') {

			// Use `attr`, not `data`, because it gives back old data
			var moniker = $(wrapper_el).parents('[data-moniker]').first().attr('data-moniker');

			if (moniker) {
				that.getCreature(moniker, function gotCreature(err, creature) {

					if (err) {
						throw err;
					}

					that[method_name](wrapper_el, creature);
				});
			} else {
				that[method_name](wrapper_el);
			}
		}
	});

	wrapper_el.addEventListener('mouseup', function onUp(e) {
		// Reset the index
		s16_el.image_index = index;
	});

	return wrapper_el;
});

/**
 * Pickup the given creature
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
ACom.setMethod(function doPickupAction(action_element, creature) {

	if (!creature) {
		throw new Error('Creature has not been defined, can not pick up');
	}

	// Pick up the creature
	creature.pickup();

	// Activate the window
	this.capp.ole.sendJSON([
		{type: 'c2window'},
		{type: 'activatewindow'}
	]);
});

/**
 * Initialize the app
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
ACom.setMethod(function init() {

	var that = this;

	this.doAsyncInit();

	// Load the world name
	this.getWorldName();

	// Load in the creatures
	this.getCreatures();

	// Listen to speed range changes
	this.$speed.on('input', Function.throttle(function onChange(e) {
		var new_value = this.value / 10;
		that.speed = new_value;
	}, 400));

	this.$sidelinks.on('click', function onClick(e) {

		var target_id = this.getAttribute('href'),
		    target    = document.querySelector(target_id),
		    cbname;

		// Remove the active class from all sidebar links
		$sidelinks.removeClass('active');

		// Add active class to the clicked link
		$(this).addClass('active');

		// Hide all tabs
		$tabs.hide();

		// Show the target
		$(target).show();

		// Possible callback name
		cbname = 'load' + target.id.camelize() + 'Tab';

		if (typeof that[cbname] == 'function') {
			that[cbname](target);
		}

		e.preventDefault();
	});
});

/**
 * Initialize the asynchronous side of the app
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
ACom.setCacheMethod(function doAsyncInit() {

	var that = this,
	    Setting = this.getDatabase('settings');

	Function.series(function getSettings(next) {
		Setting.find({key: 'settings'}, function gotSettings(err, docs) {

			var doc;

			if (err) {
				return next(err);
			}

			doc = docs[0];

			if (!doc) {
				doc = {
					key: 'settings'
				};

				return Setting.insert(doc, function saved(err, new_doc) {

					if (err) {
						return next(err);
					}

					that.settings_doc = new_doc;
					next();
				});
			}

			that.settings_doc = doc;
			next();
		});
	}, function done(err) {

		if (err) {
			throw err;
		}

		that.emit('ready');
	});
});

/**
 * Set a specific setting
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
ACom.setMethod(function setSetting(name, value) {
	this.settings_doc[name] = value;
	this.getDatabase('settings').update({key: 'settings'}, this.settings_doc);
});

/**
 * Get a specific setting, can only be called after ready
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
ACom.setMethod(function getSetting(name) {
	return this.settings_doc[name];
});

/**
 * Load the settings tab
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
ACom.setAfterMethod('ready', function loadSettingsTab(settings_element) {

	var that = this,
	    config,
	    tbody,
	    key;

	tbody = settings_element.querySelector('tbody');
	tbody.innerHTML = '';

	Object.each(ACom.settings, function eachSetting(config, key) {

		var valwrap,
		    element,
		    name_td,
		    val_td,
		    value,
		    label,
		    row;

		row = document.createElement('tr');
		name_td = document.createElement('td');
		val_td = document.createElement('td');
		label = document.createElement('label');
		label.setAttribute('for', key);
		valwrap = document.createElement('label');
		valwrap.classList.add('valwrap');

		row.appendChild(name_td);
		row.appendChild(val_td);
		tbody.appendChild(row);

		name_td.appendChild(label);
		label.textContent = config.title;

		// Get the current value
		value = that.getSetting(key);

		switch (config.type) {
			case 'boolean':
				element = document.createElement('input');
				element.setAttribute('type', 'checkbox');
				element.checked = value;
				break;

			default:
				element = document.createElement('input');
				element.value = value;
		}

		element.id = key;
		element.setAttribute('name', key);
		valwrap.appendChild(element);
		val_td.appendChild(valwrap);

		element.addEventListener('change', function onChange(e) {

			var value;

			if (config.type == 'boolean') {
				value = this.checked;
			} else {
				value = this.value;
			}

			console.log('Change!', value, 'saving', key);

			that.setSetting(key, value);
		});

		console.log('Load setting', key, config);
	});
});

/**
 * Load the sprites tab
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
ACom.setAfterMethod('ready', function loadSpritesTab(sprites_element) {

	var that = this,
	    sprites_path = libpath.resolve(this.capp.process_path, '..', 'Images'),
	    checkAppears;

	fs.readdir(sprites_path, function gotFiles(err, files) {

		if (err) {
			throw err;
		}

		files.forEach(function eachFile(file, index) {

			var lfile = file.toLowerCase(),
			    coll;

			if (!lfile.endsWith('.s16')) {
				return;
			}

			// Create a new s16-collection element
			coll = document.createElement('s16-collection');

			// Add the class indicating it's new
			coll.classList.add('new-s16');

			// Set the filename as title
			coll.setAttribute('title', file);

			sprites_element.appendChild(coll);

			coll.s16 = file;
		});

		checkAppears();
	});

	if (this.has_s16_listener) {
		return;
	}

	this.has_s16_listener = true;

	checkAppears = elementAppears('new-s16', {live: true}, function onS16C(element) {
		element.showImage(0);
	});
});

/**
 * Get the name of the current world
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
ACom.setAfterMethod('ready', function getWorldName(callback) {

	var that = this;

	if (!callback) {
		callback = Function.thrower;
	}

	return this.capp.getWorldName(function gotName(err, result) {

		if (err) {
			return callback(err);
		}

		that.world_name = result;
		callback(null, result);
	});
});

/**
 * Get all the creatures in the current world
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
ACom.setAfterMethod('ready', function getCreatures(callback) {

	var that = this;

	if (!callback) {
		callback = Function.thrower;
	}

	capp.getCreatures(function gotCreatures(err, creatures) {

		var tasks = [];

		if (err) {
			return callback(err);
		}

		creatures.forEach(function eachCreature(creature) {
			tasks.push(function doCreature(next) {
				that._initCreature(creature, next);
			});
		});

		Function.parallel(tasks, function done(err) {

			if (err) {
				return callback(err);
			}

			callback(null, creatures);
		});
	});
});

/**
 * Add the given creature to the list
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
ACom.setMethod(function _initCreature(creature, callback) {

	var that = this,
	    $row,
	    els;

	els = creature.acom_elements;

	if (els) {
		return updateCreature();
	}

	creature.acom_elements = els = {};

	// Create the tbody element
	els.tbody = document.createElement('tbody');

	// Create the row element
	els.row = document.createElement('tr');
	els.$row = $row = $(els.row);

	// Add the row to the tbody
	els.tbody.appendChild(els.row);

	// Add the moniker
	els.row.dataset.moniker = creature.moniker;
	els.tbody.dataset.moniker = creature.moniker;

	this.creatures_headers.forEach(function eachName(name) {

		var td = document.createElement('td');

		// Add the name as a class
		td.classList.add('field-' + name);

		// Store the element under the given name
		els[name] = td;

		// And add it to the row
		els.row.appendChild(td);
	});

	els.canvas = createCreatureCanvas(creature);
	els.picture.appendChild(els.canvas);

	// Listen to clicks on the row
	$row.on('click', function onClick(e) {

		var corow = that.creature_options_row;

		// Set the moniker
		corow.dataset.moniker = creature.moniker;

		// Insert it after the current creature's row
		$row.after(corow);


		//creature_options_row
		console.log('Click', this);
	});

	// Initial update
	updateCreature();

	// Add the row to the screen
	this.$list.append(els.tbody);

	// When the creature is updated, update the info on screen
	creature.on('updated', updateCreature);

	// The update function
	function updateCreature() {
		els.name.textContent = creature.name;
		els.moniker.textContent = creature.moniker;
		els.age.textContent = creature.formated_age;
		els.lifestage.textContent = creature.lifestage;
	}
});

ACom.addSetting('name_creatures', {
	title: 'Automatically name new creatures',
	type : 'boolean'
})