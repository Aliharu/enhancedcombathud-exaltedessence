import { ModuleName } from "./utils.js";

var ExEssECHCombatItems = {};
var ExEssECHMovementItems = {};
var ExEssECHMagicItems = {};
var ExEssECHOtherItems = {};

async function registerExEssECHSItems() {
    ExEssECHCombatItems = {
        groupflags: {
            actiontype: "combat"
        },
        FullDefense: {
            img: "icons/svg/shield.svg",
            name: game.i18n.localize("ExEss.FullDefense"),
            type: "base",
            system: {
                description: game.i18n.localize(ModuleName + ".Descriptions.FullDefense")
            },
            flags: {
                [ModuleName]: {
                    actionValue: 'fullDefense'
                }
            }
        },
        DefendOther: {
            img: `modules/${ModuleName}/icons/arrows-shield.svg`,
            name: game.i18n.localize("ExEss.DefendOther"),
            type: "base",
            system: {
                description: game.i18n.localize(ModuleName + ".Descriptions.DefendOther")
            },
            flags: {
                [ModuleName]: {
                    actionValue: 'defendOther'
                }
            }
        },
        Miscellaneous: {
            img: `modules/${ModuleName}/icons/swiss-army-knife.svg`,
            name: game.i18n.localize("ExEss.Misc"),
            type: "base",
            system: {
                description: game.i18n.localize(ModuleName + ".Descriptions.Miscellaneous")
            },
            flags: {
                [ModuleName]: {
                    actionValue: 'miscellaneous'
                }
            }
        },
        PowerExchange: {
            img: `modules/${ModuleName}/icons/body-swapping.svg`,
            name: game.i18n.localize("ExEss.PowerExchange"),
            type: "base",
            system: {
                description: game.i18n.localize(ModuleName + ".Descriptions.PowerExchange")
            },
            flags: {
                [ModuleName]: {
                    actionValue: 'powerExchange'
                }
            }
        },
        BuildPower: {
            img: `modules/${ModuleName}/icons/lightning-helix.svg`,
            name: game.i18n.localize("ExEss.BuildPower"),
            type: "base",
            system: {
                description: game.i18n.localize(ModuleName + ".Descriptions.BuildPower")
            },
            flags: {
                [ModuleName]: {
                    actionValue: 'buildPower'
                }
            }
        },
    }

    ExEssECHMovementItems = {
        groupflags: {
            actiontype: "movement"
        },
        Sprint: {
            img: `modules/${ModuleName}/icons/sprint.svg`,
            name: game.i18n.localize("ExEss.Sprint"),
            type: "base",
            system: {
                description: game.i18n.localize(ModuleName + ".Descriptions.Sprint")
            },
            flags: {
                [ModuleName]: {
                    actionValue: 'sprint'
                }
            }
        },
        Aim: {
            img: "systems/exaltedessence/assets/icons/targeting.svg",
            name: game.i18n.localize("ExEss.Aim"),
            type: "base",
            system: {
                description: game.i18n.localize(ModuleName + ".Descriptions.Aim")
            },
            flags: {
                [ModuleName]: {
                    actionValue: 'aim'
                }
            }
        },
        Rush: {
            img: `modules/${ModuleName}/icons/sprint.svg`,
            name: game.i18n.localize("ExEss.Rush"),
            type: "base",
            system: {
                description: game.i18n.localize(ModuleName + ".Descriptions.Rush")
            },
            flags: {
                [ModuleName]: {
                    actionValue: 'rush'
                }
            }
        },
        RiseFromProne: {
            img: "icons/svg/up.svg",
            name: game.i18n.localize("ExEss.RiseFromProne"),
            type: "base",
            system: {
                description: game.i18n.localize(ModuleName + ".Descriptions.RiseFromProne")
            },
            flags: {
                [ModuleName]: {
                    actionValue: 'riseFromProne'
                }
            }
        },
    }


    ExEssECHMagicItems = {
        groupflags: {
            actiontype: "charm"
        },
    }

    ExEssECHOtherItems = {
        groupflags: {
            actiontype: "social"
        },
        Influence: {
            img: `modules/${ModuleName}/icons/heartburn.svg`,
            name: game.i18n.localize("ExEss.Influence"),
            type: "base",
            system: {
                description: game.i18n.localize(ModuleName + ".Descriptions.Influence")
            },
            flags: {
                [ModuleName]: {
                    actionValue: 'influence'
                }
            }
        },
        focusWill: {
            img: "systems/exaltedessence/assets/icons/magic-swirl.svg",
            name: game.i18n.localize("ExEss.FocusWill"),
            type: "base",
            system: {
                description: game.i18n.localize(ModuleName + ".Descriptions.FocusWill")
            },
            flags: {
                [ModuleName]: {
                    actionValue: 'focusWill',
                }
            }
        },
        CatchBreath: {
            img: "icons/svg/regen.svg",
            name: game.i18n.localize("ExEss.CatchBreath"),
            type: "base",
            system: {
                description: game.i18n.localize(ModuleName + ".Descriptions.CatchBreath")
            },
            flags: {
                [ModuleName]: {
                    actionValue: 'catchBreath'
                }
            }
        },
        FullRest: {
            img: "icons/svg/regen.svg",
            name: game.i18n.localize("ExEss.FullRest"),
            type: "base",
            system: {
                description: game.i18n.localize(ModuleName + ".Descriptions.FullRest")
            },
            flags: {
                [ModuleName]: {
                    actionValue: 'fullRest'
                }
            }
        },
    }

    //some preparation
    for (let itemset of [ExEssECHCombatItems, ExEssECHMovementItems, ExEssECHMagicItems, ExEssECHOtherItems]) {
        for (let itemkey of Object.keys(itemset)) {
            if (itemkey != "groupflags") {
                itemset[itemkey].flags = { ...itemset[itemkey].flags };
                itemset[itemkey].flags[ModuleName] = { ...itemset.groupflags, ...itemset[itemkey].flags[ModuleName] };
            }
        }

        delete itemset.groupflags;
    }
}

export { registerExEssECHSItems, ExEssECHCombatItems, ExEssECHMovementItems, ExEssECHMagicItems, ExEssECHOtherItems }
