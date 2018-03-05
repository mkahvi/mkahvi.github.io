// https://www.w3schools.com/html/html5_webstorage.asp
// https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage

if (typeof(Storage) !== "undefined") {
    // Code for localStorage/sessionStorage.
} else {
    // Sorry! No Web Storage support..
}

var storage = window.localStorage;
var keyPrefix = "ma-tools-";
var offset = 0;

function getResults() {
	offset = Number(storage.getItem(keyPrefix+"offset"));
	
	var list = new array();
	for (var i = 0; i < offset; i++) {
		list.push(getResult(keyPrefix+i));
	}
	
	return list;
}

function compressResults() {
	var item = null;
	var seekoffset = offset;
	offset = 0;
	// find first empty slot
	while (getResult(offset) != null) offset++;
	// drop down results
	for (var key = offset; key < seekoffset; key++) {
		if (key > offset) {
			item = getResult(key);
			if (item != null) {
				saveResult(item);
				deleteResult(key);
			}
		}
	}
}

function getResult(key) {
	return storage.getItem(keyPrefix+key);
}

function saveResult(result) {
	var key = offset++;
	storage.setItem(keyPrefix+key, result);
	storage.setItem(keyPrefix+"offset", offset);
	return key;
}

function deleteResult(key) {
	storage.removeItem(keyPrefix+key);
}
