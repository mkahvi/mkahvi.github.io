// by M.A. <mkahvi@github>
// https://plus.google.com/115368956636893942473
// http://ma-tools.appspot.com/factorio

var factorio = null;
var turrets = null;

var tableCols = 7;
var tableRowPadding = 2;

var nightduration = 48; // seconds; http://www.factorioforums.com/wiki/index.php?title=Game-day

function FactorioProductData(data) {
	factorio = data;
};

function FactorioTurretData(data) {
	turrets = data;
};

function ValueIfNotNull(obj, nullreturn) {
	if (obj) {
		return obj;
	} else {
		if (nullreturn)
			return nullreturn;
		else
			return 'n/a';
	}
}

function ValueIfRequirements(reqs) {
	if (reqs) {
		var output = new Array();
		for (var key in reqs) {
			output.push(reqs[key] + '× ' + key);
		}
		return output.join(', ');
	} else {
		return 'n/a';
	}
}

function FuelToNumber(fuel) {
}

function PrettyFuelValue(fuel) {
	if (fuel > 1000000) {
		return (fuel/1000000).toFixed(1) + 'MW';
	} else {
		return (fuel/1000).toFixed(1) + 'kW';
	}
}

var totaltime;
var totalfuel;
var producttable;
var showraw;

function recalcProduction() {
	totaltime = 0, totalfuel = 0;
	for (var i=0; i < producttable.rows.length; i++) {
		
	}
}

function appendRequirements(product, level) {
	for (var req in product.requires) {
		var sproduct = factorio.Products[req];
		//console.debug([req, 'required'].join(' '));
		console.assert(sproduct, 'DATA ERROR: ' + req + ' NOT FOUND!');
		if (sproduct.tier == 0 && !showraw) {
			//console.debug(['Raw resource ignored:',req].join(' '));
			continue;
		}
		var row = producttable.insertRow();
		var pcount = row.insertCell();
		var n;
		n = document.createElement('input');
		n.value = product.requires[req];
		n.size = 4;
		pcount.appendChild(n);
		var pname = row.insertCell();
		n = document.createElement('input');
		n.value = Array(level+1).join('+') + ' ' + req;
		n.size = 16;
		pname.appendChild(n);
		var ptype = row.insertCell();
		n = document.createElement('input');
		n.value = ValueIfNotNull(sproduct.type);
		n.size = 8;
		ptype.appendChild(n);
		var ptime = row.insertCell();
		n = document.createElement('input');
		n.value = ValueIfNotNull(sproduct.time, 1) * product.requires[req];
		if (sproduct.time) {
			totaltime += sproduct.time * product.requires[req];
		}
		n.size = 6;
		ptime.appendChild(n);
		n = document.createElement('input');
		var pfuel = row.insertCell();
		n = document.createElement('input');
		n.value = ValueIfNotNull(sproduct.fuel);
		totalfuel += FuelToNumber(sproduct.fuel);
		n.size = 6;
		pfuel.appendChild(n);
		var pprod = row.insertCell();
		n = document.createElement('input');
		n.value = ValueIfNotNull(sproduct.producer);
		n.size = 12;
		pprod.appendChild(n);
		var preq = row.insertCell();
		n = document.createElement('input');
		n.value = ValueIfRequirements(factorio.Products[req].requires);
		n.size = 40;
		preq.appendChild(n);
		
		// CASCADE!!!
		if (factorio.Products[req].requires) {
			appendRequirements(factorio.Products[req], level+1);
		}
	}
}

function changeEndProduct() {
	var epnam = document.productselector.epnamsel;
	var selected = epnam.value;
	//console.log([selected, 'selected!'].join(' '));
	var product = factorio.Products[selected];
	//showraw = document.getElementById('showraw').checked;
	
	totaltime = 0, totalfuel = 0;
	
	producttable = document.getElementById('producttable'); // why is this needed?
	while (producttable.rows.length > tableRowPadding+1) {
		producttable.deleteRow(tableRowPadding+1); // delete the extra rows from previous selection
	}
	
	if (product) {
		document.productselector.eptyp.value = ValueIfNotNull(product.type);
		document.productselector.eptim.value = ValueIfNotNull(product.time);
		if (product.time) {
			totaltime += product.time;
		}
		document.productselector.epfue.value = ValueIfNotNull(product.fuel);
		if (product.fuel) {
			totalfuel += FuelToNumber(product.fuel);
		}
		document.productselector.epreq.value = ValueIfRequirements(product.requires);
		document.productselector.epprd.value = ValueIfNotNull(product.producer);
		
		if (product.requires) {
			appendRequirements(product, 1);
			
			// separator
			var empty = producttable.insertRow();
			var wcell = empty.insertCell();
			wcell.colSpan = tableCols;
			wcell.appendChild(document.createElement('hr'));
			
			// output total times and such
			
			var trow = producttable.insertRow();
			trow.insertCell();// empty, item count actually
			
			var tcell = trow.insertCell();
			tcell.innerHTML = 'Total:';
			
			trow.insertCell();// empty
			
			// total time
			var ttime = trow.insertCell();
			n = document.createElement('input');
			n.value = totaltime;
			n.size = 6;
			ttime.appendChild(n);
			
			// total fuel
			if (totalfuel > 0) {
				var tfuel = trow.insertCell();
				n = document.createElement('input');
				n.value = PrettyFuelValue(totalfuel);
				n.size = 6;
				tfuel.appendChild(n);
			}
		}
	} else {
		console.warn(selected + ' not found');
	}
	
}

function setupProducts()
{
	//var epnam = document.getElementById('epnamsel');
	var epnam = document.productselector.epnamsel;
	if (!epnam) {
		console.warn('Couldn\'t find selector!');
		return;
	}
	// clear fake options
	/*
	while (epnam.options.length > 0) {
		epnam.options.remove(0);
	};
	*/
	epnam.options.length = 0; // shouldn't work, length is readonly
	for (var key in factorio.Products) {
		epnam.options[epnam.options.length] = new Option(key);
	}
	
	console.log('Products found: ' + epnam.options.length);
	
	changeEndProduct();
}

/*
function getProcessors(product)
{
	var p = factorio.Products[product].processor;
	if (p) {
		return factorio.Processors[processor+'s'].getKeys();
	};
	return null; // doesn't require anything specific
}
*/

function updateLaserDPS()
{
	var dps = document.laserturret.ldps;
	var dpsinc = document.laserturret.lpercent;
	
	dps.value = (document.laserturret.ldamage.value * document.laserturret.lspeed.value).toFixed(1);
	var baseDPS = turrets.Laser.Speed * turrets.Laser.Damage;
	dpsinc.value = ((dps.value / baseDPS)*100).toFixed(0) + '%';
	
	//console.log(['New laser turret DPS:', dps.value].join(' '));
}

function updateGunDPS()
{
	var dps = document.gunturret.gdps;
	var dpsinc = document.gunturret.gpercent;
	
	dps.value = (document.gunturret.gdamage.value * document.gunturret.gspeed.value).toFixed(1);
	var baseDPS = turrets.Gun.Speed * turrets.Gun.Damage[0];
	dpsinc.value = ((dps.value / baseDPS)*100).toFixed(0) + '%';
	
	document.gunturret.gempty.value = (turrets.Gun.Capacity / document.gunturret.gspeed.value).toFixed(1) + 's';
	
	//console.log(['New gun turret DPS:', dps.value].join(' '));
}

function changeLaserDamageUpgrade()
{
	var td = document.laserturret.ldamageupg;
	var selected = td.value;
	
	//console.log(['Laser damage upgrade changed to:', selected].join(' '));
	
	document.laserturret.ldamage.value = (turrets.Laser.Damage * turrets.Laser.Upgrades.Damage[selected]).toFixed(2);
	
	updateLaserDPS();
}

function changeLaserSpeedUpgrade()
{
	var ts = document.laserturret.lspeedupg;
	var selected = ts.value;
	
	//console.log(['Laser speed upgrade changed to:', selected].join(' '));
	
	document.laserturret.lspeed.value = (turrets.Laser.Speed * turrets.Laser.Upgrades.Speed[selected]).toFixed(2);
	
	updateLaserDPS();
}

function changeGunSpeedUpgrade()
{
	var ts = document.gunturret.gspeedupg;
	var selected = ts.value;
	
	//console.log(['Gun speed upgrade changed to:', selected].join(' '));
	
	document.gunturret.gspeed.value = (turrets.Gun.Speed * turrets.Gun.Upgrades.Speed[selected]).toFixed(2);
	
	updateGunDPS();
}

function changeGunDamageUpgrade()
{
	var seldam = document.gunturret.gdamageupg.value;
	var selammo = document.gunturret.gammo.value;
	var seltur = document.gunturret.gturretupg.value;
	
	//console.log(['Gun damage upgrade changed to:', seldam].join(' '));
	
	document.gunturret.gdamage.value = (turrets.Gun.Ammo[selammo] * turrets.Gun.Upgrades.Damage[seldam] * turrets.Gun.Upgrades.Turret[seltur]).toFixed(2);
	
	updateGunDPS();
}

function changeGunTurretUpgrade()
{
	var seldam = document.gunturret.gdamageupg.value;
	var selammo = document.gunturret.gammo.value;
	var seltur = document.gunturret.gturretupg.value;
	
	//console.log(['Gun turret upgrade changed to:', seltur].join(' '));
	
	document.gunturret.gdamage.value = (turrets.Gun.Ammo[selammo] * turrets.Gun.Upgrades.Damage[seldam] * turrets.Gun.Upgrades.Turret[seltur]).toFixed(2);
	
	updateGunDPS();
}

function changeGunAmmo()
{
	var seldam = document.gunturret.gdamageupg.value;
	var selammo = document.gunturret.gammo.value;
	var seltur = document.gunturret.gturretupg.value;
	
	//console.log(['Gun ammo changed to:', selammo].join(' '));
	
	document.gunturret.gdamage.value = (turrets.Gun.Ammo[selammo] * turrets.Gun.Upgrades.Damage[seldam] * turrets.Gun.Upgrades.Turret[seltur]).toFixed(2);
	
	updateGunDPS();
}

function setupTurrets()
{
	var gdamage = document.gunturret.gdamageupg;
	var gturret = document.gunturret.gturretupg;
	var gspeed = document.gunturret.gspeedupg;
	var gammo = document.gunturret.gammo;
	
	var ldamage = document.laserturret.ldamageupg;
	var lspeed = document.laserturret.lspeedupg;
	
	if (!gdamage || !gspeed || !gturret || !lspeed || !ldamage) {
		console.log('Couldn\'t find one or more of turret option selectors!');
		return;
	}
	
	// fill gun turret details
	
	gdamage.options.length = 0;
	gspeed.options.length = 0;
	gturret.options.length = 0;
	gammo.options.length = 0;
	
	for (var key in turrets.Gun.Ammo) {
		gammo.options[gammo.options.length] = new Option(key);
	}
	for (var key in turrets.Gun.Upgrades.Speed) {
		gspeed.options[gspeed.options.length] = new Option(key);
	}
	for (var key in turrets.Gun.Upgrades.Damage) {
		gdamage.options[gdamage.options.length] = new Option(key);
	}
	for (var key in turrets.Gun.Upgrades.Turret) {
		gturret.options[gturret.options.length] = new Option(key);
	}
	
	//console.debug(['Gun ammo options found:', gammo.options.length].join(' '));
	//console.debug(['Gun turret options found:', gturret.options.length].join(' '));
	//console.debug(['Gun damage options found:', gdamage.options.length].join(' '));
	//console.debug(['Gun speed options found:', gspeed.options.length].join(' '));
	
	// fill laser turret details
	
	ldamage.options.length = 0;  // shouldn't work, length is readonly
	lspeed.options.length = 0;
	
	for (var key in turrets.Laser.Upgrades.Damage) {
		ldamage.options[ldamage.options.length] = new Option(key);
	}
	for (var key in turrets.Laser.Upgrades.Speed) {
		lspeed.options[lspeed.options.length] = new Option(key);
	}
	
	//console.debug(['Laser damage options found:', ldamage.options.length].join(' '));
	//console.debug(['Laser speed options found:', lspeed.options.length].join(' '));
	
	// update shown numbers
	changeLaserDamageUpgrade();
	changeLaserSpeedUpgrade();
	
	changeGunAmmo();
	changeGunDamageUpgrade();
	changeGunTurretUpgrade();
	changeGunSpeedUpgrade();
}

function toggleShowRaw()
{
	showraw = document.getElementById('showraw').checked;
	console.log('Show raw resources: ' + showraw);
	changeEndProduct(); // update listing
}

function setup()
{
	producttable = document.getElementById('producttable');
	showraw = document.getElementById('showraw').checked;
	console.log('Show raw resources: ' + showraw);
}
