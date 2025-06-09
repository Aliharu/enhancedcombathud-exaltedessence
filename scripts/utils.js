const ModuleName = "enhancedcombathud-exaltedessence";

async function getTooltipDetails(item) {
    let title, description, subtitle, details, properties, propertiesLabel;

    title = item.name;
    description = await TextEditor.enrichHTML(item.system.description);
    details = [];

    if(item.type === 'weapon') {
        subtitle = `${item.system.weapontype.capitalize()} Attack`;
        details.push({
            label: game.i18n.localize("ExEss.Accuracy"),
            value: item.system.accuracy
        });
    
        details.push({
            label: game.i18n.localize("ExEss.Damage"),
            value: item.system.damage
        });
    
        details.push({
            label: game.i18n.localize("ExEss.Defense"),
            value: item.system.defense
        });
    
        details.push({
            label: game.i18n.localize("ExEss.Overwhelming"),
            value: item.system.overwhelming
        });
        let tags = Object.values(item.system.traits.weapontags.selected).map((tag) => { return { label: tag } });
        properties = tags;
    
        propertiesLabel = properties?.length ? game.i18n.localize("ExEss.WeaponTags") : "";
    }

    if(item.type === 'charm') {

        let costString = '';
        if (item.system.cost.motes > 0 || item.system.cost.commitmotes > 0) {
          costString += `${item.system.cost.motes || item.system.cost.commitmotes}m, `
        }
        if (item.system.cost.anima > 0) {
          costString += `${item.system.cost.anima}a, `
        }
        if (item.system.cost.power > 0) {
          costString += `${item.system.cost.power}i, `
        }
        if (item.system.cost.health > 0) {
          costString += `${item.system.cost.health}`
          if (item.system.cost.healthtype === 'lethal') {
            costString += `lhl, `
          }
          if (item.system.cost.healthtype === 'aggravated') {
            costString += `ahl, `
          }
        }
        if(!costString) {
            costString = "None"
        }
        subtitle = item.system.type;

        details.push({
            label: game.i18n.localize("ExEss.Cost"),
            value: costString
        });
    }

    return { title, description, subtitle, details, properties, propertiesLabel };
}

export { getTooltipDetails, ModuleName }
