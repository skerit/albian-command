var $list_body  = $('.creatures-tbody'),
    $sidelinks  = $('.sidebar a'),
    $tabs       = $('.tabpage'),
    Fn          = Blast.Bound.Function;

// Create the Albian Command class instance
acom = new Blast.Classes.Develry.Creatures.AlbianCommand();

$.contextMenu({
	selector: '.action[data-action="Teleport"]',
	trigger: 'none',
	build: function buildMenu($trigger, e) {
		return $trigger[0].teleport_menu;
	}
});

/**
 * Create and return a canvas where the creature's head will go
 */
function createCreatureCanvas(creature) {

	var s16image = document.createElement('s16-image');

	// And get the head s16 file
	creature.getBodyPartImage('head', function gotHead(err, s16) {

		if (err) {
			throw err;
		}

		s16image.image = s16.images[28];
	});

	return s16image;
}