/**
 * Creature model
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.4
 * @version  0.1.4
 */
var CreatureModel = Function.inherits('Develry.Creatures.Model', function CreatureModel(acom) {
	return CreatureModel.super.call(this, acom, 'Creature');
});

/**
 * Set the model name
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.4
 * @version  0.1.4
 */
CreatureModel.constitute(function addFields() {

	// The original name of the creature
	this.addField('original_name');

	// The last seen name of the creature
	this.addField('name');

	// Set the gender
	this.addField('gender');

	// The moniker of the creature
	this.addField('moniker');

	// The (original) world name
	this.addField('world_name');

	// The (optional) mother
	this.addField('mother_id');

	// The (optional) father
	this.addField('father_id');
});

let Creature = CreatureModel.RecordClass;

/**
 * Attach a Creature instance
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.4
 * @version  0.1.4
 */
Creature.setMethod(function attachCreature(creature) {
	this.creature_instance = creature;

	if (creature.has_name) {
		if (!this.original_name) {
			this.original_name = creature.name;
		}

		this.name = creature.name;
	}

	if (!this.moniker) {
		this.moniker = creature.moniker;
	}

	if (!this.world_name) {
		this.world_name = creature.app.world_name;
	}

	this.save();
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