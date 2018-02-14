var less_options,
    is_dev_mode,
    Creatures,
    creatures,
    exec_dir,
    cwd_dir,
    libpath = require('path'),
    realfs = require('fs'),
    Blast,
    temp,
    acom,
    capp,
    less = require('less'),
    NeDB = require('nedb'),
    fs = require('graceful-fs'),
    db;

// Error catcher
window.addEventListener('error', function onError(event) {
	debug('Uncaught Error in: "' + event.filename + ' @ ' + event.lineno, event.message);
});

// Monkey-patch fs please
fs.gracefulify(realfs);

// Enable global protoblast in the node.js context
temp = require('creatures/node_modules/protoblast')(true);

// Get the Blast path for in the browser context
temp = temp.getClientPath();

// Just eval it, document.write is no longer synchronous
eval(fs.readFileSync(temp, 'utf8'));
Blast = __Protoblast;

// Only meant for older nwjs versions, newer ones also have NaCl
is_dev_mode = window.navigator.plugins.namedItem('Native Client') !== null;

exec_dir = libpath.dirname(process.execPath);

// Create the database instance
db = new NeDB({
	filename : libpath.join(require('nw.gui').App.dataPath, 'albian_command.db'),
	autoload : true
});

/**
 * Debug handler that show the message in an alert
 */
function debug(message) {

	var result = '',
	    entry,
	    i;

	if (is_dev_mode) {
		return console.log.apply(console, arguments);
	}

	for (i = 0; i < arguments.length; i++) {
		entry = arguments[i];

		if (typeof entry == 'object') {
			entry = JSON.stringify(entry, null, 4);
		}

		result += entry + '\n';
	}

	alert(result);
}

if (is_dev_mode) {
	// This can be called on any version,
	// but the tools will be empty in the regular version
	nw.Window.get().showDevTools();

	// Open the background devtools
	chrome.developerPrivate.openDevTools({
		renderViewId: -1,
		renderProcessId: -1,
		extensionId: chrome.runtime.id
	});
}

less_options = {
	paths : [
		'.',
		libpath.resolve(process.cwd(), 'stylesheets')
	]
};

// Yeah, it renders on every load. Sue me
less.render(fs.readFileSync('./stylesheets/style.less', 'utf8'), less_options, function gotResult(err, result) {
	document.getElementById('mainstyle').innerHTML = result.css;
});

// Require the creatures class
Creatures = require('creatures');

// Create the Creatures application instance
capp = new Creatures();