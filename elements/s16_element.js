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

	/**
	 * S16 value getter: the name of the s16 file
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.0
	 * @version  0.1.0
	 */
	get s16() {

		// Get the s16 attribute if the value is null
		if (this._s16 == null) {
			this._s16 = this.getAttribute('s16');
		}

		return this._s16;
	}

	/**
	 * S16 value getter: set the name of the s16 file
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.0
	 * @version  0.1.0
	 */
	set s16(value) {

		if (typeof value == 'string') {
			console.log('VA:', value);
			value = new Blast.Classes.Develry.Creatures.S16(capp, value);
		}

		this._s16 = value;

		if (this.image_index != null) {
			this.image_index = this.image_index;
		}
	}

	/**
	 * The index of the image to show in the s16 file
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.0
	 * @version  0.1.0
	 */
	get image_index() {
		return this._image_index;
	}

	/**
	 * Set the index of the image to show in the s16 file
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.0
	 * @version  0.1.0
	 */
	set image_index(index) {
		var that = this;
		this._image_index = Number(index);

		if (!this.s16) {
			return;
		}

		this.s16.load(function loaded() {
			that.image = that.s16.images[index];
		});
	}

	/**
	 * The actual s16 instance
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.0
	 * @version  0.1.0
	 */
	get image() {
		return this._s16_image;
	}

	/**
	 * Set the actual s16 instance
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.0
	 * @version  0.1.0
	 */
	set image(value) {
		this._s16_image = value;

		this.canvas.width = value.width;
		this.canvas.height = value.height;

		// Create the image data
		if (!value.image_data) {
			value.image_data = new ImageData(value.rgba, value.width, value.height);
		}

		this.ctx.putImageData(value.image_data, 0, 0);

		if (this._animation_interval == null) {
			this.startAnimation();
		}
	}

	/**
	 * The animation duration, if any
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.0
	 * @version  0.1.0
	 */
	get animation_duration() {
		return Number(this.getAttribute('animation-duration'));
	}

	/**
	 * Is the animation paused?
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.0
	 * @version  0.1.0
	 */
	get paused() {
		if (this._paused != null) {
			return this._paused;
		}

		this._paused = this.hasAttribute('paused');
		return this._paused;
	}

	/**
	 * Pause the animation?
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.0
	 * @version  0.1.0
	 */
	set paused(value) {
		this._paused = value;
	}

	/**
	 * Set the animation duration, if any
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.0
	 * @version  0.1.0
	 */
	set animation_duration(value) {
		this.setAttribute('animation-duration', value);
		this.startAnimation();
	}

	attributeChangedCallback(name, old_value, new_value) {
		if (name == 's16') {
			this.s16 = new_value;
		} else if (name == 'image-index') {
			this.image_index = new_value;
		} else if (name == 'paused') {
			this.paused = new_value;
		}
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

		if (this.hasAttribute('s16')) {
			this.s16 = this.getAttribute('s16');
		}

		if (this.hasAttribute('image-index')) {
			this.image_index = this.getAttribute('image-index');
		} else if (this.s16) {
			this.image_index = 0;
		}

		this.appendChild(this.canvas);
	}

	/**
	 * Element was removed, detach timers
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.0
	 * @version  0.1.0
	 */
	detachedCallback() {
		if (this._animation_interval != null) {
			clearInterval(this._animation_interval);
			this._animation_interval = null;
		}
	}

	/**
	 * Possibly start the animation
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.0
	 * @version  0.1.0
	 */
	startAnimation() {

		var that = this,
		    duration = this.animation_duration,
		    increment,
		    start,
		    fps,
		    cur;

		if (!duration) {
			if (this._animation_interval != null) {
				clearInterval(this._animation_interval);
				this._animation_interval = null;
			}
			return;
		}

		increment = Number(this.getAttribute('animation-increment')) || 1;
		fps = Number(this.getAttribute('animation-fps')) || 8;
		start = this.image_index;
		cur = 0;

		if (fps > 25) {
			fps = 25;
		}

		this._animation_interval = setInterval(function updateImage() {

			if (that.paused) {
				return;
			}

			// Increment the current counter
			cur += increment;

			if (cur >= duration) {
				cur = 0;
			}

			if (cur < 0) {
				cur = duration - 1;
			}

			that.image_index = start + cur;
		}, 1000 / fps);
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