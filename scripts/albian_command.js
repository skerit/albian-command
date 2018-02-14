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
	    column = document.createElement('td');

	column.setAttribute('colspan', this.creatures_headers.length);
	row.appendChild(column);

	column.textContent = 'test';

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
	return this._speed;
}, function setSpeed(value) {

	// Remember the speed
	this._speed = value;

	// Set it in the span
	this.$speed_val.text(value + 'x');

	// And change the game speed (but not on the initial value)
	if (this._speed != null) {
		this.capp.setSpeed(value);
	}
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

	// Load the world name
	this.getWorldName();

	// Load in the creatures
	this.getCreatures();

	// Listen to speed range changes
	this.$speed.on('input', Function.throttle(function onChange(e) {
		that.speed = this.value / 10;
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
 * Load the sprites tab
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
ACom.setMethod(function loadSpritesTab(sprites_element) {

	var that = this,
	    sprites_path = libpath.resolve(this.capp.process_path, '..', 'Images'),
	    checkAppears;

	fs.readdir(sprites_path, function gotFiles(err, files) {

		if (err) {
			throw err;
		}

		console.log('Got files:', files);

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
		console.log('APPEARS')
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
ACom.setMethod(function getWorldName(callback) {

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
ACom.setMethod(function getCreatures(callback) {

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