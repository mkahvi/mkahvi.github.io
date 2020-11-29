// by M.K.A. 2013–2020
// last updated: 2020-11-29 (ensure parseInt doesn't do weird stuff)
// previous updates:
// - 2020-11-27 (fix fractionalize using parseInt instead of parseFloat; minor modernization)
// - 2020-06-25 (fix for decimals in distances)
// - 2017-05-25

// dierolling

var dresult = document.getElementById('dresult');

/*
var form = document.getElementById('form');
*/

var rollform;
var dmroll;

// repeats above
window.onload = setup_math;
function setup_math() {
	if (dresult == null)
		dresult = document.getElementById('dresult');

	dmroll = document.getElementById('dmroll');
	rollform = document.getElementById('rollform');

	if (dmroll.value.length == 0)
		dmroll.value = "3d6+6+2d4 example 1;2#1d20 example 2";

	/*
	// submit on Enter keypress
	function submitForm(e) { if(e.keyCode === 13) { form.submit(); } }
	
	document.addEventListener('keypress', function() {submitForm(event)}, false);
	*/

	if (window.location.hash)
		hashChanged();

	if ("onhashchange" in window) // does the browser support the hashchange event?
		window.onhashchange = hashChanged;
}

function hashChanged() {
	var n = decodeURIComponent(window.location.hash).split('roll=')[1];
	if (n) {
		dmroll.value = decodeURIComponent(window.location.hash).split('roll=')[1];
		dieparse(rollform);
	}
}

/*
document.addEventListener("DOMContentLoaded", setup, false); // HTML5; Doesn't work in Chrome 35 for some reason
*/

// <-- START DIEROLL
var DieRoll = function (count = 1, size = 1, positive = true) {
	console.log(`+ DieRoll(count: ${count}, size: ${size}, positive: ${positive})`);
	this.count = (isNaN(count) ? 1 : count);
	this.size = (isNaN(size) ? 1 : size);
	this.positive = (positive ? true : false);
};

DieRoll.prototype.count = 1;
DieRoll.prototype.size = 1;
DieRoll.prototype.positive = 1;

DieRoll.prototype.min = function () { return (this.positive ? this.count : -(this.count * this.size)); }
DieRoll.prototype.max = function () { return (this.positive ? (this.count * this.size) : -(this.count)); }

DieRoll.prototype.roll = function () {
	var tmp;
	var results = new Array();
	if (this.size > 1) {
		for (var i = 0; i < this.count; i++) {
			tmp = Math.floor(Math.random() * this.size) + 1;
			results.push(this.positive ? tmp : -tmp);
		}
	} else {
		results.push(this.positive ? this.count : -this.count);
	}
	return results;
}

DieRoll.prototype.toString = function () { return (this.positive ? '' : '-') + this.count + (this.size > 1 ? ('d' + this.size) : ''); }

// <-- END DIEROLL

const showPlus = (num) => (num < 0) ? num : ('+' + num);

// handles only #d#+# format
function dieparse(form) {
	console.log("Parsing die roll...");

	var multiroll, roll, count, repeat, die, mod, tmp, header = null, cond = null;

	cleardieroll();

	multiroll = (form.roll.value).split(';');
	console.log("... found " + multiroll.length + " formula(e)");

	//dresult.innerHTML += "DEBUG mroll source :: " + form.roll.value + "<br>";
	//dresult.innerHTML += "DEBUG mroll result :: " + multiroll + "<br>";

	for (var mrpass = 0; mrpass < multiroll.length; mrpass++) { // start multiroll
		//dresult.innerHTML += "DEBUG mroll pass :: " + mrpass + "<br>";

		roll = multiroll[mrpass].trim();
		hroff = roll.search(' ');
		if (hroff > 0) {
			header = roll.substr(hroff).trim();
			roll = roll.substr(0, hroff).trim();
		}

		//dresult.innerHTML += "DEBUG roll :: " + roll + "<br>";
		//dresult.innerHTML += "DEBUG header :: " + header + "<br>";

		// SUCCESS CONDITION
		tmp = roll.split('>', 2);
		if (tmp.length == 2) {
			roll = tmp[0];
			cond = '>' + tmp[1];
		} else {
			tmp = roll.split('<', 2);
			if (tmp.length == 2) {
				roll = tmp[0];
				cond = '<' + tmp[1];
			}
		}

		// ROLL REPEATING
		tmp = roll.split('#', 2);
		if (tmp.length == 2) {
			repeat = parseInt(tmp[0], 10);
			if (isNaN(repeat))
				repeat = 1;
			roll = tmp[1];
		} else {
			repeat = 1;
			roll = tmp[0];
		}

		// PARSE ROLLS
		rolls = new Array();
		tmprx = roll.split(/(?=[-\+])/g);
		//dresult.innerHTML += "DEBUG :: " + tmprx + "<br>"
		for (i in tmprx) {
			wst = tmprx[i];
			positive = !(wst[0] == '-');
			if (wst[0] == '-' || wst[0] == '+')
				wst = wst.substr(1);
			ws = wst.split('d', 2);
			nrcount = parseInt(ws[0], 10);
			nrdie = parseInt(ws[1], 10);
			if (!isNaN(nrcount)) // discard non-numbers and pointless zeroes
				rolls.push(new DieRoll(nrcount, nrdie, positive));
		}

		//dresult.innerHTML += "DIES :: " + rolls + "<br>";

		if (header) dresult.innerHTML += '<b>' + header + '</b><br>';

		if (rolls.length == 0) {
			dresult.style.visibility = 'visible';
			dresult.innerHTML += "couldn't parse input<br>";
			return;
		}
		//dresult.innerHTML += "DEBUG rolls: " + rolls.length + "<br>";

		printrange(rolls);
		//dresult.innerHTML += "DEBUG: " + typeof(rolls) + " :: " + rolls + " :: " + multiroll.length + "<br>";
		for (var i = 0; i < repeat; i++)
			printdieroll(rolls, cond);

		if (mrpass < multiroll.length - 1) dresult.innerHTML += '<br>';
	} // end multiroll
}

function roller(count, die) {
	var results = new Array();
	for (var i = 0; i < count; i++)
		results.push(Math.floor(Math.random() * die) + 1);
	return results;
}

function dieroll(form) {
	console.log("Parsing simple die roll...");

	var die = parseInt(form.die.value, 10),
		mod = parseInt(form.mod.value, 10),
		count = parseInt(form.count.value, 10),
		repeat = parseInt(form.repeat.value, 10),
		header = null;

	// enforce some sanity
	if (count < 1) form.count.value = (count = 1);
	if (repeat < 1) form.repeat.value = (repeat = 1);
	if (die < 1) form.size.value = (die = 1);

	// clear output
	cleardieroll();

	var rolls = new Array();
	rolls.push(new DieRoll(count, die, true));
	rolls.push(new DieRoll(mod, 0, true));

	printrange(rolls)
	for (var i = 0; i < repeat; i++)
		printdieroll(rolls);

	// print manual roll
	document.getElementById('dmroll').value = (repeat > 1 ? (repeat + '#') : '') + count + 'd' + die + (mod < 0 ? '' : '+') + mod;

	return false;
}

const cleardieroll = () => dresult.innerHTML = '';

function printrange(rolls) {
	console.log("... Calculating roll range");
	dresult.style.visibility = 'visible';

	//dresult.innerHTML += "DEBUG: " + rolls + "<br>";

	dresult.innerHTML += (rolls.join('+').replace('+-', '-')) + ', range: ';
	var min = 0, max = 0;
	for (i in rolls) {
		min += rolls[i].min();
		max += rolls[i].max();
	}

	dresult.innerHTML += min + (min != max ? ' - ' + max : "");
	let avg = ((min + max) / 2);
	dresult.innerHTML += ', average: ' + avg + '<br>';
	console.log(`   = ${min} to ${max} with average of ${avg}`);
}

// pad static number
const padStNum = (str) => "<span class='roll'>" + str + "</span>";
const padMaxNum = (str) => "<span class='roll max'>" + str + "</span>";
const padMinNum = (str) => "<span class='roll min'>" + str + "</span>";
const arrSum = (a, b) => a + b;

function printdieroll(rolls, condition = null) {
	console.log("... Printing die rolls ", rolls);
	if (typeof condition === 'undefined') condition = null; // default value for cond

	dresult.style.visibility = 'visible';

	var results = new Array();
	var total = 0, max = 0, min = 0;

	var tr = 0;
	for (i = 0; i < rolls.length; i++) {
		tr = rolls[i].roll();
		trsum = tr.reduce(arrSum, 0);
		total += trsum;

		min += rolls[i].min();
		max += rolls[i].max();
		results.push(tr);
		dresult.innerHTML += rolls[i];
		if (rolls[i].die > 1) {
			dresult.innerHTML += ' [';
			if (tr.length > 1) {
				for (sr = 0; sr < tr.length; sr++) {
					dresult.innerHTML += "<span class='tooltip roll" + (rolls[i].die == tr[sr] ? ' max' : (1 == tr[sr] ? ' min' : '')) + "'>" + tr[sr] + '</span>';
					if (sr < tr.length - 1)
						dresult.innerHTML += ', ';
				}
				dresult.innerHTML += ' = ';
			}
			dresult.innerHTML += '<b>' + trsum + '</b>]';
		} else {
			// Nothing
		}
		//dresult.innerHTML += "<br>";
		if (i < rolls.length - 1) {
			dresult.innerHTML += ' + ';
		}
	}
	dresult.innerHTML += '<br>';

	dresult.innerHTML += "= <b><span class='" + (total == max ? 'max' : '') + "'>" + (total) + '</span></b>'
	match = false;
	if (condition) {
		var greaterthan = null, lesserthan = null;
		if (condition[0] == '>') {
			greaterthan = parseInt(condition.substr(1), 10);
		} else if (condition[0] == '<') {
			lesserthan = parseInt(condition.substr(1), 10);
		}

		if (greaterthan && total > greaterthan) {
			dresult.innerHTML += ' <b>&gt; ' + greaterthan + ' match</b>';
			match = true;
		} else if (lesserthan && total < lesserthan) {
			dresult.innerHTML += ' <b>&lt; ' + lesserthan + ' match</b>';
			match = true;
		} else {
			dresult.innerHTML += ' mismatch (' + condition + ')';
		}
	}

	percentage = ((total - min) / (max - min)) * 100;
	if (!isNaN(percentage))
		dresult.innerHTML += ` [${percentage.toFixed(1)}%]`;

	dresult.innerHTML += '<br>';
	//dresult.innerHTML += 'DEBUG :: Min: ' + min + ', Max: ' + max + '<br>';

	window.location.hash = "roll=" + encodeURIComponent(document.getElementById('dmroll').value);

	return match;
}

const deca = 10,
	hecto = 100,
	kilo = 1000,
	inchesInFeet = 12,
	inchesInYard = 36,
	cmInInch = 2.54,
	feetInMile = 5280,
	feetInNMile = 1852;

// conversions
const cm2in = (cms) => cms / cmInInch;
const in2cm = (inches) => inches * cmInInch;
const in2ft = (inches) => inches / inchesInFeet;
const ft2in = (feet) => feet * inchesInFeet;
const ft2mi = (feet) => feet / feetInMile;
const m2nmi = (meters) => meters / feetInNMile;
const m2cm = (meters) => meters * hecto;
const in2yd = (inches) => inches / inchesInYard;
const yd2in = (yards) => yards * inchesInYard;
const m2km = (meters) => meters / kilo;
const km2m = (km) => km * kilo;
const cm2m = (cm) => cm / hecto;
const mi2ft = (mi) => mi * feetInMile;
const nmi2m = (nmi) => nmi * feetInNMile;

function distances(form, origin) {
	switch (origin) {
		case 'cm': //form.centimeters.value
			form.meters.value = cm2m(parseFloat(form.centimeters.value));
			form.kilometers.value = m2km(form.meters.value);
			form.inches.value = cm2in(form.centimeters.value);
			form.feet.value = in2ft(form.inches.value);
			form.miles.value = ft2mi(form.feet.value);
			form.nmiles.value = m2nmi(form.meters.value);
			form.yards.value = in2yd(form.inches.value);
			break;
		case 'm': //form.meters.value
			form.centimeters.value = m2cm(parseFloat(form.meters.value));
			form.kilometers.value = m2km(form.meters.value);
			form.inches.value = cm2in(form.centimeters.value);
			form.feet.value = in2ft(form.inches.value);
			form.miles.value = ft2mi(form.feet.value);
			form.nmiles.value = m2nmi(form.meters.value);
			form.yards.value = in2yd(form.inches.value);
			break;
		case 'km': //form.kilometers.value
			form.meters.value = km2m(parseFloat(form.kilometers.value));
			form.centimeters.value = m2cm(form.meters.value);
			form.inches.value = cm2in(form.centimeters.value);
			form.feet.value = in2ft(form.inches.value);
			form.miles.value = ft2mi(form.feet.value);
			form.nmiles.value = m2nmi(form.meters.value);
			form.yards.value = in2yd(form.inches.value);
			break;
		case 'in': //form.inches.value
			form.centimeters.value = in2cm(parseFloat(form.inches.value));
			form.meters.value = cm2m(form.centimeters.value);
			form.kilometers.value = m2km(form.meters.value);
			form.feet.value = in2ft(form.inches.value);
			form.miles.value = ft2mi(form.feet.value);
			form.nmiles.value = m2nmi(form.meters.value);
			form.yards.value = in2yd(form.inches.value);
			break;
		case 'ft': // form.feet.value
			form.inches.value = ft2in(parseFloat(form.feet.value));
			form.centimeters.value = in2cm(form.inches.value);
			form.meters.value = cm2m(form.centimeters.value);
			form.kilometers.value = m2km(form.meters.value);
			form.miles.value = ft2mi(form.feet.value);
			form.nmiles.value = m2nmi(form.meters.value);
			form.yards.value = in2yd(form.inches.value);
			break;
		case 'mi': // form.miles.value
			form.feet.value = mi2ft(parseFloat(form.miles.value));
			form.inches.value = ft2in(form.feet.value);
			form.centimeters.value = in2cm(form.inches.value);
			form.meters.value = cm2m(form.centimeters.value);
			form.kilometers.value = m2km(form.meters.value);
			form.yards.value = in2yd(form.inches.value);
			form.nmiles.value = m2nmi(form.meters.value);
			break;
		case 'nmi': // form.nmiles.value
			form.meters.value = nmi2m(parseFloat(form.nmiles.value));
			form.kilometers.value = m2km(form.meters.value);
			form.centimeters.value = m2cm(form.meters.value);
			form.inches.value = cm2in(form.centimeters.value);
			form.feet.value = in2ft(form.inches.value);
			form.yards.value = in2yd(form.inches.value);
			form.miles.value = ft2mi(form.feet.value);
			break;
		case 'yd': // form.yards.value
			form.inches.value = yd2in(parseFloat(form.yards.value));
			form.feet.value = in2ft(form.inches.value);
			form.centimeters.value = in2cm(form.inches.value);
			form.meters.value = cm2m(form.centimeters.value);
			form.kilometers.value = m2km(form.meters.value);
			form.miles.value = ft2mi(form.feet.value);
			form.nmiles.value = m2nmi(form.meters.value);
			break;
	}
}

const fahrenheitNum = 32;
const kelvinNum = 273.15;
const kfNum = 459.67;

function temperatures(form, origin) {
	switch (origin) {
		case 'C':
			// −273.15 to infinity
			//form.celsius.value
			var tn = parseFloat(form.celsius.value);
			form.kelvin.value = tn + kelvinNum;
			form.fahrenheit.value = tn * (9 / 5) + fahrenheitNum;
			break;
		case 'F':
			// −459.67 to infinity
			var tn = parseFloat(form.fahrenheit.value);
			if (isNaN(tn)) tn = NaN;
			form.celsius.value = (tn - fahrenheitNum) * (5 / 9);
			form.kelvin.value = tn + kfNum * (5 / 9);
			break;
		case 'K':
			// 0 to infinity
			var tn = parseFloat(form.kelvin.value);
			form.celsius.value = tn - kelvinNum;
			form.fahrenheit.value = tn * (9 / 5) - kfNum;
			break;
	}
}

function circle(form, origin) {
	switch (origin) {
		case 'area':
			form.diameter.value = Math.sqrt(parseFloat(form.area.value) / Math.PI) * 2;
			form.circumference.value = Math.PI * form.diameter.value;
			break;
		case 'circ':
			form.diameter.value = parseFloat(form.circumference.value) / Math.PI;
			form.area.value = Math.PI * Math.pow(form.diameter.value / 2, 2);
			break;
		case 'dia':
			form.area.value = Math.PI * Math.pow(parseFloat(form.diameter.value) / 2, 2);
			form.circumference.value = Math.PI * form.diameter.value;
			break;
	}
}

// tooltips
// Should be compatible with major browsers according to:
//  * http://www.quirksmode.org/dom/w3c_events.html
//  * http://www.quirksmode.org/dom/w3c_cssom.html
function tip_show(event, elemId) {
	var obj = document.getElementById(elemId);
	if (obj) {
		// placement
		obj.style.left = `${(event.clientX - 20)}px`;
		obj.style.top = `${(event.clientY + 20)}px`;
		// make it visible
		obj.style.visibility = "visible";
	}
}

function tip_hide(elemId) {
	var obj = document.getElementById(elemId);
	if (obj) obj.style.visibility = "hidden";
}

function labeltoggle(chkbox, labelid, yestext, notext) {
	var label = document.getElementById(labelid);
	label.innerHTML = chkbox.checked ? yestext : notext;
}

// GCD math

function gcd(g1, g2) {
	var gcd = 1;
	if (g1 > g2) {
		// swap order
		// [g1,g2] = [g2,g1]; // ECMAScript 6, how to detect support for this? // works in Firefox, not in Chrome
		g2 = [g1, g1 = g2][0]; // should work for older browsers
	}
	if (g2 % g1 == 0) {
		gcd = g1;
	} else {
		var i = (g1 / 2) | 0;
		do {
			if ((g1 % i == 0) && (g2 % i == 0)) {
				gcd = i;
				break;
			}
		} while (i-- > 0);
	}
	return gcd;
}

var sortHiToLo = (n1, n2) => n2 - n1; // highest to lowest
var sortLoToHi = (n1, n2) => n1 - n2; // lowest to highest

//function gcdmulti(nums,dbg) {
function gcdmulti(nums) {
	console.log("gcdmulti().input: ", nums);
	var gcd = 1;
	if (nums.length < 2) { return gcd; } // failsafe
	nums.sort(sortHiToLo);

	console.log("gcdmulti() performing simple lookup among input");
	// This looks up potential GCD among the input values
	var match = true;
	// simple check for gcd
	var div = nums[nums.length - 1];
	for (var i = 0; i < nums.length - 1; i++) {
		if (nums[i] % div != 0) {
			match = false;
			break;
		}
	}

	//dbg.gcddebug.value = dbg.gcddebug.value + ' fail:m:' + div
	if (match) return gcd = div;

	console.log("gcdmulti() performing thorough lookup");
	var i = div / 2 | 0;
	do {
		match = true;
		for (var i2 = 0; i2 < nums.length; i2++) {
			// if divisable, we do nothing with it, test the other numbers
			if (nums[i2] % i != 0) {
				// not divisable, try the next number
				match = false;
				break;
			}
		}
		if (match) {
			gcd = i; // since we didn't skip above, this number Must be correct
			//dbg.gcddebug.value = dbg.gcddebug.value + ' def:' + i
			break;
		}
	} while (i-- > 1);

	// 30,9,6,900,600,12 = 3
	// 60,9,6 GCD: 3
	return gcd;
}

/*
function lcm(a, b) {
	var n1 = (a / gcd(a,b)) * b;
	return n1;
}

function lcdform(form) {
	var n1 = form.lcdin1.value.split('/', 2);
	var a1 = new Number(n1[0]), b1 = new Number(n1[1]);
	var n2 = form.lcdin2.value.split('/', 2);
	var a2 = new Number(n2[0]), b2 = new Number(n2[1]);
	form.lcdout.value = a1 + '/' + b1;
	if (isNaN(a1) || isNaN(b1) || isNaN(a2) || isNaN(b2)) {
		return false;
	}
	var n = Math.abs(a1*b1)/gcd(b1,b2);
	
	form.lcdout.value = n;
	form.lcddebug.value = n + ' :: ' + a1*n + '/' + b1*n + ' + ' + a2*n + '/' + b2*n + ' :: ' + lcm(a1,b1);
}
*/

function gcdmultiform(form) {
	var n = form.gcdin.value.split(',');

	for (var i = 0; i < n.length; i++) {
		n[i] = parseInt(n[i], 10);
		if (isNaN(n[i])) {
			form.gcdout.value = `[${n}]`;
			return false;
		}
	}
	n.sort(sortHiToLo);
	//form.gcddebug.value = n + ' ' + n[n.length-1];
	var g = gcdmulti(n);
	form.gcdout.value = g;
	return true;
}


function gcdform(form) {
	var g1 = parseInt(form.gcdin1.value, 10),
		g2 = parseInt(form.gcdin2.value, 10);

	form.gcdout.value = `[${g1} / ${g2}]`;
	if (isNaN(g1) || isNaN(g2)) return; // break out if bad input

	var g = gcd(g1, g2);
	form.gcdout.value = g;
	return g;
}

function fraction(form) {
	// e.g. 0.75 = (75, 100)
	var n = parseFloat(form.fractionin.value);
	console.log("fraction().input:", n);

	form.fractionout.value = `[${n}]`;

	if (isNaN(n)) return;

	let shifts = 0;
	while (((n * 10) % 10) != 0) {
		n *= 10;
		shifts += 1;
	}
	var fract = (1 * Math.pow(10, shifts)) | 0;
	form.fractionout.value = `${n} / ${fract}`;
	return [n, fract];
}

function simplify(form) {
	var n1 = parseInt(form.sin1.value, 10),
		n2 = parseInt(form.sin2.value, 10);
	// e.g. 108/24 = (108/gcd)/(24/gcd) = 9/2

	form.sout1.value = `[${n1}]`;
	form.sout2.value = `[${n2}]`;
	if (isNaN(n1) || isNaN(n2)) return; // break out if bad input

	var g = gcd(n1, n2);
	form.sout1.value = n1 / g;
	form.sout2.value = n2 / g;
	return (n1 / g, n2 / g);
}

function simplifyfract(form) {
	var tmp = form.fractionout.value.split(' / ');
	var n1 = parseInt(tmp[0], 10),
		n2 = parseInt(tmp[1], 10);

	form.fractionout.value = `[${n1} / ${n2}]`;
	if (isNaN(n1) || isNaN(n2)) return; // don't break on bad input

	var g = gcd(n1, n2);
	form.fractionout.value = `${n1 / g} / ${n2 / g}`;
}
