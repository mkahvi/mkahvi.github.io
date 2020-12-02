# Video Game Compatibility

Random factoids about video game compatibility and solutions to it, as collected by Mana#4176.

## :heavy_exclamation_mark: 8 or more CPU cores – Win XP/Vista games (pre-Win10)

**Affected systems**: Windows 10 (and newer?)  
**Cause**: Unclear. :question:  
**Problem**: Excess of 8 ​(:eight:)​ CPU cores not supported.  
**Effects**: Crashes or other odd problems.

### :green_heart: Solutions

**General**: Unclear.  
**AMD specific**: _Ryzen Master_ provides `Legacy Compatibility Mode` option in Game Mode which is meant to solve this, and it works. Disabling SMT supposedly helps, too.

##  :heavy_exclamation_mark: Single-core – Win 98/ME and older games (pre-Win2k)

**Affected systems**: Windows 2000 and newer  
**Cause**: Windows 95 (along with 98 and ME) were cooperatively multithreaded with no true multithreading support.  
Cause, extended info: Programs by default start with full CPU affinity to use all available cores if possible (or to be run in any, in case they do not do proper multithreading).  
**Problem**: Multithreading was not a real thing before Windows 2000.  
**Effects**: Lockups or crashes.

### :green_heart: Solutions

**General**: Constrain them to single core on launch.

Note: The affinity in the following solutions is a bitmask for which cores to use, so 1 is 1st core (0001), 8 is 4th core (1000), 5 is first and third core (0101), and so forth. Use programmer mode in a calculator to easily convert decimals to binary and back to figure this out.

#### CMD or .bat/.cmd file

```cmd
start /affinity 1 game.exe
```

#### Power Shell

```powershell
$exe = "game" # name of the executable, including .exe if you so desire
$params = "" # any command-line arguments you want to pass
$game = Start-Process $exe $params -PassThru
$game.ProcessorAffinity = 0x1
```

# :package: ​Resources

* [PC Gaming Wiki](https://www.pcgamingwiki.com/)

# :hammer_and_wrench: Tools

Nothing here for now.
