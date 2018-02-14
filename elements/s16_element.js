'use strict';

/**
 * The s16-image element:
 * show a single entry of an s16
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
class S16Image extends HTMLElement {

	get s16() {
		return this._s16;
	}

	set s16(value) {

		if (typeof value == 'string') {
			value = new Blast.Classes.Develry.Creatures.S16(capp, value);
		}

		this._s16 = value;

		if (this.image_index != null) {
			this.image_index = this.image_index;
		}
	}

	get image_index() {
		return this._image_index;
	}

	set image_index(index) {
		var that = this;
		this._image_index = index;

		if (!this.s16) {
			return;
		}

		this.s16.load(function loaded() {
			that.image = that.s16.images[index];
		});
	}

	get image() {
		return this._s16_image;
	}

	set image(value) {
		this._s16_image = value;

		this.canvas.width = value.width;
		this.canvas.height = value.height;

		// Create the image data
		if (!value.image_data) {
			value.image_data = new ImageData(value.rgba, value.width, value.height);
		}

		this.ctx.putImageData(value.image_data, 0, 0);
	}

	attributeChangedCallback(name, old_value, new_value) {
		console.log('Val of', name, 'is now', new_value);
	}

	/**
	 * The class constructor
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.0
	 * @version  0.1.0
	 */
	createdCallback() {

		var canvas,
		    ctx;

		// Create a new canvas
		this.canvas = canvas = document.createElement('canvas');

		// Get the context
		this.ctx = ctx = canvas.getContext('2d');

		this.appendChild(this.canvas);
	}
}

/**
 * The s16-collection element:
 * show all entries of an s16
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
class S16Collection extends HTMLElement {

	get s16() {
		return this._s16;
	}

	set s16(value) {

		if (typeof value == 'string') {
			value = new Blast.Classes.Develry.Creatures.S16(capp, value);
		}

		this._s16 = value;
	}

	/**
	 * Get the imagedata of the wanted index
	 */
	getImage(index) {

		var image = this.s16.images[index];

		if (!image) {
			return null;
		}

		// Create the image data
		if (!image.image_data) {
			image.image_data = new ImageData(image.rgba, image.width, image.height);
		}

		return image;
	}

	/**
	 * Show the wanted index
	 */
	showImage(index) {
		var that = this;

		if (!this.s16) {
			return;
		}

		this.image_index = index;
		this.index_el.textContent = index;

		this.s16.load(function loaded(err) {

			var image;

			if (err) {
				throw err;
			}

			// If the index has already changed, do nothing
			if (that.image_index != index) {
				return;
			}

			image = that.getImage(index);

			if (!image) {
				return;
			}

			that.canvas.width = image.width;
			that.canvas.height = image.height;

			that.ctx.putImageData(image.image_data, 0, 0);
		});
	}

	/**
	 * The class constructor
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.0
	 * @version  0.1.0
	 */
	createdCallback() {

		var that = this,
		    index_el,
		    buttons,
		    canvas,
		    right,
		    left,
		    ctx;

		// Create a new canvas
		this.canvas = canvas = document.createElement('canvas');

		// Get the context
		this.ctx = ctx = canvas.getContext('2d');

		this.appendChild(this.canvas);

		// Create the buttons element
		buttons = document.createElement('div');
		left = document.createElement('button');
		right = document.createElement('button');
		index_el = document.createElement('span');
		buttons.appendChild(left);
		buttons.appendChild(index_el);
		buttons.appendChild(right);
		buttons.classList.add('buttons');

		this.index_el = index_el;

		this.appendChild(buttons);

		left.textContent = '«';
		right.textContent = '»';
		index_el.textContent = 0;

		left.addEventListener('click', function onClick(e) {
			var index;

			e.preventDefault();

			index = that.image_index - 1;

			if (index < 0) {
				index = that.s16.images.length - 1;
			}

			if (index < 0) {
				index = 0;
			}

			that.showImage(index);
		});

		right.addEventListener('click', function onClick(e) {

			var index;

			e.preventDefault();

			index = that.image_index + 1;

			if (index >= that.s16.images.length) {
				index = 0;
			}

			if (index == -1) {
				index = 0;
			}

			that.showImage(index);
		});
	}
}

document.registerElement('s16-collection', S16Collection);
document.registerElement('s16-image', S16Image);