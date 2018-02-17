/**
 * Setting model
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
var SettingModel = Function.inherits('Develry.Creatures.Model', function SettingModel(acom) {
	return SettingModel.super.call(this, acom, 'Setting');
});

/**
 * Set the model name
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
SettingModel.constitute(function addFields() {

	// The name of the setting
	this.addField('name');

	// The value of the setting
	this.addField('value');
});