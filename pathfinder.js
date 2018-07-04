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
	
	if (days.isNaN || hours.isNaN || hp.isNaN || hd.isNaN ||
		days <= 0 || hours <= 0 || hours > 24 || hp <= 0 || hd <= 0)
	{
		tresult.innerHTML = "<p style='color:red;'>Malformed input.";
		
		if (days.isNaN || days <= 0)
			tresult.innerHTML += "<p>Days = 0 or NaN"
		if (hours.isNaN || hours <= 0 || hours > 24)
			tresult.innerHTML += "<p>Hours = 0 or NaN or >24"
		if (hp.isNaN || hp <= 0)
			tresult.innerHTML += "<p>HP = 0 or NaN"
		if (hd.isNaN || hd <= 0)
			tresult.innerHTML += "<p>HD = 0 or NaN"
		
		return;
	}
	
	if (hd > 60) tresult.innerHTML += "<p class='high warn'>... Why tho?";
	else if (hd > 40) tresult.innerHTML += "<p class='high warn'>EP– ... Uhh...";
	else if (hd > 20) tresult.innerHTML += "<p class='high tooltipped'>EPIC!";
	
	// update URL
	window.location.hash = "travel="+days+"d"+hours+"h"+hp+"hp"+hd+"hd"+(fastheal?"f":"");
	
	var resting = 8;
	
	if (hours > 24-8)
		resting = Math.max(0, 24 - hours);
	
	var preparing = resting > 1 ? 1 : 0;
	if (preparing) resting -= 1;
	
	var longestStretch = Math.min(hours, Math.max(hp, hd));
	var healPerHour = hd;
	if (hp < 2) healPerHour = 0;
	var remainingAfterLongest = hours-longestStretch;
	var staggerLength = Math.min(hp, hd, healPerHour);
	
	var restingHeal = (resting+preparing) * healPerHour;

	var walkHours = 0;
	
	if (remainingAfterLongest > 1 && healPerHour > 0)
		walkHours = Math.ceil(remainingAfterLongest / Math.max(2, Math.min(Math.max(hp,hd), healPerHour+1)));
	else
		walkHours = remainingAfterLongest;
	
	var hustleHours = hours - walkHours;
	
	var idleHours = 24 - (hours + resting + preparing);
	
	var totalHours = hours + hustleHours;
	var boost = totalHours / hours;
	var finalDays = (days * hours) / totalHours;
	var savedDays = days - finalDays;
	
	var NLtotal = (hustleHours-1);
	var NLheal = (walkHours*healPerHour);
	var NLleft = Math.max(0, NLtotal - NLheal);
	var NLmorning = Math.max(0, (NLleft - ((resting+preparing)*healPerHour)));
	
	var shiftedHustle = 0;
	while (NLmorning > 0)
	{
		hustleHours -= 1;
		walkHours += 1;
		
		shiftedHustle += 1;
		
		NLtotal = (hustleHours-1);
		NLheal = (walkHours*healPerHour);
		NLleft = Math.max(0, NLtotal - NLheal);
		NLmorning = Math.max(0, (NLleft - ((resting+preparing)*healPerHour)));
	}
	
	// Final Push
	
	var finalPush = Math.max(0, Math.min(walkHours, hp-1));
	var finalDaysWithPush = (days*hours) / (totalHours+(finalPush/days));
	var savedDaysWithPush = days - finalDaysWithPush;
	
	var NLpush = NLleft + finalPush;
	
	if ((NLleft > healPerHour*(resting+walkHours)) && days > 1)
		tresult.innerHTML += "<p class='warn'>Internal error: NL damage exceeding safety limits.";
	
	var dailyMarchLimit = 24-8-9;
	
	var forcedMarch = Math.max(0, hours - 8);
	var optForcedMarch = hd>5 ? (dailyMarchLimit) : 0; // 8 for default travel, 9 for resting and preparation
	
	tresult.innerHTML += "<p><b>Daily</b>" + 
		"<br>– Walking: " + walkHours +
		"<br>– Hustling: " + hustleHours +
		"<br>– Resting: " + resting + (shiftedHustle > 0 ? " – hustling swapped for walking to compensate: " + shiftedHustle : "") + 
		"<br>– Preparing: " + preparing + " – " + (resting==8 ?"spell ":"") + "camp preparation" +
		"<br>– Idle: " + idleHours +
		"<br>Effective travel hours: " + (hours + hustleHours) + 
		"<br><b>Non-lethal damage</b>" +
		"<br>– Total: " + NLtotal.toFixed() +
		"<br>– Healed: " + NLheal.toFixed() + " – from walking" +
		"<br>– Left: " + color(NLleft.toFixed() + (NLleft>0 ? " (Fatigued)" : ""), -NLleft) + " – before resting, which can heal " + restingHeal +
		"<br>– Morning: " + color(NLmorning.toFixed() + (NLmorning>0 ? " (Fatigued)" : ""), -NLmorning);
	
	if (NLleft >= hp)
		tresult.innerHTML += "<p class='warn'>Unconscious";

	if (resting < 2)
		tresult.innerHTML += "<p class='warn'>2 hour rest skipped, spell & ability refresh unavailable." + 
			"<br>Ring of Sustenance and similar options non-functional."
	else if (resting < 8)
		tresult.innerHTML += "<p class='warn'>8 hour rest skipped, spell & ability refresh unavailable." + 
			"<br>Ring of Sustenance still allows this works.";
	if (preparing < 1)
		tresult.innerHTML += "<p class='warn'>Wizard & Cleric spell preparation denied.";
	
	tresult.innerHTML += "<p><b>Final travel time</b>" + 
		"<br>– Total days: " + finalDays.toPrecision(3) +
		"<br>– Total hours: " + (finalDays*hours).toPrecision(3) + 
		"<br>– Boost: ×" + boost.toPrecision(3) + " (" + ((boost-1)*100).toPrecision(3) + "%)" +
		"<br>– Saved days: " + savedDays.toPrecision(3) +
		"<br>– Saved hours: " + (savedDays*hours).toPrecision(3);
	
	tresult.innerHTML += "<p><b>Final push</b>" +
		"<br>– Extra hours: " + finalPush + " – from hustling instead of walking" +
		(finalPush > 0 ?
		"<br>– Final days: " + finalDaysWithPush.toPrecision(3) +
		"<br>– Total saved days: " + savedDaysWithPush.toPrecision(3) + 
		"<br>– NL left: " + color(NLpush + (NLpush>0 ? " ("+((NLpush >= hp)?"Unconscious":"Fatigued")+")" : ""), -NLpush) : "");
	
	var checks = new Array();
	for (i = 0; i < forcedMarch; i++)
		checks.push(10 + (i*2));
	
	tresult.innerHTML += "<p><b>Forced March</b>" +
		"<br>– Hours: " + forcedMarch +
		"<br>– Checks: " + checks.join(", ") +
		"<br>– Damage: " + forcedMarch + " – " + (forcedMarch*6) +
		"<br>– Left: " + (healPerHour < 6 ? (Math.max(0,(forcedMarch-healPerHour)) + " – " + (forcedMarch * (6-healPerHour))) : 0);
	
	tresult.innerHTML += "<p><b>Optimal forced march</b>" +
		"<br>– Hours: " + optForcedMarch.toFixed() +
		"<br>– Hustling: " + (hd>6 ? "Yes" : "No") +
		"<br>– Total travel time: " + (8 + optForcedMarch);
}

function color(str, color)
{
	var stylecolor = null;
	if (color < 0)
		stylecolor = "warn";
	
	if (stylecolor == null) return str;
	
	return "<span class='roll " + stylecolor + "'>" + str.toString() + "</span>";
}
