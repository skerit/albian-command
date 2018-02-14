var $list_body  = $('.creatures-tbody'),
    $sidelinks  = $('.sidebar a'),
    $tabs       = $('.tabpage'),
    Fn          = Blast.Bound.Function;

// Create the Albian Command class instance
acom = new Blast.Classes.Develry.Creatures.AlbianCommand();



/**
 * Create and return a canvas where the creature's head will go
 */
function createCreatureCanvas(creature) {

	var s16image = document.createElement('s16-image');

	// And get the head s16 file
	creature.getBodyPartImage('head', function gotHead(err, s16) {

		var smile;

		console.log('Got head?', err, s16)

		if (err) {
			throw err;
		}

		s16image.image = s16.images[28];
	});

	return s16image;
}

//<canvas id="s16test" width=50 height=50 style="background:black;width:100px;height:100px;border: 1px solid red"></canvas>
// var s16 = new Blast.Classes.Develry.Creatures.S16(capp, 'C:\\GOG Games\\Creatures 2\\Images\\A00a.S16');
// s16.load(function done(err) {

// 	var entry = s16.images[10];

// 	//debug('Rgba is ready:', entry.rgba.length, 'should be', entry.width * entry.height * 4)
// 	//debug('Has imagedata cs: ', entry)

// 	try {
// 		var imagedata = new ImageData(entry.rgba, entry.width, entry.height);
// 	} catch (err) {
// 		debug('Err: ' + err)
// 		return;
// 	}

// 	try {
// 		var canvas,
// 		    ctx;

// 		canvas = document.getElementById('s16test');
// 		canvas.width = entry.width;
// 		canvas.height = entry.height;
// 		ctx = canvas.getContext('2d');
// 		ctx.putImageData(imagedata, 1, 1);
// 	} catch (err) {
// 		debug('Put err: ' + err);
// 	}

// });

