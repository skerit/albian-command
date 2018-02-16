var model_cache = {};

/**
 * A model
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
var Model = Function.inherits('Develry.Creatures.Base', function Model(acom, name) {

	// The table name
	this.table_name = name.underscore().pluralize();

	if (model_cache[this.table_name]) {
		return model_cache[this.table_name];
	} else {
		model_cache[this.table_name] = this;
	}

	// Reference to albian commant
	this.acom = acom;

	// The name of the model
	this.name = name;

	// Prepare the "database"
	this.db = acom.getDatabase(this.table_name);

	// The record cache
	this.cache = {};
});

/**
 * Find
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Model.setMethod(function find(conditions, callback) {

	var that = this;

	if (typeof conditions == 'function') {
		callback = conditions;
		conditions = {};
	}

	this.db.find(conditions, function gotRecords(err, objects) {

		var results;

		if (err) {
			return callback(err);
		}

		results = [];

		objects.forEach(function eachRecord(entry) {

			var record;

			if (that.cache[entry._id]) {
				record = that.cache[entry._id];
				record.updateFromDb(entry);
			} else {
				record = that.createRecord(entry);
			}

			results.push(record);
		});

		callback(null, results);
	});
});

/**
 * Update
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Model.setMethod(function update(query, data, options, callback) {
	return this.db.update(query, data, options, callback);
});

/**
 * Remove a record
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Model.setMethod(function remove(query, callback) {

	if (!callback) {
		callback = Function.thrower;
	}

	if (query._id) {
		delete this.cache[query._id];
	}

	this.db.remove(query, callback);
});

/**
 * Create a new record
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Model.setMethod(function createRecord(data) {

	var result;

	if (!data) {
		data = {};
	}

	if (!data._id) {
		data._id = createObjectId();
	}

	result = new Blast.Classes.Develry.Creatures.Record(this, data);
	this.cache[data._id] = result;

	return result;
});