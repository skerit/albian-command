var nwgui = require('nw.gui');

/**
 * The Albian Command class
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.4
 */
var ACom = Function.inherits('Develry.Creatures.Base', function AlbianCommand() {

	// capp is defined in the init.js file, but we make an alias here
	this.capp = capp;

	// Create an albian-babel network instance here
	this.babel = new AlbianBabel();

	// Link to the worldname element
	this.$world_name = $('#worldname');

	// Link to the creatures table
	this.$list       = $('.creatures-list');

	// Link to the eggs table
	this.$egg_list   = $('.eggs-list');

	// Link to the sidebar anchors
	this.$sidelinks  = $('.sidebar a');

	// Link to all the tab pages
	this.$tabs       = $('.tabpage');

	// Link to the speedvalue span
	this.$speed_val  = $('.speed-value');

	// Link to the speed range slider
	this.$speed      = $('.speed');

	// The #warped anchor
	this.$warped     = $('a[href="#warped"]');

	// The log textarea
	this.log_el = document.getElementById('log-output');

	// The time it was last saved
	this.last_saved = Date.now();

	// Logs of last type
	this.log_history = {};
	this.log_lines = [];

	// All the settings
	this.settings = {};

	// Update count
	this.update_count = 0;

	// Default values
	this.speed = 1;

	// Various paths
	this.paths = {
		exports       : this.resolvePath('export'),
		local_exports : this.resolvePath(['export', 'local']),
		warp_exports  : this.resolvePath(['export', 'warp'])
	};

	// All the local export files
	this.local_exports = {};

	// Models
	this.Setting = this.getModel('Setting');
	this.Name = this.getModel('Name');
	this.Creature = this.getModel('Creature');
	this.StoredCreature = this.getModel('StoredCreature');
	this.WarpedCreature = this.getModel('WarpedCreature');

	this.all_names = {};
	this.lower_names = [];

	this.init();

	console.log('Created AlbianCommand instance:', this);
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
 * The table headers of the creatures list
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.1
 */
ACom.setProperty('creatures_headers', ['picture', 'name', 'age', 'lifestage', 'health', 'status', 'drive', 'moniker']);

/**
 * The table headers of the stored creatures list
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.1
 * @version  0.1.4
 */
ACom.setProperty('stored_creatures_headers', ['picture', 'name', 'stored', 'storage_type', 'world_name', 'age', 'lifestage', 'health', 'status', 'moniker']);

/**
 * The table headers of the warped creatures list
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.1
 * @version  0.1.1
 */
ACom.setProperty('warped_creatures_headers', ['picture', 'name', 'received', 'sender', 'age', 'lifestage', 'health', 'status', 'moniker']);

/**
 * The table headers of the eggs list
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.1
 * @version  0.1.4
 */
ACom.setProperty('eggs_headers', ['picture', 'moniker', 'mother', 'father', 'gender', 'stage', 'progress', 'status']);

/**
 * The table headers of the peers list
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.1
 * @version  0.1.1
 */
ACom.setProperty('peers_headers', ['username', 'ip', 'received']);

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
 * The user's password
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.1
 * @version  0.1.1
 */
ACom.setProperty(function babel_password() {
	return this.getSetting('albian_babel_network_password') || '';
}, function setBabelPassword(password) {
	return this.setSetting('albian_babel_network_password', password);
});

/**
 * The user's preferred port
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.2
 * @version  0.1.2
 */
ACom.setProperty(function babel_preferred_port() {
	return this.getSetting('albian_babel_network_preferred_port') || null;
}, function setPreferredPort(port) {
	return this.setSetting('albian_babel_network_preferred_port', port);
});

/**
 * The user's username
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.1
 * @version  0.1.1
 */
ACom.setProperty(function babel_username() {
	return this.getSetting('albian_babel_network_username') || '';
}, function setBabelUsername(username) {

	if (this.babel_username) {
		console.warn('There already is a username defined!');
	}

	return this.setSetting('albian_babel_network_username', username);
});

/**
 * The specific creatures actions row
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.2
 */
ACom.prepareProperty(function creature_options_row() {

	var row = document.createElement('tr'),
	    column = document.createElement('td'),
	    select,
	    infect,
	    pick_up,
	    teleport,
	    language,
	    force_age,
	    pregnancy,
	    inseminate,
	    export_creature;

	// Indicate this is the actions row
	row.classList.add('actions-row');

	column.setAttribute('colspan', this.creatures_headers.length);
	row.appendChild(column);

	pick_up = this.createActionElement('creature', 'pickup', 'Pickup', 'syst.s16', 7);
	pick_up.dataset.click_image_index = 6;

	column.appendChild(pick_up);

	teleport = this.createActionElement('creature', 'teleport', 'Teleport ...', 'tele.s16');
	column.appendChild(teleport);

	language = this.createActionElement('creature', 'teach_language', 'Teach Language', 'acmp.s16');
	column.appendChild(language);

	export_creature = this.createActionElement('creature', 'export', 'Export', 'boin.s16', 0);
	column.appendChild(export_creature);

	inseminate = this.createActionElement('creature', 'inseminate', 'Inseminate', 'eggs.s16', 5);
	column.appendChild(inseminate);

	pregnancy = this.createActionElement('creature', 'pregnancy', 'Pregnancy ...', 'eggs.s16', 7);
	column.appendChild(pregnancy);

	select = this.createActionElement('creature', 'select', 'Select', 'halo.s16', 0);
	column.appendChild(select);

	infect = this.createActionElement('creature', 'infect', 'Infect with random bacteria', 'nats.s16', 0);
	column.appendChild(infect);

	force_age = this.createActionElement('creature', 'force_age', 'Force ageing', 'a05h.s16', 8);
	column.appendChild(force_age);

	return row;
});

/**
 * The generic creatures actions row
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.4
 */
ACom.prepareProperty(function all_creature_actions_row() {

	var row = document.createElement('tr'),
	    column = document.createElement('td'),
	    import_all_from,
	    export_all_to,
	    export_all,
	    backup;

	// Indicate this is the actions row
	row.classList.add('actions-row');
	row.appendChild(column);

	export_all = this.createActionElement('creatures', 'export_all', 'Export all', 'boin.s16', 0);
	column.appendChild(export_all);

	export_all_to = this.createActionElement('creatures', 'export_all_to', 'Export all to...', 'boin.s16', 0);
	column.appendChild(export_all_to);

	import_all_from = this.createActionElement('creatures', 'import_all', 'Import all from...', 'pod_.s16', 1);
	column.appendChild(import_all_from);

	backup = this.createActionElement('creatures', 'backup_all', 'Backup all', 'wob_.s16', 2);
	column.appendChild(backup);

	return row;
});

/**
 * The exported creature actions row
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.1
 * @version  0.1.1
 */
ACom.prepareProperty(function exported_creature_options_row() {

	var row = document.createElement('tr'),
	    column = document.createElement('td'),
	    import_creature,
	    warp;

	// Indicate this is the actions row
	row.classList.add('actions-row');

	column.setAttribute('colspan', this.stored_creatures_headers.length);
	row.appendChild(column);

	import_creature = this.createActionElement('exported_creature', 'import', 'Import', 'pod_.s16', 1);
	column.appendChild(import_creature);

	warp = this.createActionElement('exported_creature', 'warp', 'Warp to ...', 'tele.s16', 0);
	column.appendChild(warp);

	return row;
});

/**
 * The warped creature actions row
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.1
 * @version  0.1.1
 */
ACom.prepareProperty(function warped_creature_options_row() {

	var row = document.createElement('tr'),
	    column = document.createElement('td'),
	    import_creature,
	    message;

	// Indicate this is the actions row
	row.classList.add('actions-row');

	column.setAttribute('colspan', this.warped_creatures_headers.length);
	row.appendChild(column);

	import_creature = this.createActionElement('warped_creature', 'import', 'Import', 'pod_.s16', 1);
	column.appendChild(import_creature);

	message = document.createElement('div');
	message.classList.add('warped-message');
	column.appendChild(message);

	return row;
});

/**
 * The specific eggs actions row
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.1
 * @version  0.1.1
 */
ACom.prepareProperty(function egg_options_row() {

	var row = document.createElement('tr'),
	    column = document.createElement('td'),
	    hatch,
	    pause,
	    resume;

	// Indicate this is the actions row
	row.classList.add('actions-row');

	column.setAttribute('colspan', this.eggs_headers.length);
	row.appendChild(column);

	hatch = this.createActionElement('egg', 'hatch', 'Hatch', 'eggs.s16', 7);
	column.appendChild(hatch);

	resume = this.createActionElement('egg', 'resume', 'Resume', 'eggs.s16', 6);
	column.appendChild(resume);

	pause = this.createActionElement('egg', 'pause', 'Pause', 'eggs.s16', 1);
	column.appendChild(pause);

	return row;
});

/**
 * The specific peer actions row
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
ACom.prepareProperty(function peer_options_row() {

	var row = document.createElement('tr'),
	    column = document.createElement('td');

	// Indicate this is the actions row
	row.classList.add('actions-row');

	column.setAttribute('colspan', this.peers_headers.length);
	row.appendChild(column);

	return row;
});

/**
 * The generic eggs actions row
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.1
 * @version  0.1.4
 */
ACom.prepareProperty(function all_eggs_actions_row() {

	var row = document.createElement('tr'),
	    column = document.createElement('td'),
	    finder;

	// Indicate this is the actions row
	row.classList.add('actions-row');
	row.appendChild(column);

	finder = this.createActionElement('all_eggs', 'find', 'Line up eggs by the incubator', 'tele.s16', 0);
	column.appendChild(finder);

	return row;
});

/**
 * The extra settings actions row
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.2
 * @version  0.1.2
 */
ACom.prepareProperty(function all_settings_actions_row() {

	var row = document.createElement('tr'),
	    column = document.createElement('td'),
	    states;

	// Indicate this is the actions row
	row.classList.add('actions-row');
	row.appendChild(column);

	states = this.createActionElement('setting', 'enable_powerups', 'Enable Powerups', 'powp.s16', 0);
	column.appendChild(states);

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
 * Output to the log
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.3
 * @version  0.1.6
 */
ACom.setMethod(function log(type, message) {

	var hist,
	    now = Date.now();

	if (arguments.length == 1) {
		message = type;
		type = 'default';
	}

	if (!this.log_history[type]) {
		this.log_history[type] = {
			value : null,
			count : 0
		};
	}

	hist = this.log_history[type];

	// Remove "chrome-extension" bit
	message = message.replace(/chrome-extension:\/\/.+?\//g, '/');

	if (hist.value == message) {
		hist.count++;

		if (hist.count > 20) {
			if (hist.count % 20 == 0) {
				message += ' (repeat nr ' + hist.count + ')';
			} else {
				return message;
			}
		} else if (hist.count > 3) {
			if (hist.count % 10 == 0) {
				message += ' (repeat nr ' + hist.count + ')';
			} else {
				return message;
			}
		}
	} else {
		hist.value = message;
		hist.count = 1;
	}

	// Don't print too many duplicate lines
	if (type == 'default' && this.log_lines.indexOf(message) > -1) {
		if ((now - this.last_default_line_time) > 5000) {
			// 5 seconds passed, allow it
		} else {
			return message;
		}
	}

	if (type == 'default') {
		this.last_default_line_time = now;
	}

	this.log_lines.push(message);

	if (this.log_lines.length > 15) {
		this.log_lines.shift();
	}

	if (this.log_el.value) {
		this.log_el.value += '\n';
	}

	message = '[' + Date.create().format('Y-m-d H:i:s') + '] [' + type.toUpperCase() + '] ' + message;

	this.log_el.value += message;

	return message;
});

/**
 * Initialize the app
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.4
 */
ACom.setMethod(function init() {

	var that = this,
	    log_informer;

	this.log('Initializing Albian Command');

	log_informer = new Informer();
	Creatures.log_informer = log_informer;
	log_informer.on('log', function onLog(type, class_name, args) {
		that.log('[' + type + '] in ' + class_name + ' ' + args.join(' ').trim());
	});

	this.doAsyncInit();

	// Load the world name
	this.getWorldName();

	// Listen for world name changes
	this.capp.on('world_name', function gotNewName(name) {
		that.log('Got world name "' + name + '"');
		that.world_name = name;
	});

	// Load in the creatures
	this.getCreatures();

	// Load in the eggs
	this.getEggs();

	// Listen to speed range changes
	this.$speed.on('input', Function.throttle(function onChange(e) {
		var new_value = this.value / 10;
		that.speed = new_value;
	}, 400));

	this.$sidelinks.on('click', function onClick(e) {

		var $this = $(this),
		    $jsvalues,
		    target_id = this.getAttribute('href'),
		    target    = document.querySelector(target_id),
		    cbname;

		e.preventDefault();

		// Remove the active class from all sidebar links
		that.$sidelinks.removeClass('active');

		// And all the children
		$('.links .children').removeClass('active');

		// Add active class to the clicked link
		$this.addClass('active');

		// Add active to the children wrapper, if any
		$this.parents('.children').addClass('active');

		// Hide all tabs
		$tabs.removeClass('active');

		// Show the target
		$(target).addClass('active');

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

	// Listen for loggedin
	this.on('loggedin', function onLoggedin(claimed) {

		var transaction;

		// If we logged in during a claim, the username will be set anyway
		if (claimed) {
			return;
		}

		if (that.babel_username) {
			return;
		}

		// See if there's a transaction where we registered for a username
		transaction = that.babel.peerpin.findClaimTransaction('username', that.babel.public_key);

		if (!transaction || !transaction.data.value) {
			return console.warn('Could not find username claim for this public key');
		}

		that.babel_username = transaction.data.value;
	});

	// Listen for errors
	this.capp.on('error_dialogbox', function gotDialogError(data, callback, last_error) {

		var message,
		    entry,
		    i;

		if (data) {
			for (i = 0; i < data.length; i++) {
				entry = data[i];

				if (entry.title) {
					message = entry.title;
				}
			}
		}

		that.log('An error dialogbox appeared in C2: ' + message);

		if (!that.getSetting('close_dialog_boxes')) {
			alert('A dialog box has appeared, please close it manually');
			callback();
			return;
		}

		// The setting is on, so tell it to close it!
		callback({type: 'close'});
	});

	// Listen for crashes
	this.capp.on('error_crashdialog', function gotCrashDialog(data, callback, last_error) {

		if (!that.getSetting('close_dialog_boxes')) {
			alert('Creatures 2 seems to have crashed');
			callback();
			return;
		}

		//console.log('Got crash dialog:', data, that.capp.ole.last_sent_main, callback);
		that.log('error', 'Going to close error dialog');
		callback({type: 'close'});
	});

	let seen_peers = {};

	// Listen for peers
	this.babel.on('peer', function gotPeer(peer) {

		if (peer.ip && !seen_peers[peer.ip]) {
			seen_peers[peer.ip] = true;
			that.log('peer', 'Found new peer: ' + peer.ip);
		}

		peer.onTalk('warp_creature', function receivedWarp(data, callback) {

			that.log('Incoming warp...');

			if (!data || !data.buffer) {
				return callback(new Error('You sent invalid warp data'));
			}

			if (data.buffer.length > 500000) {
				return callback(new Error('You sent too much data'));
			}

			if (data.message && typeof data.message != 'string') {
				return callback(new Error('You sent an invalid message'));
			}

			if (data.message && data.message.length > 1024) {
				return callback(new Error('Your message is too long'));
			}

			let warped_creature = new Creatures.Export(that.capp);

			// Parse the buffer
			warped_creature.processBuffer(data.buffer);

			// Make sure te warp directory exists
			that.createDirectory(that.paths.warp_exports, function done(err) {

				if (err) {
					// Some local error, but the other side doesn't need to know to much
					return callback(null, {success: false});
				}

				let filename = peer.getClaimValue('username') + '-' + warped_creature.moniker + '-' + warped_creature.age_for_filename + '.exp',
				    filepath = libpath.join(that.paths.warp_exports, filename);

				fs.writeFile(filepath, data.buffer, function done(err) {

					if (err) {
						console.error('Failed to store warped creature', err);
						return callback(null, {success: false});
					}

					let record_data = {
						name     : warped_creature.name,
						moniker  : warped_creature.moniker,
						filename : filename,
						sender   : peer.username || peer.public_key,
						message  : data.message
					};

					let record = that.WarpedCreature.createRecord(record_data);

					record.save(function saved(err) {

						if (err) {
							console.error('Failed to store warped creature record:', err);
							return callback(null, {success: false});
						}

						// Increment the warped badge
						let value = Number(that.$warped.attr('data-badge'));

						if (!value) {
							value = 0;
						}

						value++;

						that.$warped.attr('data-badge', value);

						callback(null, {success: true});

						// Also init the warped creature, this will add it to the table
						// and so will also refresh the screen if the user is on that page
						that._initWarpedCreature(record);
					});
				});
			});
		});
	});

	setInterval(function doSave() {
		if (that.getSetting('auto_save_blueberry')) {
			that.log('Going to save game...');

			that.capp.saveGame(function done(err) {
				if (err) {
					that.log('Failed to save game: ' + err);
				} else {
					that.log('Saved game');
				}

				// Saving the world disables the powerups
				if (that.getSetting('keep_powerups_enabled')) {
					that.capp.enablePowerups();
				}
			});
		}
	}, 5 * 60 * 1000);

	// Force enable the powerups in case a manual save was performed
	// (Saving disables the powerups again)
	setInterval(function fixPowerups() {
		if (that.getSetting('keep_powerups_enabled')) {
			that.capp.enablePowerups();
		}
	}, 60 * 1000);

	// Backup creatures every hour
	setInterval(function backupCreatures() {
		if (that.getSetting('auto_backup_creatures')) {
			that.doBackupAllCreaturesAction();
		}
	}, 60 * 60 * 1000);
});

/**
 * Initialize the asynchronous side of the app
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.1
 */
ACom.setCacheMethod(function doAsyncInit() {

	var that = this;

	Function.series(function setNetworkStorageDir(next) {
		that.babel.setMainStorageDir(that.resolvePath('albian-babel'), next);
	}, function getSettings(next) {
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
	}, function loginToNetwork(next) {

		if (that.babel_preferred_port) {
			that.babel.preferred_port = that.babel_preferred_port;
		}

		if (!that.babel_password) {
			return next();
		}

		that.babel.login(that.babel_password, function loggedIn(err) {

			if (err) {
				console.warn('Failed to login:', err);
			} else {
				that.emit('loggedin');
			}

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

				if (!that.all_names[doc.letter]) {
					that.all_names[doc.letter] = [];
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
			console.error(err);
			throw err;
		}

		setInterval(function doUpdate() {
			that.update();
		}, 5 * 1000);

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
 * @version  0.1.4
 */
ACom.setMethod(function update(callback) {

	var that = this,
	    bomb;

	if (!callback) {
		callback = Function.thrower;
	}

	callback = Function.regulate(callback);

	bomb = Function.timebomb(10000, function onTimeout(err) {
		that.log('Update timeout! ' + err);
		callback(new Error('Creatures update timeout after 10 seconds'));
	});

	if (!this.last_update_time) {
		this.last_update_time = Date.now();
	}

	if (this.hasBeenSeen('updating')) {
		if ((Date.now() - this.last_update_time) > 15 * 1000) {
			that.log('warn', 'Update seems stuck, forcing a new update');
		} else {
			this.once('updated', function updated() {
				bomb.defuse();
				callback();
			});

			return;
		}
	}

	this.last_update_time = Date.now();

	// Emit the 'updating' event and do the update
	// if nothing hindered it
	this.emit('updating', function doUpdate() {

		that.log('updating', 'Updating creatures...');

		Fn.parallel(function getCreatures(next) {
			that.getCreatures(next);
		}, function getEggs(next) {
			that.getEggs(next);
		}, function done(err) {
			bomb.defuse();
			that.log('Updated creatures!');
			callback(err);
			that.unsee('updating');
			that.emit('updated');
		});
	});
});

/**
 * Resolve a path in the user's data folder
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {String|Array}   paths
 *
 * @return   {String}
 */
ACom.setMethod(function resolvePath(paths) {

	var result;

	// Make sure the paths is an array
	paths = Array.cast(paths);

	// Add the datapath to the top
	paths.unshift(nwgui.App.dataPath);

	// And now resolve it
	result = libpath.resolve.apply(libpath, paths);

	return result;
});

/**
 * Create a directory
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.1
 * @version  0.1.1
 *
 * @param    {String}   path
 */
ACom.setMethod(function createDirectory(path, callback) {

	var that = this;

	this.babel.peerpin.createDirectory(path, callback);
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
			filename : this.resolvePath(name + '.json'),
			autoload : true
		});
	}

	return this.dbs[name];
});

/**
 * Get a creature record
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.4
 * @version  0.1.4
 *
 * @param    {Develry.Creatures.Creature}   creature
 */
ACom.setMethod(function getCreatureRecord(creature, callback) {

	var that = this;

	this.Creature.find({moniker: creature.moniker}, true, function gotRecord(err, record) {

		if (err) {
			return callback(err);
		}

		record = record[0]

		if (!record) {
			record = that.Creature.createRecord();
		}

		record.attachCreature(creature);

		return callback(null, record);
	});
});

/**
 * Get a creature
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.4
 */
ACom.setMethod(function getCreature(id_or_moniker, callback) {

	var that = this;

	this.capp.getCreature(id_or_moniker, function gotCreature(err, creature) {

		if (err) {
			return callback(err);
		}

		return callback(null, creature);

		that.getCreatureRecord(creature, function gotRecord(err, record) {

			if (err) {
				return callback(err);
			}

			creature.ac_record = record;

			callback(null, creature);
		});
	});
});

/**
 * Get an egg
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.1
 * @version  0.1.1
 */
ACom.setMethod(function getEgg(id_or_moniker, callback) {
	return this.capp.getEgg(id_or_moniker, callback);
});

/**
 * Create an action element
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.1
 *
 * @param    {String}   type      The context of the action (creature, egg, creatures, ...)
 * @param    {String}   name      Internal name for the action, used to match the method
 * @param    {String}   title     Title to show in the button
 * @param    {String}   s16_name  The s16 to use as icon
 * @param    {Number}   index     The index to use in the s16 image
 */
ACom.setMethod(function createActionElement(type, name, title, s16_name, index) {

	var that = this,
	    wrapper_el = document.createElement('div'),
	    title_el = document.createElement('span'),
	    s16_el = document.createElement('s16-image'),
	    method_name;

	wrapper_el.appendChild(s16_el);
	wrapper_el.appendChild(title_el);
	wrapper_el.classList.add('action');
	wrapper_el.setAttribute('data-action', name);

	if (index == null) {
		index = 0;
	}

	s16_el.s16 = s16_name;
	s16_el.image_index = index;
	title_el.textContent = title;

	method_name = 'do' + name.camelize() + type.camelize() + 'Action';

	if (typeof that[method_name] != 'function') {
		method_name = 'do' + name.camelize() + 'Action';
	}

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
				if (type == 'creature') {
					that.getCreature(moniker, function gotCreature(err, creature) {

						if (err) {
							throw err;
						}

						wrapper_el.creature = creature;
						that[method_name](wrapper_el, creature);
					});
				} else if (type == 'egg') {
					that.getEgg(moniker, function gotEgg(err, egg) {

						if (err) {
							throw err;
						}

						wrapper_el.egg = egg;
						that[method_name](wrapper_el, egg);
					});
				} else if (type == 'exported_creature') {

					let exported_creature;

					for (let file in that.local_exports) {
						let temp = that.local_exports[file];

						if (temp.moniker == moniker) {
							exported_creature = temp;
							break;
						}
					}

					that[method_name](wrapper_el, exported_creature);
				} else if (type == 'warped_creature') {
					let warped_creature;

					for (let i = 0; i < that.warped_creatures.length; i++) {
						let warped = that.warped_creatures[i];

						if (warped.moniker == moniker) {
							warped_creature = warped;
							break;
						}
					}

					that[method_name](wrapper_el, warped_creature);
				}
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
 * Apply js values and refresh them periodically
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

		return that.applyJsValueToElement(this, target);
	});
});

/**
 * Apply js value for 1 element and refresh them periodically
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
ACom.setMethod(function applyJsValueToElement(element, target) {

	var that = this,
	    def,
	    cmd,
	    tid;

	if (element.has_js_value_timer) {
		return;
	}

	cmd = element.getAttribute('js-value');
	def = element.getAttribute('js-value-default');

	element.has_js_value_listener = true;

	tid = setInterval(function doUpdate() {
		updateValue();
	}, 2000);

	function updateValue() {

		var value;

		// If this element has been removed, clear the timer
		if (!document.body.contains(element)) {
			element.has_js_value_timer = false;
			clearInterval(tid);
			return;
		}

		try {
			value = Object.path(that, cmd);

			if (value == null) {
				value = Object.path(window, cmd);
			}
		} catch (err) {
			console.warn('Error applying js-value "' + cmd + '"', err);
		}

		if (value == null) {
			value = def || '';
		}

		element.textContent = value;
	}

	// Do an immediate update
	updateValue();
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

	that.log('Showing teleport menu: getting favourite locations...');

	this.getFavouriteLocations(function gotLocations(err, locations) {

		var offset,
		    result,
		    items,
		    conf,
		    key;

		if (err) {
			return alert('Error: ' + err);
		}

		that.log('Showing teleport menu: got ' + locations.length);

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
					that.log('Error moving creature: ' + err.message);
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
 * Inseminate the given creature
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.1
 * @version  0.1.1
 */
ACom.setMethod(function doInseminateAction(action_element, creature) {

	var that = this,
	    $this = $(action_element);

	this.getCreatures(function gotCreatures(err, creatures) {

		var offset,
		    result,
		    items,
		    conf,
		    key,
		    i;

		if (err) {
			return alert('Error: ' + err);
		}

		result = {};
		items = {};

		// Sort the creatures by name
		creatures.sortByPath('name');

		for (i = 0; i < creatures.length; i++) {
			let creature = creatures[i];

			// Don't inseminate with other females
			// @TODO: make this optional?
			if (creature.female) {
				continue;
			}

			// Don't inseminate with too young creatures
			// @TODO: also make this optional?
			if (creature.agen < 2) {
				continue;
			}

			items[creature.moniker] = {
				name     : creature.name + ' - ' + creature.formated_age + ' - ' + creature.lifestage,
				creature : creature
			};
		}

		result.callback = function onClick(key, options) {
			var donor = items[key].creature;

			creature.inseminate(donor, function done(err) {
				if (err) {
					alert('Error inseminating creature:', err);
				}
			});
		};

		result.items = items;
		offset = $this.offset();

		action_element.inseminate_menu = result;

		$this.contextMenu({
			x: offset.left,
			y: offset.top
		});
	});
});

/**
 * Show some pregnancy actions
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.1
 * @version  0.1.1
 */
ACom.setMethod(function doPregnancyAction(action_element, creature) {

	var that = this,
	    $this = $(action_element);

	var offset,
	    result,
	    items,
	    key,
	    i;

	result = {};

	items = {
		abort    : {name: 'Abort pregnancy'},
		fullterm : {name: 'Make pregnancy full term'},
		extract  : {name: 'Extract stuck egg'}
	};

	result.callback = function onClick(key, options) {

		var cmd;

		if (key == 'abort') {
			cmd = 'setv baby 0';
		} else if (key == 'fullterm') {
			// Increase the progesterone level so the creature will lay her egg
			cmd = 'chem 108 255';
		} else if (key == 'extract') {
			cmd = 'doif baby eq 0,stop,endi,'
			    + 'doif carr ne 0,stop,endi,'
			    + 'setv var0 baby,setv baby 0,'
			    + 'setv var1 pos1,addv var1 posr,divv var1 2,'
			    + 'setv var2 limb,'

			    // Make the actual egg
			    // @TODO: move this to the Egg class
			    + 'rndv var3 0 10,'
			    + 'mulv var3 8,'
			    + 'new: simp eggs 8 var3 2000 0,'
			    + 'pose 0,'
			    + 'setv cls2 2 5 2,setv attr 195,'
			    + 'setv obv0 var0,setv obv1 0,'
			    + 'subv var2 hght,'
			    + 'mvto var1 var2,slim,'
			    + 'setv grav 1,'
			    + 'evnt targ,sys: camt,'
			    + 'tick 900,dde: negg'

			    + ',stm# writ norn 29,endm';
		}

		if (cmd) {
			creature.command(cmd, function done(err) {
				if (err) {
					return alert('Error performing "' + items[key].name + '" action: ' + err);
				}
			});
		}
	};

	result.items = items;
	offset = $this.offset();

	action_element.pregnancy_menu = result;

	$this.contextMenu({
		x: offset.left,
		y: offset.top
	});
});

/**
 * Select this creature
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.2
 * @version  0.1.2
 */
ACom.setMethod(function doSelectCreatureAction(action_element, creature) {
	creature.select();
});

/**
 * Infect this creature
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.2
 * @version  0.1.2
 */
ACom.setMethod(function doInfectCreatureAction(action_element, creature) {

	var that = this;

	that.capp.doUnpaused(function doInfect(next) {
		that.capp.command('inst,setv norn ' + creature.id + ',sys: cmnd 32807,endm', function done(err) {
			next();
			if (err) {
				alertError(err);
			}
		});
	});
});

/**
 * Force age this creature
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.2
 * @version  0.1.2
 */
ACom.setMethod(function doForceAgeCreatureAction(action_element, creature) {

	var that = this;

	that.capp.doUnpaused(function doInfect(next) {
		that.capp.command('inst,setv norn ' + creature.id + ',sys: cmnd 32865,endm', function done(err) {
			next();
			if (err) {
				alertError(err);
			}
		});
	});
});

/**
 * Import this exported creature
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.1
 * @version  0.2.2
 *
 * @param    {HTMLElement}       action_element
 * @param    {Creatures.Export}  exported_creature
 */
ACom.setMethod(function doImportExportedCreatureAction(action_element, exported_creature) {

	var that = this;

	exported_creature.getBodyPartImage('head', function gotHead(err, s16) {

		if (err) {
			return alert('Import error: ' + err);
		}

		// If no s16 file is available, see if it is because we couldn't load the gene
		if (!s16) {
			if (exported_creature.genome.genes.length > 50) {
				return alert('Can not import this creature: breed sprites not found');
			}
		}

		exported_creature.import(function done(err) {

			if (err) {
				return alert('Import error: ' + err);
			}
		});
	});
});

/**
 * Import this warped in creature
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.1
 * @version  0.1.1
 *
 * @param    {HTMLElement}       action_element
 * @param    {Creatures.Export}  exported_creature
 */
ACom.setMethod(function doImportWarpedCreatureAction(action_element, warped_creature) {

	console.log('Warped:', warped_creature)
	return this.doImportExportedCreatureAction(action_element, warped_creature.export_instance);
});

/**
 * Warp this exported creature to another peer
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.1
 * @version  0.1.3
 *
 * @param    {HTMLElement}       action_element
 * @param    {Creatures.Export}  exported_creature
 */
ACom.setMethod(function doWarpExportedCreatureAction(action_element, exported_creature) {

	var that = this,
	    $this = $(action_element),
	    usernames,
	    offset,
	    result,
	    items,
	    temp,
	    key,
	    i;

	usernames = this.babel.getClaimDb('username');
	result = {};
	items = {};

	// Get the peer usernames first
	for (i = 0; i < this.babel.peers.length; i++) {
		let peer = this.babel.peers[i];

		if (!peer.username) {
			peer.username = peer.getClaimValue('username');
		}
	}

	// Iterate again
	for (i = 0; i < this.babel.peers.length; i++) {
		let peer = this.babel.peers[i];

		if (!peer.username) {
			continue;
		}

		items[peer.public_key] = {
			name   : 'Warp creature to ' + peer.username.encodeHTML(),
			peer   : peer
		};
	}

	usernames.forEach(function eachValue(trans, key) {

		// Items are stored under 2 values: username & hex
		if (key == trans.owner_hex) {
			return;
		}

		items[trans.owner_hex] = {
			name       : key,
			public_key : trans.owner_hex
		};
	});

	// Turn the array into an object
	temp = Object.dissect(items);

	// Sort it
	temp.sort(function sorting(a, b) {
		if (!a.value || !a.value.name) {
			return -1;
		}

		if (!b.value || !b.value.name) {
			return 1;
		}

		return a.value.name.toLowerCase() > b.value.name.toLowerCase();
	});

	items = {};

	temp.forEach(function eachEntry(entry) {

		if (!entry.value || !entry.value.name) {
			return;
		}

		if (entry.value.name == 'Actest') {
			return;
		}

		items[entry.key] = entry.value;
	});

	result.callback = function onClick(key, options) {
		var item = items[key],
		    peer;

		if (item) {
			peer = item.peer;
		}

		let msg = prompt('Please provide a message for the receiver');

		if (msg == null) {
			return;
		}

		if (peer) {
			let bomb = Function.timebomb(5000, function done(err) {
				alert('Warp timed out!');
			});

			peer.talk('warp_creature', {
				message : msg,
				buffer  : exported_creature.buffer
			}, function done(err, response) {

				if (bomb.exploded) {
					return;
				}

				bomb.defuse();

				if (err) {
					return alert('Error warping: ' + err);
				}

				console.log('Warp response:', response);
			});

			return;
		}

		if (!item.public_key) {
			return alert('Could not locate destination');
		}

		// Request the network to forward our (public) message
		that.babel.requestForward(item.public_key, {
			talk    : 'warp_creature',
			data    : {
				message : msg,
				buffer  : exported_creature.buffer
			}
		});
	};

	if (Object.isEmpty(items)) {
		items.__empty = {
			name : 'There are no peers currently online!'
		};
	}

	result.items = items;
	offset = $this.offset();

	action_element.warp_menu = result;

	$this.contextMenu({
		x: offset.left,
		y: offset.top
	});
});

/**
 * Hatch this egg
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.1
 * @version  0.1.1
 */
ACom.setMethod(function doHatchAction(action_element, egg) {

	var that = this;

	egg.hatch(function hatched(err) {
		if (err) {
			alert('Error hatching egg: ' + err);
		}
	});
});

/**
 * Pause this egg
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.1
 * @version  0.1.1
 */
ACom.setMethod(function doPauseEggAction(action_element, egg) {

	var that = this;

	egg.pause(function paused(err) {
		if (err) {
			alert('Error pausing egg: ' + err);
		}
	});
});

/**
 * Resume this egg
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.1
 * @version  0.1.1
 */
ACom.setMethod(function doResumeEggAction(action_element, egg) {

	var that = this;

	egg.resume(function resumed(err) {
		if (err) {
			alert('Error resuming egg: ' + err);
		}
	});
});

/**
 * Find all eggs and move them to the incubator
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.4
 * @version  0.1.4
 */
ACom.setMethod(function doFindAllEggsAction(action_element) {

	var that = this,
	    code;

	that.log('Finding all egs...');

	code = [
		'inst',
		'setv var0 4750',
		'enum 2 5 2',
			'doif pose le 3',
				'addv var0 20',
				'mvto var0 720',
				'setv grav 1',
				'sys: camt',
				'tick 0',
			'endi',
		'next',
		'endm'
	];

	this.capp.command(code.join(','), function done(err) {

		if (err) {
			that.log('Error finding all eggs: ' + err);
			return alertError(err);
		}

		that.log('All eggs have been found');
	});
});

/**
 * Toggle the game states
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.2
 * @version  0.1.4
 */
ACom.setMethod(function doEnablePowerupsSettingAction(action_element) {

	// Make sure the powerups remain enabled
	this.setSetting('keep_powerups_enabled', true);

	this.capp.enablePowerups(function done(err) {

		if (err) {
			alertError(err);
		}
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

	this.log('Storing "' + name + '" setting with value "' + value + '"');

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
 * Load the creatures tab
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.1
 */
ACom.setAfterMethod('ready', function loadCreaturesTab(element) {

	var general_actions_row = this.all_creature_actions_row,
	    general_actions_table;

	if (!general_actions_row.parentElement) {
		general_actions_table = element.querySelector('.creatures-generic-actions');
		general_actions_table.appendChild(general_actions_row);
	}
});

/**
 * Load the stored creatures tab
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.1
 * @version  0.1.1
 */
ACom.setAfterMethod('ready', function loadStoredTab(element) {

	var that = this;

	fs.readdir(this.paths.local_exports, function gotFiles(err, files) {

		if (err) {

			// Folder doesn't exist yet
			if (err.code == 'ENOENT') {
				return;
			}

			return alert('Error reading local exports: ' + err);
		}

		let tasks = [],
		    i;

		for (i = 0; i < files.length; i++) {
			let file = files[i];

			if (!file.endsWith('.exp')) {
				continue;
			}

			if (that.local_exports[file]) {
				continue;
			}

			tasks.push(function loadExport(next) {

				var instance = new Creatures.Export(that.capp, libpath.resolve(that.paths.local_exports, file));

				// Remember this export instance for later
				that.local_exports[file] = instance;

				Function.parallel(function loadInstance(next) {
					instance.load(function loaded(err) {
						if (err) {
							console.error('Failed to load file: ' + file);
							return next();
						}

						next(null, instance);
					});
				}, function loadRecord(next) {
					that.StoredCreature.find({filename: file.before('.exp')}, true, function gotRecord(err, record) {

						if (err) {
							return next(err);
						}

						if (!record || !record[0]) {
							return next();
						}

						instance.ac_record = record[0];
						next();
					});
				}, function done(err) {

					if (err) {
						return next(err);
					}

					next(null, instance);
				});
			});
		}

		Function.parallel(tasks, function loaded(err, results) {

			if (err) {
				return alert('Error reading stored creatures: ' + err);
			}

			results.sortByPath(-1, 'ac_record.created');

			for (let i = 0; i < results.length; i++) {
				let instance = results[i];

				that._initStoredCreature(instance);
			}
		});
	});
});


/**
 * Load the warped creatures tab
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.1
 * @version  0.1.1
 */
ACom.setAfterMethod('ready', function loadWarpedTab(element) {

	var that = this;

	// Reset the badge
	this.$warped.attr('data-badge', null);

	this.getWarpedCreatures(function gotWarpedCreatures(err, result) {

		if (err) {
			console.error('Error getting warped creatures records:', err);
			return;
		}

		result.forEach(function eachWarpedCreature(warped_creature) {
			that._initWarpedCreature(warped_creature);
		});
	});
});

/**
 * Load warped creatures record
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.1
 * @version  0.1.1
 */
ACom.setAfterMethod('ready', function getWarpedCreatures(callback) {

	var that = this;

	if (!this.warped_creatures) {
		this.warped_creatures = [];
	}

	this.WarpedCreature.find(function gotAll(err, records) {

		var tasks = [];

		if (err) {
			return callback(err);
		}

		records.forEach(function eachRecord(record) {

			if (that.warped_creatures.findByPath('_id', record._id)) {
				return;
			}

			that.warped_creatures.push(record);

			tasks.push(function loadCreature(next) {
				record.load(next);
			});
		});

		Function.series(tasks, function done(err) {
			callback(err, that.warped_creatures);
		});
	});
});

/**
 * Load the eggs tab
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.1
 * @version  0.1.1
 */
ACom.setAfterMethod('ready', function loadEggsTab(element) {

	var general_actions_row = this.all_eggs_actions_row,
	    general_actions_table;

	if (!general_actions_row.parentElement) {
		general_actions_table = element.querySelector('.eggs-generic-actions');
		general_actions_table.appendChild(general_actions_row);
	}
});

/**
 * Load the peers tab
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.1
 * @version  0.1.1
 */
ACom.setAfterMethod('ready', function loadPeersTab(element) {

	var that = this,
	    $table = $('.peers-list', element);

	// Remove all tbodies
	$('tbody', $table).remove();

	this.babel.peers.forEach(function eachPeer(peer) {

		var els = {},
		    $row;

		// Create the tbody element
		els.tbody = document.createElement('tbody');

		// Create the row element
		els.row = document.createElement('tr');
		els.$row = $row = $(els.row);

		// Add the row to the tbody
		els.tbody.appendChild(els.row);

		// Add the current id
		els.row.dataset.id = peer.id;

		that.peers_headers.forEach(function eachName(name) {

			var td = document.createElement('td');

			// Add the name as a class
			td.classList.add('field-' + name);

			// Store the element under the given name
			els[name] = td;

			// And add it to the row
			els.row.appendChild(td);
		});

		// Listen to clicks on the row
		$row.on('click', function onClick(e) {

			var corow = that.peer_options_row;

			// Set the moniker
			corow.dataset.id = peer.id;

			// Insert it after the current creature's row
			$row.after(corow);
		});

		// Add the row to the screen
		$table.append(els.tbody);

		els.username.textContent = peer.getClaimValue('username');
		els.ip.textContent = peer.ip;
	});
});

/**
 * Load the about/network tab
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.1
 */
ACom.setAfterMethod('ready', function loadAboutTab(element) {

	var that = this,
	    connect_element = element.querySelector('.connect-to-network'),
	    register_button,
	    password_input,
	    username_input,
	    login_button,
	    $connecting,
	    username;

	if (connect_element.innerHTML) {
		return;
	}

	connect_element.innerHTML = `
		<div class="connecting-info flex-center" style="display:none;">
		</div>

		<form id="register-network" class="flex-center">
			<input type="text" class="username" placeholder="Username"><br>
			<button class="register">Register on the network</button>
		</form>

		<br>

		<form id="login-network" class="flex-center">
			<input type="password" class="password" placeholder="Password"><br>
			<button class="login">Login on the network</button>
		</form>
	`;

	username_input = connect_element.querySelector('.username');
	register_button = connect_element.querySelector('.register');

	login_button = connect_element.querySelector('.login');
	password_input = connect_element.querySelector('.password');

	$connecting = $('.connecting-info', connect_element);

	if (this.babel_password) {
		password_input.value = this.babel_password;
	}

	register_button.addEventListener('click', function onClick(e) {

		e.preventDefault();

		// Get the input username
		username = username_input.value.trim();

		if (!username || username.length > 32) {
			return alert('Please provide a valid username');
		}

		// Show the connecting-info div
		$connecting.show();

		// Hide all the forms
		$('form', connect_element).hide();

		// Set some text to know something's happening
		$connecting.text('Attempting to register "' + username_input.value + '" ...');

		// If no password is set, register the user
		if (!that.babel_password) {
			// Register on the network
			that.babel.register(function registered(err, private_key) {

				if (err) {
					$connecting.text('Failed to register: ' + err);
					return;
				}

				that.setSetting('albian_babel_network_password', that.babel.private_mnemonic);

				$connecting.html('Registered! Please store your password somewhere safe:<br>' + that.babel.private_mnemonic);
				connected();
			});
		} else {
			// Login with this private key
			that.babel.login(that.babel_password, function loggedin(err) {

				if (err) {
					$connecting.text('Failed to login: ' + err);
					return;
				}

				connected();
			});
		}

		function connected() {
			that.babel.claimValue('username', username, function claimed(err, block) {

				if (err) {
					$connecting.text('Failed to claim username: ' + err);
					return;
				}

				that.babel_username = username;
				$connecting.text('Claimed username "' + username + '"');
				that.emit('loggedin', true);
			});
		}
	});

	login_button.addEventListener('click', function onClick(e) {

		var password,
		    new_pass;

		e.preventDefault();

		password = password_input.value.trim();

		if (password) {
			if (password != that.babel_password) {
				new_pass = true;
			}
		} else {
			password = that.babel_password;
		}

		if (!password) {
			return alert('Unable to login without a password');
		}

		that.babel.login(password, function loggedin(err) {

			if (err) {
				$connecting.text('Failed to login: ' + err);
				return;
			}

			// If a new password was given, store it in the settings
			if (new_pass) {
				that.babel_username = '';
				that.babel_password = password;
			}

			that.emit('loggedin');
		});
	});

	this.after('loggedin', function onLoggedin() {

		if (!that.babel_username) {
			$connecting.show();
			$connecting.text('Connected to the network...');
		} else {
			$connecting.show();
			$connecting.text('Logged in as "' + (that.babel_username || that.babel.public_key) + '"');

			// Hide all the forms
			$('form', connect_element).hide();
		}
	});
});

/**
 * Import all the creatures from a given folder
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.1
 * @version  0.1.1
 */
ACom.setMethod(function doImportAllAction() {

	var that = this,
	    tasks = [],
	    monikers = [],
	    chosen_dir;

	Function.parallel(function loadCreatures(next) {
		// If it is allowed, we don't need to get the monikers
		if (that.getSetting('import_duplicate_moniker_creature')) {
			return next();
		}

		// Get all creatures so we can get their monikers
		that.getCreatures(function gotCreatures(err, creatures) {

			if (err) {
				return next(err);
			}

			creatures.forEach(function eachCreature(creature) {
				monikers.push(creature.moniker);
			});

			next();
		});
	}, function getDirectory(next) {
		// Make the user choose a directory to import from
		chooseDirectory(function done(err, dirpath) {

			if (err) {
				return next(err);
			}

			chosen_dir = dirpath;
			next();
		});
	}, function done(err) {

		if (err) {
			return alert('Error importing directory: ' + err);
		}

		if (!chosen_dir) {
			return;
		}

		// Read in the directory
		fs.readdir(chosen_dir, function gotFiles(err, files) {

			if (err) {
				return alert('Error reading directory: ' + err);
			}

			// Iterate over the files
			files.forEach(function eachFile(file) {

				var lower_file = file.toLowerCase(),
				    filepath;

				if (!lower_file.endsWith('.exp')) {
					return;
				}

				// Resolve the full path to the export file
				filepath = libpath.resolve(chosen_dir, file);

				// Add a new task
				tasks.push(function doImport(next) {
					// Load the export file first
					that.capp.loadExport(filepath, function loaded(err, creature_export) {

						if (err) {
							return next(err);
						}

						// Skip creatures in the monikers table
						if (monikers.indexOf(creature_export.moniker) > -1) {
							console.log('Skipping', creature_export.moniker, 'because it is already in the world');
							return next();
						}

						that.capp.importCreature(creature_export, next);
					});
				});
			});

			Function.series(tasks, function done(err, results) {

				if (err) {
					alert('Error importing: ' + err);
				}

				console.log('Import finished:', err, results);

			});
		});

	});
});

/**
 * Export all the creatures to the given directory
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.1
 * @version  0.1.4
 */
ACom.setMethod(function exportAllTo(dirpath, type, callback) {

	var that = this,
	    tasks = [],
	    now = Date.now();

	if (typeof type == 'function') {
		callback = type;
		type = null;
	}

	if (!callback) {
		callback = Function.thrower;
	}

	that.getCreatures(function gotCreatures(err, creatures) {

		if (err) {
			return callback(err);
		}

		creatures.forEach(function eachCreature(creature, index) {

			// Don't export pregnant creatures
			if (creature.pregnant) {
				return;
			}

			tasks.push(function doExport(next) {
				that.exportCreatureTo(creature, dirpath, type, function exported(err, filename, record, result) {

					if (!record || type != 'backup') {
						return next(err, result);
					}

					that.log('Loading backed up creature record ' + record.moniker + ' ' + record._id);

					// Load the exp file
					record.load(function loaded(err, exported) {

						if (err) {
							that.log('Failed to load backup up creature: ' + err);
							return next(err);
						}

						that.log('Re-importing backed up creature to position ' + record.x + ', ' + record.y);

						exported.import(true, {x: record.x, y: record.y}, function done(err) {

							if (err) {
								return next(err);
							}

							next();
						});
					});
				});
			});
		});

		Function.series(tasks, function exportedAll(err, results) {

			if (err) {
				return callback(err);
			}

			return callback(null);
		});
	});
});

/**
 * Export the given creature creatures to the given directory
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.1
 * @version  0.1.4
 *
 * @param    {Creature}   creature
 * @param    {String}     dirpath
 * @param    {String}     type
 * @param    {Function}   callback
 */
ACom.setMethod(function exportCreatureTo(creature, dirpath, type, callback) {

	var that = this,
	    export_path,
	    filename;

	if (typeof type == 'function') {
		callback = type;
		type = null;
	}

	// Generate the filename
	filename = [
		creature.generation,
		creature.gender,
		creature.name.slug(),
		creature.moniker,
		creature.age_for_filename,
		Date.now()
	].join('_');

	// Construct a path to export to
	export_path = libpath.resolve(dirpath, filename);

	// Actually export the creature
	creature.exportTo(export_path, function exported(err, result) {

		if (err) {
			return callback(err);
		}

		let record = null;

		if (type) {
			// Create a stored creature record
			record = that.StoredCreature.createRecord();

			// Attach this creature & save on next tick
			record.attachCreature(creature);

			// Also set the filename
			record.filename = filename;

			// Set it as a manual export
			record.storage_type = type;
		}

		callback(null, filename, record, result);
	});
});

/**
 * Export all the creatures to the local directory
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.1
 * @version  0.1.1
 */
ACom.setMethod(function doExportAllAction() {

	var that = this;

	this.createDirectory(this.paths.local_exports, function created(err) {

		if (err) {
			return alertError(err, 'Error creating directory');
		}

		that.exportAllTo(that.paths.local_exports, 'manual', function exported(err) {

			if (err) {
				return alertError(err, 'Error exporting');
			}

		});
	});
});

/**
 * Backup all the creatures to the local directory
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.4
 * @version  0.1.4
 */
ACom.setMethod(function doBackupAllCreaturesAction() {

	var that = this;

	this.createDirectory(this.paths.local_exports, function created(err) {

		if (err) {
			return alertError(err, 'Error creating directory');
		}

		that.exportAllTo(that.paths.local_exports, 'backup', function exported(err) {

			if (err) {
				return alertError(err, 'Error backup');
			}
		});
	});
});

/**
 * Export this creatures to the local directory
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.1
 * @version  0.1.4
 */
ACom.setMethod(function doExportCreatureAction(element, creature) {

	var that = this;

	this.createDirectory(this.paths.local_exports, function created(err) {

		if (err) {
			return alertError(err, 'Error creating directory');
		}

		that.exportCreatureTo(creature, that.paths.local_exports, 'manual', function exported(err, result, filename) {

			if (err) {
				return alertError(err, 'Error exporting');
			}

		});
	});
});

/**
 * Export all the creatures to a certain directory
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.1
 * @version  0.1.1
 */
ACom.setMethod(function doExportAllToAction() {

	var that = this,
	    tasks = [],
	    now = Date.now();

	// Make the user choose a directory to export to
	chooseDirectory(function done(err, dirpath) {

		if (err) {
			return alertError(err, 'Error choosing directory');
		}

		if (!dirpath) {
			return;
		}

		that.exportAllTo(dirpath, function done(err) {

			if (err) {
				return alertError(err, 'Error exporting');
			}

		});
	});
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
	    actions_table,
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
				element.value = value !== undefined ? value : '';
		}

		if (config.disabled) {
			element.disabled = true;
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

	actions_table = settings_element.querySelector('.settings-generic-actions');
	actions_table.appendChild(this.all_settings_actions_row);
});

/**
 * Load the caos tab
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.2
 * @version  0.1.2
 */
ACom.setAfterMethod('ready', function loadCaosTab(element) {

	'use strict';

	var that = this;

	if (this._loaded_caos_tab) {
		return;
	}

	this._loaded_caos_tab = true;

	let output = element.querySelector('#caos-output'),
	    input = element.querySelector('#caos-code'),
	    exec  = element.querySelector('.execute-caos');

	// Execute caos on click
	exec.addEventListener('click', function onClick(e) {

		var code = input.innerText.trim();

		// Collapse all tabs
		code = code.replace(/\t/g, '');

		// Replace all duplicate newlines with a single one
		code = code.replace(/\n+/g, '\n');

		// Replace all newlines with commas
		code = code.replace(/\n/g, ',');

		// Replace all duplicate commas with a single comma
		code = code.replace(/,+/g, ',');

		that.capp.ole.sendCAOS(code, function gotResult(err, result) {

			if (err) {
				output.classList.add('error');
				output.innerText = err.message;
				return;
			}

			output.classList.remove('error');
			output.innerText = JSON.stringify(result, null, 4);
		});
	});

	input.addEventListener('keydown', function onKeydown(e) {

		// Disabled for now
		return;

		if (e.code != 'Tab') {
			return;
		}

		e.preventDefault();
		input.innerHTML += '&nbsp;&nbsp;&nbsp;&nbsp;';
	});
});

/**
 * Load the scriptorium tab
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.6
 * @version  0.1.6
 */
ACom.setAfterMethod('ready', function loadScriptoriumTab(element) {

	'use strict';

	var that = this;

	if (this._loaded_scriptorium_tab) {
		return;
	}

	this._loaded_scriptorium_tab = true;
	element.innerHTML = '<div class="scriptorium-families"></div>';

	let $families = $('.scriptorium-families');

	this.capp.classification_system.forEach(function eachFamily(family, index) {

		var $table,
		    $tbody,
		    html;

		html = `<div class="scriptorium-family" data-family-id="${index}">
			<span class="family-name">${family.name}</span>
		</div>`

	});
});

/**
 * Load the logging tab
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.3
 * @version  0.1.3
 */
ACom.setAfterMethod('ready', function loadLogTab(element) {
	// Doesn't really need any initiating for now
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
 * @version  0.1.2
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

	// Some "letters" won't exist because they're actually numbers
	// or something else, so create them
	if (!this.all_names[letter]) {
		this.all_names[letter] = [];
	}

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

	checkAppears = elementAppears('new-s16', {live: true}, function onS16C(element) {
		element.showImage(0);
	});

	this.has_s16_listener = checkAppears;

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

		that.has_s16_listener();
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
 * @version  0.1.4
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
	// Re-set their name every 15 minutes
	if (this.getSetting('make_creatures_remember_their_name')) {
		if (this.update_count % 60 == 0) {
			remember_names = true;
		}
	}

	// Get the actual creatures
	capp.getCreatures(function gotCreatures(err, creatures) {

		var tasks = [];

		if (err) {
			return callback(err);
		}

		that.log('got_creatures', 'Got ' + creatures.length + ' creatures');

		creatures.forEach(function eachCreature(creature) {
			tasks.push(function doCreature(next) {
				that.getCreatureRecord(creature, function gotRecord(err, record) {

					// Re-set the creature's name
					if (remember_names && creature.has_name) {
						that.log('Making creature "' + creature.name + '" remember its name');
						creature.setName(creature.name);
					}

					that._initCreature(creature, function done(err) {

						if (err) {
							return next(err);
						}

						next(null, creature);
					});
				});
			});
		});

		Function.parallel(tasks, function done(err, results) {

			if (err) {
				return callback(err);
			}

			callback(null, results);
		});
	});
});

/**
 * Get all the eggs in the current world
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.1
 * @version  0.1.1
 */
ACom.setAfterMethod('ready', function getEggs(callback) {

	var that = this;

	if (!callback) {
		callback = Function.thrower;
	}

	// Get the actual creatures
	capp.getEggs(function gotCreatures(err, eggs) {

		var tasks = [],
		    norn_limit = 0;

		if (err) {
			return callback(err);
		}

		eggs.forEach(function eachEgg(egg) {
			tasks.push(function doEgg(next) {
				that._initEgg(egg, next);
			});
		});

		tasks.push(function getLimit(next) {
			capp.getHatcheryLimit(function gotLimit(err, limit) {
				if (err) {
					return next(err);
				}

				norn_limit = limit;
				next();
			});
		});

		Function.parallel(tasks, function done(err) {

			var unpaused_count = 0,
			    paused_count = 0;

			if (err) {
				return callback(err);
			}

			eggs.forEach(function eachEgg(egg) {
				if (egg.paused) {
					paused_count++;
				} else {
					unpaused_count;
				}
			});

			that.log('eggs', 'There are currently ' + eggs.length + ' eggs in the world: ' + paused_count + ' are paused, ' + unpaused_count + ' are unpaused');

			let max_unpaused = Number(that.getSetting('max_unpaused_eggs')),
			    do_unpause = that.getSetting('unpause_eggs'),
			    creature_count = Object.size(capp.creatures);

			if (creature_count && norn_limit && creature_count >= norn_limit && eggs.length) {
				that.log('Going to pause all eggs because there are too many norns: ' + creature_count + ' creatures > ' + norn_limit);

				eggs.forEach(function eachEgg(egg) {
					if (egg.paused) {
						return;
					}

					egg.pause();
				});
			} else if (do_unpause && paused_count) {
				eggs.forEach(function eachEgg(egg) {

					if (max_unpaused && unpaused_count >= max_unpaused) {
						return;
					}

					if (egg.paused) {
						that.log('Resuming paused egg ' + egg.moniker);
						egg.resume();
						paused_count--;
						unpaused_count++;
					}
				});
			}

			callback(null, eggs);
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

	that.log('name_creature', 'Naming creature ' + creature.moniker + '...');

	creature.getGeneration(function gotGeneration(err, generation) {

		var letter,
		    index,
		    names,
		    name,
		    i;

		if (err) {
			that.log('name_creature', 'Unable to name creature, failure getting generation: ' + err);
			return callback(err);
		}

		// Get the letter index
		index = generation % 26;

		// Get the letter
		letter = String.fromCharCode(65 + index);

		that.log('name_creature', 'Should name creature ' + creature.moniker + ' (' + creature.gender + ') with starting letter ' + letter);

		// Get the names
		names = that.all_names[letter];

		// Sort by ascending use_count
		names.sortByPath(1, 'use_count', 1, 'name');

		// Iterate over all the names
		for (i = 0; i < names.length; i++) {
			name = names[i];

			if (name[creature.gender]) {
				// Use this name if it hasn't been used before,
				// or if reusing names is allowed
				if (!name.use_count || that.getSetting('reuse_names')) {
					break;
				} else {
					name = null;
				}
			} else {
				name = null;
			}
		}

		if (name) {
			if (!name.monikers) {
				name.monikers = [];
			}

			name.monikers.push(creature.moniker);

			that.log('name_creature', 'Going to set ' + name.name + ' on creature ' + creature.moniker);

			creature.setName(name.name, function done(err) {

				if (err) {
					that.log('name_creature', 'Error setting name: ' + name.name + ' on ' + creature.moniker);
					return callback(err);
				}

				callback(null, name.name);
			});
		} else {
			that.log('name_creature', 'Unable to name ' + creature.moniker + ' of generation ' + creature.generation + ': Found no name!');
			callback(null, false);
		}
	});
});

/**
 * Add the given export to the list
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.1
 * @version  0.1.4
 */
ACom.setMethod(function _initStoredCreature(creature, callback) {

	var that = this,
	    $list = $('.stored-list'),
	    $row,
	    els;

	els = creature.acom_elements;

	if (els) {
		if (callback) {
			callback();
		}
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

	this.stored_creatures_headers.forEach(function eachName(name) {

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

		var corow = that.exported_creature_options_row;

		// If this is a click on the same creature, close the actions row
		if (corow.dataset.moniker == creature.moniker) {
			corow.dataset.moniker = '';
			return corow.remove();
		}

		// Set the moniker
		corow.dataset.moniker = creature.moniker;

		// Insert it after the current creature's row
		$row.after(corow);
	});

	// Add the row to the screen
	$list.append(els.tbody);

	els.name.textContent = creature.name;
	els.moniker.textContent = creature.moniker;

	els.age.textContent = creature.formated_age;
	els.age.dataset.sortValue = creature.age;

	els.lifestage.textContent = creature.lifestage;
	els.lifestage.dataset.sortValue = creature.agen;

	els.health.textContent = ~~(creature.health / 2.56) + '%';
	els.health.dataset.sortValue = creature.health;

	if (creature.ac_record) {
		els.stored.textContent = creature.ac_record.created.format('Y-m-d H:i');
		els.stored.dataset.sortValue = Number(creature.ac_record.created);

		if (creature.ac_record.storage_type) {
			els.storage_type.textContent = creature.ac_record.storage_type;
		}

		if (creature.ac_record.world_name) {
			els.world_name.textContent = creature.ac_record.world_name;
			els.world_name.dataset.sortValue = creature.ac_record.world_name.toLowerCase();
		}
	}
});

/**
 * Add the given warped creature to the list
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.1
 * @version  0.1.1
 *
 * @param    {Document}   warped_record
 */
ACom.setMethod(function _initWarpedCreature(warped_record, callback) {

	var that = this,
	    $list = $('.warped-list'),
	    $row,
	    els;

	els = warped_record.acom_elements;

	if (els) {
		if (callback) {
			callback();
		}
		return;
	}

	warped_record.acom_elements = els = {};

	// Create the tbody element
	els.tbody = document.createElement('tbody');

	// Create the row element
	els.row = document.createElement('tr');
	els.$row = $row = $(els.row);

	// Add the row to the tbody
	els.tbody.appendChild(els.row);

	warped_record.load(function loaded(err) {

		if (err) {
			console.error('Error loading warped creature:', err);
			return;
		}

		let creature = warped_record.export_instance;

		// Add the moniker
		els.row.dataset.moniker = creature.moniker;
		els.tbody.dataset.moniker = creature.moniker;

		that.warped_creatures_headers.forEach(function eachName(name) {

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

			var corow = that.warped_creature_options_row,
			    $message = $('.warped-message', corow),
			    html;

			// If this is a click on the same creature, close the actions row
			if (corow.dataset.moniker == creature.moniker) {
				corow.dataset.moniker = '';
				return corow.remove();
			}

			// Set the moniker
			corow.dataset.moniker = creature.moniker;

			html = String(warped_record.message || '').encodeHTML();

			if (html) {
				html = 'Message from ' + warped_record.getSenderName() + ':<br><blockquote>' + html + '</blockquote>';
			}

			// Set the message
			$message.html(html);

			// Insert it after the current creature's row
			$row.after(corow);
		});

		// Add the row to the screen
		$list.append(els.tbody);

		els.name.textContent = creature.name;
		els.moniker.textContent = creature.moniker;

		els.received.textContent = warped_record.created.format('Y-m-d H:i');
		els.received.dataset.sortValue = 0 + warped_record.created;

		els.sender.textContent = warped_record.getSenderName();

		els.age.textContent = creature.formated_age;
		els.age.dataset.sortValue = creature.age;

		els.lifestage.textContent = creature.lifestage;
		els.lifestage.dataset.sortValue = creature.agen;

		els.health.textContent = ~~(creature.health / 2.56) + '%';
		els.health.dataset.sortValue = creature.health;
	});
});

/**
 * Add the given creature to the list
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.2
 */
ACom.setMethod(function _initCreature(creature, callback) {

	var that = this,
	    updating,
	    $row,
	    els;

	els = creature.acom_elements;

	if (els) {
		if (callback) {
			creature.afterOnce('updated', callback);
		}
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

	// Set the gender
	els.tbody.dataset.gender = creature.gender;

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

		// If this is a click on the same creature, close the actions row
		if (corow.dataset.moniker == creature.moniker) {
			corow.dataset.moniker = '';
			return corow.remove();
		}

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

	// When the creature is removed, so should the elements
	creature.once('removed', function whenRemoved() {

		that.log('Creature ' + creature.moniker + ' has been removed');

		// Unset the elements
		creature.acom_elements = null;

		// Remove the row
		els.tbody.remove();
	});

	// The update function
	function updateCreature(callback) {

		var name_doc,
		    status = '';

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

		els.health.textContent = ~~(creature.health / 2.56) + '%';
		els.health.dataset.sortValue = creature.health;

		els.drive.textContent = creature.drive;

		// Set the lifestage on the tbody
		els.tbody.dataset.lifestage = creature.lifestage;

		// Is the creature pregnant?
		if (creature.pregnant) {
			els.tbody.dataset.pregnant = creature.pregnant;
		} else {
			els.tbody.removeAttribute('data-pregnant');
		}

		if (creature.dead) {
			status += 'Dead';
		}

		if (creature.unconscious) {
			if (status) {
				status += '<br>';
			}
			status += 'Unconscious';
		}

		if (creature.pregnant) {
			if (status) {
				status += '<br>';
			}

			status += 'Pregnant';
		}

		if (creature.asleep) {
			if (status) {
				status += '<br>';
			}

			status += 'Asleep';
		}

		els.status.innerHTML = status;

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

/**
 * Add the given egg to the list
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.1
 * @version  0.1.2
 */
ACom.setMethod(function _initEgg(egg, callback) {

	var that = this,
	    updating,
	    egg_img,
	    $row,
	    els;

	els = egg.acom_elements;

	if (els) {
		if (callback) {
			egg.afterOnce('updated', callback);
		}
		return;
	}

	egg.acom_elements = els = {};

	// Create the tbody element
	els.tbody = document.createElement('tbody');

	// Create the row element
	els.row = document.createElement('tr');
	els.$row = $row = $(els.row);

	// Add the row to the tbody
	els.tbody.appendChild(els.row);

	// Add the moniker
	els.row.dataset.moniker = egg.moniker;
	els.tbody.dataset.moniker = egg.moniker;

	// Add all the egg header elements
	this.eggs_headers.forEach(function eachName(name) {

		var td = document.createElement('td');

		// Add the name as a class
		td.classList.add('field-' + name);

		// Store the element under the given name
		els[name] = td;

		// And add it to the row
		els.row.appendChild(td);
	});

	// Add the row to the screen
	this.$egg_list.append(els.tbody);

	// Listen to clicks on the row
	$row.on('click', function onClick(e) {

		var corow = that.egg_options_row;

		// If this is a click on the same egg, close the actions row
		if (corow.dataset.moniker == egg.moniker) {
			corow.dataset.moniker = '';
			return corow.remove();
		}

		// Set the moniker
		corow.dataset.moniker = egg.moniker;

		// Insert it after the current creature's row
		$row.after(corow);
	});

	// Create the egg image (we use the first egg image for now)
	egg_img = document.createElement('s16-image');
	egg_img.s16 = 'eggs.s16';
	egg_img.image_index = 0;
	els.picture.appendChild(egg_img);

	// Initial update
	updateEgg();

	// When the egg is removed, so should the elements
	// type is "hatched" or nothing
	// If it is hatched, "creature" will be the hatched creature
	egg.once('removed', function whenRemoved(type, creature) {

		// Unset the elements
		egg.acom_elements = null;

		// Remove the row
		els.tbody.remove();
	});

	// Listen for egg updates
	egg.on('updated', function whenRemoved(type, egg) {
		updateEgg();
	});

	function updateEgg() {

		els.moniker.textContent = egg.moniker;
		els.gender.textContent = egg.gender;

		els.stage.textContent = egg.stage;
		els.stage.dataset.sortValue = egg.stage;

		els.progress.textContent = egg.tick_progress;
		els.progress.dataset.sortValue = egg.tick_progress;

		if (egg.mother) {
			els.mother.textContent = egg.mother.name;
		}

		if (egg.father) {
			els.father.textContent = egg.father.name;
		}

		egg_img.image_index = egg.stage;

		els.status.textContent = egg.paused ? 'Paused' : '';
	}
});

ACom.addSetting('name_creatures', {
	title   : 'Automatically name new creatures',
	type    : 'boolean',
	default : true
});

ACom.addSetting('reuse_names', {
	title   : 'Reuse names',
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

ACom.addSetting('close_dialog_boxes', {
	title   : 'Automatically close error dialog boxes',
	type    : 'boolean',
	default : true
});

ACom.addSetting('import_duplicate_moniker_creature', {
	title   : 'Import creature even if they are already in the world',
	type    : 'boolean',
	default : false
});

ACom.addSetting('albian_babel_network_password', {
	title   : 'Your password to log into the network',
	type    : 'string'
});

ACom.addSetting('albian_babel_network_username', {
	title    : 'Your username on the network',
	type     : 'string',
	disabled : true
});

ACom.addSetting('albian_babel_network_preferred_port', {
	title    : 'The preferred port to connect to the network on',
	type     : 'number'
});

ACom.addSetting('auto_save_blueberry', {
	title    : 'Save the game every 5 minutes (blueberry4$ cheat required)',
	type     : 'boolean'
});

ACom.addSetting('unpause_eggs', {
	title    : 'Automatically unpause eggs',
	type     : 'boolean'
});

ACom.addSetting('max_unpaused_eggs', {
	title    : 'Maximum number of eggs that can be unpaused at once',
	type     : 'number'
});

ACom.addSetting('keep_powerups_enabled', {
	title    : 'Keep powerups enabled',
	type     : 'boolean',
	hidden   : true
});

ACom.addSetting('auto_backup_creatures', {
	title    : 'Automatically backup creatures every hour',
	type     : 'boolean'
});