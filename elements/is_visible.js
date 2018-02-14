function addIsVisible() {
	'use strict';

	var getStyle;

	/**
	 * The main function that will be added to the HTMLElement prototype.
	 * Warning: using padding will disable the occlusion check
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    1.0.0
	 * @version  1.2.2
	 *
	 * @param    {Number}   padding
	 *
	 * @return   {Boolean}
	 */
	function isVisible(padding) {
		return _isVisible(this, padding || 0);
	}

	/**
	 * Returns true if the element is actually part of the current document
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    1.2.2
	 * @version  1.2.2
	 *
	 * @param    {HTMLElement}   element
	 *
	 * @return   {Boolean}
	 */
	function elementInDocument(element) {
		return isChild(element, document.body);
	};

	/**
	 * Returns true if one element is a child of the other
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    1.2.2
	 * @version  1.2.2
	 *
	 * @param    {HTMLElement}   element
	 *
	 * @return   {Boolean}
	 */
	function isChild(child, parent) {
		while (child = child.parentNode) {
			if (child == parent) {
				return true;
			}
		}

		return false;
	};

	/**
	 * Returns true if the element or its parents
	 * has no opacity, visibility or display
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    1.2.2
	 * @version  1.2.2
	 *
	 * @param    {HTMLElement}   element
	 *
	 * @return   {Boolean}
	 */
	function isHidden(element) {

		var parent_styles,
		    overflow_x,
		    overflow_y,
		    overflow,
		    parent = element.parentNode,
		    styles;

		if (!parent) {
			return true;
		}

		// Always return false for the document element
		if (isDocumentElement(parent)) {
			return false;
		}

		// Get the computed styles of the element
		styles = getStyle(element);

		// Return true if the element is invisible
		if (   styles.opacity === '0'
			|| styles.display === 'none'
			|| styles.visibility === 'hidden') {
			return true;
		}

		return isHidden(parent);
	}

	/**
	 * Returns true if the element is the body or document or html element
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    1.2.2
	 * @version  1.2.2
	 *
	 * @param    {HTMLElement}   element
	 *
	 * @return   {Boolean}
	 */
	function isDocumentElement(element) {
		if (   element == document.body
			|| element.nodeType === 9
			|| (element.nodeType == 1 && element.nodeName == 'HTML')) {
			return true;
		}

		return false;
	}

	/**
	 * Returns true if the two elements or rectangles collide
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    1.2.2
	 * @version  1.2.2
	 *
	 * @param    {HTMLElement}   element_one
	 * @param    {HTMLElement}   element_two
	 *
	 * @return   {Boolean}
	 */
	function collides(element_one, element_two) {

		var result,
		    rect1,
		    rect2;

		if (element_one.nodeName) {
			rect1 = element_one.getBoundingClientRect();
		} else {
			rect1 = element_one;
		}

		if (element_two.nodeName) {
			rect2 = element_two.getBoundingClientRect();
		} else {
			rect2 = element_two;
		}

		result = !(
			rect1.top    > rect2.bottom ||
			rect1.right  < rect2.left ||
			rect1.bottom < rect2.top ||
			rect1.left   > rect2.right
		);

		return result;
	}

	/**
	 * Returns the context of the given element:
	 * a parent element with a specific overflow,
	 * or the document element if none are found
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    1.2.2
	 * @version  1.2.2
	 *
	 * @param    {HTMLElement}   element
	 *
	 * @return   {HTMLElement}
	 */
	function getViewContext(element) {

		var parent_styles,
		    overflow_x,
		    overflow_y,
		    overflow,
		    parent = element.parentNode;

		if (!parent) {
			return null;
		}

		if (isDocumentElement(parent)) {
			return parent;
		}

		parent_styles = getStyle(parent);

		overflow = parent_styles.overflow;
		overflow_x = parent_styles['overflow-x'];
		overflow_y = parent_styles['overflow-y'];

		if ((  'hidden' === overflow   || 'scroll' === overflow
			|| 'hidden' === overflow_x || 'scroll' === overflow_x
			|| 'hidden' === overflow_y || 'scroll' === overflow_y)) {
			return parent;
		}

		return getViewContext(parent);
	}

	/**
	 * See if the element can be found at any of the rect's points
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    1.2.2
	 * @version  1.2.2
	 *
	 * @param    {HTMLElement}   element
	 * @param    {Object}        rect
	 *
	 * @return   {Boolean}
	 */
	function elementAtRectPoints(element, rect) {

		var sample;

		// Get the first sample
		sample = document.elementFromPoint(rect.left, ~~rect.top);

		if (sample == element || isChild(element, sample)) {
			return true;
		}

		// Get the second sample
		sample = document.elementFromPoint(rect.left, ~~rect.bottom);

		if (sample == element || isChild(element, sample)) {
			return true;
		}

		// Get the third sample
		sample = document.elementFromPoint(rect.right, ~~rect.bottom);

		if (sample == element || isChild(element, sample)) {
			return true;
		}

		// Get the fourth sample
		sample = document.elementFromPoint(rect.right, ~~rect.top);

		if (sample == element || isChild(element, sample)) {
			return true;
		}

		return false;
	}

	/**
	 * The actual visibility checking
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    1.2.2
	 * @version  1.2.2
	 *
	 * @param    {HTMLElement}   element
	 * @param    {Number}        padding
	 *
	 * @return   {Boolean}
	 */
	function _isVisible(start_element, padding) {

		var real_rect,
		    sample,
		    result,
		    rect;

		// Check if the start element is in the document
		if (!elementInDocument(start_element)) {
			return false;
		}

		// Check if the element is explicitly hidden
		if (isHidden(start_element)) {
			return false;
		}

		if (padding == null) {
			padding = 2;
		}

		// Make sure the start element is somewhere on the screen
		real_rect = start_element.getBoundingClientRect();

		rect = {
			bottom : real_rect.bottom + padding,
			right  : real_rect.right  + padding,
			left   : real_rect.left   - padding,
			top    : real_rect.top    - padding
		};

		// Totally underneath the viewport
		if (rect.top > document.documentElement.clientHeight) {
			return false;
		}

		// Totally above the viewport
		if (rect.bottom < 0) {
			return false;
		}

		// Totally left of the viewport
		if (rect.right < 0) {
			return false;
		}

		// Totally right of the viewport
		if (rect.left > document.documentElement.clientWidth) {
			return false;
		}

		result = isElementVisible(start_element);

		if (result) {
			// If no padding is given, we can also check for occlusions
			if (!padding) {
				return elementAtRectPoints(start_element, rect);
			}

			return true;
		} else {
			return false;
		}

		function isElementVisible(element) {

			var context = getViewContext(element),
			    ctx_rect;

			if (!context) {
				return false;
			}

			// Get the context rectangle
			ctx_rect = context.getBoundingClientRect();

			// The current element and the start element
			// both have to collide with the current context rectangle
			// (if the current element equals the start_element we only need
			//  to check the modified rect to the ctx_rect)
			if (   (element == start_element || collides(element, ctx_rect))
				&& collides(rect, ctx_rect)) {

				// If the context element is the document element,
				// no further checks are needed
				if (isDocumentElement(context)) {
					return true;
				}

				// Recursively see if the current context is visible
				return isElementVisible(context);
			}

			return false;
		}
	}

	// Cross browser method to get style properties:
	if (window.getComputedStyle) {
		getStyle = function getStyle(el) {
			return document.defaultView.getComputedStyle(el, null);
		};
	} else {
		getStyle = function getStyle(el) {
			return el.currentStyle || {};
		};
	}

	// Set the 'isVisible' method on the element prototype
	Blast.definePrototype('HTMLElement', 'isVisible', isVisible, true);
};

addIsVisible();