var $list_body  = $('.creatures-tbody'),
    $sidelinks  = $('.sidebar a'),
    cc_queue    = Function.createQueue({enabled: true, limit: 2});
    $tabs       = $('.tabpage'),
    Fn          = Blast.Bound.Function;

// Create the Albian Command class instance
acom = new Blast.Classes.Develry.Creatures.AlbianCommand();

$.contextMenu({
	selector: '.action[data-action="teleport"]',
	trigger: 'none',
	build: function buildMenu($trigger, e) {
		return $trigger[0].teleport_menu;
	}
});

$.contextMenu({
	selector: '.action[data-action="inseminate"]',
	trigger: 'none',
	build: function buildMenu($trigger, e) {
		return $trigger[0].inseminate_menu;
	}
});

$.contextMenu({
	selector: '.action[data-action="pregnancy"]',
	trigger: 'none',
	build: function buildMenu($trigger, e) {
		return $trigger[0].pregnancy_menu;
	}
});

$.contextMenu({
	selector: '.action[data-action="warp"]',
	trigger: 'none',
	build: function buildMenu($trigger, e) {
		return $trigger[0].warp_menu;
	}
});

/**
 * Create and return a canvas where the creature's head will go
 */
function createCreatureCanvas(creature) {

	var s16image = document.createElement('s16-image');

	cc_queue.add(function getBodyPart(done) {

		// And get the head s16 file
		creature.getBodyPartImage('head', function gotHead(err, s16) {

			if (err) {
				done();
				throw err;
			}

			if (!s16) {
				done();
				console.warn('Could not found head for creature', creature.moniker);
				return;
			}

			s16image.image = s16.images[28];
			done();
		});
	});

	return s16image;
}

$('body').on('click', '.accordion-opener', function onClick(e) {

	var $this = $(this),
	    $accordion = $this.parents('.accordion');

	// If it already hase the active class, remove it
	if ($accordion.hasClass('active')) {
		return $accordion.removeClass('active');
	}

	$('.accordion').removeClass('active');
	$accordion.addClass('active');
});

/**
 * Make tables sortable
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
function makeSortable(table) {
	var $table = $(table),
	    $thead = $('thead', $table).first(),
	    $ths = $('th', $table);

	$table.addClass('sortable');

	$ths.on('click', function onClick(e) {

		var $th = $(this),
		    siblings = Array.cast(this.parentElement.children),
		    th_index = siblings.indexOf(this),
		    direction = this.dataset.sortDirection || -1;
		    temp_table = [];

		// Reverse the sort order
		direction *= -1;
		this.dataset.sortDirection = direction;

		$('tbody', $table).each(function eachBody(index) {
			var $first_row = $('tr', this).first(),
			    value_element = $first_row[0].children[th_index],
			    value;

			if (value_element.hasAttribute('data-sort-value')) {
				value = value_element.getAttribute('data-sort-value');
			} else {
				value = value_element.textContent;
			}

			if (Number.isNumeric(value)) {
				value = Number(value);
			}

			temp_table.push({
				element    : this,
				sort_value : value
			});
		});

		// Sort the values
		temp_table.sortByPath(direction, 'sort_value');

		temp_table.forEach(function eachEntry(entry) {
			$thead.after(entry.element);
		});
	});
}

elementAppears('make-sortable', {live: true}, function gotTable(table) {
	makeSortable(table);
});