/**
 * Name model
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
var NameModel = Function.inherits('Develry.Creatures.Model', function NameModel(acom) {
	return NameModel.super.call(this, acom, 'Name');
});

/**
 * Set the model name
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
NameModel.constitute(function addFields() {
	this.addField('letter');
	this.addField('name');
	this.addField('male');
	this.addField('female');
	this.addField('monikers');

	this.RecordClass.setProperty(function use_count() {
		if (!this.monikers) {
			return 0;
		}

		return this.monikers.length;
	})
});