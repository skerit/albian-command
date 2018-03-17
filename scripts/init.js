var less_options,
    focus_waiter,
    AlbianBabel,
    is_dev_mode,
    machine_id,
    process_id,
    Creatures,
    creatures,
    exec_dir,
    cwd_dir,
    package,
    counter = 0,
    libpath = require('path'),
    realfs = require('fs'),
    Blast,
    temp,
    acom,
    capp,
    less = require('less'),
    NeDB = require('nedb'),
    gui = require('nw.gui'),
    win = gui.Window.get(),
    fs = require('graceful-fs'),
    db;

// Error catcher
window.addEventListener('error', function onError(event) {
	if (is_dev_mode) {
		return console.error('Uncaught error:', event.error);
	}
	debug('Uncaught Error in: "' + event.filename + ' @ ' + event.lineno, event.message);
});

// Only meant for older nwjs versions, newer ones also have NaCl
is_dev_mode = window.navigator.plugins.namedItem('Native Client') !== null;

package = require('./package.json');

// Monkey-patch fs please
fs.gracefulify(realfs);

console.log('Requiring Background Protoblast...');

// Enable global protoblast in the node.js context
try {
	temp = require('protoblast');
} catch (err) {
	temp = require('creatures/node_modules/protoblast');
}

temp = temp(true);

console.log('Background Protoblast has loaded');

// Get the Blast path for in the browser context
temp = temp.getClientPath();

// Just eval it, document.write is no longer synchronous
eval(fs.readFileSync(temp, 'utf8'));
Blast = __Protoblast;

exec_dir = libpath.dirname(process.execPath);

// Create the database instance
db = new NeDB({
	filename : libpath.join(gui.App.dataPath, 'albian_command.db'),
	autoload : true
});

// Open new windows in external browser!
win.on('new-win-policy', function onNewWindowRequest(frame, url, policy) {
	gui.Shell.openExternal(url);
	policy.ignore();
});

window.addEventListener('focus', function onFocus(e) {
	if (focus_waiter) {
		Blast.setImmediate(focus_waiter);
		focus_waiter = null;
	}
});

/**
 * Choose a directory
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.1
 * @version  0.1.1
 */
function chooseDirectory(callback) {
	var chooser = document.createElement('input'),
	    value;

	chooser.setAttribute('type', 'file');
	chooser.setAttribute('nwdirectory', 'nwdirectory');

	chooser.addEventListener('change', function onChange(e) {
		value = this.value;

		if (!callback) {
			return console.error('Callback already nullified!');
		}

		callback(null, value);
		callback = null;
	});

	focus_waiter = function documentGotFocus() {

		setTimeout(function doCallback() {
			if (callback) {
				console.log('chooseDirectory timeout, no choice made? Value is', chooser.value);
				callback(null);
			}
		}, 1000);
	};

	chooser.click();
}

/**
 * Create an object id
 */
function createObjectId() {

	var result,
	    count,
	    time;

	// Start with 4 bytes for the time in seconds
	time = parseInt(Date.now()/1000).toString(16).slice(0, 8);
	result = time;

	// Add the machine identifier
	if (!machine_id) {
		machine_id = Math.abs(Blast.Bound.String.fowler(navigator.userAgent)).toString(16);

		if (machine_id.length < 6) {
			machine_id += result;
		}

		// Get the first 6 pieces
		machine_id = machine_id.slice(0, 6);
	}

	result += machine_id;

	if (!process_id) {
		process_id = Blast.Classes.Crypto.pseudoHex().slice(0, 4);
	}

	result += process_id;

	// Create the counter
	count = (counter++).toString(16);

	if (count.length < 6) {
		count = Blast.Bound.String.multiply('0', 6 - count.length) + count;
	}

	result += count;

	return result;
}

/**
 * Debug handler that show the message in an alert
 */
function debug(message) {

	var result = '',
	    entry,
	    i;

	if (is_dev_mode) {
		console.log.apply(console, arguments);
		console.trace();
		return;
	}

	for (i = 0; i < arguments.length; i++) {
		entry = arguments[i];

		if (typeof entry == 'object') {
			entry = JSON.stringify(entry, null, 4);
		}

		result += entry + '\n';
	}

	acom.log(result);

	alert(result);
}

/**
 * Show an error message
 */
function alertError(err, prefix) {

	var result;

	if (!prefix) {
		prefix = 'Error:';
	}

	result = prefix + '\n' + Blast.Bound.String.multiply('-', 5+prefix.length);
	result += '\n\n';

	if (err.type == 'window' && err.req) {
		result += 'Was waiting for a window with title';
		result += '\n\n"' + err.req.command + '"\n\n';
		result += 'but it didn\'t appear.';
	} else {
		result += err;
	}

	acom.log(result);

	console.error('Show error:', err, result);
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
	if (err) {
		throw err;
	}

	document.getElementById('mainstyle').innerHTML = result.css;
});

// Require the creatures class
var CreaturesApplication = require('creatures');

// Get the Creatures namespace
Creatures = Function.getNamespace('Develry.Creatures');

// Require Albian Babel network
AlbianBabel = require('albian-babel');

// Create the Creatures application instance
capp = new CreaturesApplication();