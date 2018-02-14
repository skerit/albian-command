function elementAppears(query, options, callback) {

	var intervalId,
	    elements,
	    queue,
	    live;

	if (typeof options == 'function') {
		callback = options;
		options = {};
	}

	if (typeof query == 'object') {
		elements = Blast.Bound.Array.cast(query);
	} else {
		if (options.live) {
			if (query.indexOf('.') > -1 || query.indexOf('#') > -1) {
				throw new Error('Live appearances require a single classname');
			}

			elements = document.getElementsByClassName(query);
			live = true;
		} else {
			elements = Blast.Bound.Array.cast(document.querySelectorAll(query));
			live = false;
		}
	}

	if (typeof options.interval != 'number') {
		options.interval = 5000;
	}

	// Don't go below 100ms
	if (options.interval < 100) {
		options.interval = 100;
	}

	// Create a new function queue
	queue = Function.createQueue();

	// Wait at least 330ms between executions
	queue.throttle = options.throttle || 330;

	// Only 1 execution at a time
	queue.limit = 1;

	// Start the queue
	queue.start();

	// Listen to the scroll and click event
	document.addEventListener('wheel', req, {passive: true});
	document.addEventListener('scroll', req, {passive: true});
	document.addEventListener('click', req, {passive: true});

	// Request a check
	function req() {
		if (!queue._queue.length) {
			queue.add(check);
		}
	}

	// The actual check
	function check() {

		var el,
		    i;

		// Return early if no elements need to be checked
		if (!elements.length) {
			return;
		}

		for (i = 0; i < elements.length; i++) {
			el = elements[i];

			if (el.isVisible(options.padding)) {
				if (live) {
					el.classList.remove(query);
				} else {
					elements.splice(i, 1);
				}

				i--;
				callback(el);

				// If delay_callback is true,
				// wait until the next check to call another item
				if (options.delay_callback) {
					req();
					break;
				}
			}
		}

		// Stop all future checks if no elements are left and it's not live
		if (!live && !elements.length) {
			document.removeEventListener('wheel', req);
			document.removeEventListener('click', req);
			document.removeEventListener('scroll', req);

			clearInterval(intervalId);
			queue.destroy();
		}
	}

	// Request a check every so many milliseconds
	intervalId = setInterval(req, options.interval);

	// Request the initial check
	req();

	return check;
}