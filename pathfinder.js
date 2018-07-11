// by M.K.A. 2018
// last updated: 2018-07-04

// dierolling

var tresult = document.getElementById('tresult');
var cresult = document.getElementById('cresult');

/*
var form = document.getElementById('form');
*/

var travelform = document.getElementById('travelform');
var craftform = document.getElementById('craftform');;

// repeats above
window.onload = setup_pathfinder;
function setup_pathfinder()
{
	if (tresult == null)
		tresult = document.getElementById('tresult');
	if (travelform == null)
		travelform = document.getElementById('travelform');
	
	if (cresult == null)
		cresult = document.getElementById('cresult');
	if (craftform == null)
		craftform = document.getElementById('craftform');
	
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
	var travelquery = decodeURIComponent(window.location.hash).split('travel=', 2)[1];
	if (travelquery)
	{
		travelquery = travelquery.split('&', 2)[0];
		
		//1d8h6 hp 1hd
		// hps[0] hps[1]
		var hps = travelquery.split('hp');
		
		if (travelquery.search('f') != -1)
			fastheal = true;
		else
			fastheal = false;
		
		hd = hps[1].split('hd')[0];
		
		var hs = hps[0].split('h');
		var d = hs[0].split('d');
		days = parseInt(d[0]);
		hours = parseInt(d[1]);
		hp = parseInt(hs[1]);
		//hd = parseInt(hds[0]);
		
		//tresult.style.visibility = 'visible';
		//tresult.innerHTML = "d: " + days + "<br>h: " + hours + "<br>hp: " + hp + "<br>hd: " + hd + "<br>f: " + fastheal;
		
		travelform.days.value = days;
		travelform.hours.value = hours;
		travelform.hp.value = hp;
		travelform.hd.value = hd;
		//travelform.fastheal.checked = fastheal;
		
		travelparse();
	}
	
	var craftquery = decodeURIComponent(window.location.hash).split('craft=', 2)[1];
	if (craftquery)
	{
		craftquery = craftquery.split('&', 2)[0];
		
		if (craftquery.search('mwk') != -1)
			craftform.mw.checked = true;
		else
			craftform.mw.checked = false;
		
		var checknum = craftquery.split('r', 2);
		
		craftform.check.value = checknum[0];
		
		var complexnum = checknum[1].split('c', 2);
		craftform.complexity.selectedIndex = complexnum[0];
		
		var gmnum = complexnum[1].split('gm', 2);
		craftform.gmdc.value = gmnum[0];
		
		var matnum = gmnum[1].split('t', 2);
		craftform.material.selectedIndex = matnum[0];
		
		craftparse();
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
	days = parseInt(travelform.days.value);
	hours = parseInt(travelform.hours.value);
	hp = parseInt(travelform.hp.value);
	hd = parseInt(travelform.hd.value);
	//fastheal = travelform.fastheal.checked;
	
	tresult.style.visibility = 'visible';
	
	tresult.innerHTML = "";
	
	if (isNaN(days) ||isNaN(hours) || isNaN(hp) || isNaN(hd) ||
		days <= 0 || hours <= 0 || hours > 24 || hp <= 0 || hd <= 0)
	{
		tresult.innerHTML = "<p style='color:red;'>Malformed input.";
		
		if (isNaN(days) || days <= 0)
			tresult.innerHTML += "<p>Days = 0 or NaN"
		if (isNaN(hours) || hours <= 0 || hours > 24)
			tresult.innerHTML += "<p>Hours = 0 or NaN or >24"
		if (isNaN(hp) || hp <= 0)
			tresult.innerHTML += "<p>HP = 0 or NaN"
		if (isNaN(hd) || hd <= 0)
			tresult.innerHTML += "<p>HD = 0 or NaN"
		
		return;
	}
	
	if (hd > 60) tresult.innerHTML += "<p class='high warn'>... Why tho?";
	else if (hd > 40) tresult.innerHTML += "<p class='high warn'>EP– ... Uhh...";
	else if (hd > 20) tresult.innerHTML += "<p class='high tooltipped'>EPIC!";
	
	// update URL
	window.location.hash = "travel="+days+"d"+hours+"h"+hp+"hp"+hd+"hd"+(fastheal?"f":"");
	
	var resting = 8;
	var preparing = 0;
	
	var left = 24 - hours;
	if (left < 2)
	{
		resting = left;
		preparing = 0;
	}
	else
	{
		resting = left < 9 ? (left-1) : (Math.min(8, left-1));
		preparing = 1;
	}
	
	var idleHours = 24 - hours - resting - preparing;
	
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
	
	var NLtotal = (hustleHours-1);
	var NLheal = (walkHours*healPerHour);
	var NLleft = Math.max(0, NLtotal - NLheal);
	var NLrested = Math.max(0, (NLleft - ((resting+preparing)*healPerHour)));
	
	var shiftedHustle = 0;
	while (NLrested > 0)
	{
		hustleHours -= 1;
		walkHours += 1;
		
		shiftedHustle += 1;
		
		NLtotal = (hustleHours-1);
		NLheal = (walkHours*healPerHour);
		NLleft = Math.max(0, NLtotal - NLheal);
		NLrested = Math.max(0, (NLleft - ((resting+preparing)*healPerHour)));
	}
	
	// Final Push
	
	var finalPush = Math.max(0, Math.min(walkHours, hp-1));
	var finalDaysWithPush = (days*hours) / (totalHours+(finalPush/days));
	var savedDaysWithPush = days - finalDaysWithPush;
	
	var NLpush = NLleft + finalPush;
	
	var restingHeal = (resting+preparing) * healPerHour;
	
	if (NLleft > (healPerHour*(resting+preparing+walkHours)) && days > 1)
		tresult.innerHTML += "<p class='warn'>Internal error: NL damage exceeding safety limits."+
			"<br>" + healPerHour + " .. " + (healPerHour*(resting+walkHours));
	
	var dailyMarchLimit = 24-8-9;
	
	var forcedMarch = Math.max(0, hours - 8);
	var optForcedMarch = hd>5 ? (dailyMarchLimit) : 0; // 8 for default travel, 9 for resting and preparation
	
	var optForcedMarchDaily = (8 + optForcedMarch);
	var optForcedMarchDailyEffective =  optForcedMarchDaily + hustleHours;
	var optForcedMarchDays = (hours*days) / optForcedMarchDailyEffective;
	
	var marchboost = optForcedMarchDaily / hours;
	
	tresult.innerHTML += "<p><b>Daily</b>" + 
		"<br>– Walking: " + walkHours +
		"<br>– Hustling: " + hustleHours +
		"<br>– Resting: " + resting + (shiftedHustle > 0 ? " – hustling swapped for walking to compensate: " + shiftedHustle : "") + 
		"<br>– Preparing: " + preparing + " – " + (resting==8 ?"spell &amp; ":"") + "camp preparation" +
		"<br>– Idle: " + idleHours +
		"<br>Effective travel hours: " + (hours + hustleHours) + 
		"<br><b>Non-lethal damage</b>" +
		"<br>– Total: " + NLtotal.toFixed() +
		"<br>– Healed: " + NLheal.toFixed() + " – from walking" +
		"<br>– Left: " + color(NLleft.toFixed() + (NLleft>0 ? " (Fatigued)" : ""), -NLleft) + " – before resting, which can heal " + restingHeal +
		"<br>– Rested: " + color(NLrested.toFixed() + (NLrested>0 ? " (Fatigued)" : ""), -NLrested);
	
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
	
	tresult.innerHTML += "<p><b>With hasty final push</b>" +
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
		(forcedMarch > 0 ?
		"<br>– Checks: " + checks.join(", ") +
		"<br>– Damage: " + forcedMarch + " – " + (forcedMarch*6) +
		"<br>– Left: " + (healPerHour < 6 ? (Math.max(0,(forcedMarch-healPerHour)) + " – " + (forcedMarch * (6-healPerHour))) : 0) : "");
	
	tresult.innerHTML += "<p><b>Optimal forced march</b>" + (hours == optForcedMarchDaily ? " (IN USE!)" : "") +
		"<br>– Hours: " + optForcedMarch.toFixed() +
		"<br>– Hustling: " + (hd>6 ? "Yes" : "No") +
		"<br>– Total daily hours: " + optForcedMarchDaily +
		"<br>– Effective daily hours: " + optForcedMarchDailyEffective + 
		"<br>– Boost: ×" + marchboost.toPrecision(3) +
		"<br>– Days: " + optForcedMarchDays.toPrecision(3);
}

function craftparse()
{
	cresult.style.visibility = 'visible';
	cresult.innerHTML = "";
	
	var check = parseInt(craftform.check.value);
	var cost = parseFloat(craftform.cost.value);
	var dc = parseInt(craftform.dc.value);
	var limit = parseInt(craftform.limit.value);
	var gmdc = parseInt(craftform.gmdc.value);
	var complexity = parseInt(craftform.complexity.value);
	var material = parseInt(craftform.material.value);
	var mwk = craftform.mw.checked == true;
	
	if (isNaN(check) || check <= 0)
		cresult.innerHTML += "<p class='warn'>Craft check result is missing.";
	
	// Core Rules
	if (!isNaN(cost) && !isNaN(dc))
	{
		if (isNaN(limit) || limit <= 0) limit = 1;
		
		var corecheckdc = check * dc;
		var corecost = cost*10;
		var corespeed = Math.floor(check / dc);
		var coreprogress = check * dc / corecost / 7;
		var coredays = (1/coreprogress) / corespeed;
		var corefinished = Math.max(1, Math.min(limit, Math.floor(coreprogress)));
		
		cresult.innerHTML += "<p><b>Core crafting results:</b><p>Check × DC: " + corecheckdc +
			"<br>Goal: " + corecost +
			"<br>Speed: ×" + corespeed +
			"<br>Progress: " + coreprogress + " per day" +
			"<br>Days: " + coredays +
			"<br>Finished: " + corefinished;
	}
	
	cresult.innerHTML += "<p><b>Making Craft Work results:</b>";
	
	// Make Crafting Work alternate rules
	if (isNaN(gmdc) || gmdc == null) gmdc = 0;

	var materialmod = 0;
	var complexitymod = 0;
	
	var time = 0;
	switch (+complexity) // for some dumb reason + is required
	{
		default:
			cresult.innerHTML += "<p class='warn'>Complexity: No match";
			break;
		case 0:
			time = 4;
			break;
		case 2:
			time = 8; // 1 day
			break;
		case 4:
			time = 2*8; // 2 days
			break;
		case 8:
			time = 4*8; // 4 days
			break;
		case 10:
			time = 7*8; // 1 week
			break;
	}
	
	var timemult = 1 + (mwk ? .5 : 0) + (material==0 ? 0 : .5);
	time *= timemult;
	
	var finaldc = 10 + complexity + material + gmdc + (mwk?4:0);
	
	var speed = 1;
	if ((check-finaldc) >= 10) speed = 4;
	else if ((check-finaldc) >= 5) speed = 2;
	
	var finaltime = time/speed;
	
	if (finaldc > check)
	{
		cresult.innerHTML += "<p class='warn'>Crafting failed. Time wasted.";
		if (finaldc > (check+5))
			cresult.innerHTML += "Failed by 5 or more: Half the materials are ruined.";
		if (finaldc > (check+10))
			cresult.innerHTML += "Failed by 10 or more: Catastrophic results. Laboratory explodes or similar.";
	}
	
	time /= speed;
	
	var days = Math.floor(time/8);
	var hours = time - (days*8);
	
	cresult.innerHTML += "Complexity: +" + complexity +
		"<br>Material: +" + material +
		"<br>Extra DC: " + plusify(gmdc) +
		"<br>Masterwork: " + (mwk?"Yes +4":"No") +
		"<p>Final DC: " + finaldc + (finaldc <= check ? " – <b>Success!</b>" : "");

	cresult.innerHTML += "<p>Time spent: " + Math.floor(time/8) + " days, " + hours + " hours." +
		"<br>Speed: ×" + speed;
	
	// update URL
	window.location.hash = "craft="+check+"r"+craftform.complexity.selectedIndex+"c"+gmdc+"gm"+craftform.material.selectedIndex+"t"+(mwk==true?"mwk":"");
}

function plusify(num)
{
	return (num >= 0 ? "+" + num : num);
}

function color(str, color)
{
	var stylecolor = null;
	if (color < 0)
		stylecolor = "warn";
	
	if (stylecolor == null) return str;
	
	return "<span class='roll " + stylecolor + "'>" + str.toString() + "</span>";
}
