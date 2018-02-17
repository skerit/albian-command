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
 * Set the model name
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Model.constitute(function setNames() {

	var name = this.name.before('Model');

	if (!name) {
		return;
	}

	this.model_name = name;
});

/**
 * Get a record class
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Model.prepareStaticProperty(function RecordClass() {
	return this.getRecordClass();
});

/**
 * Get a record class
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Model.setStatic(function getRecordClass(name) {

	var record_name,
	    temp;

	if (this.name != 'Model' && this._record_class) {
		return this._record_class;
	}

	if (!name) {
		name = this.model_name;
	}

	if (!name) {
		return Blast.Classes.Develry.Creatures.Record;
	}

	record_name = name.singularize().camelize() + 'Record';

	if (!Blast.Classes.Develry.Creatures[record_name]) {
		temp = Function.inherits('Develry.Creatures.Record', Function.create(record_name, function wrapper(model, data) {
			wrapper.wrapper.super.call(this, model, data);
		}));
	}

	if (this.name != 'Model' && this.name == name) {
		this._record_class = Blast.Classes.Develry.Creatures[record_name];
	}

	return Blast.Classes.Develry.Creatures[record_name];
});

/**
 * Add a field
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Model.setStatic(function addField(name) {
	var doc_class = this.getRecordClass(this.model_name);
	doc_class.addField(name);
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

	var RecordClass = this.constructor.getRecordClass(),
	    result;

	if (!data) {
		data = {};
	}

	if (!data._id) {
		data._id = createObjectId();
	}

	if (!data.created) {
		data.created = new Date();
	}

	data.updated = new Date();

	result = new RecordClass(this, data);
	this.cache[data._id] = result;

	return result;
});