// by M.K.A. 2013–2017
// last updated: 2017-05-25

// dierolling

var dresult = document.getElementById('dresult');

/*
var form = document.getElementById('form');
*/

var rollform;
var dmroll;

// repeats above
window.onload = setup_math;
function setup_math()
{
	if (dresult == null) {
		dresult = document.getElementById('dresult');
	}
	dmroll = document.getElementById('dmroll');
	rollform = document.getElementById('rollform');
	if (dmroll.value.length == 0) {
		dmroll.value = "3d6+6+2d4 example 1;2#1d20 example 2";
	};
	
	/*
	// submit on Enter keypress
	function submitForm(e) { if(e.keyCode === 13) { form.submit(); } }
	
	document.addEventListener('keypress', function() {submitForm(event)}, false);
	*/
	
	if (window.location.hash)
	{
		hashChanged();
	}
	
	if ("onhashchange" in window) // does the browser support the hashchange event?
	{
		window.onhashchange = hashChanged;
	}
}

function hashChanged()
{
	var n = decodeURIComponent(window.location.hash).split('roll=')[1];
	if (n)
	{
		dmroll.value = decodeURIComponent(window.location.hash).split('roll=')[1];
		dieparse(rollform);
	}
}

/*
document.addEventListener("DOMContentLoaded", setup, false); // HTML5; Doesn't work in Chrome 35 for some reason
*/

// <-- START DIEROLL
var DieRoll = function (count,die,positive) {
	this.count = (isNaN(count)?1:count);
	this.die = (isNaN(die)?1:die);
	this.positive = (positive?true:false);
};

DieRoll.prototype.min = function() {
	return this.positive?this.count:-(this.count * this.die);
}

DieRoll.prototype.max = function() {
	return this.positive?(this.count * this.die):-(this.count);
}

DieRoll.prototype.roll = function() {	
	var tmp;
	var results = new Array();
	if (this.die > 1) {
		for (var i=0; i < this.count; i++)
		{
			tmp = Math.floor(Math.random() * this.die)+1;
			results.push(this.positive?tmp:-tmp);
		}
	} else {
		results.push(this.positive?this.count:-this.count);
	}
	return results;
}

DieRoll.prototype.toString = function() {
	if (this.die > 1) {
		return (this.positive?'':'-') + this.count + 'd' + this.die;
	} else {
		return (this.positive?'':'-') + this.count; // d1s don't need to be stated as such.
	}
}
// <-- END DIEROLL

function showPlus(num) {
	if (num < 0)  {
		return num;
	} else {
		return '+' + num;
	}
}

// handles only #d#+# format
function dieparse(form)
{
	var multiroll, roll, count, repeat, die, mod, tmp, header=null, cond=null;
	
	cleardieroll();
	
	multiroll = (form.roll.value).split(';');
	//dresult.innerHTML += "DEBUG mroll source :: " + form.roll.value + "<br>";
	//dresult.innerHTML += "DEBUG mroll result :: " + multiroll + "<br>";
	
	for (var mrpass=0; mrpass < multiroll.length; mrpass++) { // start multiroll
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
		cond = '>'+tmp[1];
	} else {
		tmp = roll.split('<', 2);
		if (tmp.length == 2) {
			roll = tmp[0];
			cond = '<'+tmp[1];
		}
	}
	
	// ROLL REPEATING
	tmp = roll.split('#', 2);
	if (tmp.length == 2) {
		repeat = parseInt(tmp[0]);
		if (isNaN(repeat)) {
			repeat = 1;
		}
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
		if (wst[0] == '-' || wst[0] == '+') {
			wst = wst.substr(1);
		}
		ws = wst.split('d',2);
		nrcount = parseInt(ws[0]);
		nrdie = parseInt(ws[1]);
		if (!isNaN(nrcount)) { // discard non-numbers and pointless zeroes
			rolls.push(new DieRoll(nrcount, nrdie, positive));
		}
	}
	
	//dresult.innerHTML += "DIES :: " + rolls + "<br>";
	
	if (header)
	{
		dresult.innerHTML += '<b>' + header + '</b><br>';
	}
	
	if (rolls.length == 0) {
		dresult.style.visibility = 'visible';
		dresult.innerHTML += "couldn't parse input<br>";
		return;
	}
	//dresult.innerHTML += "DEBUG rolls: " + rolls.length + "<br>";
	
	printrange(rolls);
	//dresult.innerHTML += "DEBUG: " + typeof(rolls) + " :: " + rolls + " :: " + multiroll.length + "<br>";
	for (var i = 0; i < repeat; i++) {
		printdieroll(rolls, cond);
	}
	
	if (mrpass < multiroll.length-1) { dresult.innerHTML += '<br>'; }
	} // end multiroll
}

function roller(count, die)
{
	var tmp;
	var results = new Array();
	for (var i=0; i < count; i++)
	{
		tmp = Math.floor(Math.random() * die)+1;
		results.push(tmp);
	}
	
	return results;
}

function dieroll(form)
{
	var die = parseInt(form.die.value);
	var mod = parseInt(form.mod.value);
	var count = parseInt(form.count.value);
	var repeat = parseInt(form.repeat.value);
	var header = null;
	
	// enforce some sanity
	if (count < 1) {
		count=1;
		form.count.value = count;
	}
	if (repeat < 1) {
		repeat=1;
		form.repeat.value = repeat;
	}
	if (die < 1) {
		die = 1;
		form.size.value = die;
	}
	
	// clear output
	cleardieroll();
	
	var rolls = new Array();
	rolls.push(new DieRoll(count,die,true));
	rolls.push(new DieRoll(mod,0,true));
	
	printrange(rolls)
	for (var i=0; i < repeat; i++)
	{
		printdieroll(rolls);
	}
	
	// print manual roll
	document.getElementById('dmroll').value = (repeat>1?(repeat + '#'):'') + count + 'd' + die + (mod<0?'':'+') + mod;
	
	return false;
}

function cleardieroll()
{
	dresult.innerHTML = '';
}

function printrange(rolls)
{
	dresult.style.visibility = 'visible';
	
	//dresult.innerHTML += "DEBUG: " + rolls + "<br>";
	
	dresult.innerHTML += (rolls.join('+').replace('+-','-')) + ', range: ';
	var min = 0, max = 0;
	for (i in rolls) {
		min += rolls[i].min();
		max += rolls[i].max();
	}
	if (min!=max) {
		dresult.innerHTML += min + ' – ' + max;
	} else {
		dresult.innerHTML += min;
	}
	dresult.innerHTML += ', average: ' + ((min+max)/2) + '<br>';
	
}

// pad static number
function padStNum(str) {
	return "<span class='roll'>" + str + "</span>";
}

function padMaxNum(str) {
	return "<span class='roll max'>" + str + "</span>";
}

function padMinNum(str) {
	return "<span class='roll min'>" + str + "</span>";
}

function arrSum(a,b) {
	return a+b;
}

function printdieroll(rolls, cond)
{
	if (typeof cond === 'undefined') { cond = null; } // default value for cond
	
	dresult.style.visibility = 'visible';
	
	var results = new Array();
	var total = 0, max = 0, min = 0;
	
	var tr = 0;
	for (i = 0; i < rolls.length; i++) {
		tr = rolls[i].roll();
		trsum = tr.reduce(arrSum,0);
		total += trsum;
		
		min += rolls[i].min();
		max += rolls[i].max();
		results.push(tr);
		dresult.innerHTML += rolls[i];
		if (rolls[i].die > 1) {
			dresult.innerHTML += ' [';
			if (tr.length>1) {
				for (sr = 0; sr < tr.length; sr++) {
					dresult.innerHTML += "<span class='tooltip roll" + (rolls[i].die==tr[sr]?' max':(1==tr[sr]?' min':'')) + "'>" + tr[sr] + '</span>';
					if (sr < tr.length-1) {
						dresult.innerHTML += ', ';
					}			
				}
				dresult.innerHTML += ' = ';
			}
			dresult.innerHTML += '<b>' + trsum + '</b>]';
		} else {
			
		}
		//dresult.innerHTML += "<br>";
		if (i < rolls.length-1) {
			dresult.innerHTML += ' + ';
		}
	}
	dresult.innerHTML += '<br>';
	
	dresult.innerHTML += "= <b><span class='" + (total==max?'max':'') + "'>" + (total) + '</span></b>'
	match = false;
	if (cond) {
		var greaterthan=null, lesserthan=null;
		if (cond[0] == '>') {
			greaterthan = parseInt(cond.substr(1));
		} else if (cond[0] == '<') {
			lesserthan = parseInt(cond.substr(1));
		}
		if (greaterthan && total>greaterthan) {
			dresult.innerHTML += ' <b>&gt; '+greaterthan+' match</b>';
			match = true;
		} else if (lesserthan && total<lesserthan) {
			dresult.innerHTML += ' <b>&lt; '+lesserthan+' match</b>';
			match = true;
		} else {
			dresult.innerHTML += ' mismatch (' + cond + ')';
		}
	}
	
	percentage = ((total-min) / (max-min)) * 100;
	if (!isNaN(percentage)) {
		dresult.innerHTML += ' [' + percentage.toFixed(1) + '%]';
	}
	dresult.innerHTML += '<br>';
	//dresult.innerHTML += 'DEBUG :: Min: ' + min + ', Max: ' + max + '<br>';
	
	window.location.hash = "roll="+encodeURIComponent(document.getElementById('dmroll').value);
	
	return match;
}

// conversions
function cm2in(centimeters) { return centimeters / 2.54; };
function in2cm(inches) { return inches * 2.54; };
function in2ft(inches) { return inches / 12; };
function ft2in(feet) { return feet * 12; };
function ft2mi(feet) { return feet / 5280; };
function m2nmi(meters) { return meters / 1852; };
function m2cm(meters) { return meters * 100; };
function in2yd(inches) { return inches / 36; };
function yd2in(yards) { return yards * 36; };
function m2km(meters) { return meters / 1000; };
function km2m(kilometers) { return kilometers * 1000; };
function cm2m(centimeters) { return centimeters / 100; };
function mi2ft(miles) { return miles * 5280; };
function nmi2m(nmiles) { return nmiles * 1852; };

function distances(form, origin)
{
	switch (origin) {
		case 'cm': //form.centimeters.value
			form.meters.value = cm2m(parseInt(form.centimeters.value));
			form.kilometers.value = m2km(form.meters.value);
			form.inches.value = cm2in(form.centimeters.value);
			form.feet.value = in2ft(form.inches.value);
			form.miles.value = ft2mi(form.feet.value);
			form.nmiles.value = m2nmi(form.meters.value);
			form.yards.value = in2yd(form.inches.value);
			break;
		case 'm': //form.meters.value
			form.centimeters.value = m2cm(parseInt(form.meters.value));
			form.kilometers.value = m2km(form.meters.value);
			form.inches.value = cm2in(form.centimeters.value);
			form.feet.value = in2ft(form.inches.value);
			form.miles.value = ft2mi(form.feet.value);
			form.nmiles.value = m2nmi(form.meters.value);	
			form.yards.value = in2yd(form.inches.value);
			break;
		case 'km': //form.kilometers.value
			form.meters.value = km2m(parseInt(form.kilometers.value));
			form.centimeters.value = m2cm(form.meters.value);
			form.inches.value = cm2in(form.centimeters.value);
			form.feet.value = in2ft(form.inches.value);
			form.miles.value = ft2mi(form.feet.value);
			form.nmiles.value = m2nmi(form.meters.value);
			form.yards.value = in2yd(form.inches.value);
			break;
		case 'in': //form.inches.value
			form.centimeters.value = in2cm(parseInt(form.inches.value));
			form.meters.value = cm2m(form.centimeters.value);
			form.kilometers.value = m2km(form.meters.value);
			form.feet.value = in2ft(form.inches.value);
			form.miles.value = ft2mi(form.feet.value);
			form.nmiles.value = m2nmi(form.meters.value);
			form.yards.value = in2yd(form.inches.value);
			break;
		case 'ft': // form.feet.value
			form.inches.value = ft2in(parseInt(form.feet.value));
			form.centimeters.value = in2cm(form.inches.value);
			form.meters.value = cm2m(form.centimeters.value);
			form.kilometers.value = m2km(form.meters.value);
			form.miles.value = ft2mi(form.feet.value);
			form.nmiles.value = m2nmi(form.meters.value);
			form.yards.value = in2yd(form.inches.value);
			break;
		case 'mi': // form.miles.value
			form.feet.value = mi2ft(parseInt(form.miles.value));
			form.inches.value = ft2in(form.feet.value);
			form.centimeters.value = in2cm(form.inches.value);
			form.meters.value = cm2m(form.centimeters.value);
			form.kilometers.value = m2km(form.meters.value);
			form.yards.value = in2yd(form.inches.value);
			form.nmiles.value = m2nmi(form.meters.value);
			break;
		case 'nmi': // form.nmiles.value
			form.meters.value = nmi2m(parseInt(form.nmiles.value));
			form.kilometers.value = m2km(form.meters.value);
			form.centimeters.value = m2cm(form.meters.value);
			form.inches.value = cm2in(form.centimeters.value);
			form.feet.value = in2ft(form.inches.value);
			form.yards.value = in2yd(form.inches.value);
			form.miles.value = ft2mi(form.feet.value);
			break;
		case 'yd': // form.yards.value
			form.inches.value = yd2in(parseInt(form.yards.value));
			form.feet.value = in2ft(form.inches.value);
			form.centimeters.value = in2cm(form.inches.value);
			form.meters.value = cm2m(form.centimeters.value);
			form.kilometers.value = m2km(form.meters.value);
			form.miles.value = ft2mi(form.feet.value);
			form.nmiles.value = m2nmi(form.meters.value);
			break;
	}
}

function temperatures(form, origin)
{
	switch (origin)
	{
		case 'C':
			// −273.15 to infinity
			//form.celsius.value
			var tn = parseFloat(form.celsius.value);
			form.kelvin.value = tn + 273.15;
			form.fahrenheit.value = tn * (9/5) + 32;
			break;
		case 'F':
			// −459.67 to infinity
			var tn = parseFloat(form.fahrenheit.value);
			if (isNaN(tn)) tn = NaN;
			form.celsius.value = (tn - 32) * (5/9);
			form.kelvin.value = tn + 459.67 * (5/9);
			break;
		case 'K':
			// 0 to infinity
			var tn = parseFloat(form.kelvin.value);
			form.celsius.value = tn - 273.15;
			form.fahrenheit.value = tn * (9/5) - 459.67;
			break;
	}
}

function circle(form, origin)
{
	switch (origin)
	{
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
function tip_show(event, elemId)
{
    var obj = document.getElementById(elemId);
	if (obj) {
		// placement
		obj.style.left = (event.clientX - 20) + 'px';
		obj.style.top = (event.clientY + 20) + 'px';
		// make it visible
		obj.style.visibility = "visible";
	}
}

function tip_hide(elemId)
{
    var obj = document.getElementById(elemId);
    if (obj) obj.style.visibility = "hidden";
}

function labeltoggle(chkbox, labelid, yestext, notext) {
	var label = document.getElementById(labelid);
	if (chkbox.checked){
		label.innerHTML = yestext;
	} else {
		label.innerHTML = notext;
	}
}

// GCD math

function gcd(g1,g2) {
	var gcd = 1;
	if (g1 > g2) {
		// [g1,g2] = [g2,g1]; // ECMAScript 6, how to detect support for this? // works in Firefox, not in Chrome
		g2 = [g1, g1 = g2][0]; // should work for older browsers
	}
	if (g2 % g1 == 0) {
		gcd = g1;
	} else {
		var i = (g1/2)|0;
		do {
			if ((g1 % i == 0) && (g2 % i == 0)) {
				gcd = i;
				break;
			}
		} while (i-- > 0);
	}
	return gcd;
}

function numhilo(n1,n2) { return n2-n1; } // highest to lowest
function numlohi(n1,n2) { return n1-n2; } // lowest to highest

//function gcdmulti(nums,dbg) {
function gcdmulti(nums) {
	var gcd = 1;
	if (nums.length < 2) { return gcd; } // failsafe
	nums.sort(numhilo);
	var m = true;
	
	// simple check for gcd
	var div = nums[nums.length-1];
	for (var i = 0; i < nums.length-1; i++) {
		if (nums[i] % div != 0)
		{
			m = false;
			break;
		}
	}
	if (m) {
		//dbg.gcddebug.value = dbg.gcddebug.value + ' fail:m:' + div
		return gcd = div;
	}
	
	var i = div/2|0;
	do {
		m = true;
		for (var i2 = 0; i2 < nums.length; i2++) {
			
			if (nums[i2] % i == 0) {
				// divisable, we do nothing with it, test the other numbers
			} else {
				// not divisable, try the next number
				m = false;
				break;
			}
		}
		if (m) {
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
		n[i] = parseInt(n[i]);
		if (isNaN(n[i])) {
			form.gcdout.value = '[' + n + ']'
			return false;
		}
	}
	n.sort(numhilo);
	//form.gcddebug.value = n + ' ' + n[n.length-1];
	var g = gcdmulti(n);
	form.gcdout.value = g;
	return true;
}


function gcdform(form) {
	var g1 = parseInt(form.gcdin1.value);
	var g2 = parseInt(form.gcdin2.value);
	
	form.gcdout.value = '[' + g1 + ' / ' + g2 + ']';
	if (isNaN(g1) || isNaN(g2)) { return; } // break out if bad input
	
	var g = gcd(g1,g2);
	form.gcdout.value = g;
	return g;
}

function fraction(form) {
	// e.g. 0.75 = (75, 100)
	var n = parseInt(form.fractionin.value);
	var shifts = 0;
	
	form.fractionout.value = '[' + n + ']'
	if (isNaN(n)) { return; }
	
	while (((n*10) % 10) != 0) {
		n *= 10;
		shifts += 1;
	}
	var fract = (1 * Math.pow(10, shifts))|0;
	form.fractionout.value = n + ' / ' + fract;
	return [n,fract];
}

function simplify(form) {
	var n1 = parseInt(form.sin1.value);
	var n2 = parseInt(form.sin2.value);
	// e.g. 108/24 = (108/gcd)/(24/gcd) = 9/2
	
	form.sout1.value = '[' + n1 + ']'
	form.sout2.value = '[' + n2 + ']'
	if (isNaN(n1) || isNaN(n2)) { return; } // break out if bad input
	
	var g = gcd(n1,n2);
	form.sout1.value = n1/g;
	form.sout2.value = n2/g;
	return (n1/g, n2/g);
}

function simplifyfract(form) {
	var n1,n2;
	var tmp = form.fractionout.value.split(' / ')
	n1 = parseInt(tmp[0])
	n2 = parseInt(tmp[1])
	
	form.fractionout.value = '[' + n1 + '/' + n2 + ']'
	if (isNaN(n1) || isNaN(n2)) { return; } // don't break on bad input
	
	var g = gcd(n1,n2);
	form.fractionout.value = n1/g + ' / ' + n2/g;
}
