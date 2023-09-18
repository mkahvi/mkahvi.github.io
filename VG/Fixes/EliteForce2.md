# Elite Force II (2)

## Fixes

Following are console commands.

You can also define them in your `UserName.cfg` by prefixing them with `seta` and quoting the value. Easier to set them in the console however.

### Mouse issues

For example if the main menu mouse feels weird.

**Raw input**, maybe help with stuck mouse buttons and odd mouse movement.

`in_mouse -1`

**DirectInput**, which may help with odd mouse input, but in my experience resulted in mouse buttons getting stuck.

`in_mouse 1`

Requires restart.

### Zero gravity clip through

`com_maxfps 80`

Values greater tha 80 supposedly cause issues even though the game defaults to 85.

### Stuttering

`com_hunkMegs 100`

Any value greater than ~70 should be good.

### Model LOD issues

`r_lodCurveError 500`

Use some arbitrary larger than default values. There's no harm setting this to 5000000.

`r_lodbias -1`

### World geometry

`r_subdivisions -1`

This can severely affect framerate however, so restore it to 4 or something if having issues.
