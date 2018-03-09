'use strict';

/**
 * The s16-image element:
 * show a single entry of an s16
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
class XSvg extends HTMLElement {
	/**
	 * Connected to the document
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.1
	 * @version  0.1.1
	 */
	createdCallback() {

		var that = this,
		    src = this.getAttribute('src');

		// Resolve the path
		src = libpath.resolve('images', src);

		fs.readFile(src, 'utf8', function gotFile(err, source) {

			if (err) {
				return console.error(err);
			}

			that.innerHTML = source;
		});
	}
}

document.registerElement('x-svg', XSvg);