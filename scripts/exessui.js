import { registerExEssECHSItems, ExEssECHCombatItems, ExEssECHMovementItems, ExEssECHOtherItems } from "./specialItems.js";
import { getTooltipDetails, ModuleName } from "./utils.js";


Hooks.on("argonInit", (CoreHUD) => {
	const ARGON = CoreHUD.ARGON;

	registerExEssECHSItems();

	class ExEssEffect extends ARGON.PORTRAIT.Effect {
		constructor(...args) {
			super(...args);
		}

		async _onLeftClick(event) {
			if (this.effect.type === 'item') {
				this.effect.sheet.render(true);
			} else if (this.effect.parent?.parentCollection === 'items') {
				this.effect.parent.sheet.render(true);
			}
		}
	}

	class ExEssPortraitPanel extends ARGON.PORTRAIT.PortraitPanel {
		constructor(...args) {
			super(...args);

			this.wasDead = {};
		}

		get effectClass() {
			return ExEssEffect;
		}

		get description() {
			if (this.actor.type === 'character' || (this.actor.type === 'npc' && this.actor.system.creaturetype === 'exalt')) {
				return `Essence ${this.actor.system.essence.value} ${this.actor.system.details.exalt.capitalize()}`;
			}
			return `Essence ${this.actor.system.essence.value}`;
		}

		async _getButtons() {
			return [
				{
					id: "roll-initiative",
					icon: "fas fa-dice-d10",
					label: "Join Battle",
					onClick: (e) => this.actor.rollInitiative({ rerollInitiative: true, createCombatants: true })
				},
				{
					id: "open-sheet",
					icon: "fas fa-address-card",
					label: "Open Character Sheet",
					onClick: (e) => this.actor.sheet.render(true)
				},
				{
					id: "toggle-minimize",
					icon: "fas fa-caret-down",
					label: "Minimize",
					onClick: (e) => ui.ARGON.toggleMinimize()
				}
			];
		}

		async getEffects() {
			const effects = [];
			for (const activeCharm of this.actor.items.filter(item => item.system.active)) {
				if (!activeCharm.disabled) {
					effects.push({ type: 'item', img: activeCharm.img, name: activeCharm.name, tooltip: await TextEditor.enrichHTML(activeCharm.system.description), sheet: activeCharm.sheet });
				}
			}
			for (const effect of this.actor.allApplicableEffects()) {
				if (!effect.disabled) {
					effects.push({ type: 'effect', img: effect.img, name: effect.name, tooltip: await TextEditor.enrichHTML(effect.description), parent: effect.parent });
				}
			}
			return effects;
		}

		async getsideStatBlocks() {
			let Blocks = { left: [], right: [] };

			Blocks['left'].unshift([
				{
					text: `${this.actor.system.health.value}`,
					color: this.actor.system.health.value > 0 ? "rgb(0 255 100)" : "rgb(252, 3, 7)",
				},
				{
					text: `/`,
				},
				{
					text: `${this.actor.system.health.max}`,
					color: "rgb(255 255 255)",
				},
				{
					text: 'HP',
					id: "hpText",
				},
				{
					text: this.actor.system.health.penalty ? `(-${this.actor.system.health.penalty})` : '',
					id: "hpPenalty",
				},
			]);

			if (this.actor.type === 'character' || (this.actor.type === 'npc' && this.actor.system.creaturetype === 'exalt')) {
				Blocks['left'].unshift([
					{
						text: game.i18n.localize("ExEss.Anima"),
					},
					{
						isinput: true,
						inputtype: "number",
						changevent: (newvalue) => this.actor.update({ [`system.anima.value`]: newvalue }),
						text: this.actor.system.anima.value,
						color: "rgb(249, 181, 22)",
					},
					{
						text: "/",
					},
					{
						text: "10"
					}
				]);

			}

			Blocks['right'].unshift([
				{
					text: game.i18n.localize("ExEss.Motes"),
				},
				{
					isinput: true,
					inputtype: "number",
					text: this.actor.system.motes.value,
					color: this.actor.system.motes.value > 0 ? "rgb(249, 181, 22)" : "rgb(252, 3, 7)",
					changevent: (newvalue) => this.actor.update({ [`system.motes.value`]: newvalue })
				},
				{
					text: "/",
				},
				{
					text: this.actor.system.motes.max
				}
			]);

			Blocks['right'].unshift([
				{
					text: game.i18n.localize("ExEss.Power"),
				},
				{
					isinput: true,
					inputtype: "number",
					changevent: (newvalue) => this.actor.update({ [`system.power.value`]: newvalue }),
					text: this.actor.system.power.value,
					color: "rgb(249, 181, 22)",
				},
				{
					text: "/",
				},
				{
					text: this.actor.system.power.max
				}
			]);

			if (this.actor.items.some(spell => spell.type === 'spell')) {
				Blocks['right'].unshift([
					{
						text: game.i18n.localize("ExEss.Will"),
					},
					{
						isinput: true,
						inputtype: "number",
						changevent: (newvalue) => this.actor.update({ [`system.will.value`]: newvalue }),
						text: this.actor.system.will.value,
						color: "rgb(249, 181, 22)",
					}
				]);
			}


			return Blocks;
		}

		async _renderInner(data) {
			await super._renderInner(data);

			const statBlocks = await this.getsideStatBlocks();
			for (const position of ["left", "right"]) {
				const sb = document.createElement("div");

				sb.style = `position : absolute;${position} : 0px`;

				for (const block of statBlocks[position]) {
					const sidesb = document.createElement("div");
					sidesb.classList.add("portrait-stat-block");
					sidesb.style.paddingLeft = "0.35em";
					sidesb.style.paddingRight = "0.35em";
					for (const stat of block) {
						if (!stat.position) {
							let displayer;
							if (stat.isinput) {
								displayer = document.createElement("input");
								displayer.type = stat.inputtype;
								displayer.value = stat.text;
								displayer.style.width = "1.5em";
								displayer.style.color = "#ffffff";
								displayer.onchange = () => { stat.changevent(displayer.value) };
							}
							else {
								displayer = document.createElement("span");
								displayer.innerText = stat.text;
							}
							displayer.style.color = stat.color;
							sidesb.appendChild(displayer);
						}
					}
					sb.appendChild(sidesb);
				}
				this.element.appendChild(sb);
			}
		}
	}

	class ExEssDrawerPanel extends ARGON.DRAWER.DrawerPanel {
		constructor(...args) {
			super(...args);
		}

		get categories() {
			let returncategories = [];

			let socialButtons = [
				new ARGON.DRAWER.DrawerButton([
					{
						label: game.i18n.localize("ExEss.Resolve"),
					},
					{
						label: `${this.actor.system.resolve.value}`,
						style: "display: flex; justify-content: flex-end;"
					}
				]),
			];

			let combatButtons = [
				new ARGON.DRAWER.DrawerButton([
					{
						label: game.i18n.localize("ExEss.Defense"),
					},
					{
						label: `${this.actor.type === 'character' ? Math.max(this.actor.system.evasion.value, this.actor.system.parry.value) : this.actor.system.defense.value}`,
						style: "display: flex; justify-content: flex-end;"
					}
				]),
				new ARGON.DRAWER.DrawerButton([
					{
						label: game.i18n.localize("ExEss.Soak"),
					},
					{
						label: `${this.actor.system.soak.value}`,
						style: "display: flex; justify-content: flex-end;"
					}
				]),
				new ARGON.DRAWER.DrawerButton([
					{
						label: game.i18n.localize("ExEss.Hardness"),
					},
					{
						label: `${this.actor.system.hardness.value}`,
						style: "display: flex; justify-content: flex-end;"
					}
				]),
			];

			if (this.actor.type === 'character') {
				let abilityButtons = []
				const abilities = this.actor.system.abilities;
				for (let [id, ability] of Object.entries(abilities)) {
					abilityButtons.push(new ARGON.DRAWER.DrawerButton([
						{
							label: game.i18n.localize(ability.name),
							onClick: () => {
								this.actor.actionRoll(
									{ rollType: 'ability', ability: id }
								);
							}
						},
						{
							label: ability.value,
							style: "display: flex; justify-content: flex-end;"
						}
					]));
				}

				returncategories.push({
					gridCols: "7fr 2fr",
					captions: [
						{
							label: game.i18n.localize("ExEss.Abilities"),
						},
						{
							label: "",
						}
					],
					buttons: abilityButtons,
				});
			}

			if (this.actor.type === 'npc') {
				let actionButtons = [];
				const pools = this.actor.system.pools;
				for (let [id, pool] of Object.entries(pools)) {
					actionButtons.push(new ARGON.DRAWER.DrawerButton([
						{
							label: game.i18n.localize(id),
							onClick: () => {
								this.actor.actionRoll(
									{ rollType: 'ability', pool: id }
								);
							}
						},
						{
							label: pool.value,
							style: "display: flex; justify-content: flex-end;"
						}
					]));
				}

				returncategories.push({
					gridCols: "7fr 2fr",
					captions: [
						{
							label: game.i18n.localize("ExEss.Pools"),
						},
						{
							label: "",
						}
					],
					buttons: actionButtons,
				});

				if (this.actor.system.battlegroup) {
					const drillMap = {
						0: game.i18n.localize("ExEss.Poor"),
						1: game.i18n.localize("ExEss.Average"),
						2: game.i18n.localize("ExEss.Elite"),
					}
					returncategories.push({
						gridCols: "7fr 2fr",
						captions: [
							{
								label: game.i18n.localize("ExEss.Battlegroup"),
							},
							{
								label: "",
							}
						],
						buttons: [
							new ARGON.DRAWER.DrawerButton([
								{
									label: game.i18n.localize("ExEss.Drill"),
								},
								{
									label: drillMap[this.actor.system.drill.value],
									style: "display: flex; justify-content: flex-end;"
								}
							]),
						],
					});
				}
			}

			returncategories.push({
				gridCols: "7fr 2fr",
				captions: [
					{
						label: game.i18n.localize("ExEss.Combat"),
					},
					{
						label: "",
					}
				],
				buttons: combatButtons,
			});

			returncategories.push({
				gridCols: "7fr 2fr",
				captions: [
					{
						label: game.i18n.localize("ExEss.Other"),
					},
					{
						label: "",
					}
				],
				buttons: socialButtons,
			});

			return returncategories;
		}

		get title() {
			return `${game.i18n.localize("ExEss.Stats")}`;
		}
	}

	class ExEssWeaponSets extends ARGON.WeaponSets {
		constructor(...args) {
			super(...args);
		}

		async _onDrop(event) {
			try {
				event.preventDefault();
				event.stopPropagation();
				const data = JSON.parse(event.dataTransfer.getData("text/plain"));
				if (data?.type !== "Item") return;
				const item = await Item.fromDropData(data);

				if (item?.type !== "weapon") return;
				const set = event.currentTarget.dataset.set;
				const slot = event.currentTarget.dataset.slot;
				const sets = this.actor.getFlag("enhancedcombathud", "weaponSets") || {};
				sets[set] = sets[set] || {};
				sets[set][slot] = data.uuid;

				await this.actor.setFlag("enhancedcombathud", "weaponSets", sets);
				await this.render();
			} catch (error) {

			}
		}

		async _onSetChange({ sets, active }) {
			const updates = [];
			const activeSet = sets[active];
			const activeItems = Object.values(activeSet).filter((item) => item);
			const inactiveSets = Object.values(sets).filter((set) => set !== activeSet);
			const inactiveItems = inactiveSets.flatMap((set) => Object.values(set)).filter((item) => item);
			activeItems.forEach((item) => {
				if (!item.system?.equipped) updates.push({ _id: item.id, "system.equipped": true });
			});
			inactiveItems.forEach((item) => {
				if (item.system?.equipped) updates.push({ _id: item.id, "system.equipped": false });
			});
			return await this.actor.updateEmbeddedDocuments("Item", updates);
		}
	}

	class ExEssActionCombatPanel extends ARGON.MAIN.ActionPanel {
		constructor(...args) {
			super(...args);
		}

		get label() {
			return game.i18n.localize("ExEss.Combat");
		}

		async _getButtons() {
			const specialActions = Object.values(ExEssECHCombatItems);

			let buttons = [];
			buttons.push(new ExEssItemButton({ item: null, isWeaponSet: true, isPrimary: true }));
			buttons.push(new ExEssItemButton({ item: null, isWeaponSet: true, isSecondary: true }));

			buttons.push(new ARGON.MAIN.BUTTONS.SplitButton(new ExEssSpecialActionButton(specialActions[0]), new ExEssSpecialActionButton(specialActions[1])));
			buttons.push(new ARGON.MAIN.BUTTONS.SplitButton(new ExEssSpecialActionButton(specialActions[2]), new ExEssSpecialActionButton(specialActions[3])));
			buttons.push(new ExEssSpecialActionButton(specialActions[4]));
			return buttons;
		}
	}

	class ExEssMovementActionPanel extends ARGON.MAIN.ActionPanel {
		constructor(...args) {
			super(...args);
		}

		get label() {
			return ModuleName + ".Titles.Movement";
		}

		async _getButtons() {
			const specialActions = Object.values(ExEssECHMovementItems);
			let buttons = [];
			buttons.push(new ARGON.MAIN.BUTTONS.SplitButton(new ExEssSpecialActionButton(specialActions[0]), new ExEssSpecialActionButton(specialActions[1])));
			buttons.push(new ARGON.MAIN.BUTTONS.SplitButton(new ExEssSpecialActionButton(specialActions[2]), new ExEssSpecialActionButton(specialActions[3])));

			return buttons;
		}
	}

	class ExEssOtherActionPanel extends ARGON.MAIN.ActionPanel {
		constructor(...args) {
			super(...args);
		}

		get label() {
			return ModuleName + ".Titles.Other";
		}

		async _getButtons() {
			const specialActions = Object.values(ExEssECHOtherItems);
			let buttons = [];
			buttons.push(new ARGON.MAIN.BUTTONS.SplitButton(new ExEssSpecialActionButton(specialActions[0]), new ExEssSpecialActionButton(specialActions[1])));
			buttons.push(new ARGON.MAIN.BUTTONS.SplitButton(new ExEssSpecialActionButton(specialActions[2]), new ExEssSpecialActionButton(specialActions[3])));
			return buttons;
		}
	}

	class ExEssExaltActionPanel extends ARGON.MAIN.ActionPanel {
		constructor(...args) {
			super(...args);
		}

		get label() {
			return ModuleName + ".Titles.Magic";
		}

		async _getButtons() {
			let buttons = [];

			if (this.actor.items.some(charm => charm.type === 'charm')) {
				buttons.push(new ExEssButtonPanelButton({ type: "charm", color: 3 }));
			}
			if (this.actor.items.some(charm => charm.type === 'charm' && charm.system.diceroller.opposedbonuses.enabled)) {
				buttons.push(new ExEssButtonPanelButton({ type: "opposedCharm", color: 3 }));
			}

			return buttons;
		}
	}

	class ExEssItemButton extends ARGON.MAIN.BUTTONS.ItemButton {
		constructor({ item, isWeaponSet = false, isPrimary = false, inActionPanel = undefined, flags = null }) {
			super({ item, isWeaponSet, isPrimary, inActionPanel });

			this.flags = flags;
		}

		get hasTooltip() {
			return true;
		}

		get targets() {
			return null;
		}

		get hasTooltip() {
			return true;
		}

		get quantity() {
			if (this.item?.type === 'charm') return (Math.max(this.item.system.cost.motes, this.item.system.cost.commitmotes) || null);
			if (this.item?.type === 'spell') return (this.item.system.cost || null);
			return null;
		}

		async getTooltipData() {
			if (this.panel?.visible) return null;
			const tooltipData = await getTooltipDetails(this.item);
			return tooltipData;
		}

		async _onLeftClick(event) {
			if (this.item?.type === 'weapon') {
				const template = "modules/enhancedcombathud-exaltedessence/templates/attack.hbs";
				const html = await renderTemplate(template);

				new Dialog({
					title: game.i18n.localize("ExEss.Attack"),
					content: html,
					buttons: {
						closeImportItem: { label: "Close" }
					},
					render: (html) => {
						html.find('.attack').click(ev => {
							let attackType = $(ev.target).attr("data-roll-type");
							this.actor.actionRoll({ rollType: attackType, attackType: attackType, weapon: this.item.system });
							html.find('.closeImportItem').trigger('click');
						});

					},
				}, {
					resizable: true, classes: ["dialog", `${game.settings.get("exaltedessence", "sheetStyle")}-background`]
				}).render(true);
			}
			if (this.item?.type === 'spell') {
				if (this.item.system.cost) {
					this.actor.actionRoll(
						{
							rollType: 'sorcery',
							pool: 'sorcery',
							spell: this.item.id,
						}
					);
				}
				else {
					this.actor.spendItem(this.item);
				}
			}
			if (this.item?.type === 'charm') {
				if (this.flags?.specialType && this.flags.specialType === 'opposedCharm') {
					if (this.item?.parent) {
						game.socket.emit('system.exaltedessence', {
							type: 'addOpposingCharm',
							data: this.item,
							actorId: this.actor.id,
						});
						if (game.opposingCharmForm) {
							game.opposingCharmForm.addOpposingCharm(this.item);
						}
					}
				}
				else {
					this.actor.spendItem(this.item);
				}
			}
		}

		async _onRightClick(event) {
			if (event.target.classList.contains("specialAction")) return;

			if (this.item?.sheet) {
				this.item?.sheet?.render(true);
			}
			else {
				if (this.item?.system?.item?.sheet) {
					this.item.system.item.sheet.render(true);
				}
			}
		}

		async render(...args) {
			await super.render(...args);
		}
	}

	class ExEssSpecialActionButton extends ARGON.MAIN.BUTTONS.ActionButton {
		constructor(specialItem) {
			super();
			this.item = new CONFIG.Item.documentClass(specialItem, {
				parent: this.actor,
			});
		}

		get label() {
			return this.item.name;
		}

		get icon() {
			return this.item.img;
		}

		get hasTooltip() {
			return true;
		}

		// get quantity() {
		// 	if(this.item.flags[ModuleName]?.actionValue === 'grappleControl') {
		// 		return this.actor.system.grapplecontrolrounds.value;
		// 	}
		// 	return null;
		// }

		// async getData() {
		// 	if (!this.visible) return {};
		// 	const quantity = this.quantity;

		// 	return {
		// 	  ...(await super.getData()),
		// 	  quantity: quantity,
		// 	  hasQuantity: Number.isNumeric(quantity)
		// 	}
		// }

		// get template() {
		// 	return `/modules/${ModuleName}/templates/ActionButton.hbs`;
		// }

		get colorScheme() {
			switch (this.item?.flags[ModuleName]?.actiontype) {
				case "action":
					return 0;
				case "movement":
					return 1;
				case "exalt":
					return 3;
				case "social":
					return 4;
			}
			return 0;
		}

		async getTooltipData() {
			const tooltipData = await getTooltipDetails(this.item);
			return tooltipData;
		}

		async _onLeftClick(event) {
			if (this.item.flags[ModuleName]?.actionValue) {
				switch (this.item.flags[ModuleName]?.actionValue) {
					case "fullDefense":
					case "aim":
					case "defendOther":
					case "miscellaneous":
					case "rush":
					case "sprint":
					case "powerExchange":
						break;
					case "riseFromProne":
						new Dialog({
							title: `${game.i18n.localize("ExEss.Opposed")}?`,
							content: `
						  	<div>Is there an enemy in close range of you that wishes to oppose your action?</div>`,
							buttons: {
								no: {
									label: 'No',
									callback: async (html) => {
										const effectExists = this.actor.effects.find(e => e.statuses.has('prone'));
										if (effectExists) {
											await effectExists.delete();
										}
									}
								},
								yes: {
									label: 'Yes',
									callback: async (html) => {
										this.actor.actionRoll(
											{
												rollType: 'ability',
											}
										);
									}
								},
							},
							default: "no"
						}, {
							resizable: true, classes: ["dialog", `${game.settings.get("exaltedessence", "sheetStyle")}-background`]
						}).render(true);
						break;
					case "influence":
						this.actor.actionRoll(
							{
								rollType: 'social',
								ability: 'embassy'
							}
						);
						break;
					case "focusWill":
						this.actor.actionRoll(
							{
								rollType: 'focusWill',
								ability: 'sagacity',
							}
						);
						break;
					case "buildPower":
						this.actor.actionRoll(
							{
								rollType: 'buildPower',
							}
						);
						break;
					case "catchBreath":
						this.actor.catchBreath();
						break;
					case "fullRest":
						this.actor.fullRest();
						break;
				}
			}
		}
	}

	class ExEssButtonPanelButton extends ARGON.MAIN.BUTTONS.ButtonPanelButton {
		constructor({ type, color }) {
			super();
			this.type = type;
			this.color = color;
		}

		get colorScheme() {
			return this.color;
		}

		get label() {
			switch (this.type) {
				case "charm": return ModuleName + ".Titles.Charms";
				case "opposedCharm": return ModuleName + ".Titles.OpposedCharms";
				case "social": return ModuleName + ".Titles.Social";
			}
		}

		get icon() {
			switch (this.type) {
				case "charm": return "icons/svg/explosion.svg";
				case "opposedCharm": return `modules/${ModuleName}/icons/healing-shield.svg`;
				case "social": return `modules/${ModuleName}/icons/heartburn.svg`;
			}
		}

		categorizeCharms() {
			let charmCategories = [];

			for (const charmList of Object.values(this.actor.charms)) {
				charmCategories.push({
					label: charmList.name,
					buttons: charmList.list.map(charm => new ExEssItemButton({ item: charm }))
				});
			}

			return charmCategories
		}

		categorizeOpposedCharms() {
			let charmCategories = [];

			for (const charmList of Object.values(this.actor.charms)) {
				if (charmList.list.some(charm => charm.system.diceroller?.opposedbonuses?.enabled)) {
					charmCategories.push({
						label: charmList.name,
						buttons: charmList.list.filter(charm => charm.system.diceroller.opposedbonuses.enabled).map(charm => new ExEssItemButton({ item: charm, flags: { specialType: 'opposedCharm' } }))
					});
				}
			}

			return charmCategories
		}


		async _getPanel() {
			if (this.type === 'charm') {
				return new ARGON.MAIN.BUTTON_PANELS.ACCORDION.AccordionPanel({ id: this.id, accordionPanelCategories: this.categorizeCharms().map(data => new ARGON.MAIN.BUTTON_PANELS.ACCORDION.AccordionPanelCategory(data)) });
			}
			if (this.type === 'opposedCharm') {
				return new ARGON.MAIN.BUTTON_PANELS.ACCORDION.AccordionPanel({ id: this.id, accordionPanelCategories: this.categorizeOpposedCharms().map(data => new ARGON.MAIN.BUTTON_PANELS.ACCORDION.AccordionPanelCategory(data)) });
			}
			return new ARGON.MAIN.BUTTON_PANELS.ButtonPanel({ buttons: this.actor.items.filter(item => item.type == this.type).map(item => new ExEssItemButton({ item })) });
		}
	}

	CoreHUD.definePortraitPanel(ExEssPortraitPanel);
	CoreHUD.defineDrawerPanel(ExEssDrawerPanel);
	CoreHUD.defineMainPanels([
		ExEssActionCombatPanel,
		ExEssMovementActionPanel,
		ExEssOtherActionPanel,
		ExEssExaltActionPanel,
	]);
	CoreHUD.defineMovementHud(null);
	CoreHUD.defineWeaponSets(ExEssWeaponSets);
	CoreHUD.defineSupportedActorTypes(["character", "npc"]);
});
