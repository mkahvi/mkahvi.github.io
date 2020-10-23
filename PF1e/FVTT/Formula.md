# Formulas for Foundry VTT use

**By**: MKAh (Discord: Mana#4176)

[Go back](./)

WARNING: THESE ARE TESTED ONLY ON FOUNDRY 0.6.6  
0.7 BRANCH MADE FORMULAS WORK SLIGHTLY DIFFERENTLY.

## Basic formulas

Variables are found usually with mouse hover tooltip on relevant thing.

| THING                                              | FORMULA                                                      |
| -------------------------------------------------- | ------------------------------------------------------------ |
| Half class level                                   | `floor(@classes.boo.level / 2)`                              |
| Half class level, minium 1                         | `max(1, floor(@classes.boo.level / 2))`                      |
| Ability modifier                                   | `@abilities.con.mod`                                         |
|                                                    |                                                              |
| Sneak Attack style progression (Lvls 1, 3, 5,...)  | `ceil(@classes.boo.level / 2)d6`                             |
| Lay on Hands style progression (Lvls 2, 4, 6,...)  | `floor(@classes.boo.level / 2)d6`                            |
| Arcane Strike style (Lvls 1, 5, 10, 15,...)        | `1 + floor(@classes.wizard.level / 5)`                       |
|                                                    |                                                              |
| **ITEMS**                                          |                                                              |
| Composite Bow w/ +2 Strength modifier              | `min(@abilties.str.mod, 2)`                                  |
|                                                    |                                                              |
| **POWER ATTACK**                                   |                                                              |
| Attack penalty                                     | `-floor((@attributes.bab.total + 4) / 4)`                    |
| Damage bonus                                       | `floor((@attributes.bab.total + 4) / 4) * 2`                 |
| Alternatively                                      | `-1 - floor(@attributes.bab.total / 4)`                      |
| Alt. Damage                                        | `2 + floor(@attributes.bab.total / 4) * 2`                   |
|                                                    |                                                              |
| **CLASS FEATURES**                                 |                                                              |
| Cavalier Challenge dailies (Lvls 1, 4, 7, 10, ...) | `floor((@classes.cavalier.level + 2) / 3)`                   |
|                                                    |                                                              |
| **FEATS**                                          |                                                              |
| Skill Focus (+3 base, +6 at 10 ranks and higher)   | `@skills.int.rank > 9 ? 6 : 3`                               |
| Fleet feat speed bonus                             | `(@armor.type < 2 && @attributes.encumbrance.level < 1) ? 5 : 0` |

