/**
 * Creature model
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.4
 * @version  0.1.4
 */
var StoredCreatureModel = Function.inherits('Develry.Creatures.Model', function StoredCreatureModel(acom) {
	return StoredCreatureModel.super.call(this, acom, 'StoredCreature');
});

/**
 * Add fields
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.4
 * @version  0.1.4
 */
StoredCreatureModel.constitute(function addFields() {

	// The filename this is tored in
	this.addField('filename');

	// The name of the creature
	this.addField('name');

	// Set the gender
	this.addField('gender');

	// The moniker of the creature
	this.addField('moniker');

	// The age at the time of export
	this.addField('age');

	// The (original) world name
	this.addField('world_name');

	// The creature id
	this.addField('creature_id');

	// Storage type
	this.addField('storage_type');

	// Positions at the time of export
	this.addField('x');
	this.addField('y');
});

let StoredCreature = StoredCreatureModel.RecordClass;

/**
 * Attach a Creature instance
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.4
 * @version  0.1.4
 */
StoredCreature.setMethod(function attachCreature(creature, callback) {
	this.creature_instance = creature;

	if (creature.has_name) {
		this.name = creature.name;
	}

	if (!this.moniker) {
		this.moniker = creature.moniker;
	}

	if (!this.world_name) {
		this.world_name = creature.app.world_name;
	}

	if (!this.creature_id && creature.ac_record) {
		this.creature_id = creature.ac_record._id;
	}

	if (!this.age) {
		this.age = creature.age;
	}

	if (this.x == null) {
		this.x = creature.x;
		this.y = creature.y;
	}

	Blast.nextTick(this.save, this, callback);
});

/**
 * Load this record's file
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.4
 * @version  0.1.4
 */
StoredCreature.setMethod(function load(callback) {

	'use strict';

	var that = this;

	if (this.hasBeenSeen('loading_file')) {
		return this.afterOnce('loaded_file', function done() {
			callback(null, that.export_instance);
		});
	}

	this.emit('loading_file');

	let filepath = libpath.join(acom.paths.local_exports, this.filename + '.exp');

	acom.log('Going to load Stored creature at ' + filepath);

	this.readFile(filepath, function gotFile(err, buffer) {

		if (err) {
			acom.log('Failed to load Stored creature: ' + err);
			return callback(err);
		}

		let exported = new Creatures.Export(capp);
		exported.processBuffer(buffer);

		that.export_instance = exported;
		callback(null, exported);
		that.emit('loaded_file');
	});
});

/**
 * Set methods on the Creature instance
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.4
 * @version  0.1.4
 */
Creatures.Creature.setMethod(function save(callback) {
	console.log('Saving?');
});