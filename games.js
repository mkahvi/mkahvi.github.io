// by M.K.A. 2018
// last updated: 2018-01-22

// Game functions

function dps(form) {
	var damage = new Number(form.damage.value);
	var rate = new Number(form.rate.value);
	
	var crits = form.criticalsenabled.checked;
	//var wpoints = form.weakpointsenabled.checked;
	
	if (dpm)
		rate = rate / 60;
	
	var critchance = null;
	var critbonus = null;
	if (crits)
	{
		critchance = parseFloat(form.critchance.value);
		if (form.critchance.value.indexOf("%") !== -1) critchance /= 100;
	
		critbonus = parseFloat(form.critbonus.value);
		if (form.critbonus.value.indexOf("%") !== -1) critbonus /= 100;
	}
	
	var ammo = new Number(form.ammo.value);
	var reload = new Number(form.reload.value);
	
	form.dpsout.value = NaN;
	form.sustaineddps.value = NaN;
	form.outputduration.value = NaN;
	form.outputpercentage.value = NaN;
	form.critout.value = NaN;
	
	var basedps = damage * rate;
	form.dpsout.value = basedps;
	var dps = basedps;
	
	var critdamage = 0;
	if (!isNaN(critbonus) && !isNaN(critchance))
	{
		if (critbonus > 0 && critchance > 0)
		{
			var critdamage = 0;
			
			if (critAmp) { critdamage = (critbonus * damage) * critchance; }
			else { critdamage = (critbonus * critchance); }
			//form.critout.value = critdamage;
			form.critout.value = (critdamage/damage)*100 + "%";
		}
	}
	
	dps = basedps + (critdamage * rate);
	form.dpsout.value = dps;
	form.dpmout.value = dps * 60;
	
	var secondstoempty = 0;
	var dpspercentage = 1.0;
	if (!isNaN(ammo) && !isNaN(reload) && !isNaN(rate))
	{
		if (ammo > 0 && reload > 0 && rate > 0)
		{
			secondstoempty = ammo / rate;
			form.outputduration.value = secondstoempty + "s";
			dpspercentage = (secondstoempty / (secondstoempty+reload));
			form.outputpercentage.value = (dpspercentage * 100).toFixed(2) + "%";
		}
	}
	
	if (secondstoempty > 0)
	{
		form.sustaineddps.value = (dps * dpspercentage).toFixed(2);
	}
}

var dpm = false;
var dpsformatel = null;
var dpsform = null;

window.onload = setup_games;
function setup_games() {
	dpsform = document.getElementById('dpsform');
	dpsformatel = document.getElementById('dpsformat');
	console.log("Setup done");
}

function dpsformatchange(form) {
	dpm = form.dpm.checked;
	if (dpm) {
		form.rate.title = form.rate.title.replace('second', 'minute');
	} else {
		form.rate.title = form.rate.title.replace('minute', 'second');
	}
	dps(form);
}

var critAmp = false;
function criticalAmp(form) {
	critAmp = form.critamp.checked;
	dps(form);
}

var weakAmp = false;
function weakpointAmp(form) {
	weakAmp = form.critamp.checked;
	dps(form);
}
