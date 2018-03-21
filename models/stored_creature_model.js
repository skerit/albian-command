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

	// The (original) world name
	this.addField('world_name');

	// The creature id
	this.addField('creature_id');
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

	Blast.nextTick(this.save, this, callback);
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