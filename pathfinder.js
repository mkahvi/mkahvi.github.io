// by M.K.A. 2018
// last updated: 2018-07-04

// dierolling

var tresult = document.getElementById('tresult');

/*
var form = document.getElementById('form');
*/

var travelform;
var query;

// repeats above
window.onload = setup_pathfinder;
function setup_pathfinder()
{
	if (tresult == null) {
		tresult = document.getElementById('tresult');
	}
	travelform = document.getElementById('travelform');
	
	if (travelform.days.value.length == 0 && travelform.hours.value.length == 0)
	{
		travelform.days.value = 1;
		travelform.hours.value = 8;
	}
	
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
	var n = decodeURIComponent(window.location.hash).split('travel=')[1];
	if (n)
	{
		query = n;
		
		//1d8h6 hp 1hd
		// hps[0] hps[1]
		var hps = query.split('hp');
		
		if (query.search('f') != -1)
			fastheal = true;
		else
			fastheal = false;
		
		hd = hps[1].split('hd')[0];
		
		var hs = hps[0].split('h');
		var d = hs[0].split('d');
		days = new Number(d[0]);
		hours = new Number(d[1]);
		hp = new Number(hs[1]);
		//hd = new Number(hds[0]);
		
		//tresult.style.visibility = 'visible';
		//tresult.innerHTML = "d: " + days + "<br>h: " + hours + "<br>hp: " + hp + "<br>hd: " + hd + "<br>f: " + fastheal;
		
		travelform.days.value = days;
		travelform.hours.value = hours;
		travelform.hp.value = hp;
		travelform.hd.value = hd;
		//travelform.fastheal.checked = fastheal;
		
		travelparse();
	}
}

/*
document.addEventListener("DOMContentLoaded", setup, false); // HTML5; Doesn't work in Chrome 35 for some reason
*/

// Travel calculations

var days = null;
var hours = null;
var hp = null;
var hd = null;
var fastheal = false;

function travelparse()
{
	days = new Number(travelform.days.value);
	hours = new Number(travelform.hours.value);
	hp = new Number(travelform.hp.value);
	hd = new Number(travelform.hd.value);
	//fastheal = travelform.fastheal.checked;
	
	tresult.style.visibility = 'visible';
	
	tresult.innerHTML = "";
	
	if (days.isNaN || hours.isNaN || hp.isNaN || hd.isNaN || days <= 0 || hours <= 0 || hp <= 0 || hd <= 0)
	{
		tresult.innerHTML = "<p style='color:red;'>Malformed input.";
		
		if (days.isNaN || days <= 0)
			tresult.innerHTML += "<p>Days = 0 or NaN"
		if (hours.isNaN || hours <= 0)
			tresult.innerHTML += "<p>Hours = 0 or NaN"
		if (hp.isNaN || hp <= 0)
			tresult.innerHTML += "<p>HP = 0 or NaN"
		if (hd.isNaN || hd <= 0)
			tresult.innerHTML += "<p>HD = 0 or NaN"
		
		return;
	}
	
	// update URL
	window.location.hash = "travel="+days+"d"+hours+"h"+hp+"hp"+hd+"hd"+(fastheal?"f":"");
	
	var longestStretch = Math.min(hours, Math.max(hp, hd));
	var healPerHour = hd;
	if (hp < 2) healPerHour = 0;
	var remainingAfterLongest = hours-longestStretch;
	var staggerLength = Math.min(hp, hd, healPerHour);
	
	var walkHours = 0;
	
	if (remainingAfterLongest > 1 && healPerHour > 0)
		walkHours = Math.ceil(remainingAfterLongest / Math.max(2, Math.min(Math.max(hp,hd), healPerHour+1)));
	else
		walkHours = remainingAfterLongest;
	
	var hustleHours = hours - walkHours;
	var totalHours = hours + hustleHours;
	var boost = totalHours / hours;
	var finalDays = (days * hours) / totalHours;
	var savedDays = days - finalDays;
	
	// Final Push
	
	var finalPush = Math.max(0, Math.min(walkHours, hp-1));
	var finalDaysWithPush = (days*hours) / (totalHours+(finalPush/days));
	var savedDaysWithPush = days - finalDaysWithPush;
	
	var NLtotal = (hustleHours-1);
	var NLheal = (walkHours*healPerHour);
	var NLleft = NLtotal - NLheal;
	
	tresult.innerHTML += "<p><b>Daily hours</b>" + 
		"<br>– Walking: " + walkHours + "<br>– Hustling: " + hustleHours +
		"<br><b>Total</b> travel hours: " + (hours + hustleHours);
	
	tresult.innerHTML += "<p><b>Final travel time</b>" + 
		"<br>– Total days: " + finalDays.toPrecision(3) +
		"<br>– Total hours: " + (finalDays*hours).toPrecision(3) + 
		"<br>– Boost: ×" + boost.toPrecision(4) + " (" + ((boost-1)*100).toPrecision(3) + "%)" +
		"<br>– Saved days: " + savedDays.toPrecision(3) +
		"<br>– Saved hours: " + (savedDays*hours).toPrecision(3) +
		"<br><b>Non-lethal damage</b>" +
		"<br>– Total: " + NLtotal.toFixed() +
		"<br>– Healed: " + NLheal.toFixed() + 
		"<br>– Left: " + color(NLleft.toFixed() + (NLleft>0 ? " (Fatigued)" : ""), -NLleft);
	
	tresult.innerHTML += "<p><b>Final push</b>" +
		"<br>– Extra hours: " + finalPush.toPrecision(3) +
		"<br>– Final days: " + finalDaysWithPush.toPrecision(3) +
		"<br>– Total saved days: " + savedDaysWithPush.toPrecision(3);
}

function color(str, color)
{
	var stylecolor = null;
	if (color < 0)
		stylecolor = "warn";
	
	if (stylecolor == null) return str;
	
	return "<span class='roll " + stylecolor + "'>" + str.toString() + "</span>";
}
