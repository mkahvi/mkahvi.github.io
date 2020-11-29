# Problems with FVTT PF1e

This is not an official resource. I take no responsibility for any solutions here working or not.

## Compendium errors ('collection' of null)

Extra observations: Problem persists with modules disabled. Problem DOES NOT occur in different browser, incognito mode, or separate profile.

```js
Uncaught (in promise) TypeError: Cannot read property 'collection' of null
    at CompendiumBrowser._mapEntry (compendium-browser.js:513)
    at CompendiumBrowser._fetchMetadata (compendium-browser.js:263)
    at CompendiumBrowser._gatherData (compendium-browser.js:148)
    at compendium-browser.js:134
    at new Promise (<anonymous>)
    at CompendiumBrowser.loadData (compendium-browser.js:131)
    at CompendiumBrowser.getData (compendium-browser.js:549)
    at CompendiumBrowser._render (foundry.js:4509)
    at CompendiumBrowser._render (compendium-browser.js:953)
    at CompendiumDirectoryPF._onBrowseCompendium (compendium.js:24)
```

```js
compendium-browser.js:1118 Uncaught (in promise) TypeError: Cannot read property 'querySelector' of undefined
    at CompendiumBrowser._filterResults (compendium-browser.js:1118)
    at CompendiumBrowser._render (compendium-browser.js:966)
```

**Solution**: Delete site cookies and refresh.

**Alternative for Electron**: Open console with F12 and run the following code. **THIS DOESN’T ACTUALLY WORK**

```js
const { session } = require('electron');
await session.defaultSession.clearStorageData({"storages": ["cookies"]}); // clear cookies
//await session.defaultSession.clearStorageData(); // clears everything
```

**Alternate**: Select browse application data from the app context menu, go up to the folder with cookie files, close Electron, delete the cookie files, relaunch Electron.

Why does this happen? Unknown. Weird cookie data?

## energyDrain not in rollData

**Solution**: Update to latest version of PF1e (`0.75.13` at minimum) and Foundry (`0.7.7` at minimum).  
If problem persists, run `game.pf1.migrateWorld();` in console (F12) as GM.

Why does this happen? I dunno. Conversion to deal with Foundry’s updates maybe?

## Character sheet renders weird

Extra observations: PF1e version 0.701

**Solution**: Update to latest version of PF1e (`0.75.13` at minimum) and Foundry (`0.7.7` at minimum).  
If problem persists, uninstall PF1e first and then re-install it.

Why does this happen? Semantic versioning not compatible with old versioning (701 is larger than any other version number)