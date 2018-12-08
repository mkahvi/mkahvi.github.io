// by M.K.A. 2018
// last updated: 2018-07-04

// dierolling
var dresult = document.getElementById('dresult');
var tresult = document.getElementById('tresult');
var cresult = document.getElementById('cresult');

/*
var form = document.getElementById('form');
*/

var travelform = document.getElementById('travelform');
var craftform = document.getElementById('craftform');;
var dprform = document.getElementById('dprform');;

// repeats above
window.onload = setup_pathfinder;
function setup_pathfinder()
{
	if (tresult == null)
		tresult = document.getElementById('tresult');
	if (travelform == null)
		travelform = document.getElementById('travelform');
	
	if (dresult == null)
		dresult = document.getElementById('dresult');
	if (dprform == null)
		dprform = document.getElementById('dprform');
	
	
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
	
	if ("onpopstate" in window)
	{
		window.onpopstate = historyPop;
	}
}

function historyPop(event)
{
	var ev = event.state;
	if (ev == null) return; // no state to restore
	if ("Query" in ev)
	{
	switch (ev.Query)
	{
		case "DPR":
			// {Query:'DPR', BAB:bab, AttackBonus:atkbonus, ExtraAttacks:extraattacks, Damage:damage, DamageBonus:dmgbonus, CriticalThreat:criticalthreat, CriticalMultiplier:criticalmultiplier, PrecisionDamage:precisiondamage,Armor:armor};
			dprform.bab.value = ev.BAB;
			dprform.atkbonus.value = ev.AttackBonus;
			dprform.xatk.value = ev.ExtraAttacks;
			dprform.damage.value = ev.Damage;
			dprform.dmgbonus.value = ev.DamageBonus;
			dprform.criticalthreat.value = ev.CriticalThreat;
			dprform.criticalmult.value = ev.CriticalMultiplier;
			dprform.precisiondmg.value = ev.PrecisionDamage;
			dprform.armor.value = ev.Armor;
			dprform.dr.value = ev.DR;
			dprparse();
			break;
		case "Travel":
			// {Query:'Travel', Days:days, Hours:hours, HP:hp, HD:hd, Fastheal:fastheal};
			travelform.days.value = ev.Days;
			travelform.hours.value = ev.Hours;
			travelform.hp.value = ev.HP;
			travelform.hd.value = ev.HD;
			travelparse();
			break;
		case "Craft":
			// {Query:'Craft', Check:check, Complexity:craftform.complexity.selectedIndex, ExtraDC:gmdc, Material:craftform.material.selectedIndex, Masterwork:mwk};
			craftform.mw.checked = ev.Mastework;
			craftform.check.value = ev.Check;
			craftform.complexity.selectedIndex = ev.Complexity;
			craftform.gmdc.value = ev.ExtraDC;
			craftform.material.selectedIndex = ev.Material;
			craftparse();
			break;
		default:
			// REPORT ERROR
			break;
	}
	}
}

function hashChanged()
{
	var travelquery = decodeURIComponent(window.location.search).split('?travel=', 2)[1];
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
	
	var craftquery = decodeURIComponent(window.location.search).split('?craft=', 2)[1];
	if (craftquery)
	{
		craftquery = craftquery.split('&', 2)[0];
		
		craftform.mw.checked = (craftquery.search('mwk') != -1);
		
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
	
	var dprquery = decodeURIComponent(window.location.search).split('?dpr=', 2)[1];
	if (dprquery)
	{
		// dpr=+8+2-damage-1d8+2-crit-19x2-precision-0-vs-22
		attackt = dprquery.split('-damage-', 2)[0];
		xattackt = attackt.split('-xtk-', 2);
		attackt = xattackt[0];
		extraattacks = parseInt(xattackt[1]);
		if (isNaN(extraattacks)) extraattacks = 0;
		bab = attackt.split('+', 2)[0];
		atkbonus = attackt.split('+', 2)[1];
		damaget = dprquery.split('-damage-', 2)[1].split('-crit-', 2)[0];
		damage = damaget.split('+', 2)[0];
		dmgbonus = damaget.split('+', 2)[1];
		crit = dprquery.split('-crit-', 2)[1].split('-precision-', 2)[0];
		critt = crit.split('x', 2);
		criticalthreat = parseInt(critt[0]);
		criticalmult = parseInt(critt[1]);
		precisiondamage = dprquery.split('-precision-', 2)[1].split('-vs-', 2)[0];
		armor = parseInt(dprquery.split('-vs-', 2)[1].split('-dr-', 2)[0]);
		dr = parseInt(dprquery.split('-dr-', 2)[1]);
		
		dprform.bab.value = bab;
		dprform.atkbonus.value = atkbonus;
		dprform.xatk.value = extraattacks;
		dprform.damage.value = damage;
		dprform.dmgbonus.value = dmgbonus;
		dprform.criticalthreat.value = criticalthreat;
		dprform.criticalmult.value = criticalmult;
		dprform.precisiondmg.value = precisiondamage;
		dprform.armor.value = armor;
		dprform.dr.value = dr;
		
		dprparse();
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
	nurl = "?travel="+days+"d"+hours+"h"+hp+"hp"+hd+"hd"+(fastheal?"f":"");
	nhash = "#travel";
	var querystate = {Query:'Travel', Days:days, Hours:hours, HP:hp, HD:hd, Fastheal:fastheal};
	history.pushState(querystate, "Travel", nurl+nhash);
	
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

// DPR / Damage Per Round
function dprparse()
{
	damage = dprform.damage.value;
	if (damage.length == 0) damage = "1d3"; // punch
	bab = parseInt(dprform.bab.value);
	if (isNaN(bab)) bab = 0; // level 1 non-martial
	atkbonus = parseInt(dprform.atkbonus.value);
	if (isNaN(atkbonus)) atkbonus = 0; // 
	extraattacks = parseInt(dprform.xatk.value);
	if (isNaN(extraattacks)) extraattacks = 0;
	dmgbonus = parseInt(dprform.dmgbonus.value);
	if (isNaN(dmgbonus)) dmgbonus = 0;
	criticalthreat = parseInt(dprform.criticalthreat.value);
	if (isNaN(criticalthreat)) criticalthreat = 20; // default
	criticalmultiplier = parseInt(dprform.criticalmult.value);
	if (isNaN(criticalmultiplier)) criticalmultiplier = 2; // default
	precisiondamage = dprform.precisiondmg.value;
	armor = parseInt(dprform.armor.value);
	if (isNaN(armor)) armor = 16;
	dr = parseInt(dprform.dr.value);
	if (isNaN(dr)) dr = 0;
	
	// TODO: Power Attack w/ Furious Focus (first attack without penalty)
	// TODO: Bonuses to critical confirm (e.g. Critical Focus feat)
	
	dresult.style.visibility = 'visible';
	
	dresult.innerHTML = "";
	
	if (isNaN(bab) || isNaN(atkbonus) || isNaN(dmgbonus) || isNaN(criticalthreat) || isNaN(criticalmultiplier) || isNaN(armor) ||
		bab < 0 || criticalthreat > 20 || criticalthreat < 1 || criticalmultiplier < 1 || criticalmultiplier > 5 || armor < 0 || armor > 900)
	{
		dresult.innerHTML = "<p style='color:red;'>Malformed input.";
		return;
	}
	
	// BOUNDING
	if (criticalmultiplier < 1) criticalmultiplier=1;
	else if (criticalmultiplier > 10) criticalmultiplier = 10;
	if (criticalthreat > 20) criticalthreat = 20;
	else if (criticalthreat < 1) criticalthreat = 1;
	
	// update URL
	nurl = "?dpr="+bab+"+"+atkbonus+"-xtk-"+extraattacks+"-damage-"+damage+"+"+dmgbonus+"-crit-"+criticalthreat+"x"+criticalmultiplier+"-precision-"+precisiondamage+"-vs-"+armor + "-dr-" + dr;
	nhash = "#dpr";
	var querystate = {Query:'DPR', BAB:bab, AttackBonus:atkbonus, ExtraAttacks:extraattacks, Damage:damage, DamageBonus:dmgbonus, CriticalThreat:criticalthreat, CriticalMultiplier:criticalmultiplier, PrecisionDamage:precisiondamage,Armor:armor, DR:dr};
	history.pushState(querystate, "DPR", nurl+nhash);
	
	critmax = 0;
	var drv = ParseDieAvg(damage+"+"+dmgbonus+"-"+dr);
	max = drv.Maximum;
	avg = drv.Average;
	min = drv.Minimum;
	
	if (max <= 0)
	{
		dresult.innerHTML+="<p>Damage Reduction fully nullifies all damage.";
	}
	
	pmax = 0;
	pavg = 0;
	pmin = 0;
	pstr = "";
	if (precisiondamage.length > 0)
	{
		var prv = ParseDieAvg(precisiondamage);
		pmax = prv.Maximum;
		pavg = prv.Average;
		pmin = prv.Minimum;
		staticdamage = (pmin == pmax);
		
		pstr = "; Precision: " + pavg + (staticdamage ? "" : (" (" + precisiondamage + ", range: "+pmin+ " – "+pmax+")"));
	}
	
	critmax = max * criticalmultiplier;
	critmin = min * criticalmultiplier;
	critchance = (21-criticalthreat) * 0.05;
	
	staticdamage = (min == max);
	
	dresult.innerHTML+= "<p><b>Basic</b> Attack Breakdown:<br>Average damage: <b>" + avg.toFixed(1) + "</b> (" + damage+"+"+dmgbonus +
		(staticdamage ? "" : (", range: "+min + " – "+max))+")"+pstr+"<br/>" +
		"Critical potential (×"+criticalmultiplier+", "+criticalthreat+(criticalthreat<20?"–20":"")+", "+(critchance*100.0).toFixed(0)+"%): "+((critmin+critmax)/2).toFixed(1)+ " ("+critmin+" – "+critmax+")";
	
	// Multiple Attacks
	var iteratives = new Array();
	iteratives.push(bab);
	
	// Haste, UnMonk Flurry & Ki Extra Attack, etc.
	if (extraattacks > 0)
	{
		xatk = extraattacks;
		while (xatk > 0)
		{
			iteratives.push(bab);
			xatk--;
		}
	}
	
	// BAB Iteratives
	tbab = bab;
	while (tbab>5)
	{
		tbab -= 5;
		iteratives.push(tbab);
	}
	var iterout = new Array();
	iteratives.forEach(function(tbab) {
		iterout.push(tbab+atkbonus);
	});

	//dresult.innerHTML += "<p>Iterative attacks: +" + iterout.join(', +') + "<br/>against AC: " + armor;
	
	var chanceout = new Array();
	var chances = new Array();
	iterout.forEach(function(tbab) {
		var chance = (21-(armor-tbab))*0.05;
		truechance = Math.max(0.05, chance);
		chances.push((truechance * 100.0).toFixed(0));
		chanceout.push(Attack(tbab, chance));
	});
	
	totalavg = 0;
	totalcrit = 0;
	totalprc = 0;
	var out = new Array();
	var rolls = new Array();
	chanceout.forEach(function(atk) {
		rollneeded = Math.min((armor-atk.attack), 20);
		var on20 = rollneeded == 20 ? true : false; // hits only on nat 20
		rolls.push((on20?"=":"≥")+rollneeded);
		truechance = Math.max(atk.chance, 0.05);  // allow natural 20 to always hit
		truechance = Math.min(1.0, truechance); // don't allow over 100% chance to hit as this is nonsense and makes DPR math faulty
		
		out.push("+"+atk.attack + " (d20"+(on20?"=":"≥")+ rollneeded + ", "+(truechance*100).toFixed(0)+"%)");
		
		totalavg += avg * truechance;
		totalprc += pavg * truechance;
		
		// Critical Hit
		// multiply crit chance with hit chance (critical chance and critical confirm chance)
		// Multiply damage by crit multiplier
		if (criticalmultiplier > 1)
			totalcrit += (avg*(criticalmultiplier-1)) * (Math.min(critchance, truechance) * truechance);
	});
	
	/*
	dresult.innerHTML += "<p>Attack breakdown: <br>" +
		" – Basic: +"+iterout.join(', +') +
		"<br/> – Chances: " + chances.join('%, ') + "%" +
		"<br/>– Rolls: " + rolls.join(', ');
	*/
	
	dresult.innerHTML += "<p>Attacks (×"+iteratives.length+"): " + out.join(', ');
	
	maxdmg = max*iteratives.length;
	mindmg = min*iteratives.length;
	maxcritdmg = max*(criticalmultiplier-1)*iteratives.length;
	maxprcdmg = pmax*iteratives.length;
	minprcdmg = pmin*iteratives.length;
	drinfluence = dr/(max+dr);
	nondrdmg = (totalavg+totalcrit+totalprc);
	
	dresult.innerHTML += "<p><b>Average</b> damage output: <b>" + totalavg.toFixed(2) + "</b>"+
		(criticalmultiplier > 1 ? " + <i>Criticals</i>: " + totalcrit.toFixed(2) : "") +
		(pavg > 0 ? " + <i>Precision</i>: " + (totalprc).toFixed(2) : "") +
		" – Total: <b>" + (totalavg+totalcrit+totalprc).toFixed(2) + "</b>" +
		"<br/>– <b>Minimum</b> damage output: " + mindmg +
		(pavg > 0 ? (" + <i>Precision</i>: " + (minprcdmg)) : "") +
		" – Total: " + (mindmg+minprcdmg) + " – assuming all hit but deal minimum damage" +
		"<br/>– <b>Maximum</b> damage output: " + maxdmg +
		(criticalmultiplier > 1 ? (" + <i>Criticals</i>: " + maxcritdmg) : "") +
		(pavg > 0 ? (" + <i>Precision</i>: " + (maxprcdmg)) : "") +
		" – Total: " + (maxdmg+maxcritdmg+maxprcdmg) +
		(dr > 0 ? ("<p>Damage Reduction nullifies in average: " + (drinfluence*100).toFixed(1) + "% the damage.") : "");
}

function ParseDieAvg(dieroll)
{
	tmprx = dieroll.split(/(?=[-\+])/g);
	_avg = 0;
	_max = 0;
	_min = 0;
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
			if (!positive) nrcount = -nrcount;
			if (!isNaN(nrdie)) // .e.g +2d4
			{
				_avg += (nrcount*((nrdie+1.0)/2.0));
				_max += (nrcount*nrdie);
				_min += nrcount;
			}
			else // e.g. +2
			{
				_avg += nrcount;
				_max += nrcount;
				_min += nrcount;
			}
		}
	}
	
	return {Average: _avg, Maximum: _max, Minimum: _min};
}


function Attack(attack_,chance_) {
		return {attack: attack_, chance: chance_};
}

// CRAFTING
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
	nurl = "?craft="+check+"r"+craftform.complexity.selectedIndex+"c"+gmdc+"gm"+craftform.material.selectedIndex+"t"+(mwk==true?"mwk":"");
	nhash = "#craft";
	var querystate = {Query:'Craft', Check:check, Complexity:craftform.complexity.selectedIndex, ExtraDC:gmdc, Material:craftform.material.selectedIndex, Masterwork:mwk};
	history.pushState(querystate, "Craft", nurl+nhash);
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