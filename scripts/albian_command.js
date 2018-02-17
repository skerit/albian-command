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

	// All the settings
	this.settings = {};

	// Update count
	this.update_count = 0;

	// Default values
	this.speed = 1;

	// Models
	this.Setting = this.getModel('Setting');
	this.Name = this.getModel('Name');

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

	if (!this.available_settings) {
		this.available_settings = {};
	}

	this.available_settings[name] = options;
});

/**
 * The name of the current world
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
ACom.setProperty('creatures_headers', ['picture', 'name', 'age', 'lifestage', 'health', 'status', 'n', 'drive', 'moniker']);

/**
 * The starting letters:
 * Generate array with letters A-Z
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
ACom.setProperty('letters', Array.range(65, 91).map(function(v) {return String.fromCharCode(v)}));

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
	    pick_up,
	    teleport,
	    language;

	// Indicate this is the actions row
	row.classList.add('actions-row');

	column.setAttribute('colspan', this.creatures_headers.length);
	row.appendChild(column);

	pick_up = this.createActionElement('Pickup', 'syst.s16', 7);
	pick_up.dataset.click_image_index = 6;

	column.appendChild(pick_up);

	teleport = this.createActionElement('Teleport', 'tele.s16');
	column.appendChild(teleport);

	language = this.createActionElement('Teach Language', 'acmp.s16');
	column.appendChild(language);

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

	var send_value = value * 2,
	    was_set = this._speed != null;

	// Remember the speed
	this._speed = value;

	// Set it in the span
	this.$speed_val.text(value + 'x');

	// And change the game speed (but not on the initial value)
	if (was_set) {
		this.setAcceleration(send_value);
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

		var $jsvalues,
		    target_id = this.getAttribute('href'),
		    target    = document.querySelector(target_id),
		    cbname;

		e.preventDefault();

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

		$jsvalues = $('[js-value]', target);

		if ($jsvalues.length) {
			that.applyJsValues($jsvalues, target);
		}
	});

	setInterval(function doUpdate() {
		that.update();
	}, 15000);
});

/**
 * Initialize the asynchronous side of the app
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
ACom.setCacheMethod(function doAsyncInit() {

	var that = this;

	this.all_names = {};
	this.lower_names = [];

	Function.series(function getSettings(next) {
		// Preload all the settings
		that.Setting.find({}, function gotSettings(err, docs) {

			var doc;

			if (err) {
				return next(err);
			}

			docs.forEach(function eachSetting(doc) {
				that.settings[doc.name] = doc;
			});

			next();
		});
	}, function loadNames(next) {

		var generation,
		    name,
		    temp,
		    i,
		    j;

		that.letters.forEach(function eachLetter(letter) {
			that.all_names[letter] = [];
		});

		that.Name.find({}, function gotAllNames(err, docs) {

			if (err) {
				return next(err);
			}

			docs.forEach(function eachDoc(doc) {

				if (!doc.letter) {
					return;
				}

				that.all_names[doc.letter].push(doc);
				that.lower_names.push(doc.name.toLowerCase());
			});

			next();
		});
	}, function addInitialNames(next) {

		// Import names on first load
		if (!that.getSetting('imported_names')) {
			that.setSetting('imported_names', true);

			for (i = 0; i < that.capp.names.male.length; i++) {
				generation = that.capp.names.male[i];

				for (j = 0; j < generation.length; j++) {
					name = generation[j];
					temp = that.addName(name);

					if (temp) {
						temp.male = true;
						temp.save();
					}
				}
			}

			for (i = 0; i < that.capp.names.female.length; i++) {
				generation = that.capp.names.female[i];

				for (j = 0; j < generation.length; j++) {
					name = generation[j];
					temp = that.addName(name);

					if (temp) {
						temp.female = true;
						temp.save();
					}
				}
			}
		}

		next();

	}, function done(err) {

		if (err) {
			throw err;
		}

		that.emit('ready');
	});
});

/**
 * Set the speed of the game
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
ACom.setMethod(function setAcceleration(value, callback) {
	this.capp.setSpeed(value, callback);
});

/**
 * Do an update
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
ACom.setMethod(function update(callback) {

	var that = this;

	if (!callback) {
		callback = Function.thrower;
	}

	this.emit('updating', function doUpdate() {

		that.getCreatures();

		that.emit('updated');
	});
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
			filename : libpath.join(require('nw.gui').App.dataPath, name + '.json'),
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
	wrapper_el.setAttribute('data-action', title);

	if (index == null) {
		index = 0;
	}

	s16_el.s16 = s16_name;
	s16_el.image_index = index;
	title_el.textContent = title;

	method_name = 'do' + title.camelize() + 'Action';

	wrapper_el.addEventListener('mousedown', function onDown(e) {

		wrapper_el.classList.add('mousedown');

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

					wrapper_el.creature = creature;
					that[method_name](wrapper_el, creature);
				});
			} else {
				wrapper_el.creature = null;
				that[method_name](wrapper_el);
			}
		}
	});

	wrapper_el.addEventListener('mouseup', function onUp(e) {

		wrapper_el.classList.remove('mousedown');

		// Reset the index
		s16_el.image_index = index;
	});

	return wrapper_el;
});

/**
 * Apply js vlaues
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
ACom.setMethod(function applyJsValues($elements, target) {

	var that = this;

	$elements.each(function eachElement() {

		var $this = $(this),
		    value,
		    cmd = $this.attr('js-value');

		value = Object.path(that, cmd);

		if (value == null) {
			value = Object.path(window, cmd);
		}

		if (value == null) {
			value = '';
		}

		$this.text(value);
	});
});

/**
 * Teach the creature all the language & remember its name
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
ACom.setMethod(function doTeachLanguageAction(action_element, creature) {

	if (!creature) {
		throw new Error('Creature has not been defined, can not teach language');
	}

	// Teach the language
	this.teachLanguage(creature);
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
 * Teleport the given creature:
 * show a contextmenu first
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
ACom.setMethod(function doTeleportAction(action_element, creature) {

	var that = this,
	    $this = $(action_element);

	this.getFavouriteLocations(function gotLocations(err, locations) {

		var offset,
		    result,
		    items,
		    conf,
		    key;

		if (err) {
			return alert('Error: ' + err);
		}

		result = {};
		items = {};

		for (key in locations) {
			items[key] = {
				name : key
			};
		};

		result.callback = function onClick(key, options) {
			var loc = locations[key];

			creature.move(loc.x, loc.y, function done(err) {
				if (err) {
					console.error('Error moving creature:', err);
				}
			})
		};

		result.items = items;
		offset = $this.offset();

		action_element.teleport_menu = result;

		$this.contextMenu({
			x: offset.left,
			y: offset.top
		});
	});
});

/**
 * Get favourite locations in the current world
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
ACom.setMethod(function getFavouriteLocations(callback) {

	var that = this;

	this.capp.getWorld(function gotWorld(err, world) {

		if (err) {
			return callback(err);
		}

		callback(null, world.locations);
	});
});

/**
 * Get a model
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
ACom.setMethod(function getModel(name) {

	var model_name = name.singularize().camelize() + 'Model';

	if (Blast.Classes.Develry.Creatures[model_name]) {
		return new Blast.Classes.Develry.Creatures[model_name](this);
	}

	return new Blast.Classes.Develry.Creatures.Model(this, name);
});

/**
 * Set a specific setting
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
ACom.setMethod(function setSetting(name, value) {

	var doc = this.getSettingDocument(name);

	doc.value = value;
	doc.save();
});

/**
 * Get a specific setting, can only be called after ready
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @return   {Record}
 */
ACom.setMethod(function getSettingDocument(name) {

	var doc = this.settings[name],
	    config,
	    data;

	if (!doc) {
		// Get the configuration
		config = ACom.available_settings[name] || {};

		// Create the new data
		data = {
			name  : name,
			value : config.default
		};

		this.settings[name] = doc = this.Setting.createRecord(data);
		doc.save();
	}

	return doc;
});

/**
 * Get a specific setting value
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @return   {Mixed}
 */
ACom.setMethod(function getSetting(name) {
	return this.getSettingDocument(name).value;
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

	Object.each(ACom.available_settings, function eachSetting(config, key) {

		var valwrap,
		    element,
		    name_td,
		    val_td,
		    value,
		    label,
		    row;

		// Don't show hidden configurations
		// (@TODO: add button to make these visible anyway)
		if (config.hidden) {
			return;
		}

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

			that.setSetting(key, value);
		});
	});
});

/**
 * Look for a name
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
ACom.setMethod(function getName(name) {

	var lower_name,
	    letter,
	    result,
	    key,
	    i;

	name = name.trim();
	lower_name = name.toLowerCase();

	if (this.lower_names.indexOf(lower_name) == -1) {
		return;
	}

	letter = name[0].toUpperCase();

	if (this.all_names[letter]) {
		result = this.all_names[letter].findByPath('data.name', name);

		if (result) {
			return result;
		}
	}

	for (i = 0; i < this.all_names[letter].length; i++) {
		key = this.all_names[letter][i].name;

		if (key.toLowerCase() == lower_name) {
			return this.all_names[letter][i];
		}
	}
});

/**
 * Add a new name
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
ACom.setMethod(function addName(name) {

	var existing_name,
	    new_doc,
	    letter;

	name = name.trim();

	existing_name = this.getName(name);

	if (existing_name) {
		return false;
	}

	letter = name[0].toUpperCase();

	new_doc = this.Name.createRecord({
		letter : letter,
		name   : name
	});

	this.all_names[letter].push(new_doc);
	this.lower_names.push(name.toLowerCase());

	new_doc.save();

	return new_doc;
});

/**
 * Remove a name
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
ACom.setMethod(function removeName(name) {

	var letter,
	    doc,
	    i;

	name = name.trim();
	letter = name[0].toUpperCase();

	if (!letter) {
		return;
	}

	// Get the name document
	doc = this.getName(name);

	if (!doc) {
		return false;
	}

	doc.remove();

	for (i = 0; i < this.all_names[letter].length; i++) {
		if (this.all_names[letter][i].name == name) {
			this.all_names[letter].splice(i, 1);
			return true;
		}
	}
});

/**
 * Update a name
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
ACom.setMethod(function updateName(name) {

	if (typeof name != 'object') {
		throw new Error('Unable to update name without document');
	}

	if (!name._id) {
		throw new Error('Unable to update name without id');
	}

	name.save();
});

/**
 * Load the names tab
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
ACom.setAfterMethod('ready', function loadNamesTab(names_element) {

	var that = this,
	    $this = $(names_element),
	    letters = this.letters;

	// Clear the names element
	$this.html('');

	letters.forEach(function eachLetter(letter) {
		var $table,
		    $tbody,
		    names = that.all_names[letter],
		    html;

		html = `<table class="name-letter-table" data-letter="${letter}">
			<thead class="name-letter-header">
				<tr>
					<td>${letter} (${names.length})</td>
					<td><span class="when-open">Gender</span></td>
					<td><span class="when-open">Use count</span></td>
					<td></td>
				</tr>
			</thead>
			<tbody></tbody>
			<tfoot>
				<tr>
					<td colspan=3>
						<input type="text" placeholder="Add new name ...">
					</td>
				</tr>
			</tfoot>
		`;

		html += '</table>';

		// Parse the html
		$table = $(html);
		$tbody = $('tbody', $table);
		recreateTbody();

		function recreateTbody() {

			// Clear the tbody
			$tbody.html('');

			names.sortByPath(-1, 'name');

			names.forEach(function eachName(doc) {
				var $female,
				    $male,
				    $row,
				    html;

				html = `
					<tr>
						<td>${doc.name}</td>
						<td>
							<s16-image
								s16="Omelette.s16"
								image-index="38"
								animation-duration="16"
								animation-increment="-1"
								class="gender female inactive"
								title="Female"
							></s16-image>

							<s16-image
								s16="Omelette.s16"
								image-index="54"
								animation-duration="16"
								class="gender male inactive"
								title="Male"
							></s16-image>
						</td>
						<td>
						${doc.use_count}
						</td>
						<td><a href="#" class="delete">Delete</a></td>
					</tr>
				`;

				$row = $(html);
				$female = $('.female', $row);
				$male = $('.male', $row);

				if (doc.get('female')) {
					$female.removeClass('inactive');
				}

				$female[0].paused = !doc.female;

				if (doc.male) {
					$male.removeClass('inactive');
				}

				$male[0].paused = !doc.male;

				$tbody.append($row);

				$female.on('click', function onClick(e) {
					// Enable or disable inactive class
					$female.toggleClass('inactive');
					doc.set('female', !$female.hasClass('inactive'));
					$female[0].paused = !doc.female;
					that.updateName(doc);
				});

				$male.on('click', function onClick(e) {
					// Enable or disable inactive class
					$male.toggleClass('inactive');
					doc.set('male', !$male.hasClass('inactive'));
					$male[0].paused = !doc.male;
					that.updateName(doc);
				});

				$('.delete', $row).on('click', function onClick(e) {

					if (!doc._id) {
						return;
					}

					$row.remove();
					that.removeName(doc.name);
				});
			});
		}

		// Add to the element
		$this.append($table);

		$('thead', $table).on('click', function onClick(e) {
			$('.name-letter-table').removeClass('active');
			$table.addClass('active');
		});

		$('input', $table).on('keyup', function onPress(e) {

			var result;

			if (e.keyCode == 13 && this.value) {
				result = that.addName(this.value);
				this.value = '';

				if (result) {
					if (result.get('letter') != letter) {
						loadNamesTab.call(that, names_element);
						$('table[data-letter="' + result.get('letter') + '"]').addClass('active');
					} else {
						recreateTbody();
					}
				}
			}
		});
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
	    $this = $(sprites_element),
	    $applet,
	    $general,
	    $creatures,
	    checkAppears,
	    fnamerx = /[a-z]\d\d[a-z]\./i;

	$this.html(`
		<div class="sprite-div general-sprites accordion">
			<div class="accordion-opener">
				General sprites
			</div>
			<div class="accordion-content">

			</div>
		</div>
		<div class="sprite-div applet-sprites accordion">
			<div class="accordion-opener">
				Applet sprites
			</div>
			<div class="accordion-content">

			</div>
		</div>
		<div class="sprite-div creature-sprites accordion">
			<div class="accordion-opener">
				Creature sprites
			</div>
			<div class="accordion-content">

			</div>
		</div>
	`);

	$applet = $('.applet-sprites .accordion-content', $this);
	$general = $('.general-sprites .accordion-content', $this);
	$creatures = $('.creature-sprites .accordion-content', $this);

	fs.readdir(sprites_path, gotFiles.bind(this, 'Images'));
	fs.readdir(libpath.resolve(this.capp.process_path, '..', 'Applet Data'), gotFiles.bind(this, 'Applet'));

	if (this.has_s16_listener) {
		return;
	}

	this.has_s16_listener = true;

	checkAppears = elementAppears('new-s16', {live: true}, function onS16C(element) {
		element.showImage(0);
	});

	function gotFiles(type, err, files) {

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

			if (type == 'Applet') {
				$applet.append(coll);
			} else if (fnamerx.test(file)) {
				$creatures.append(coll);
			} else {
				$general.append(coll);
			}

			coll.s16 = file;
		});

		checkAppears();
	}
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

	var that = this,
	    remember_names = false;

	if (!callback) {
		callback = Function.thrower;
	}

	// Increment the update count
	this.update_count++;

	// If the setting to make the creatures remember their name is on,
	// Re-set their name every 1.5 minutes
	if (this.getSetting('make_creatures_remember_their_name')) {
		if (this.update_count % 6 == 0) {
			remember_names = true;
		}
	}

	// Get the actual creatures
	capp.getCreatures(function gotCreatures(err, creatures) {

		var tasks = [];

		if (err) {
			return callback(err);
		}

		creatures.forEach(function eachCreature(creature) {

			tasks.push(function doCreature(next) {

				// Re-set the creature's name
				if (remember_names && creature.has_name) {
					creature.setName(creature.name);
				}

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
 * Teach the creature language
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
ACom.setMethod(function teachLanguage(creature, callback) {

	if (!callback) {
		callback = Function.thrower;
	}

	// First teach language
	creature.teachLanguage(function done(err) {

		if (err) {
			return callback(err);
		}

		// Then reset the name
		creature.setName(creature.name, function done(err) {
			callback(err);
		});
	});
});

/**
 * Name the given creature
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
ACom.setMethod(function nameCreature(creature, callback) {

	var that = this;

	if (!callback) {
		callback = Function.thrower;
	}

	if (creature.has_name) {
		return callback();
	}

	creature.getGeneration(function gotGeneration(err, generation) {

		var letter,
		    index,
		    names,
		    name,
		    i;

		if (err) {
			return callback(err);
		}

		// Get the letter index
		index = generation % 26;

		// Get the letter
		letter = String.fromCharCode(65 + index);

		// Get the names
		names = that.all_names[letter];

		// Iterate over all the names
		for (i = 0; i < names.length; i++) {
			name = names[i];

			if (!name.use_count && name[creature.gender]) {
				break;
			} else {
				name = null;
			}
		}

		if (name) {
			if (!name.monikers) {
				name.monikers = [];
			}

			name.monikers.push(creature.moniker);

			creature.setName(name.name, function done(err) {

				if (err) {
					console.error('Error setting name:', name.name, 'on', creature);
				}

				callback();
			});
		}

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
	    updating,
	    $row,
	    els;

	els = creature.acom_elements;

	if (els) {
		return;
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
	});

	// Initial update
	updateCreature(callback);

	// Add the row to the screen
	this.$list.append(els.tbody);

	// When the creature is updated, update the info on screen
	creature.on('updated', updateCreature);

	// The update function
	function updateCreature(callback) {

		var name_doc;

		if (updating) {
			return;
		}

		updating = true;

		if (!callback) {
			callback = Function.thrower;
		}

		els.name.textContent = creature.name;
		els.moniker.textContent = creature.moniker;

		els.age.textContent = creature.formated_age;
		els.age.dataset.sortValue = creature.age;

		els.lifestage.textContent = creature.lifestage;
		els.lifestage.dataset.sortValue = creature.agen;

		els.health.textContent = ~~(creature.health / 2) + '%';
		els.health.dataset.sortValue = creature.health;

		if (creature.has_name) {
			name_doc = that.getName(creature.name);

			if (!name_doc) {
				name_doc = that.addName(creature.name);
				name_doc.male = creature.male;
				name_doc.female = creature.female;
			}

			if (!name_doc.monikers) {
				name_doc.monikers = [];
			}

			if (name_doc.monikers.indexOf(creature.moniker) == -1) {
				name_doc.monikers.push(creature.moniker);
				name_doc.save(function saved() {
					updating = false;
					callback();
				});
			} else {
				updating = false;
				callback();
			}
		} else {
			// Add a name!
			if (creature.is_in_world && that.getSetting('name_creatures')) {
				that.nameCreature(creature, function done() {
					updating = false;
					callback();
				});
			} else {
				updating = false;
				callback();
			}
		}
	}
});

ACom.addSetting('name_creatures', {
	title   : 'Automatically name new creatures',
	type    : 'boolean',
	default : true
});

ACom.addSetting('imported_names', {
	title   : 'Imported names from Creatures library',
	type    : 'boolean',
	default : false,
	hidden  : true
});

ACom.addSetting('make_creatures_remember_their_name', {
	title   : 'Make Creatures remember their name',
	type    : 'boolean',
	default : true
});