/**
 * A record object
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
var Record = Function.inherits('Develry.Creatures.Base', function Record(model, data) {

	// Reference to the model
	this.model = model;

	// The actual data
	this.data = data;
});

/**
 * Reference to the _id
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Record.setProperty(function _id() {
	return this.data._id;
});

/**
 * Add a field
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Record.setStatic(function addField(name) {
	this.setProperty(name, function getter() {
		return this.get(name)
	}, function setter(value) {
		return this.set(name, value);
	});
});

/**
 * Update from the database
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Record.setMethod(function updateFromDb(new_data) {

	if (!this.data) {
		this.data = {};
	}

	Object.assign(this.data, new_data);
});

/**
 * Save to the database
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Record.setMethod(function save(callback) {

	var that = this;

	if (!callback) {
		callback = Function.thrower;
	}

	this.data.updated = new Date();

	this.model.update({_id: this._id}, this.data, {upsert: true}, function saved(err, result) {

		if (err) {
			return callback(err);
		}

		return callback(null);
	});
});

/**
 * Delete this record
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Record.setMethod(function remove(callback) {
	this.model.remove({_id: this._id}, callback);
});

/**
 * Get a property
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Record.setMethod(function get(name) {
	return this.data[name];
});

/**
 * Set a property
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Record.setMethod(function set(name, value) {
	return this.data[name] = value;
});