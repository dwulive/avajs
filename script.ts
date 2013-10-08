/////<reference path="C:/source/Avajs/qxEa.js" />
//"use strict";
// ==UserScript==
// @name           Ava Tools
// @description    Ava Tools - script for fun and good times
// @namespace      Ava
// @include        http://prodgame*.lordofultima.com/*/index.aspx*
// @version        1024.0.0.4
// ==/UserScript==
/**
 * 5.2.1 - Go button stayed disabled for some "cancel raids" options.
 * 5.2.2 - Additional case where Go button stayed disabled with "cancel all".
 *            removed from BBCode the !LoU.slap and other commands as they allow an anonymous person to determine your online status.
 * 5.2.3 - Incoming attack icon was hidden by a button when collapsed.  Embed emoticons rather than downloading (WatchmanCole).
 *            changes to incoming attacks window.  now makes use of alliance faith and displayed % is the research required by the
 *            attacking player.  - is displayed if it is believed the attack is not possible with that troop type.  a ship column has
 *            been added.  can only verify ship attacks if you are the target.  seperate requests are made to determine if
 *            source and target cities are on water.  data may not have been returned when the attacks are initially listed.
 *            re-opening the window should show the updated data, or waiting for the incoming data to change.
 * 5.2.4 - Put simple building counts panel back in with options menu.  Added option to disable "Use closest hub" button and
 *            setup on the options tab.
 * 5.2.5 - Throttle rate requests are made to determine if cities involved in attacks are on water due to reports of being kicked when opening incoming window.


 = 5.2.6.0
 - added PVP+Cache
 - stores recently touched cities for rapid access"
 Needs internationalization work.
 - Enabled "Send Army" on the context meny of your own cities (for support)
 - Added WantStone and WantWood options to raiding.  See tooltips for more details.


 **/
(function() {


	var main = function() {

		// globals

		function AvaInit() {
			try {
				var bossKill = [50, 300, 2000, 4000, 10000, 15000, 20000, 30000, 45000, 60000];
				var dungeonKill = [10, 100, 450, 1500, 3500, 6000, 13000, 20000, 35000, 60000];
				var l = qx.locale.Manager.getInstance().getLocale();
				if(l != "en" || l != "de" || l != "pl") {
					l = "en";
				}
				var tr = {
					"en": {
						"weak": "Weakness"
					},
					"de": {
						"weak": "Schwche"
					},
					"pl": {
						"weak": "????????"
					}
				};
				var a = qx.core.Init.getApplication();
				var r = webfrontend.res.Main.getInstance();
				var nameC = a.tr("tnf:name:").charAt(0);
				var typeC = a.tr("tnf:type:").charAt(0);
				var levelT = a.tr("tnf:level:");
				var progressP = a.tr("tnf:progress:");
				var sHdr = '<table cellspacing="0"><tr><td width="75">';
				var sRow = "</td><td>";
				var pId = sHdr.length;
				var pRow = sRow.length;
				var weakT = tr[l]["weak"] + ':' + sRow;
				var progressT = 'TS + pct:' + sRow;

				// var zergT = r.units["6"].dn + ':' + sRow;
				var zergT = 'Unit TS:' + sRow;
				var zergT6 = r.units["6"].dn + ':' + sRow;
				var zergT7 = r.units["7"].dn + ':' + sRow;
				var zergT10 = r.units["10"].dn + ':' + sRow;
				var zergT11 = r.units["11"].dn + ':' + sRow;
				var zergT12 = r.units["12"].dn + ':' + sRow;
				var zergT16 = r.units["16"].dn + ':' + sRow;
				var zergT17 = r.units["17"].dn + ':' + sRow;

				// "Name" or "Type", Boss or Dungeon
				// Desc offset
				var pBName = pId + pRow + a.tr("tnf:name:").length;
				var pDName = pId + pRow + a.tr("tnf:type:").length;

				// Progress offset
				// x
				// Level offset
				var pLevel = pRow + a.tr("tnf:level:").length;

				// Forest		Dragon		CAvalry		Wood
				// Mountain		Hydra		Infantry	Iron
				// Hill			Moloch		Magic		Stone
				// Sea			Octopus		Artillery 	Food
				var cavT = r.attackTypes["2"].dn;
				var infT = r.attackTypes["1"].dn;
				var magT = r.attackTypes["4"].dn;
				var artT = r.attackTypes["3"].dn;
				var dragC = r.dungeons["6"].dn.charAt(0);
				var hydrC = r.dungeons["8"].dn.charAt(0);
				var moloC = r.dungeons["7"].dn.charAt(0);
				var octyC = r.dungeons["12"].dn.charAt(0);
				var forstC = r.dungeons["5"].dn.charAt(0);
				var mountC = r.dungeons["4"].dn.charAt(0);
				var hillC = r.dungeons["3"].dn.charAt(0);
				var seaC = r.dungeons["2"].dn.charAt(0);

				function getBossWeakness(name) {
					if(name == dragC)
						return cavT;
					else if(name == hydrC)
						return infT;
					else if(name == moloC)
						return magT;
					else if(name == octyC)
						return artT;
					else
						return "";
				}

				function getDungeonWeakness(name) {
					if(name == forstC)
						return cavT;
					else if(name == mountC)
						return infT;
					else if(name == hillC)
						return magT;
					else if(name == seaC)
						return artT;
					else
						return "";
				}

				function toolTipAppear() {
					try {
						var tip = a.worldViewToolTip;
						var mode = tip.getMode();
						if(mode == 'c' || mode == 'd') {
							// if(tip.contextObject)
						} else {
							var text = tip.getLabel();
							if(text != null || text.length > pId) {
								var type = text.charAt(pId);
								if(type == nameC) {
									//Boss
									var weak = getBossWeakness(text.charAt(pBName));
									var lPos = text.indexOf(levelT, pBName) + pLevel;
									var level = text.charAt(lPos);
									if(level == '1') {
										if(text.charAt(lPos + 1) == '0')
											level = '10';
									}
									var zergs = webfrontend.gui.Util.formatNumbers(bossKill[parseInt(level) - 1]);
									var sb = new qx.util.StringBuilder(20);
									var research6 = webfrontend.data.Tech.getInstance().getBonus("unitDamage", webfrontend.data.Tech.research, 6);
									var shrine6 = webfrontend.data.Tech.getInstance().getBonus("unitDamage", webfrontend.data.Tech.shrine, 6);
									var bonus6 = ((shrine6 + research6) / 100) + 1;
									var research7 = webfrontend.data.Tech.getInstance().getBonus("unitDamage", webfrontend.data.Tech.research, 6);
									var shrine7 = webfrontend.data.Tech.getInstance().getBonus("unitDamage", webfrontend.data.Tech.shrine, 6);
									var bonus7 = ((shrine7 + research7) / 100) + 1;
									var research10 = webfrontend.data.Tech.getInstance().getBonus("unitDamage", webfrontend.data.Tech.research, 10);
									var shrine10 = webfrontend.data.Tech.getInstance().getBonus("unitDamage", webfrontend.data.Tech.shrine, 10);
									var bonus10 = ((shrine10 + research10) / 100) + 1;
									var research11 = webfrontend.data.Tech.getInstance().getBonus("unitDamage", webfrontend.data.Tech.research, 11);
									var shrine11 = webfrontend.data.Tech.getInstance().getBonus("unitDamage", webfrontend.data.Tech.shrine, 11);
									var bonus11 = ((shrine11 + research11) / 100) + 1;
									var research12 = webfrontend.data.Tech.getInstance().getBonus("unitDamage", webfrontend.data.Tech.research, 12);
									var shrine12 = webfrontend.data.Tech.getInstance().getBonus("unitDamage", webfrontend.data.Tech.shrine, 12);
									var bonus12 = ((shrine12 + research12) / 100) + 1;
									var research16 = webfrontend.data.Tech.getInstance().getBonus("unitDamage", webfrontend.data.Tech.research, 16);
									var shrine16 = webfrontend.data.Tech.getInstance().getBonus("unitDamage", webfrontend.data.Tech.shrine, 16);
									var bonus16 = ((shrine16 + research16) / 100) + 1;
									var research17 = webfrontend.data.Tech.getInstance().getBonus("unitDamage", webfrontend.data.Tech.research, 17);
									var shrine17 = webfrontend.data.Tech.getInstance().getBonus("unitDamage", webfrontend.data.Tech.shrine, 17);
									var bonus17 = ((shrine17 + research17) / 100) + 1;
									var zergs6 = webfrontend.gui.Util.formatNumbers(parseInt(bossKill[parseInt(level) - 1] / bonus6));
									if(weak == "Infantry")
										zergs6 = webfrontend.gui.Util.formatNumbers(parseInt((bossKill[parseInt(level) - 1] / bonus6) * 0.67));
									var zergs7 = webfrontend.gui.Util.formatNumbers(parseInt(bossKill[parseInt(level) - 1] / bonus7) * 0.72);
									if(weak == "Magic")
										zergs7 = webfrontend.gui.Util.formatNumbers(parseInt((bossKill[parseInt(level) - 1] / bonus7) * 0.67 * 0.72));
									var zergs10 = webfrontend.gui.Util.formatNumbers(parseInt((bossKill[parseInt(level) - 1] / bonus10) * 0.83));
									if(weak == "Cavalry")
										zergs10 = webfrontend.gui.Util.formatNumbers(parseInt((bossKill[parseInt(level) - 1] / bonus10) * 0.67 * 0.83));
									var zergs11 = webfrontend.gui.Util.formatNumbers(parseInt((bossKill[parseInt(level) - 1] / bonus11) * 0.55));
									if(weak == "Cavalry")
										zergs11 = webfrontend.gui.Util.formatNumbers(parseInt((bossKill[parseInt(level) - 1] / bonus11) * 0.67 * 0.55));
									var zergs12 = webfrontend.gui.Util.formatNumbers(parseInt((bossKill[parseInt(level) - 1] / bonus12) * 0.42));
									if(weak == "Magic")
										zergs12 = webfrontend.gui.Util.formatNumbers(parseInt((bossKill[parseInt(level) - 1] / bonus12) * 0.67 * 0.42));
									if(weak == "Artillery") {
										var zergs16 = webfrontend.gui.Util.formatNumbers(parseInt((bossKill[parseInt(level) - 1] / bonus16) * 0.03));
										var zergs17 = webfrontend.gui.Util.formatNumbers(parseInt((bossKill[parseInt(level) - 1] / bonus17) * 0.003));
										sb.add(text, sHdr, weakT, weak, "</td></tr><tr><td>", zergT16, zergs16, "</td></tr><tr><td>", zergT17, zergs17, "</td></tr></table>");
									} else {
										sb.add(text, sHdr, weakT, weak, "</td></tr><tr><td>", zergT6, zergs6, "</td></tr></td></tr><tr><td>", zergT10, zergs10, "</td></tr></td></tr><tr><td>", zergT11, zergs11, "</td></tr><tr><td>", zergT12, zergs12, "</td></tr><tr><td>", zergT7, zergs7, "</td></tr></table>");
									}
									tip.setLabel(sb.get());
								} else if(type == typeC) {
									//Dungeon
									var weak = getDungeonWeakness(text.charAt(pDName));
									var lPos = text.indexOf(levelT, pDName) + pLevel;
									var level = text.charAt(lPos);
									if(level == '1') {
										if(text.charAt(lPos + 1) == '0')
											level = '10';
									}
									var progress = text.substr(text.indexOf("Progress") + 18, 2);
									if(progress.substr(1, 1) == '%') {
										progress = progress.substr(0, 1);
									}
									progress = webfrontend.gui.Util.formatNumbers(parseInt((progress * 0.0175 + 1.0875) * dungeonKill[parseInt(level) - 1]));
									zergs6 = webfrontend.gui.Util.formatNumbers(dungeonKill[parseInt(level) - 1]);
									var sb = new qx.util.StringBuilder(20);
									sb.add(text, sHdr, weakT, weak, "</td></tr><tr><td>", zergT, zergs6, "</td></tr><tr><td>", progressT, progress, "</td></tr></table>");
									tip.setLabel(sb.get());
								}

							}
						}
					} catch(e) {
						console.assert(0);
						console.assert(0);
					}
				}

				a.worldViewToolTip.addListener("appear", toolTipAppear, this);
			} catch(e) {
				console.assert(0);
				console.assert(0);
			}
		}; // avainit
		var avaDebug = true;

		function paDebug(e) {
			if(avaDebug && window.console && typeof console.debug == "function") {
				console.log(e);
				//  addMessage(e);
			}
		}

		function paError(e) {
			if(window.console && typeof console.error == "function") {
				console.error(e);
				console.assert(0);
			}
		}

		function dung(type, lvl, progress, coords, distance) {
			this.type = type;
			this.level = lvl;
			this.progress = progress;
			this.coords = coords;
			this.id = coords;
			this.distance = distance;
			this.get_Level = function() {
				return this.level;
			};
			this.get_Progress = function() {
				return this.progress;
			};
			this.get_Coordinates = function() {
				return this.coords;
			};
			this.get_Distance = function() {
				return this.distance;
			};
			this.get_Id = function() {
				return this.id;
			};

		}

		/*
		 * Contribute  http://benalman.com/projects/jAvascript-emotify/
		 * Spezial thanks to Ben Alman, http://benalman.com/about/license/
		 */
		var EMOTICON_RE,
			emoticons = {},
			lookup = [],
			emotify = function(txt, callback) {
				callback = callback || function(img, title, smiley, text) {
					title = (title + ', ' + smiley).replace(/"/g, '&quot;').replace(/</g, '&lt;');
					return '<img src="' + img + '" title="' + title + '" alt="" class="smiley" style="vertical-align: -20%;"/>';
				};
				return txt.replace(EMOTICON_RE, function(a, b, text) {
					var i = 0,
						smiley = text,
						e = emoticons[text];

					if(!e) {
						while(i < lookup.length && !lookup[i].regexp.test(text)) {
							i = i + 1;
						}
						smiley = lookup[i].name;
						e = emoticons[smiley];
					}

					// If the smiley was found, return HTML, otherwise the original search string
					return e ? (b + callback(e[0], e[1], smiley, text)) : a;
				});
			};
		emotify.emoticons = function() {
			var args = Array.prototype.slice.call(arguments),
				base_url = typeof args[0] === 'string' ? args.shift() : '',
				replace_all = typeof args[0] === 'boolean' ? args.shift() : false,
				smilies = args[0],
				e,
				arr = [],
				alts,
				i,
				regexp_str;
			if(smilies) {
				if(replace_all) {
					emoticons = {};
					lookup = [];
				}
				for(e in smilies) {
					emoticons[e] = smilies[e];
					emoticons[e][0] = base_url + emoticons[e][0];
				}

				for(e in emoticons) {
					if(emoticons[e].length > 2) {
						// Generate regexp from smiley and alternates.
						alts = emoticons[e].slice(2).concat(e);
						i = alts.length;
						while(i--) {
							alts[i] = alts[i].replace(/(\W)/g, '\\$1');
						}
						regexp_str = alts.join('|');

						// Manual regexp, map regexp back to smiley so we can reverse-match.
						lookup.push({
							name:   e,
							regexp: new RegExp('^' + regexp_str + '$')
						});
					} else {
						// Generate regexp from smiley.
						regexp_str = e.replace(/(\W)/g, '\\$1');
					}
					arr.push(regexp_str);
				}
				EMOTICON_RE = new RegExp('(^|\\s)(' + arr.join('|') + ')(?=(?:$|\\s))', 'g');
			}
			return emoticons;
		};


		var CreateAvaTweak = function() {

			qx.Class.define("ava.Version", {
				type:    "static",
				statics: {
					PAversion: "0.0.3",
					PAbuild:   "10:09:13"
				}
			});

			/**
			 * Place where PATools are initialized.
			 */
			var cityStatusText;
			var cityStatusRow;

			function clearCityStatusText() {
				if(cityStatusText && cityStatusRow) {
					cityStatusRow.setMaxHeight(0);
					cityStatusText.setMaxHeight(0);
					cityStatusRow.setVisibility("hidden");
					cityStatusText.setValue("");
				}
			}

			function findTextNode(text) {
				var retVal;
				var n,
					walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
				n = walk.nextNode();
				while(n) {
					if(n.data == text) {
						retVal = n;
					}
				}
				return retVal;
			}

			function safeGetProperty(obj, prop) {
				if(obj && obj.hasOwnProperty(prop))
					return obj[prop];
				return null;
			}

			function addApplyAllButtons() {
				var app = qx.core.Init.getApplication();
				var orderPage = app.getOrderDetailPage();
				var buttonLayout = new qx.ui.layout.HBox(3);
				var btnRow = new qx.ui.container.Composite(buttonLayout);
				btnRow.add(orderPage.applyAllBtn);
				btnRow.add(orderPage.applyAllThisDungeonBtn);
				for(p in app.getOrderDetailPage()) {
					if(app.getOrderDetailPage()[p] instanceof webfrontend.gui.OrderDetail.RaidTimeDisplay) {
						var rtd = app.getOrderDetailPage()[p];
						var children = rtd.getLayoutParent().getLayoutChildren();
						var item;
						for(var ii = 0; ii < children.length; ++ii) {
							if(children[ii] == rtd) {
								item = children[ii + 2];
								break;
							}
						}
						if(item) {
							item = item.getLayoutChildren()[1];
							item.getLayoutParent().addAfter(btnRow, item);
						}
					}
				}
			}

			function SetSelection(sel, value) {
				if(value === null || value === undefined)
					return 0;
				var opts = sel.getChildren();
				for(var ii = 0; ii < opts.length; ++ii) {
					if(opts[ii].getLabel() === value) {
						sel.setSelection([opts[ii]]);
						return ii;
					}
				}
				return 0;
			}

			function SetSelectionFromStore(sel, key) {
				var value = localStorage.getItem(key);
				if(value != null) {
					console.log(key + " == " + value.toString());
					return SetSelection(sel, value);
				}
			}

			{
				var PLUNDER_ORDER_ID = 2;
				var ATTACK_ORDER_ID = 3;
				var SUPPORT_ORDER_ID = 4;
				var SIEGE_ORDER_ID = 5;
				var RAID_ORDER_ID = 8;
				var SETTLE_ORDER_ID = 9;
				var ORDER_STATE_OUTGOING = 1;
				var ORDER_STATE_RETURNING = 2;
			}

			qx.Class.define("ava.Main", {
				type:    "singleton",
				extend:  qx.core.Object,
				members: {
					options:                    null,
					SEND_WOOD:                  1,
					SEND_STONE:                 2,
					SEND_BOTH:                  3,
					DO_NOT_ATTACK_UNITS:        {
						"1":  true,
						"19": true
					},
					DO_NOT_PLUNDER_UNITS:       {
						"13": true,
						"14": true,
						"2":  true
					},
					SCOUT_ORDER_ID:             1,
					PLUNDER_ORDER_ID:           2,
					ATTACK_ORDER_ID:            3,
					SUPPORT_ORDER_ID:           4,
					SIEGE_ORDER_ID:             5,
					RAID_ORDER_ID:              8,
					_city:                      null,
					reportExtraInfo:            null,
					coord:                      null,
					worldContext:               null,
					copyMenu:                   null,
					infoMenu:                   null,
					selectCityBtn:              null,
					LOC_CONTAINER_INDEX:        4,
					ORIG_CHILD_COUNT:           6,
					RETURN_TIME_INDEX:          3,
					CMD_LIST_INDEX:             1,
					cityBuildings:              null,
					initialize:                 function() {
						paDebug("ava initialize");
						this.app = qx.core.Init.getApplication();
						this.cInfoView = this.app.getCityInfoView();
						this.chat = this.app.chat;
						this.bQc = this.cInfoView.buildingQueue;
						this.bQh = this.bQc.header;
						this.playerName = webfrontend.data.Player.getInstance().getName();
						var civ_cont = this.cInfoView.container.getChildren();
						this.loadOptions();

						for(var i = 0; i < civ_cont.length; i++) {
							if(civ_cont[i].basename == "CityCommandInfoView") {
								this.cCmdInfoView = civ_cont[i];
								break;
							}
						}
						var commands = this.cCmdInfoView.commands;
						commands.addListener("addChildWidget", this.onAddChildWidget, this);
						var children = commands.getChildren();
						for(var i = 0; i < children.length; i++) {
							var e = new qx.event.type.Data();
							e.init(children[i], null, false);
							this.onAddChildWidget(e);
						}
						this.tweakPA();
					},
					onAddChildWidget:           function(e) {
						var widget = e.getData();
						var optionsPanel = widget.getChildren()[4].getChildren()[1].getChildren()[2];
						if(!optionsPanel || optionsPanel.getChildren().length < 2)
							return;
						if(optionsPanel.getChildren()[1].classname == "webfrontend.ui.QuickUseButton") {
							var child = optionsPanel.getChildren()[1];
							child.setMaxHeight(24);
							child.setMaxWidth(24);
							optionsPanel.remove(child);
							widget.add(child, {
								top:  3,
								left: 165
							});
						}
					},
					loadOptions:                function() {
						var _str = localStorage.getItem("Ava_options");
						paDebug(_str);
						if(_str)
							this.options = JSON.parse(_str);
						else {
							this.options = {
								"hideAvaTools":         false,
								"sortByReference":      false,
								"showChatAlert":        true,
								"showWhisperAlert":     true,
								"showChatAlertPhrases": true,
								"chatAlertPhrases":     "",
								"showCityBuildings":    1,
								"enableClosestHub":     true,
								"hubTemplates":         [
									{
										name: "Castle",
										res:  {
											wood:  100000,
											stone: 200000,
											iron:  300000,
											food:  1000000
										}
									},
									{
										name: "Res City",
										res:  {
											wood:  100000,
											stone: 100000,
											iron:  0,
											food:  0
										}
									},
									{
										name: "Hub",
										res:  {
											wood:  1000000,
											stone: 1000000,
											iron:  1000000,
											food:  1000000
										}
									},
									{
										name: "Finished Res",
										res:  {
											wood:  0,
											stone: 0,
											iron:  0,
											food:  0
										}
									}
								],
								"AvaToolsVersion":      ava.Version.PAversion
							};
						}
						if(!this.options.hasOwnProperty("showWhisperAlert"))
							this.options.showWhisperAlert = true;
						if(!this.options.hasOwnProperty("showChatAlert"))
							this.options.showChatAlert = true;
						if(!this.options.hasOwnProperty("showChatAlertPhrases"))
							this.options.showChatAlertPhrases = true;
						if(!this.options.hasOwnProperty("chatAlertPhrases"))
							this.options.chatAlertPhrases = "";
						if(!this.options.hasOwnProperty("hideAvaTools"))
							this.options.hideAvaTools = false;
						if(!this.options.hasOwnProperty("sortByReference"))
							this.options.sortByReference = false;
						if(!this.options.hasOwnProperty("enableClosestHub"))
							this.options.enableClosestHub = true;
						if(!this.options.hasOwnProperty("showCityBuildings"))
							this.options.showCityBuildings = 2;
						if(this.options.showCityBuildings == true)
							this.options.showCityBuildings = 2;
						if(!this.options.hasOwnProperty("hubTemplates")) {
							this.options.hubTemplates = [
								{
									name: "Castle",
									res:  {
										wood:  100000,
										stone: 200000,
										iron:  300000,
										food:  1000000
									}
								},
								{
									name: "Res City",
									res:  {
										wood:  100000,
										stone: 100000,
										iron:  0,
										food:  0
									}
								},
								{
									name: "Hub",
									res:  {
										wood:  1000000,
										stone: 1000000,
										iron:  1000000,
										food:  1000000
									}
								},
								{
									name: "Finished Res",
									res:  {
										wood:  0,
										stone: 0,
										iron:  0,
										food:  0
									}
								}
							];
						}
						this.options.AvaToolsVersion = ava.Version.PAversion;
						this.app.setUserData("Ava_options", this.options);
						var str = JSON.stringify(this.options);
						localStorage.setItem("Ava_options", str);
						console.log("loaded");
					},
					tweakPA:                    function() {
						console.log("TweakPA start");

						// Create a toolbar in the main area on the left below existing forms.
						this.panel = new ava.ui.ExtraTools("- 343i  " + ava.Version.PAversion);
						this.addPanel(this.panel);
						this._city = this.panel.city;

						// Cancel Orders
						this.cancelOrders = new ava.ui.CancelOrderPanel();
						console.log("TweakPA1");
						this.cCmdInfoView.commandHeaderData.header.add(this.cancelOrders, {
							left: 155,
							top:  7
						});
						var app = qx.core.Init.getApplication();
						this.app = app;
						this.chat = this.app.chat;

						ava.ui.alerts.getInstance().init();

						try {
							/*



							 var targetContainer = (app.cityDetailView || this.app.getCityDetailView()).actionArea;
							 // Ask BotX
							 var row = new qx.ui.container.Composite();
							 row.setLayout(new qx.ui.layout.HBox(2));
							 targetContainer.add(row);

							 var askBotxHistoryBtn = new qx.ui.form.Button("BotX 3day player history");
							 askBotxHistoryBtn.setToolTipText("Get player history from BotX");
							 row.add(askBotxHistoryBtn, {flex:1});
							 askBotxHistoryBtn.addListener("execute", function () {
							 var selectedCity = (app.cityDetailView || app.getCityDetailView()).city;
							 var cityPlayerName = selectedCity.get_PlayerName();
							 webfrontend.data.Chat.getInstance().addMsg("/whisper Avatar343i !history " + cityPlayerName);
							 });
							 var askBotxCityBtn = new qx.ui.form.Button("BotX city coords history");
							 askBotxCityBtn.setToolTipText("Get city history from BotX");
							 row.add(askBotxCityBtn, {flex:1});
							 askBotxCityBtn.addListener("execute", function () {
							 var selectedCity = (app.cityDetailView || app.getCityDetailView()).city;
							 var citycoords = ava.CombatTools.cityIdToCoords(selectedCity.get_Coordinates());
							 webfrontend.data.Chat.getInstance().addMsg("/whisper Avatar343i !city " + citycoords[0] + ":" + citycoords[1]);
							 });
							 */
							var targetContainer = (app.cityDetailView || app.getCityDetailView()).actionArea;
							var row = new qx.ui.container.Composite();
							row.setLayout(new qx.ui.layout.HBox(4));
							targetContainer.add(row);
							var assaultButton = new qx.ui.form.Button("Attack");
							assaultButton.orderId = this.ATTACK_ORDER_ID;
							assaultButton.setToolTipText("Assault selected city with all Available units");
							assaultButton.addListener("execute", this.sendTroops, this);
							var plunderButton = new qx.ui.form.Button("Plunder");
							plunderButton.orderId = this.PLUNDER_ORDER_ID;
							plunderButton.setToolTipText("Plunder selected city with all Available units");
							plunderButton.addListener("execute", this.sendTroops, this);
							var siegeButton = new qx.ui.form.Button("Siege");
							siegeButton.orderId = this.SIEGE_ORDER_ID;
							siegeButton.setToolTipText("Siege selected city with all Available units");
							siegeButton.addListener("execute", this.sendTroops, this);
							var supportButton = new qx.ui.form.Button("Support");
							supportButton.orderId = this.SUPPORT_ORDER_ID;
							supportButton.setToolTipText("Support selected city with all Available units");
							supportButton.addListener("execute", this.sendTroops, this);

							// add elements
							row.add(assaultButton, {
								flex: 1
							});
							row.add(plunderButton, {
								flex: 1
							});
							row.add(siegeButton, {
								flex: 1
							});
							row.add(supportButton, {
								flex: 1
							});
							cityStatusRow = new qx.ui.container.Composite();
							cityStatusRow.setLayout(new qx.ui.layout.HBox());
							cityStatusText = new qx.ui.basic.Label();
							cityStatusText.setAlignY("middle");
							cityStatusText.setRich(true);
							cityStatusText.setFont("bold");
							cityStatusRow.setMaxHeight(0);
							cityStatusText.setMaxHeight(0);
							cityStatusRow.setVisibility("hidden");
							cityStatusRow.add(cityStatusText);
							targetContainer.add(cityStatusRow);
							// mkReq();  // @@@
						} catch(e) {
							console.assert(0);
							console.assert(0);
						}
						try {
							this.reportExtraInfo = ava.ui.RaidReporter.getInstance();
							var rep = app.getReportPage();
							rep.origOnReport = rep._onReport;
							rep._onReport = this.reportExtraInfo.interceptOnReport;
						} catch(e) {
							console.assert(0);
							console.assert(0);
						}
						try {
							this.cInfoView = this.app.getCityInfoView();
							var civ_cont = this.cInfoView.container.getChildren();

							for(var i = 0; i < civ_cont.length; i++) {
								if(civ_cont[i].basename == "CityCommandInfoView") {
									this.cCmdInfoView = civ_cont[i];
									break;
								}
							}
							webfrontend.data.City.getInstance().addListener("changeVersion", this.updateCity, this);

							// Calculate for existing raids in initial city
							this.calcReturnTimes();
							var buttonLayout = new qx.ui.layout.HBox(3);
							var btnRow = new qx.ui.container.Composite(buttonLayout);
							this.app.getForumPostPage().getChildren()[0].add(btnRow, {
								top:  45,
								left: 400
							});

							// Add Scroll To Top button
							var scrollTBtn = new qx.ui.form.Button('Scroll To Top');
							scrollTBtn.set({
								width:       90,
								appearance:  "button-text-small",
								toolTipText: "Scroll to top of thread"
							});
							scrollTBtn.addListener("click", this.scrollToTop, false);
							btnRow.add(scrollTBtn);

							// Add Scroll To Bottom button
							var scrollBtn = new qx.ui.form.Button('Scroll To Bottom');
							scrollBtn.set({
								width:       90,
								appearance:  "button-text-small",
								toolTipText: "Scroll to bottom of thread"
							});
							scrollBtn.addListener("click", this.scrollToBottom, false);
							btnRow.add(scrollBtn);
						} catch(e) {
							console.assert(0);
							console.assert(0);
						}
						/* (e) {
						 console.log("Error");
						 console.dir(e);
						 } */
						this.createWorldViewEnhancments();
						this.createRaidApplyToAll();
						this.createContextMenu();
						ava.Inception.getInstance().init();
						ava.Chat.getInstance().init();
						this.emotifyIcons();
						ava.Chat.getInstance().addChatMessage(" is not broken :) - good times for all", true);
						this.panel.showOptionsPage();
						qx.core.Init.getApplication().switchOverlay(null);

						// City Buildings
						this.cityBuildings = new ava.ui.CityBuildings();
						this.panel.getLayoutParent().addBefore(this.cityBuildings.bldgsCont, this.panel);
						webfrontend.data.City.getInstance().addListener("changeVersion", this.cityBuildings.updateCityBuildings, this.cityBuildings);
						this.app.visMain.addListener("changeMapLoaded", function() {
							if(ava.Main.getInstance().options.showCityBuildings == 2)
								this.cityBuildings.updateCityBuildings();
						}, this);
						this.cityBuildings.updateCityBuildings();
						console.log("TweakPA Endt");
					},
					updateCity:                 function() {
						// Clear return time from all command windows
						var commands = this.cCmdInfoView.getChildren()[this.CMD_LIST_INDEX].getChildren();
						if(commands) {
							for(var i = 0; i < commands.length; i++) {
								//var localContainer = commands[i].getChildren()[this.LOC_CONTAINER_INDEX];
								var localContainer = commands[i].getChildren()[this.LOC_CONTAINER_INDEX].getChildren()[1].getChildren()[0];
								if(localContainer.getChildren().length > this.ORIG_CHILD_COUNT) {
									localContainer.removeAt(this.RETURN_TIME_INDEX);
								}
							}
						}

						// Recalc return times where appropriate
						this.calcReturnTimes();
					},
					calcReturnTimes:            function() {
						if(!this.cCmdInfoView) {
							for(var i = 0; i < civ_cont.length; i++) {
								if(civ_cont[i].basename == "CityCommandInfoView") {
									this.cCmdInfoView = civ_cont[i];
									break;
								}
							}
						}
						var commands = this.cCmdInfoView.getChildren()[this.CMD_LIST_INDEX].getChildren();
						var orders = webfrontend.data.City.getInstance().getUnitOrders();

						if(!orders)
							return;
						for(var i = 0; i < orders.length; i++) {
							var order = orders[i];
							if(order.type == SETTLE_ORDER_ID)
								continue;

							if(order.type == SUPPORT_ORDER_ID)
								continue;

							if(order.type == SIEGE_ORDER_ID)
								continue;

							if(order.state != ORDER_STATE_OUTGOING)
								continue;

							// Only process outgoing attacks
							// Calculate return time
							var diff = order.end - order.start;
							var returnTime = webfrontend.Util.getDateTimeString(webfrontend.data.ServerTime.getInstance().getStepTime(order.end + diff));

							//
							var container = new qx.ui.container.Composite();
							container.setLayout(new qx.ui.layout.Canvas());
							var returnLabel = new qx.ui.basic.Label("Returns:");
							returnLabel.setTextColor("text-darkbrown");
							var spacr2 = new qx.ui.core.Spacer();
							spacr2.setWidth(7);
							var returnVal = new qx.ui.basic.Label(returnTime);
							returnVal.setTextColor("text-deepdarkbrown");
							returnVal.set({
								font: "bold"
							});
							container.add(returnLabel);
							container.add(spacr2);
							container.add(returnVal, {
								left: 70
							});

							// remove existing
							var localContainer = commands[i].getChildren()[this.LOC_CONTAINER_INDEX].getChildren()[1].getChildren()[0];
							if(localContainer.getChildren().length > this.ORIG_CHILD_COUNT) {
								localContainer.removeAt(this.RETURN_TIME_INDEX);
							}

							// add new
							localContainer.addAt(container, this.RETURN_TIME_INDEX);
						}
					},
					scrollToTop:                function() {
						try {
							var mypage = qx.core.Init.getApplication().getForumPostPage();
							var lastChildIndex = mypage.getChildren().length - 1;
							var myscroll = mypage.getChildren()[lastChildIndex].getChildren()[1];
							myscroll.scrollToY(0);
						} catch(err) {
							paDebug(err);
						}
						/* (e) {
						 console.log("Error");
						 console.dir(e);
						 } */
					},
					scrollToBottom:             function() {
						try {
							var mypage = qx.core.Init.getApplication().getForumPostPage();
							var lastChildIndex = mypage.getChildren().length - 1;
							var myscroll = mypage.getChildren()[lastChildIndex].getChildren()[1];
							myscroll.scrollToY(99999);
						} catch(err) {
							paDebug(err);
						}
						/* (e) {
						 console.log("Error");
						 console.dir(e);
						 } */
					},
					createContextMenu:          function() {
						this.worldContext = new qx.ui.menu.Menu();
						this.worldContext.setIconColumnWidth(0);
						this.copyMenu = new qx.ui.menu.Menu();
						this.copyMenu.setIconColumnWidth(0);
						this.infoMenu = new qx.ui.menu.Menu();
						this.infoMenu.setIconColumnWidth(0);
						this.selectCityBtn = new qx.ui.menu.Button("Switch to City");
						this.viewReportsBtn = new qx.ui.menu.Button("View Reports");
						this.killBossBtn = new qx.ui.menu.Button("Kill Boss");
						this.raidDungeonBtn = new qx.ui.menu.Button("Raid");

						//this.raidDungeon1Btn = new qx.ui.menu.Button("Raid 1");
						//this.raidDungeonAllBtn = new qx.ui.menu.Button("Raid all");
						this.sendArmyBtn = new qx.ui.menu.Button("Send Army");
						this.plunderBtn = new qx.ui.menu.Button("Plunder With All");
						this.scoutBtn = new qx.ui.menu.Button("Scout With All");
						this.supportBtn = new qx.ui.menu.Button("Support With All");
						this.copyBtn = new qx.ui.menu.Button("Copy to Chat");
						this.copyBtnSub = new qx.ui.menu.Button("Copy to Chat", null, null, this.copyMenu);
						this.copyCoordBtn = new qx.ui.menu.Button("Coordinates");
						this.copyPlayerBtn = new qx.ui.menu.Button("Player");
						this.copyAllianceBtn = new qx.ui.menu.Button("Alliance");
						this.sendResBtn = new qx.ui.menu.Button("Send Resources");

						//this.infoBtn = new qx.ui.menu.Button("Info", null, null, this.infoMenu);
						this.infoPlayerBtn = new qx.ui.menu.Button("Player Info");
						this.worldContext.add(this.infoPlayerBtn);

						//this.infoAllianceBtn = new qx.ui.menu.Button("Alliance");
						this.whisperBtn = new qx.ui.menu.Button("Whisper");
						this.worldContext.add(this.selectCityBtn);
						this.worldContext.add(this.viewReportsBtn);
						this.worldContext.add(this.killBossBtn);
						this.worldContext.add(this.raidDungeonBtn);

						//this.worldContext.add(this.raidDungeon1Btn);
						//this.worldContext.add(this.raidDungeonAllBtn);
						this.worldContext.add(this.sendArmyBtn);
						this.worldContext.add(this.plunderBtn);
						this.worldContext.add(this.scoutBtn);
						this.worldContext.add(this.supportBtn);
						this.worldContext.add(this.sendResBtn);

						//this.worldContext.add(this.infoBtn);
						this.worldContext.add(this.whisperBtn);
						this.worldContext.add(this.copyBtnSub);
						this.copyMenu.add(this.copyCoordBtn);
						this.copyMenu.add(this.copyPlayerBtn);
						this.copyMenu.add(this.copyAllianceBtn);

						//this.infoMenu.add(this.infoPlayerBtn);
						//this.infoMenu.add(this.infoAllianceBtn);
						qx.core.Init.getApplication().worldView.setContextMenu(this.worldContext);
						qx.core.Init.getApplication().worldView.addListener("beforeContextmenuOpen", function(e) {
							this.updateWorldViewContext();
						}, this);
						this.plunderBtn.orderId = this.PLUNDER_ORDER_ID;
						this.plunderBtn.addListener("execute", this.sendTroops, this);
						this.scoutBtn.orderId = this.SCOUT_ORDER_ID;
						this.scoutBtn.addListener("execute", this.sendTroops, this);
						this.supportBtn.orderId = this.SUPPORT_ORDER_ID;
						this.supportBtn.addListener("execute", this.sendTroops, this);
						this.sendArmyBtn.addListener("execute", function(e) {
							if(this.coord) {
								this.app.showSendArmy(this.coord.xPos, this.coord.yPos);
							}
						}, this);
						this.killBossBtn.addListener("execute", function(e) {
							var rw = ava.ui.RaidingWindow.getInstance();
							var rt = rw.pickBossRaider().t;
							var o = new Object();
							o.BossType = getBossType(this.coord.playerName);
							o.BossLevel = this.coord.level;
							var utk = rw.getUnitsToKill(rt, o);
							var CI = webfrontend.data.City.getInstance();
							var uinfo = CI.getUnitTypeInfo(rt);
							if(utk <= uinfo.count) {
								var unitsToSend = new Array();
								unitsToSend.push({
									t: rt,
									c: Math.floor(utk)
								});
								webfrontend.net.CommandManager.getInstance().sendCommand("OrderUnits", {
									cityid:                     webfrontend.data.City.getInstance().getId(),
									units:                      unitsToSend,
									targetPlayer:               "",
									targetCity:                 this.coord.xPos + ":" + this.coord.yPos,
									order:                      8,
									transport:                  1,
									timeReferenceType:          1,
									referenceTimeUTCMillis:     0,
									raidTimeReferenceType:      0,
									raidReferenceTimeUTCMillis: 0
								});
							}
						}, this);
						this.sendResBtn.addListener("execute", function(e) {
							if(this.coord && this.coord.city) {
								this.app.showTrade(this.coord.xPos, this.coord.yPos);
							}
						}, this);
						this.selectCityBtn.addListener("execute", function(e) {
							if(this.coord && this.coord.city && this.coord.playerName == this.playerName) {
								var cityList = qx.core.Init.getApplication().cityBar.citiesSelect;
								cityList.setSelectedCityId(this.coord.id);
							}
						}, this);
						this.viewReportsBtn.addListener("execute", function(e) {
							if(this.coord && this.coord.type) {
								this.app.showInfoPage(this.app.getCityInfoPage(), {
									"id": this.coord.id
								});
							}
						}, this);
						this.raidDungeonBtn.addListener("execute", function(e) {
							if(this.coord && this.coord.dungeon) {
								var dialog = ava.ui.RaidingWindow.getInstance();
								var w = qx.bom.Viewport.getWidth(window);
								var h = qx.bom.Viewport.getHeight(window);
								var wh = Math.floor(h * 0.45);
								dialog.setWidth(500);
								dialog.setHeight(500);
								dialog.show();
								dialog.moveTo(w - 500, h - 525);
							}
						}, this);
						this.infoPlayerBtn.addListener("execute", function(e) {
							if(this.coord && this.coord.type) {
								this.app.showInfoPage(this.app.getPlayerInfoPage(), {
									"name": this.coord.playerName
								});
							}
						}, this);
						this.copyBtnSub.addListener("execute", function(e) {
							if(this.coord) {
								this.sendToChat("[city]" + webfrontend.gui.Util.formatCoordinates(this.coord.xPos, this.coord.yPos) + "[/city]");
							}
						}, this);
						this.copyCoordBtn.addListener("execute", function(e) {
							if(this.coord) {
								this.sendToChat("[coords]" + webfrontend.gui.Util.formatCoordinates(this.coord.xPos, this.coord.yPos) + "[/coords]");
							}
						}, this);
						this.copyPlayerBtn.addListener("execute", function(e) {
							if(this.coord && this.coord.city) {
								this.sendToChat("[player]" + this.coord.playerName + "[/player]");
							}
						}, this);
						this.copyAllianceBtn.addListener("execute", function(e) {
							if(this.coord && this.coord.city) {
								this.sendToChat("[alliance]" + this.coord.allianceName + "[/alliance]");
							}
						}, this);
					},
					sendToChat:                 function(msg, overWrite) {
						var str = "";
						if(!overWrite && this.chat && this.chat.chatLine.getValue()) {
							str = this.chat.chatLine.getValue();
							str = str.substr(0, this.chat.chatLine.getTextSelectionStart()) + msg + str.substr(this.chat.chatLine.getTextSelectionEnd());
							msg = "";
						}
						this.chat.chatLine.setValue(str + msg);
					},
					updateWorldViewContext:     function() {
						this.selectCityBtn.setVisibility("excluded");
						this.infoPlayerBtn.setVisibility("excluded");
						this.viewReportsBtn.setVisibility("excluded");
						this.killBossBtn.setVisibility("excluded");
						this.raidDungeonBtn.setVisibility("excluded");

						//this.raidDungeon1Btn.setVisibility("excluded");
						//this.raidDungeonAllBtn.setVisibility("excluded");
						this.sendArmyBtn.setVisibility("excluded");
						this.plunderBtn.setVisibility("excluded");
						this.scoutBtn.setVisibility("excluded");
						this.sendResBtn.setVisibility("excluded");
						this.copyBtn.setVisibility("excluded");
						this.copyBtnSub.setVisibility("excluded");
						this.supportBtn.setVisibility("excluded");

						//this.infoBtn.setVisibility("excluded");
						this.whisperBtn.setVisibility("excluded");
						if(this.app.visMain.mapmode == "r" || this.app.visMain.mapmode == "w") {
							this.coord = this.updateWorldViewCoord();
							this.sendArmyBtn.setVisibility(this.coord.attackable && (this.coord.city || this.coord.lawless) && this.coord.playerName != this.playerName ? "visible" : "excluded");
							this.plunderBtn.setVisibility(this.coord.attackable && (this.coord.city || this.coord.lawless) && this.coord.playerName != this.playerName ? "visible" : "excluded");
							this.scoutBtn.setVisibility(this.coord.attackable && (this.coord.city || this.coord.lawless) && this.coord.playerName != this.playerName ? "visible" : "excluded");
							this.supportBtn.setVisibility(this.coord.attackable && (this.coord.city || this.coord.lawless) ? "visible" : "excluded");
							this.sendArmyBtn.setVisibility(this.coord.attackable && (this.coord.city || this.coord.lawless) && this.coord.playerName != this.playerName ? "visible" : "excluded");
							this.viewReportsBtn.setVisibility(this.coord.attackable ? "visible" : "excluded");
							this.selectCityBtn.setVisibility(this.coord.city && this.coord.playerName == this.playerName ? "visible" : "excluded");
							this.infoPlayerBtn.setVisibility(this.coord.city && this.coord.playerName ? "visible" : "excluded");
							this.sendResBtn.setVisibility(this.coord.city && this.coord.playerName ? "visible" : "excluded");
							this.killBossBtn.setVisibility(this.coord.boss ? "visible" : "excluded");
							this.raidDungeonBtn.setVisibility(this.coord.dungeon ? "visible" : "excluded");
							this.copyBtn.setVisibility(this.coord ? "visible" : "excluded");
							this.copyBtnSub.setVisibility(this.coord ? "visible" : "excluded");
							this.copyPlayerBtn.setVisibility(this.coord && this.coord.city && this.coord.playerName ? "visible" : "excluded");
							this.copyAllianceBtn.setVisibility(this.coord && this.coord.allianceName ? "visible" : "excluded");
						}
					},
					updateWorldViewCoord:       function() {
						if(this.worldViewCoord == null) {
							this.worldViewCoord = new Object();
						}
						var worldViewToolTip = this.app.worldViewToolTip;
						var id = 0;
						var playerName = null;
						var allianceName = "";
						var type = null;
						var xPos = worldViewToolTip.x - worldViewToolTip.getWorldView().getContentLocation().left;
						var yPos = worldViewToolTip.y - worldViewToolTip.getWorldView().getContentLocation().top;
						var xCoord = worldViewToolTip.getVisMain().GetXCoordFromViewPosition(xPos);
						var yCoord = worldViewToolTip.getVisMain().GetYCoordFromViewPosition(yPos);
						var tooltipText = worldViewToolTip.getVisMain().GetTooltipText(xPos, yPos);
						var level = 0;
						var progress = 0;
						if(tooltipText.match(/<td>Player:<\/td><td>(.+?) <span dir="ltr">(.+?)<\/td>/)) {
							playerName = tooltipText.match(/<td>Player:<\/td><td>(.+?) <span dir="ltr">(.+?)<\/td>/)[1];
							if(tooltipText.match(/<td>Alliance:<\/td><td>(.+?) <span dir="ltr">(.+?)<\/td>/)) {
								allianceName = tooltipText.match(/<td>Alliance:<\/td><td>(.+?) <span dir="ltr">(.+?)<\/td>/)[1];
							}
							type = "City";
						} else if(tooltipText.match(/<td>Score:<\/td><td>.+?<\/td>/)) {
							type = "LawlessCity";
						} else if(tooltipText.match(/<td width="75">Type:<\/td><td>.+?<\/td>/)) {
							type = "Dungeon";
							if(tooltipText.match(/<td>Level:<\/td><td>(.+?)<\/td>/)) {
								level = tooltipText.match(/<td>Level:<\/td><td>(.+?)<\/td>/)[1];
							}
							if(tooltipText.match(/<td>Progress:<\/td><td>(.+?)%<\/td>/)) {
								progress = tooltipText.match(/<td>Progress:<\/td><td>(.+?)%<\/td>/)[1];
							}
						} else if(tooltipText.match(/<td width="75">Name:<\/td><td>.+?<\/td>/)) {
							type = "Boss";
							if(tooltipText.match(/<td>Level:<\/td><td>(.+?)<\/td>/)) {
								level = tooltipText.match(/<td>Level:<\/td><td>(.+?)<\/td>/)[1];
							}
							if(tooltipText.match(/<td width="75">Name:<\/td><td>(.+?)<\/td>/)) {
								playerName = tooltipText.match(/<td width="75">Name:<\/td><td>(.+?)<\/td>/)[1];
							}
						} else {
							type = "FreeSlot";
						}
						this.worldViewCoord.id = (yCoord << 0x10) | xCoord;
						this.worldViewCoord.xPos = xCoord;
						this.worldViewCoord.yPos = yCoord;
						this.worldViewCoord.playerName = playerName;
						this.worldViewCoord.allianceName = allianceName;
						this.worldViewCoord.type = type;
						this.worldViewCoord.level = level;
						this.worldViewCoord.progress = progress;
						this.worldViewCoord.city = type == "City";
						this.worldViewCoord.lawless = type == "LawlessCity";
						this.worldViewCoord.boss = type == "Boss";
						this.worldViewCoord.dungeon = type == "Dungeon";
						this.worldViewCoord.attackable = (type == "City" || type == "Boss" || type == "Dungeon" || type == "LawlessCity");
						return this.worldViewCoord;
					},
					sendTroops:                 function(event) {
						try {
							try {
								var clicked = event.getCurrentTarget();
								var activeCity = webfrontend.data.City.getInstance();
								var app = qx.core.Init.getApplication();
								var selectedCity = (app.cityDetailView || app.getCityDetailView()).city;
								var units = activeCity.units;
								var unitsOrdered = [];
								for(var u in units) {

									if(this.DO_NOT_ATTACK_UNITS[u])
										continue;
									if(clicked.orderId == this.PLUNDER_ORDER_ID && this.DO_NOT_PLUNDER_UNITS[u])
										continue;
									if(units[u].count > 0)
										unitsOrdered.push({
											t: u,
											c: units[u].count
										});
								}
								var coords = ava.CombatTools.cityIdToCoords(selectedCity ? selectedCity.get_Coordinates() : this.worldViewCoord.id);
								var request = {
									cityid:                     activeCity.getId(),
									units:                      unitsOrdered,
									targetPlayer:               selectedCity ? selectedCity.get_PlayerName() : this.worldViewCoord.playerName,
									targetCity:                 coords[0] + ":" + coords[1],
									order:                      clicked.orderId,
									transport:                  1,
									timeReferenceType:          1,
									referenceTimeUTCMillis:     0,
									raidTimeReferenceType:      0,
									raidReferenceTimeUTCMillis: 0
								};
								var commandManager = webfrontend.net.CommandManager.getInstance();
								commandManager.sendCommand("OrderUnits", request, this, this.sentTroops);
							} catch(err) {
								console.assert(0);
								console.assert(0);
							}
						} catch(e) {
							console.assert(0);
							console.assert(0);
						}

					},
					sentTroops:                 function(ok, errorCode) {
						try {
							if(errorCode.r0 != 0) {
								if(cityStatusText) {
									cityStatusRow.setMaxHeight(20);
									cityStatusText.setMaxHeight(20);
									cityStatusRow.setVisibility("visible");
									cityStatusText.setValue("Troops won't go.");
									window.setTimeout(clearCityStatusText, 2000);
								}
								paDebug("Troops won't go");
							} else {
								if(cityStatusText) {
									cityStatusRow.setMaxHeight(20);
									cityStatusText.setMaxHeight(20);
									cityStatusRow.setVisibility("visible");
									cityStatusText.setValue("Troops Sent.");
									window.setTimeout(clearCityStatusText, 2000);
								}
							}
						} catch(e) {
							console.assert(0);
							console.assert(0);
						}
						/* (e) {
						 console.log("Error");
						 console.dir(e);
						 } */
					},
					createRaidApplyToAll:       function() {
						try {
							var orderPage = this.app.getOrderDetailPage();
							orderPage.applyAllBtn = new webfrontend.ui.SoundButton("Apply to all");
							orderPage.applyAllBtn.set({
								marginRight: 4,
								marginLeft:  9
							});
							orderPage.applyAllThisDungeonBtn = new webfrontend.ui.SoundButton("Apply to all this dungeon");
							orderPage.applyAllBtn.onTroopsSent = this.onTroopsSent;
							orderPage.applyAllBtn.addListener("execute", function(e) {
								var rtd = this.findObject(qx.core.Init.getApplication().getOrderDetailPage(), webfrontend.gui.OrderDetail.RaidTimeDisplay);
								var currRecurrType = rtd.getRaidMode();
								var endStep = rtd.getStepTime();
								var orders = webfrontend.data.City.getInstance().unitOrders;
								for(var i in orders) {
									if(orders[i].type == 8) {
										webfrontend.net.CommandManager.getInstance().sendCommand("UnitOrderSetRecurringOptions", {
											cityid:           webfrontend.data.City.getInstance().getId(),
											id:               orders[i].id,
											isDelayed:        orders[i].isDelayed,
											recurringType:    currRecurrType,
											recurringEndStep: endStep
										}, this, this.onTroopsSent);
									}
								}
							}, this);
							orderPage.applyAllThisDungeonBtn.onTroopsSent = this.onTroopsSent;
							orderPage.applyAllThisDungeonBtn.addListener("execute", function(e) {
								var rtd = this.findObject(qx.core.Init.getApplication().getOrderDetailPage(), webfrontend.gui.OrderDetail.RaidTimeDisplay);
								var currRecurrType = rtd.getRaidMode();
								var endStep = rtd.getStepTime();
								var orderId = orderPage.getOrderId();
								var city = 0;
								var orders = webfrontend.data.City.getInstance().unitOrders;
								for(var i in orders) {
									if(orders[i].id == orderId) {
										city = orders[i].city;
									}
								}
								for(var i in orders) {
									if(orders[i].type == 8 && orders[i].city == city) {
										webfrontend.net.CommandManager.getInstance().sendCommand("UnitOrderSetRecurringOptions", {
											cityid:           webfrontend.data.City.getInstance().getId(),
											id:               orders[i].id,
											isDelayed:        orders[i].isDelayed,
											recurringType:    currRecurrType,
											recurringEndStep: endStep
										}, this, this.onTroopsSent);
									}
								}
							}, this);
							orderPage.addListenerOnce("appear", addApplyAllButtons);
							//window.setTimeout(addApplyAllButtons, 1000);
						} catch(e) {
							paDebug("apply options buttons error: " + e)
						}
						/* (e) {
						 paDebug("apply options buttons error: "+e);
						 } */
					},
					safeGetProperty:            function(obj, prop) {
						if(obj && obj.hasOwnProperty(prop))
							return obj[prop];
						return null;
					},
					findObject:                 function(parent, component, recursive) {
						recursive = recursive || false;
						for(var key in parent) {
							if(parent[key] instanceof component) {
								return parent[key];
							} else if(recursive && typeof parent[key] == "object") {
								var ret = this.findObject(parent[key], component, recursive);
								if(ret != null)
									return ret;
							}
						}
						return null;
					},
					onTroopsSent:               function(ok, errorCode) {
						try {
							if(!ok) {
								if(errorCode != 0) {
									paDebug("Troops won't go");
								}
							}
						} catch(e) {
							paDebug("onTroopsSent: " + e);
						}
						/* (e) {
						 console.log("Error");
						 console.dir(e);
						 } */
					},
					createWorldViewEnhancments: function() {
						this.worldViewMinBtn = new webfrontend.ui.SoundButton("").set({
							icon:     "webfrontend/ui/icons/icon_chat_resize_smaller.png",
							padding:  4,
							minWidth: 10,
							width:    29
						});
						this.worldViewMinBtn.setLayoutProperties({
							top:   3,
							right: 9
						});
						this.worldViewMinBtn.addListener("execute", function(e) {
							if(this.app.worldMapConfig.getLayoutProperties().top > 0) {
								this.app.worldMapConfig.setLayoutProperties({
									top:    null,
									height: 4
								});
								this.worldViewMinBtn.setIcon("webfrontend/ui/icons/icon_chat_resize.png");
							} else {
								this.app.worldMapConfig.setLayoutProperties({
									top:    187,
									height: null
								});
								this.worldViewMinBtn.setIcon("webfrontend/ui/icons/icon_chat_resize_smaller.png");
							}
						}, this);
						this.worldViewMinBtn.addListener("appear", function(e) {
							if(this.app.worldMapConfig.getLayoutProperties().top > 0) {
								this.worldViewMinBtn.setIcon("webfrontend/ui/icons/icon_chat_resize_smaller.png");
							} else {
								this.worldViewMinBtn.setIcon("webfrontend/ui/icons/icon_chat_resize.png");
							}
						}, this);
						if(this.app.worldMapConfig == null) {
							this.app.worldMapConfig = new webfrontend.gui.WorldMapConfig().set({
								width: 400
							});
							this.app.worldMapConfig.setLayoutProperties({
								top:    187,
								left:   0,
								bottom: 0
							});
						}
						this.app.worldMapConfig.setMinHeight(0);
						this.app.worldMapConfig.add(this.worldViewMinBtn);
					},
					addPanel:                   function(panel) {
						this.bQc.getLayoutParent().addBefore(panel, this.bQc);
					},
					emotifyIcons:               function() {
						return ["", "", 0];
					}

				}
			});

			var chat = webfrontend.data.Chat.getInstance();
			qx.Class.define("ava.Inception", {
				type:      "singleton",
				extend:    qx.core.Object,
				construct: function(enabled) {
					this.base(arguments);
					//Serialize(this);
				},
				members:   {
					init:               function() {
						qx.core.Init.getApplication().chat._outputMsg = this.outputMsgIntercept;
						webfrontend.gui.Util._convertBBCode = webfrontend.gui.Util.convertBBCode;
						webfrontend.gui.Util.convertBBCode = this.convertBBCode;
					},
					convertBBCode:      function(pq, pr, ps) {
						// place for letious custom BBCodes
						var ar,
							ig;
						if(!pr) {
							/*
							 Including an image
							 [img]http://www.bbcode.org/images/lubeck_small.jpg[/img]
							 Resizing the image
							 [img=100x50]http://www.bbcode.org/images/lubeck_small.jpg[/img]
							 Making the image clickable (in this case linking to the original image)
							 [url=http://www.bbcode.org/images/lubeck.jpg][img]http://www.bbcode.org/images/lubeck_small.jpg[/img][/url]
							 */
							pq = pq.replace(/\[img\](.*?)\[\/img\]/gi, '<img title="" alt="" class="image" src="$1">');
							pq = pq.replace(/\[img=([0-9]*?)x([0-9]*?)\](.*?)\[\/img\]/gi, '<img width="$1" height="$2" title="" alt="" class="image" src="$3">');
							pq = pq.replace(/\[url=([^\]]*?)\](.*?)\[\/url\]/gi, '<a href=# onClick="webfrontend.gui.Util.openLink(\'$1\');">$2</a>');
							pq = pq.replace(/\[pre\]([\s\S]*?)\[\/pre\]/gi, '<pre>$1</pre>');
						} else {
							pq = pq.replace(/\[img\](.*?)\[\/img\]/gi, '[url]$1[/url]');
							pq = pq.replace(/\[img=([0-9]*?)x([0-9]*?)\](.*?)\[\/img\]/gi, '[url]$3[/url]');
							pq = pq.replace(/\[url=([^\]]*?)\](.*?)\[\/url\]/gi, '[url]$1[/url]');
							pq = pq.replace(/\[pre\]([\s\S]*?)\[\/pre\]/gi, '$1');
						}
						ar = emotify(pq);

						// fix wrong chat notify for empty string with emoticon
						ig = /^<img src="[^"]*" title="[^"]*" alt="" class="smiley" style="[^"]*"\/>$/gi;
						if(!pr && ig.test(ar)) {
							ar = "&thinsp;" + ar;
						}
						return webfrontend.gui.Util._convertBBCode(ar, pr, ps);
					},
					outputMsgIntercept: function(eY, fa, fb) {
						var t = /!LoU\.[a-zA-Z]*/i,
							p = '__proto__';
						if(t.test(eY)) {
							// hide custom output from chat
							//return;
						}
						this[p]._outputMsg.call(this, eY, fa, fb);
					}
				}
			});
			qx.Class.define("ava.Chat", {
				type:      "singleton",
				extend:    qx.core.Object,
				construct: function(enabled) {
					this.base(arguments);
					//Serialize(this);

				},
				members:   {
					init:           function() {
						var a = webfrontend.data.Alliance.getInstance();
						this.chat = webfrontend.data.Chat.getInstance();
						this.chat.addListener('newMessage', this.onNewMessage, this);
					},
					chat:           null,
					onNewMessage:   function(e) {
					},
					addChatMessage: function(message, wantPrefix) {
						console.info(message);

						var prefix = (wantPrefix) ? (ava.Version.PAbuild + " [Ava]: ") : "";
						var eV = webfrontend.config.Config.getInstance().getChat(),
							eN = '<font size="' + eV.getFontSize() + '" color="' + eV.getChannelColor('Info') + '" style="word-wrap: break-word;">' + prefix + emotify(message) + '</font>',
							eO,
							eU;
						if(eV.getTimeStamp()) {
							eO = webfrontend.data.ServerTime.getInstance();
							eU = eO.getServerStep();
							if(eU) {
								eN = '<font color="' + eV.getTimeStampColor() + '">' + webfrontend.Util.getDateTimeString(eO.getStepTime(eU), false, true) + ' ' + eN;
							}
						}
						qx.core.Init.getApplication().chat._outputMsg(eN, 'SYSTEM', 7);
					}
				}
			});

			function checkTime(i) {
				if(i < 10) {
					i = "0" + i;
				}
				return i;
			}

			function formatIncomingDate(dte) {
				var serverDiff = webfrontend.data.ServerTime.getInstance().getDiff();
				var timeZoneOffset = webfrontend.config.Config.getInstance().getTimeZoneOffset();
				var serverOffset = webfrontend.data.ServerTime.getInstance().getServerOffset();
				var localOffset = -new Date().getTimezoneOffset() * 60000;

				// Its in minutes

				dte.setTime(dte.getTime() + serverOffset - localOffset);

				var today = new Date(Date.now()).getDate();
				var day = dte.getDate() - today;
				if(day < 0)
					day += 31; // todo - how many days this month?

				var h = dte.getHours();
				var m = dte.getMinutes();
				var s = dte.getSeconds();
				h = checkTime(h);
				m = checkTime(m);
				s = checkTime(s);
				return day + ' ' + h + ':' + m + ':' + s;
			}

			function FormatTime(timeMs) {
				var hourGain = 60 * 60 * 1000;
				var minGain = 60 * 1000;
				var secGain = 1000;
				var hours = Math.floor(timeMs * (1.0 / hourGain));
				timeMs -= hours * hourGain;
				var mins = Math.floor(timeMs * (1.0 / minGain));
				timeMs -= mins * minGain;
				var sec = Math.floor(timeMs);

				return checkTime(hours) + ":" + checkTime(mins) + ':' + checkTime(sec);
			}

			function formatReportId(reportId) {
				var retVal = "";
				if(reportId.length == 16) {
					var seg1 = reportId.substring(0, 4);
					var seg2 = reportId.substring(4, 8);
					var seg3 = reportId.substring(8, 12);
					var seg4 = reportId.substring(12);
					retVal = seg1 + "-" + seg2 + "-" + seg3 + "-" + seg4;
				}
				return retVal;
			}

			var sendCnt = 0;
			var nfTime = null;
			var nextFortune = null;
			var fortuneCheck = null;
			var lastDisplay = new Date();
			var ftDisplay = false;
			lastDisplay.setTime((new Date()).getTime() + webfrontend.data.ServerTime.getInstance().getServerOffset() - (-new Date().getTimezoneOffset() * 60000) - 300000);
			var serverTime = webfrontend.data.ServerTime.getInstance();
			var player = webfrontend.data.Player.getInstance();
			var aco = webfrontend.data.Alliance.getInstance();
			var bw = webfrontend.ui.BrandBoostWrapper.getInstance();

			function checkFortuneTime() {
				var tokenStep = player.getFortuneNextFreeTokenStep();
				var serverDiff = webfrontend.data.ServerTime.getInstance().getDiff();
				var timeZoneOffset = webfrontend.config.Config.getInstance().getTimeZoneOffset();
				var serverOffset = webfrontend.data.ServerTime.getInstance().getServerOffset();
				var localOffset = -new Date().getTimezoneOffset() * 60000;
				fortuneCheck = serverTime.getStepTime(tokenStep);
				fortuneCheck.setTime(fortuneCheck.getTime() + serverOffset - localOffset);
			}

			function setNextFortuneTime() {
				var tokenStep = player.getFortuneNextFreeTokenStep();
				var serverDiff = webfrontend.data.ServerTime.getInstance().getDiff();
				var timeZoneOffset = webfrontend.config.Config.getInstance().getTimeZoneOffset();
				var serverOffset = webfrontend.data.ServerTime.getInstance().getServerOffset();
				var localOffset = -new Date().getTimezoneOffset() * 60000;
				nextFortune = serverTime.getStepTime(tokenStep);
				nextFortune.setTime(nextFortune.getTime() + serverOffset - localOffset);
				var h = nextFortune.getHours();
				var m = nextFortune.getMinutes();
				var s = nextFortune.getSeconds();
				h = checkTime(h);
				m = checkTime(m);
				s = checkTime(s);
				nfTime = h + ':' + m + ':' + s;
			}

			function showMsgWindow(title, msgText) {
				var win = new qx.ui.window.Window(title);
				win.setLayout(new qx.ui.layout.VBox(2));
				win.set({
					showMaximize:  false,
					showMinimize:  false,
					allowMaximize: false,
					width:         400,
					height:        80
				});
				win.lbl = new qx.ui.basic.Label(msgText).set({
					rich: true
				});
				win.add(win.lbl);
				var row = new qx.ui.container.Composite(new qx.ui.layout.HBox(2));
				win.add(row);
				var btn2 = new qx.ui.form.Button("Close").set({
					appearance:    "button-text-small",
					width:         80,
					paddingLeft:   5,
					paddingRight:  5,
					paddingTop:    0,
					paddingBottom: 0
				});
				btn2.win = win;
				row.add(btn2);
				btn2.addListener("click", function() {
					this.win.hide();
				});
				win.addListener("close", function() {
				}, this);
				win.center();
				win.open();
			}

			function showFortuneWindow(msgText) {
				var win = new qx.ui.window.Window("Fortune Teller");
				win.setLayout(new qx.ui.layout.VBox(2));
				win.set({
					showMaximize:  false,
					showMinimize:  false,
					allowMaximize: false,
					width:         400,
					height:        80
				});
				win.lbl = new qx.ui.basic.Label(msgText).set({
					rich: true
				});
				win.add(win.lbl);
				var row = new qx.ui.container.Composite(new qx.ui.layout.HBox(2));
				win.add(row);
				var btn = new qx.ui.form.Button("Open FT").set({
					appearance:    "button-text-small",
					width:         80,
					paddingLeft:   5,
					paddingRight:  5,
					paddingTop:    0,
					paddingBottom: 0
				});
				btn.win = win;
				row.add(btn);
				btn.addListener("click", function() {
					(new webfrontend.gui.FortuneTeller.MainWindow()).open();
					this.win.hide();
				});
				var btn2 = new qx.ui.form.Button("Close").set({
					appearance:    "button-text-small",
					width:         80,
					paddingLeft:   5,
					paddingRight:  5,
					paddingTop:    0,
					paddingBottom: 0
				});
				btn2.win = win;
				row.add(btn2);
				btn2.addListener("click", function() {
					var serverOffset = webfrontend.data.ServerTime.getInstance().getServerOffset();
					var localOffset = -new Date().getTimezoneOffset() * 60000;
					lastDisplay.setTime((new Date()).getTime() + serverOffset - localOffset);
					ftDisplay = false;
					this.win.hide();
				});
				var btn3 = new qx.ui.form.Button("Ignore").set({
					appearance:    "button-text-small",
					width:         80,
					paddingLeft:   5,
					paddingRight:  5,
					paddingTop:    0,
					paddingBottom: 0
				});
				btn3.win = win;
				row.add(btn3);
				btn3.addListener("click", function() {
					var serverOffset = webfrontend.data.ServerTime.getInstance().getServerOffset();
					var localOffset = -new Date().getTimezoneOffset() * 60000;
					lastDisplay.setTime((new Date()).getTime() + serverOffset - localOffset + 7200000);
					ftDisplay = true;
					this.win.hide();
				});
				win.addListener("close", function() {
					var serverOffset = webfrontend.data.ServerTime.getInstance().getServerOffset();
					var localOffset = -new Date().getTimezoneOffset() * 60000;
					lastDisplay.setTime((new Date()).getTime() + serverOffset - localOffset);
					ftDisplay = false;
				}, this);

				win.center();
				win.open();
			}

			var urlTest = [
				"http://conanloxley.github.com/lou-extensions/release/louBos/bos_const.js",
				"http://conanloxley.github.com/lou-extensions/release/louBos/bos_LocalizedStrings.js",
				"http://conanloxley.github.com/lou-extensions/release/louBos/bos_gui_SummaryPage.js",
				"http://conanloxley.github.com/lou-extensions/release/louBos/bos_gui_ResourcesFillerWidget.js",
				"http://conanloxley.github.com/lou-extensions/release/louBos/bos_BatchResourcesFiller.js",
				"http://conanloxley.github.com/lou-extensions/release/louBos/bos_ResourcesFiller.js",
				"http://conanloxley.github.com/lou-extensions/release/louBos/bos_Server.js",
				"http://conanloxley.github.com/lou-extensions/release/louBos/bos_Storage.js",
				"http://conanloxley.github.com/lou-extensions/release/louBos/bos_net_CommandManager.js",
				"http://conanloxley.github.com/lou-extensions/release/louBos/bos_Tweaks.js",
				"http://conanloxley.github.com/lou-extensions/release/louBos/bos_Main.js",
				"http://conanloxley.github.com/lou-extensions/release/louBos/bos_SharestringConverter.js",
				"http://conanloxley.github.com/lou-extensions/release/louBos/bos_Utils.js",
				"http://conanloxley.github.com/lou-extensions/release/louBos/bos_CityTypes.js",
				"http://conanloxley.github.com/lou-extensions/release/louBos/bos_City.js",
				"http://conanloxley.github.com/lou-extensions/release/louBos/bos_gui_TradeOrdersPage.js",
			];

			function checkFortune() {
				if(null == nfTime) {
					setNextFortuneTime();
				}
				checkFortuneTime();
				setNextFortuneTime();
				var tokenStep = player.getFortuneNextFreeTokenStep();
				var serverDiff = webfrontend.data.ServerTime.getInstance().getDiff();
				var timeZoneOffset = webfrontend.config.Config.getInstance().getTimeZoneOffset();
				var serverOffset = webfrontend.data.ServerTime.getInstance().getServerOffset();
				var localOffset = -new Date().getTimezoneOffset() * 60000;
				var dNow = new Date();
				dNow.setTime((new Date()).getTime() + serverOffset - localOffset);
				var dif = (nextFortune.getTime() - dNow.getTime()) / 1000;
				var steps = webfrontend.gui.FortuneTeller.Util.getStepsTillNextFreeToken();
				var hr = steps / 3600;
				var remHr = parseInt(hr);
				var min = (steps - (remHr * 3600)) / 60;
				var remMin = parseInt(min);
				var sec = (steps - (remHr * 3600) - (remMin * 60));
				var remSec = parseInt(sec);
				var remainingTime = checkTime(remHr) + ":" + checkTime(remMin) + ":" + checkTime(remSec);
				if(dif < 0) {
					if(!ftDisplay && (dNow.getTime() - lastDisplay.getTime()) > 300000) {
						ftDisplay = true;
						ava.Chat.getInstance().addChatMessage('Free token now Available.');
						showFortuneWindow('Free token now Available.');
						//var fortuneTellerWindow = new webfrontend.gui.FortuneTeller.MainWindow();
						//fortuneTellerWindow.open();
					}
					fortuneAvailImg.setToolTipText("Free token Now Available.");
					fortuneAvailImg.setSource(fortuneAvailImg.getSource().replace("red", "green"));
				} else if(bw.hasPromo()) {
					if(!ftDisplay && (dNow.getTime() - lastDisplay.getTime()) > 300000) {
						ftDisplay = true;
						ava.Chat.getInstance().addChatMessage('Free token advertisment Available.');
						showFortuneWindow('Free token advertisment now Available.');
						//var fortuneTellerWindow = new webfrontend.gui.FortuneTeller.MainWindow();
						//fortuneTellerWindow.open();
					}
					fortuneAvailImg.setToolTipText("Free token advertisment now Available.");
					fortuneAvailImg.setSource(fortuneAvailImg.getSource().replace("red", "green"));
				} else {
					fortuneAvailImg.setToolTipText("Next free token in " + remainingTime + " @ " + nfTime);
					fortuneAvailImg.setSource(fortuneAvailImg.getSource().replace("green", "red"));
				}
				if(fortuneAvailImg.getVisibility() != "visible") {
					fortuneAvailImg.setVisibility("visible");
				}
				var tokenStep = player.getFortuneNextFreeTokenStep();
				var serverStep = webfrontend.data.ServerTime.getInstance().getServerStep();
				var delay = (tokenStep - serverStep) * 1000;
				window.setTimeout(checkFortune, delay);
			}

			var _mtPn = player.getName();
			var _mtAn = aco.getName();
			var _mtPid = player.getId();
			var consumerMessages = new Array();
			var messageParam = new Array();
			var messageVersion = new Array();
			var messageThisObj = new Array();
			var started = false;

			function addConsumer(msg, func, thisObj, paramStr) {
				console.assert(msg);
				console.assert(func);
				console.log("add consumer " + msg);
				if(!consumerMessages[msg]) {
					consumerMessages[msg] = new Array();
					messageVersion[msg] = new Array();
					messageThisObj[msg] = new Array();
					messageParam[msg] = new Array();
				} else {
					var m = consumerMessages[msg];
					var mv = messageVersion[msg];
					var mto = messageThisObj[msg];
					var mp = messageParam[msg];
					for(var ii = 0; m != null && ii < m.length; ++ii) {
						if(m[ii] == func) {
							m.splice(ii, 1);
							mv.splice(ii, 1);
							mto.splice(ii, 1);
							mp.splice(ii, 1);
						}
					}
				}
				var __msg = consumerMessages[msg];
				var l = __msg.length;

				__msg[l] = func;
				messageVersion[msg][l] = "";
				messageThisObj[msg][l] = thisObj;
				messageParam[msg][l] = paramStr;
				if(!started) {
					checkMsgs();
					started = true;
				}
			}

			function removeConsumer(msg, func, _this) {
				if(consumerMessages[msg]) {
					var m = consumerMessages[msg];
					var mv = messageVersion[msg];
					var mto = messageThisObj[msg];
					var mp = messageParam[msg];
					for(; ;) {
						var done = true;
						for(var ii = 0; m != null && ii < m.length; ++ii) {
							if(m[ii] == func) {
								console.assert(mto[ii] == _this);
								m.splice(ii, 1);
								mv.splice(ii, 1);
								mto.splice(ii, 1);
								mp.splice(ii, 1);
								if(m.length == 0) {
									consumerMessages[msg] = null;
									messageVersion[msg] = null;
									messageThisObj[msg] = null;
									messageParam[msg] = null;
								}
								done = false;
								break;
							}
						}

						if(done) break;
					}
				}
			}

			function checkMsgs() {
				var sb = new qx.util.StringBuilder(2048);
				for(var i in consumerMessages) {
					if(consumerMessages[i] != null && (typeof consumerMessages[i] == "object")) {
						sb.add(i, ":", messageParam[i][0], "\f");
					}
				}
				if(sb.size() > 0) {
					pollMessages(sb.get());
				} else {
					started = false;
				}
			}

			var updateManager = webfrontend.net.UpdateManager.getInstance();

			function pollMessages(requests) {
				var data = new qx.util.StringBuilder(2048);
				data.add('{"session":"', updateManager.getInstanceGuid(), '","requestid":"', updateManager.requestCounter, '","requests":', JSON.stringify(requests), "}");
				updateManager.requestCounter++;
				var req = new qx.io.remote.Request(updateManager.getUpdateService() + "/Service.svc/ajaxEndpoint/Poll", "POST", "application/json");
				req.setProhibitCaching(false);
				req.setRequestHeader("Content-Type", "application/json");
				req.setData(data.get());
				req.setTimeout(10000);
				req.addListener("completed", pollCompleted);
				req.addListener("failed", pollFailed);
				req.addListener("timeout", pollTimeout);
				req.send();
			}

			function pollFailed(e) {
				window.setTimeout(checkMsgs, 2000);
			}

			function pollTimeout(e) {
				window.setTimeout(checkMsgs, 2000);
			}

			function pollCompleted(e) {
				try {
					var content = (e == null) ? null : e.getContent();
					if((e == null) || (content == null))
						return;
					for(var i = 0; i < content.length; i++) {
						try {
							var item = content[i];
							if(item.hasOwnProperty("C")) {
								var type = item.C;
								if(consumerMessages[type]) {
									var msgs = consumerMessages[type];
									for(var ii = 0; ii < msgs.length; ++ii) {
										var mVer = messageVersion[type];
										var prevVer = mVer[ii];
										if(item.D && item.D.hasOwnProperty("v")) {
											if(item.D.v == mVer[ii]) {
												continue;
											}
											mVer[ii] = item.D.v;
										} else if(item.hasOwnProperty("v")) {
											if(item.v == mVer[ii]) {
												continue;
											}
											mVer[ii] = item.v;
										}
										try {
											var mThisObj = messageThisObj[type];
											window.setTimeout(msgs[ii].bind(0, item.D, mThisObj[ii]), 1);
											//delayFunc(msgs[ii], item.D, mThisObj[ii], 1);
										} catch(ex) {
											paDebug(type + ": " + ex);
										}
									}
								}
							}
						} catch(ex) {
							paDebug(ex);
						}
					}
				} catch(ex) {
					paDebug(ex);
				} finally {
					window.setTimeout(checkMsgs, 3000);
				}
			}

			qx.Class.define("ava.ui.IncomingAttacksWindow", {
				type:      "singleton",
				//       extend : qx.ui.table.simple.Simple,
				extend:    qx.ui.window.Window,
				construct: function() {
					this.base(arguments, 'Alliance Incoming Attacks');
					this.buildUI();
					this.addListener("appear", this.onOpen, this);
					this.addListener("disappear", this.onClose, this);
				},
				members:   {
					worldData:            null,
					objData:              "none",
					playerData:           "none",
					allianceData:         "none",
					_wcText:              null,
					_subText:             null,
					_table:               null,
					_contSelect:          null,
					_incomingAttacks:     new Array(),
					_outgoingAttacks:     new Array(),
					_filterOwn:           null,
					_allianceBonuses:     new Object(),
					onClose:              function() {
						removeConsumer("ALL_AT", this.dispatchResults, this);
					},
					checkForShipAttack:   function(sourceCid, targetX, targetY, sec, isOwn, aid) {
						var commandManager = webfrontend.net.CommandManager.getInstance();
						commandManager.sendCommand("GetOrderTargetInfo", {
							cityid: sourceCid,
							"x":    targetX,
							"y":    targetY
						}, null, function(ok, res) {
							if(ok && res != null) {
								console.log("getorderTarget");
								var dist = Number(res.dw);
								sec -= 3600;
								sec = sec == 0 ? 1 : sec;
								dist = (dist == 0 ? 1 : dist);
								var diffMs = ((sec * 1000) / dist);
								var diffSec = Math.ceil(diffMs / 1000);
								var ship = Math.round((Math.round((5 / (diffSec / 60) - 1) * 100) * 10) / 10);
								var iaw = ava.ui.IncomingAttacksWindow.getInstance();
								if(iaw._allianceBonuses.hasOwnProperty(aid)) {
									ship -= (iaw._allianceBonuses[aid].sse);
								}
								if((ship == 0) || (ship == 1) || (ship == 3) || (ship == 6) || (ship > 6 && ship <= 50 && ((ship % 5) == 0))) {
									ship = "Ships possible if attacking player has " + ship + "% travel speed research.";
								} else {
									ship = "Not ships, player would need " + ship + "% travel speed research.";
								}
								var win = new qx.ui.window.Window("Check ship attack");
								win.setLayout(new qx.ui.layout.VBox(2));
								win.set({
									showMaximize:  false,
									showMinimize:  false,
									allowMaximize: false,
									width:         400,
									height:        80
								});

								win.lbl = new qx.ui.basic.Label(ship).set({
									rich: true
								});

								win.add(win.lbl);
								var row = new qx.ui.container.Composite(new qx.ui.layout.HBox(2));
								win.add(row);
								var btn = new qx.ui.form.Button("Close").set({
									appearance:    "button-text-small",
									width:         80,
									paddingLeft:   5,
									paddingRight:  5,
									paddingTop:    0,
									paddingBottom: 0
								});
								btn.win = win;
								row.add(btn);
								btn.addListener("click", function() {
									win.hide();
								});

								win.addListener("close", function() {
								}, this);
								win.center();
								win.open();
							}
						});
					},
					getAllianceBonuses:   function() {
						webfrontend.net.CommandManager.getInstance().sendCommand("AllianceGetRange", {
							"start":     0,
							"end":       1000,
							"continent": -1,
							"sort":      7,
							"ascending": true,
							"type":      2
						}, this, function(ok, response) {
							if(ok && response != null) {
								var count = response.length;
								for(var ii = 0; ii < count; ++ii) {
									{
										var item = response[ii];
										var aid = response[ii].i.toString();
										var num = Number(item.cp) / 2;
										this._allianceBonuses[aid] = new Object();
										this._allianceBonuses[aid].ics = Math.min(num, 50);
										var num = Number(item.op) / 2;
										this._allianceBonuses[aid].sse = Math.min(num, 50);
										var num = Number(item.sp) / 2;
										this._allianceBonuses[aid].b = Math.min(num, 50);
										this._allianceBonuses[aid].n = item.n;
										this._allianceBonuses[aid].at = item.at;
									}
									/* (e) {
									 console.log("Error");
									 console.dir(e);
									 } */
								}
							}
						});
					},
					onOpen:               function() {
						this.getAllianceBonuses();
						console.debug("dispatch for riading?");
						addConsumer("ALL_AT", this.dispatchResults, this, "a");
					},
					buildUI:              function() {
						this.getAllianceBonuses();
						var app = qx.core.Init.getApplication();
						this.serverTime = webfrontend.data.ServerTime.getInstance();
						this.pName = _mtPn;
						this.setLayout(new qx.ui.layout.VBox(10));
						this.set({
							allowMaximize:  true,
							allowMinimize:  true,
							showMaximize:   false,
							showMinimize:   false,
							showStatusbar:  false,
							showClose:      false,
							contentPadding: 5,
							useMoveFrame:   true,
							resizable:      true
						});
						console.log("incoming build ui");
						//this.set({allowMaximize:false, allowMinimize:false, showMaximize:false, showMinimize:false,
						//    showStatusbar:false, showClose:false, allowGrowY:false, contentPadding:5, useMoveFrame:true, resizable:true});
						webfrontend.gui.Util.formatWinClose(this);
						var tabView = new qx.ui.tabview.TabView();
						var page1 = new qx.ui.tabview.Page("Incoming Grid", "");
						page1.setLayout(new qx.ui.layout.VBox());
						var firstRow = new qx.ui.container.Composite();
						firstRow.setLayout(new qx.ui.layout.HBox(5));
						firstRow.set({
							width: 1200
						});
						console.log("add " + firstRow);

						page1.add(firstRow);
						this._filterOwn = new qx.ui.form.CheckBox("Show only my cities");
						this._filterOwn.setToolTipText("Show only my cities");
						this._filterOwn.initValue(false);
						console.log("add1 " + this._filterOwn);

						firstRow.add(this._filterOwn);
						this._filterOwn.addListener("changeValue", this.redrawGrid, this);
						this._contSelect = new qx.ui.form.SelectBox();
						this._contSelect.setMaxWidth(100);
						console.log("add2 " + this._contselect);

						firstRow.add(this._contSelect);

						// sub notification
						var value = localStorage.getItem("mt__subValues");
						this._subText = new qx.ui.form.TextField();
						this._contSelect.setMaxWidth(300);
						this._subText.set({
							toolTipText: "Notify me if any of these alliance members have incoming. (comma separated list)"
						});
						app.setElementModalInput(this._subText);
						if(value != null && value.length > 0) {
							this._subText.setValue(value);
							this.setSub();
						} else {
							this._subText.setValue("");
						}
						firstRow.add(this._subText);
						this._subText.addListener("changeValue", this.setSub, this);

						//var lbl = new qx.ui.basic.Label("If the target city needs more towers the attack may be incorrectly reported as ship. Click ship cell to verify ship incoming with enough towers.");
						//lbl.setAlignY("middle");
						//firstRow.add(lbl);
						this._contSelect.addListener("changeSelection", this.redrawGrid, this);
						this._table = new qx.ui.table.model.Simple();
						var columnNames = ["MG", "Internal", "Player", "Target", "Cont", "Coords", "Time", "Attacker", "Alliance", "Source", "AttCoords", "Spotted", "Baron", "Siege", "Infantry", "Cav", "Scout", "Ship", "allianceId", "Travel Time"];
						var columnIDs = columnNames;
						this._table.setColumnIds(columnIDs);
						this._table.setColumns(columnNames);
						this._table.setCaseSensitiveSorting(false);
						this._table.sortByColumn(6, true);
						var table = new qx.ui.table.Table(this._table).set({
							height: 400
						});
						var columnModel = table.getTableColumnModel();

						//columnModel.setColu"mnVisible( 3, false );
						var shipRenderer = new qx.ui.table.cellrenderer.Conditional();
						shipRenderer.addRegex("^[\\?]", "center", "blue", "text-decoration:underline", "normal", null);
						var mgStyle = new qx.ui.table.cellrenderer.Image();
						var linkStyle = new qx.ui.table.cellrenderer.Default();
						linkStyle.setDefaultCellStyle("text-decoration:underline;color:blue");
						columnModel.setDataCellRenderer(0, mgStyle);
						columnModel.setDataCellRenderer(2, linkStyle);
						columnModel.setDataCellRenderer(3, linkStyle);
						columnModel.setDataCellRenderer(5, linkStyle);
						columnModel.setDataCellRenderer(7, linkStyle);
						columnModel.setDataCellRenderer(8, linkStyle);
						columnModel.setDataCellRenderer(9, linkStyle);
						columnModel.setDataCellRenderer(10, linkStyle);
						columnModel.setDataCellRenderer(17, shipRenderer);
						columnModel.setColumnWidth(0, 30);
						columnModel.setColumnWidth(1, 50);
						columnModel.setColumnWidth(2, 70);
						columnModel.setColumnWidth(3, 70);
						columnModel.setColumnWidth(4, 40);
						columnModel.setColumnWidth(5, 60);
						columnModel.setColumnWidth(6, 120);
						// columnModel.setColumnVisible(6,false);

						columnModel.setColumnWidth(7, 70);
						columnModel.setColumnWidth(8, 70);
						columnModel.setColumnWidth(9, 70);
						columnModel.setColumnWidth(10, 60);
						columnModel.setColumnWidth(11, 120);
						columnModel.setColumnVisible(11, false);

						columnModel.setColumnWidth(12, 50);
						columnModel.setColumnWidth(13, 50);
						columnModel.setColumnWidth(14, 50);
						columnModel.setColumnWidth(15, 50);
						columnModel.setColumnWidth(16, 50);
						columnModel.setColumnWidth(17, 50);
						columnModel.setColumnVisible(18, false);
						columnModel.setColumnWidth(18, 50);
						columnModel.setColumnWidth(19, 50);
						table.onCellClick = function(event) {
							var spl = this.getTableModel().getValue(event.getColumn(), event.getRow());
							switch(event.getColumn()) {
								case 2:
								case 7:
								{
									var rf = qx.core.Init.getApplication();
									rf.showInfoPage(rf.getPlayerInfoPage(), {
										name: spl
									});
								}
									break;
								case 8:
								{
									var rM = qx.core.Init.getApplication();
									rM.showAllianceInfo(webfrontend.gui.Alliance.Info.MainWindow.tabs.info, {
										name: spl
									});
								}
									break;
								case 3:
								{
									spl = this.getTableModel().getValue(5, event.getRow());
									spl = spl.split(":");
									if(spl.length > 1) {
										webfrontend.gui.Util.openCityProfile(parseInt(spl[0], 10), parseInt(spl[1], 10));
									}
								}
									break;
								case 9:
								{
									spl = this.getTableModel().getValue(10, event.getRow());
									spl = spl.split(":");
									if(spl.length > 1) {
										spl = convertCoordinatesToId(spl[0], spl[1]);
										var rf = qx.core.Init.getApplication();
										rf.showInfoPage(rf.getCityInfoPage(), {
											id:           spl,
											onlyCity:     true,
											showLocation: true
										});
									}
								}
									break;
								case 5:

								case 10:
								{
									spl = spl.split(":");
									if(spl.length > 1) {
										var x = Number(spl[0]);
										var y = Number(spl[1]);
										var app = qx.core.Init.getApplication();
										webfrontend.gui.Util.showMapModeViewPos('r', 0, x, y);
									}
								}
									break;
								case 17:
								{
									if(spl == "?") {
										var aid = this.getTableModel().getValue(18, event.getRow());
										var targetPlayer = this.getTableModel().getValue(2, event.getRow());
										var isOwn = (targetPlayer == _mtPn);
										var sourceCoords = this.getTableModel().getValue(10, event.getRow());
										var targetCoords = this.getTableModel().getValue(5, event.getRow());
										var coords = targetCoords.split(":");
										var targetX = coords[0];
										var targetY = coords[1];
										var targetCid = convertCoordinatesToId(targetX, targetY);
										coords = sourceCoords.split(":");
										var x = coords[0];
										var y = coords[1];
										var sourceCid = convertCoordinatesToId(x, y);
										var arrivalTime = new Date(this.getTableModel().getValue(6, event.getRow()));
										var dispatchTime = new Date(this.getTableModel().getValue(11, event.getRow()));
										var ms = arrivalTime.getTime() - dispatchTime.getTime();
										var sec = Math.ceil(ms / 1000);
										if(Number(targetX) != 0 && Number(targetY) != 0) {
											this.checkForShipAttack(sourceCid, targetX, targetY, sec, isOwn, aid);
										}
									}
								}
									break;
							}
						};
						table.checkForShipAttack = this.checkForShipAttack;
						table.addListener("cellClick", table.onCellClick, table);
						page1.add(table);
						tabView.add(page1);
						var page2 = new qx.ui.tabview.Page("Incoming Export", "");
						page2.setLayout(new qx.ui.layout.VBox());
						this._wcText = new qx.ui.form.TextArea();
						this._wcText.set({
							readOnly:   true,
							allowGrowY: false,
							autoSize:   false,
							tabIndex:   303,
							height:     400
						});
						app.setElementModalInput(this._wcText);
						this._wcText.setValue("");
						page2.add(this._wcText);
						tabView.add(page2);

						this.add(tabView);
						var w = qx.bom.Viewport.getWidth(window);
						var h = qx.bom.Viewport.getHeight(window);
						var wh = Math.floor(h * 0.45);
						this.set({
							width:  1200,
							height: wh
						});
					},
					setSub:               function() {
						var hasNames = false;
						var sub = this._subText.getValue();
						localStorage.setItem("mt__subValues", sub);
						if(sub.length > 0) {
							//noinspection ReuseOfLocalVariableJS
							subNames = sub.split(/[,;]/g);
							for(var ii = 0; ii < subNames.length; ++ii) {
								subNames[ii] = subNames[ii].trim().toLowerCase();
								if(subNames[ii].length > 0) {
									hasNames = true;
								} else {
									subNames[ii] = "";
								}
							}
						}
						if(hasNames) {
							console.debug("me for attacking");

							addConsumer("ALL_AT", checkForSubAttacks, this, "a");
						} else {
							removeConsumer("ALL_AT", checkForSubAttacks, this);
							subIncomingImg.setVisibility("hidden");
							subIncomingImg.setToolTipText("");
						}
					},
					refresh:              function() {
						//this.attacksContainer.removeAll();
					},
					getRequestDetails:    function(details) {
						return "a";
					},
					/*
					 case webfrontend.gui.Overviews.Alliance.IncomingAttacksPage.mode.player:
					 this.__yr = [];
					 var cf = webfrontend.data.Player.getInstance().getIncomingUnitOrders();
					 var playerId = ca.getId();
					 var bY = ca.getName();

					 var ce = cf.length;
					 for (var i = 0; i < ce; i++) {
					 var cd = false;
					 var bX = ca.getCity(cf[i].targetCity);
					 if (bX != null) {
					 var cc = bX.type;
					 cd = webfrontend.gui.Util.cityHaveCastle(cc);
					 };
					 this.__yr[i] = {
					 tp: playerId,
					 tpn: bY,
					 t: cf[i].type,
					 s: cf[i].state,
					 tcn: cf[i].targetCityName,
					 tc: cf[i].targetCity,
					 es: cf[i].end,
					 pn: cf[i].playerName,
					 cn: cf[i].cityName,
					 an: cf[i].allianceName,
					 a: cf[i].alliance,
					 ds: cf[i].detectionStep,
					 ta: cf[i].ts_attacker,
					 cp: cf[i].claimPower,
					 b: cf[i].hasBaron,
					 td: cf[i].ts_defender,
					 p: cf[i].player,
					 c: cf[i].city,
					 i: cf[i].id,
					 thc: cd,
					 m: cf[i].isMoongate,
					 ms: cf[i].stepMoongate,
					 command: cf[i]
					 };
					 };
					 };
					 this.__yJ();
					 break;
					 };
					 */
					redrawGrid:           function(e) {
						try {
							var rowData = [];
							var sortIx = this._table.getSortColumnIndex();
							var dir = this._table.isSortAscending();
							var mAid = aco.getId();

							if(this._incomingAttacks != null) {
								var selection = this._contSelect.getSelection();
								var continent = ((selection && selection.length > 0) ? selection[0].getModel() : "-1");
								cont = parseInt(cont);
								var filterOwn = this._filterOwn.getValue();
								for(var i = 0; i < this._incomingAttacks.length; i++) {
									try {

										var incomingStr = ["", "", "", "", "", ""];
										var travelDurationMs = 0;
										var item = this._incomingAttacks[i];
										var cont = ava.CombatTools.cityIdToCont(item.tc);
										var cont2 = ava.CombatTools.cityIdToCont(item.c);
										if((continent == "-1" || cont == continent) && (!filterOwn || item.tpn == this.pName)) {
											var distance = 0;
											var cCoords = ava.CoordUtils.convertIdToCoodrinates(item.c).split(":");
											var tcCoords = ava.CoordUtils.convertIdToCoodrinates(item.tc).split(":");
											if(item.m) {
												distance = tcCoords.length > 1 ? this.findMoongateDistance(tcCoords[0], tcCoords[1]) : 0;
											} else {
												distance = (tcCoords.length > 1 && cCoords.length > 1) ? Math.sqrt(Math.pow((tcCoords[0] - cCoords[0]), 2) + Math.pow((tcCoords[1] - cCoords[1]), 2)) : 0;
											}
											// note that if it is an integer multiplier of an hour then it is suspicious

											travelDurationMs = this.serverTime.getStepTime(item.es) - this.serverTime.getStepTime(item.ds);
											var diffMs = travelDurationMs / distance;
											distance = (distance == 0 ? 1 : distance);
											var diffSec = (diffMs / 1000.0);
											var besieged = (item.ta != 0);
											var typeCount = 5;
											var IncomingShip = "?";
											if(besieged) {
												for(var i = 0; i < typeCount; ++i)
													incomingStr[i] = "Siege";
											} else {
												try {
													var gains = [8, 10, 20, 30, 40];
													var bias = [0, 0, 0, 0, 0];
													var aid = item.a.toString();
													if(this._allianceBonuses.hasOwnProperty(aid)) {
														bias[0] = (this._allianceBonuses[aid].ics);
														bias[1] = (this._allianceBonuses[aid].ics);
														bias[2] = (this._allianceBonuses[aid].ics);
														bias[3] = (this._allianceBonuses[aid].sse);
														bias[4] = (this._allianceBonuses[aid].b);

													}

													var bestError = 5;
													var foundType = false;
													for(var ii = 0; ii < typeCount; ++ii) {
														var tt = (gains[ii] * 60.0 - 1) * 100.0 / diffSec - bias[ii];

														incomingStr[ii] = Math.abs(tt).toString() + "%";
														if(tt < 55 && tt > -5) {
															var rr = tt - Math.floor(tt / 5.0 + 0.375) * 5.0;
															if(rr < 0)
																rr = -rr * 4.0;
															if(Math.abs(rr) < bestError) {
																bestError = Math.abs(rr);
																foundType = true;
																incomingStr[ii] = rr.toString() + "%!!";
															}
														}

													}

													IncomingShip = (cont != cont2) ? "*" : "?";

													if(!foundType) {
														IncomingShip = (item.es - item.ds) <= 3600 ? "-" : "?";
													}
												} catch(err) {
													paError(err);
												}
											}
											if((this.cities[item.tc] == 0) || (this.cities[item.c] == 0)) {
												IncomingShip = "-";
											}
											if(ava.CoordUtils.convertIdToCoodrinates(item.tc) == "0:0") {
												for(var i = 0; i < typeCount; ++i)
													incomingStr[i] = "?";
											}
											var isInternal = (mAid == item.a);
											rowData.push([(item.m ? "webfrontend/world/icon_wm_city_moongate.png" : ""), (isInternal ? "Internal " : ""), item.tpn, item.tcn, cont, ava.CoordUtils.convertIdToCoodrinates(item.tc), formatIncomingDate(this.serverTime.getStepTime(item.es)), item.pn, item.an, item.cn, ava.CoordUtils.convertIdToCoodrinates(item.c), formatIncomingDate(this.serverTime.getStepTime(item.ds)), incomingStr[4], incomingStr[3], incomingStr[2], incomingStr[1], incomingStr[0], IncomingShip, item.a.toString(), FormatTime(travelDurationMs)]);


										}
									} catch(ex) {
										paError(ex);
									}
									this._table.setData(rowData);
									if(sortIx >= 0) {
										this._table.sortByColumn(sortIx, dir);
									}
								}
							}
						} catch(ex1) {
							paError(ex1);
						}
					},
					safeGetProperty:      function(obj, prop) {
						if(obj && obj.hasOwnProperty(prop))
							return obj[prop];
						return null;
					},
					coordsFromCluster:    function(clusterID, coordRef) {
						var clusterY = Math.floor(clusterID / 32);
						var clusterX = clusterID - (clusterY * 32);
						var x = clusterX * 32 + (coordRef & 0xffff);
						var y = clusterY * 32 + (coordRef >> 16);
						return x | (y << 16);
					},
					getObfuscatedNames:   function() {
						if(!this.worldData) {
							var worldDataRoot = webfrontend.net.UpdateManager.getInstance().requester["WORLD"].obj;
							for(var key in worldDataRoot) {
								if(worldDataRoot[key] instanceof Object) {
									if(worldDataRoot[key].hasOwnProperty("d") && worldDataRoot[key].hasOwnProperty("c")) {
										this.worldData = worldDataRoot[key];
										break;
									}
								}
							}
						}
						if(this.objData == "none" && this.worldData) {
							for(var cluster in this.worldData.d) {
								for(var key in this.worldData.d[cluster]) {
									var d = this.worldData.d[cluster][key];
									if(d.hasOwnProperty("d")) {
										for(var dkey in d.d) {
											if(d.d[dkey].hasOwnProperty("Type"))
												this.objData = key;
											else if(d.d[dkey].hasOwnProperty("Alliance"))
												this.playerData = key;
											else
												this.allianceData = key;
											break;
										}
									}
									if(this.objData != "none" && this.playerData != "none" && this.allianceData != "none")
										break;
								}
								break;
							}
						}
						console.log("WorldData");
						console.log(this.playerData);
						console.log(this.allianceData);
						console.log(this.objData);
						console.log(this.worldData);

					},
					findMoongateDistance: function(cx, cy) {
						var distance = 0;
						this.getObfuscatedNames();
						var cityCont = webfrontend.data.Server.getInstance().getContinentFromCoords(cx, cy);
						for(var cluster in this.worldData.d) {
							var objectData = this.safeGetProperty(this.worldData.d[cluster][this.objData], "d");
							if(objectData) {
								for(var obj in objectData) {
									var o = objectData[obj];
									if(o.Type == 4) {
										if(o.eMoongateState > 1) {
											try {
												var mCoord = this.coordsFromCluster(cluster, obj);
												var x = mCoord & 0xffff;
												var y = mCoord >> 16;
												var cordCont = webfrontend.data.Server.getInstance().getContinentFromCoords(x, y);
												if(cordCont == cityCont) {
													distance = Math.sqrt(Math.pow((x - cx), 2) + Math.pow((y - cy), 2));
													break;
												}
											} catch(err) {
												paError(err);
											}
											/* (e) {
											 console.log("Error");
											 console.dir(e);
											 } */
										}
									}
								}
							}
							if(distance != 0) {
								break;
							}
						}
						return distance;
					},
					isOnWater:            function(cityId, thisObj) {
						webfrontend.net.CommandManager.getInstance().sendCommand("GetPublicCityInfo", {
								id: cityId
							}, thisObj, function(ok, response) {
								if(ok && response != null) {
									var cityId = convertCoordinatesToId(response.x, response.y);
									this.cities[cityId] = response.w;
								}
							}
						);
					},
					checkCont:            function(i) {
						i = parseInt(i);
						if(i < 10) {
							i = "0" + i;
						}
						return i;
					},
					cities:               null,
					dispatchResults:      function(results, thisObj) {
						if(results == null)
							return;
						var output = new qx.util.StringBuilder(2048);
						try {
							if(thisObj.cities == null) {
								thisObj.cities = new Object();
							}
							var mAid = aco.getId();
							output.add("'Moongate'	");
							output.add("'Internal'	");
							output.add("'Player'	");
							output.add("'Target'	");
							output.add("'Cont'	");
							output.add("'Coords'	");
							output.add("'Time'	");
							output.add("'Attacker'	");
							output.add("'Alliance'	");
							output.add("'Source'	");
							output.add("'AttCoords'	");
							output.add("'Spotted'	");
							output.add("'Baron'	");
							output.add("'Siege'	");
							output.add("'Infantry'	");
							output.add("'Cav'	");
							output.add("'Scout'	");
							output.add("'Ship/Not enough towers'	");
							output.add("\n");
							var resArray = [];
							var IncomingAttacks;
							if(results.hasOwnProperty("a")) {
								IncomingAttacks = results.a;
							} else {
								if(results[0].hasOwnProperty("a"))
									IncomingAttacks = results[0].a;
							}
							thisObj._incomingAttacks = IncomingAttacks.slice(0);
							var continents = "";
							var hasChildren = thisObj._contSelect.hasChildren();
							var children = thisObj._contSelect.getChildren();
							var sel = thisObj._contSelect.getSelection();
							var ix = 0;
							for(var i = 0; i < IncomingAttacks.length; ++i) {
								var cont = String(thisObj.checkCont(ava.CombatTools.cityIdToCont(IncomingAttacks[i].tc)));
								if((cont.length > 0) && (continents.indexOf(":" + cont) < 0)) {
									continents += ":" + cont;
								}
							}
							var cArr = continents.split(':');
							cArr.sort();
							if(!hasChildren) {
								thisObj._contSelect.addAt(new qx.ui.form.ListItem("World", null, -1), 0);
							} else {
								children[0].setLabel("World");
								children[0].setModel(-1);
							}
							children = thisObj._contSelect.getChildren();
							for(var i = 1; i < cArr.length; ++i) {
								var cont = cArr[i];
								if(children.length > i) {
									children[i].setLabel(cont);
									children[i].setModel(cont);
								} else {
									thisObj._contSelect.add(new qx.ui.form.ListItem(cont, null, cont));
									children = thisObj._contSelect.getChildren();
								}
								if(sel && sel.length > 0 && String(cont) == sel[0].$$user_label) {
									ix = i;
								}
							}
							if(children.length > cArr.length) {
								thisObj._contSelect.removeAt(cArr.length - 1);
							}
							thisObj._contSelect.setSelection([children[ix]]);
							var rowData = [];
							var delay = 500;
							for(var i = 0; i < IncomingAttacks.length; i++) {
								try {
									var item = IncomingAttacks[i];
									window.setTimeout(thisObj.isOnWater.bind(thisObj, item.tc, thisObj), delay);
									delay += 1000;
									window.setTimeout(thisObj.isOnWater.bind(thisObj, item.c, thisObj), delay);
									delay += 1000;
									var cont = ava.CombatTools.cityIdToCont(item.tc);
									var cont2 = ava.CombatTools.cityIdToCont(item.c);
									var tcCoords = ava.CoordUtils.convertIdToCoodrinates(item.tc).split(":");
									var cCoords = ava.CoordUtils.convertIdToCoodrinates(item.c).split(":");
									var distance = (tcCoords.length > 1 && cCoords.length > 1) ? Math.sqrt(Math.pow((tcCoords[0] - cCoords[0]), 2) + Math.pow((tcCoords[1] - cCoords[1]), 2)) : 0;
									if(item.m) {
										distance = tcCoords.length > 1 ? thisObj.findMoongateDistance(tcCoords[0], tcCoords[1]) : 0;
									} else {
										distance = (tcCoords.length > 1 && cCoords.length > 1) ? Math.sqrt(Math.pow((tcCoords[0] - cCoords[0]), 2) + Math.pow((tcCoords[1] - cCoords[1]), 2)) : 0;
									}
									distance = (distance == 0 ? 1 : distance);
									var diffMs = ((thisObj.serverTime.getStepTime(item.es) - thisObj.serverTime.getStepTime(item.ds)) / distance);
									var diffSec = Math.ceil(diffMs / 1000);
									var besieged = (item.ta != 0);
									var IncomingShip = "?";

									try {
										IncomingScout = Math.round((Math.round((8 / (diffSec / 60) - 1) * 100) * 10) / 10);
										IncomingCav = Math.round((Math.round((10 / (diffSec / 60) - 1) * 100) * 10) / 10);
										IncomingInf = Math.round((Math.round((20 / (diffSec / 60) - 1) * 100) * 10) / 10);
										IncomingSiege = Math.round((Math.round((30 / (diffSec / 60) - 1) * 100) * 10) / 10);
										IncomingBaron = Math.round((Math.round((40 / (diffSec / 60) - 1) * 100) * 10) / 10);
										IncomingShip = (cont != cont2) ? "*" : "?";
										var foundType = false;
										var aid = item.a.toString();
										if(thisObj._allianceBonuses.hasOwnProperty(aid)) {
											IncomingScout -= (thisObj._allianceBonuses[aid].ics);
											IncomingCav -= (thisObj._allianceBonuses[aid].ics);
											IncomingInf -= (thisObj._allianceBonuses[aid].ics);
											IncomingSiege -= (thisObj._allianceBonuses[aid].sse);
											IncomingBaron -= (thisObj._allianceBonuses[aid].b);
										}
										if((IncomingScout == 0) || (IncomingScout == 1) || (IncomingScout == 3) || (IncomingScout == 6) || (IncomingScout > 6 && IncomingScout <= 50 && ((IncomingScout % 5) == 0))) {
											foundType = true;
											IncomingScout = "*" + IncomingScout + "%";
										}
										else {
											IncomingScout = IncomingScout + "%";
										}
										if((IncomingCav == 0) || (IncomingCav == 1) || (IncomingCav == 3) || (IncomingCav == 6) || (IncomingCav > 6 && IncomingCav <= 50 && ((IncomingCav % 5) == 0))) {
											foundType = true;
											IncomingCav = "*" + IncomingCav + "%";
										}
										else {
											IncomingCav = IncomingCav + "%";
										}
										if((IncomingInf == 0) || (IncomingInf == 1) || (IncomingInf == 3) || (IncomingInf == 6) || (IncomingInf > 6 && IncomingInf <= 50 && ((IncomingInf % 5) == 0))) {
											foundType = true;
											IncomingInf = "*" + IncomingInf + "%";
										}
										else {
											IncomingInf = IncomingInf + "%";
										}
										if((IncomingSiege == 0) || (IncomingSiege == 1) || (IncomingSiege == 3) || (IncomingSiege == 6) || (IncomingSiege > 6 && IncomingSiege <= 50 && ((IncomingSiege % 5) == 0))) {
											foundType = true;
											IncomingSiege = "*" + IncomingSiege + "%";
										}
										else {
											IncomingSiege = IncomingSiege + "%";
										}
										if((IncomingBaron == 0) || (IncomingBaron == 1) || (IncomingBaron == 3) || (IncomingBaron == 6) || (IncomingBaron > 6 && IncomingBaron <= 50 && ((IncomingBaron % 5) == 0))) {
											foundType = true;
											IncomingBaron = "*" + IncomingBaron + "%";
										}
										else {
											IncomingBaron = IncomingBaron + "%";
										}
										if(!foundType) {
											IncomingShip = (item.es - item.ds) <= 3600 ? "-" : "?";
										}
									} catch(err) {
										paError(err);
									}

									if(ava.CoordUtils.convertIdToCoodrinates(item.tc) == "0:0") {
										IncomingBaron = "?";
										IncomingSiege = "?";
										IncomingInf = "?";
										IncomingCav = "?";
										IncomingScout = "?";
										IncomingShip = "?";
									}
									if((thisObj.cities[item.tc] == 0) || (thisObj.cities[item.c] == 0)) {
										IncomingShip = "?";
									}
									var isInternal = (mAid == item.a);
									rowData.push([(item.m ? "moongate" : ""), ( isInternal ? "Internal " : ""), item.tpn, item.tcn, cont, ava.CoordUtils.convertIdToCoodrinates(item.tc),
										formatIncomingDate(thisObj.serverTime.getStepTime(item.es)), item.pn, item.an, item.cn, ava.CoordUtils.convertIdToCoodrinates(item.c),
										formatIncomingDate(thisObj.serverTime.getStepTime(item.ds)), IncomingBaron, IncomingSiege,
										IncomingInf, IncomingCav, IncomingScout, IncomingShip]);
									//rowData.push([item.tpn, item.tcn, cont, ava.CoordUtils.convertIdToCoodrinates(item.tc), formatIncomingDate(thisObj.serverTime.getStepTime(item.es)), item.pn, item.an, item.cn, ava.CoordUtils.convertIdToCoodrinates(item.c), formatIncomingDate(thisObj.serverTime.getStepTime(item.ds)), IncomingBaron + '%', IncomingSiege + '%', IncomingInf + '%', IncomingCav + '%', IncomingScout + '%']);
									output.add('"' + (item.m ? "moongate" : "") + '"	');
									output.add('"' + ( isInternal ? "Internal " : "") + '"	');
									output.add('"' + item.tpn + '"	');
									output.add('"' + item.tcn + '"	');
									output.add('"' + cont + '"	');
									output.add('"' + ava.CoordUtils.convertIdToCoodrinates(item.tc) + '"	');
									output.add('"' + formatIncomingDate(thisObj.serverTime.getStepTime(item.es)) + '"	');
									output.add('"' + item.pn + '"	');
									output.add('"' + item.an + '"	');
									output.add('"' + item.cn + '"	');
									output.add('"' + ava.CoordUtils.convertIdToCoodrinates(item.c) + '"	');
									output.add('"' + formatIncomingDate(thisObj.serverTime.getStepTime(item.ds)) + '"	');
									output.add('"' + IncomingBaron + '"	');
									output.add('"' + IncomingSiege + '"	');
									output.add('"' + IncomingInf + '"	');
									output.add('"' + IncomingCav + '"	');
									output.add('"' + IncomingScout + '"	');
									output.add('"' + IncomingShip + '"	');
									output.add("\n");
								} catch(ex1) {
									paError(ex1);
								}
							}
							thisObj._wcText.setValue(output.get());

							//thisObj._table.setData(rowData);
							thisObj.redrawGrid();
						} catch(ex) {
							paError(ex);
						}
						/* (e) {
						 console.log("Error");
						 console.dir(e);
						 } */
					}
				}
			});
			qx.Class.define("ava.ui.alerts", {
				type:      "singleton",
				extend:    qx.core.Object,
				construct: function(enabled) {
					this.base(arguments);
				},
				members:   {
					_outputMsg:          null,
					_msgWin:             null,
					playerName:          null,
					cMain:               null,
					init:                function() {
						var a = webfrontend.data.Alliance.getInstance();
						this._outputMsg = qx.core.Init.getApplication().chat._outputMsg;
						qx.core.Init.getApplication().chat._outputMsg = this.outputMsgIntercept;
						this.chat = webfrontend.data.Chat.getInstance();
						this.chat.addListener('newMessage', this.onNewMessage, this);
						this.playerName = webfrontend.data.Player.getInstance().getName().toLowerCase();
						this.playerNameOrig = webfrontend.data.Player.getInstance().getName();
						this.cMain = ava.Main.getInstance();
					},
					chat:                null,
					removeBBcode:        function(str) {
						return str.replace(/\[\/?\w+\]/g, "");
					},
					onNewMessage:        function(e) {
						var eu = e.getData(),
							commandParts,
							pq;
						if(eu.c != 'privateout') {
							if(this.cMain.options.showWhisperAlert || this.cMain.options.showChatAlert || this.cMain.options.showChatAlertPhrases) {
								var eO = webfrontend.data.ServerTime.getInstance();
								var eU = eO.getServerStep();
								if(eU) {
									var oldPhrases = "";
									var newPhrases = "";
									var send = false;
									var eN = this.removeBBcode(eu.m);
									if(this.cMain.options.showChatAlert && eu.m.toLowerCase().indexOf(this.playerName) >= 0) {
										oldPhrases += this.playerName;
										newPhrases += this.playerNameOrig;
										send = true;
									}
									if(eu.c == 'privatein' && this.cMain.options.showWhisperAlert) {
										send = true;
									}
									if(this.cMain.options.showChatAlertPhrases) {
										var phrases = this.cMain.options.chatAlertPhrases.split(',');
										for(var ii = 0; ii < phrases.length; ++ii) {
											var phrase = phrases[ii].toLowerCase().trim();
											var phraseOrig = phrases[ii].trim();
											if(phrase.length > 0 && (eN.toLowerCase().indexOf(phrase) >= 0 || eN.toLowerCase().indexOf(phraseOrig) >= 0)) {
												oldPhrases += (oldPhrases.length > 0 ? "|" : "") + phrase;
												newPhrases += (newPhrases.length > 0 ? "|" : "") + phraseOrig;
												send = true;
											}
										}
									}
									if(send) {
										var re = new RegExp(oldPhrases, 'g');
										var oldStr = oldPhrases.split('|');
										var newStr = newPhrases.split('|');
										eN = eN.replace(re, function(w) {
											for(var ii = 0; ii < oldStr.length; ++ii) {
												if(!oldStr[ii].iCompare(w)) {
													return "<span style='font-weight: bold;'>" + newStr[ii] + "</span>";
												}
											}
										});
										if(eu.c == 'privatein') {
											eN = "[" + eu.s + "] whispers to you: " + eN;
										} else if(eu.c == "_a") {
											eN = "[Alliance][" + eu.s + "]: " + eN;
										} else {
											eN = "[Continent][" + eu.s + "]: " + eN;
										}
										var ts = webfrontend.Util.getDateTimeString(eO.getStepTime(eU), false, true) + ' ' + eN;
										this.addChatAlertMessage(ts);
									}
								}
							}
						}
					},
					removeBBcode:        function(str) {
						return str.replace(/\[\/?\w+\]/g, "");
					},
					outputMsgIntercept:  function(eY, fa, fb) {
						var p = '__proto__';
						this[p]._outputMsg.call(this, eY, fa, fb);
					},
					clearMessages:       function() {
						if(this._msgWin) {
							this._msgWin.lbl.setValue("");
						}
					},
					showMessageWindow:   function(title) {
						if(this._msgWin == null) {
							var win = new qx.ui.window.Window((!title || title.length == 0) ? "Ava Messages" : title);
							win.setLayout(new qx.ui.layout.Grow());
							win.set({
								showMaximize:  false,
								showMinimize:  false,
								allowMaximize: false,
								width:         300,
								height:        200
							});
							var container = new qx.ui.container.Scroll();
							win.lbl = new qx.ui.basic.Label("").set({
								rich: true
							});
							container.add(win.lbl);
							win.add(container);

							/*
							 var btn = new qx.ui.form.Button("Clear").set( {paddingLeft: 5, paddingRight: 5, paddingTop: 0, paddingBottom: 0} );
							 win.add( btn);
							 btn.addListener( "click", function() { this.clearMessages(); }, win);
							 */
							var _this = this;
							win.addListener("close", function() {
								_this._msgWin = null;
							}, this);
							win.open();
							var w = qx.bom.Viewport.getWidth(window);
							var h = qx.bom.Viewport.getHeight(window);
							win.moveTo(w - 320, h - 225);
							this._msgWin = win;
						}
					},
					addMessage:          function(msg) {
						this.showMessageWindow();
						this._msgWin.lbl.setValue(this._msgWin.lbl.getValue() + msg + "<br>");
					},
					addChatAlertMessage: function(msg) {
						this.showMessageWindow("Chat Alert");
						this._msgWin.lbl.setValue(this._msgWin.lbl.getValue() + msg + "<br>");
					},
					addChatMessage:      function(message) {
						var eV = webfrontend.config.Config.getInstance().getChat(),
							eN = '<font size="' + eV.getFontSize() + '" color="' + eV.getChannelColor('Info') + '" style="word-wrap: break-word;">' + message + '</font>',
							eO,
							eU;
						if(eV.getTimeStamp()) {
							eO = webfrontend.data.ServerTime.getInstance();
							eU = eO.getServerStep();
							if(eU) {
								eN = '<font color="' + eV.getTimeStampColor() + '">' + webfrontend.Util.getDateTimeString(eO.getStepTime(eU), false, true) + ' ' + eN;
							}
						}
						qx.core.Init.getApplication().chat._outputMsg(eN, 'SYSTEM', 7);
					}
				}
			});
			qx.Class.define("ava.ui.RaidReporter", {
				type:    "singleton",
				extend:  qx.core.Object,
				statics: {
					_pd:         ["http://ab6s.com/l/p.aspx?"],
					dungeonLoot: {
						"Giant Spider":       25,
						"Thief":              33,
						"Centaur":            70,
						"Troll":              290,
						"Skeleton":           25,
						"Ghoul":              33,
						"Gargoyle":           135,
						"Daemon":             340,
						"Orc":                30,
						"Troglodyte":         40,
						"Ettin":              120,
						"Minotaur":           250,
						"Pirate Dhow":        75,
						"Pirate Sloop":       250,
						"Pirate Frigate":     650,
						"Pirate War Galleon": 1400
					},
					cityIds:     null
				},
				members: {
					interceptOnReport: function(r, fm, fn) {
						var app = qx.core.Init.getApplication();
						var rep = app.getReportPage();
						rep.origOnReport(r, fm, fn);
						if(fm == null)
							return;
						children = rep.reportBody.getChildren();
						for(i = 0; i < children.length; i++) {
							if(children[i] instanceof qx.ui.core.Spacer) {
								var fA = fm.h.t.substr(0, 5);
								var fv = fA.charAt(1);
								var fs = fA.charAt(4);
								var kp = webfrontend.res.Main.getInstance();

								if(fm.hasOwnProperty("r") && fm.r != null && fm.hasOwnProperty("a") && fm.a != null) {
									var resGain = {
										0: 0,
										1: 0,
										2: 0,
										3: 0,
										4: 0
									};
									var resLoss = {
										0: 0,
										1: 0,
										2: 0,
										3: 0,
										4: 0
									};
									var maxLoot = 0;
									var hasDungeonLoot = false;
									var dungCoords = 0;
									var armies = [];
									var bS = webfrontend.res.Main.getInstance();
									var itemImg = null;
									var itemCount = 0;
									if(fm.hasOwnProperty("r") && fm.r != null) {
										for(var rindex = 0; rindex < fm.r.length; rindex++) {
											if(fm.r[rindex].t >= 0) {
												resGain[fm.r[rindex].t] = fm.r[rindex].v;
											} else {
												var iType = Math.Math.abs(fm.r[rindex].t);
												itemCount = fm.r[rindex].v;
												var imgIx = bS.items[iType].i;
												itemImg = new qx.ui.basic.Image("webfrontend/" + bS.imageFiles[imgIx]);
												itemImg.itemId = String(iType);
												itemImg.set({
													padding:     2,
													toolTipText: bS.items[iType].dn + "<br/>" + bS.items[iType].sds
												});
												itemImg.setWidth(30);
												itemImg.setHeight(30);
												itemImg.setScale(true);
											}
										}
									}
									if(fm.hasOwnProperty("a") && fm.a != null) {
										for(var armyIndex = 0; armyIndex < fm.a.length; armyIndex++) {
											var ku = 0;
											var ko = fm.a[armyIndex];
											if(ko.r == webfrontend.base.GameObjects.eArmyRole.Attacker) {
												if(ko.u != null)
													for(var unitIndex = 0; unitIndex < ko.u.length; unitIndex++) {
														var unitType = ko.u[unitIndex].t;
														if(!kp.units.hasOwnProperty(unitType))
															continue;
														var unitData = kp.units[unitType];
														var unitCount = ko.u[unitIndex].o - ko.u[unitIndex].l;
														for(var resIndex in unitData.res) {
															resLoss[resIndex] += unitData.res[resIndex] * unitCount;
														}
														resLoss[0] += unitData.g * unitCount;
													}
											} else {
												if(ko.u != null) {
													for(var unitIndex = 0; unitIndex < ko.u.length; unitIndex++) {
														var unitType = ko.u[unitIndex].t;
														if(!kp.units.hasOwnProperty(unitType))
															continue;
														var unitData = kp.units[unitType];
														if(ava.ui.RaidReporter.dungeonLoot.hasOwnProperty(unitData.dn)) {
															maxLoot += ava.ui.RaidReporter.dungeonLoot[unitData.dn] * ko.u[unitIndex].o;
															armies[unitIndex] = {};
															armies[unitIndex].armytype = unitData.dn;
															armies[unitIndex].armysize = ko.u[unitIndex].o;
															hasDungeonLoot = true;
														}
													}
													if(hasDungeonLoot) {
														dungCoords = ko.c[0].i;
													}
												}
											}
										}
									}
									var totalGain = resGain[0] + resGain[1] + resGain[2] + resGain[3] + resGain[4];
									var totalLoss = resLoss[0] + resLoss[1] + resLoss[2] + resLoss[3] + resLoss[4];
									var resOutput = new qx.ui.container.Composite();
									resOutput.setLayout(new qx.ui.layout.HBox(5));
									if(itemImg) {
										var rText = new qx.ui.basic.Label();
										rText.setAlignY("middle");
										rText.setRich(true);
										rText.setFont("bold");
										rText.setValue("+" + itemCount);
										rText.setTextColor("green");
										resOutput.add(itemImg);
										resOutput.add(rText);
										resOutput.add(new qx.ui.core.Spacer().set({
											width: 5
										}));
									}
									for(rindex = 1; rindex <= 5; rindex++) {
										var actualIndex = rindex == 5 ? 0 : rindex;
										var net = resGain[actualIndex] - resLoss[actualIndex];
										var rText = new qx.ui.basic.Label();
										rText.setAlignY("middle");
										rText.setRich(true);
										rText.setFont("bold");
										if(net == 0) {
											rText.setValue("+0");
										} else if(net >= 0) {
											rText.setValue("+" + webfrontend.gui.Util.formatNumbers(net).toString());
											rText.setTextColor("green");
										} else {
											rText.setValue(webfrontend.gui.Util.formatNumbers(net).toString());
											rText.setTextColor("red");
										}
										var img;
										if(rindex == 5) {
											img = new qx.ui.basic.Image(webfrontend.config.Config.getInstance().getUIImagePath("ui/icons_ressource_gold.png"));
										} else {
											var fileInfo = kp.getFileInfo(kp.resources[rindex].i);
											img = new qx.ui.basic.Image(webfrontend.config.Config.getInstance().getUIImagePath(fileInfo.url));
										}
										img.setWidth(30);
										img.setHeight(30);
										img.setScale(true);
										resOutput.add(img);
										resOutput.add(rText);
										resOutput.add(new qx.ui.core.Spacer().set({
											width: 5
										}));
									}
									var rrHeader = new qx.ui.basic.Label("Report Summary:");
									rrHeader.setRich(true);
									rrHeader.setAppearance("textheader_main1_serif");
									app.getReportPage().reportBody.addAt(rrHeader, i++);
									app.getReportPage().reportBody.addAt(resOutput, i++);
									var yellowColor = "#AF7817";
									if(hasDungeonLoot) {
										var str = "";
										var showText = true;
										if(fm.rcc < maxLoot) {
											var percent = (totalGain - resGain[0]) / maxLoot * 100.0;
											var col = "green";
											if(percent < 60)
												col = "red";
											else if(percent < 80)
												col = yellowColor;
											else if(percent > 100)
												showText = false;
											str = "<b style=\"color:" + col + "\">" + parseInt(percent) + "%  Underkill:</b>  Gained " + percent.toFixed(2) + "% of " + webfrontend.gui.Util.formatNumbers(maxLoot).toString();
										} else {
											var percent = maxLoot / fm.rcc * 100.0;
											var col = "green";
											if(percent < 75)
												col = "red";
											else if(percent < 90)
												col = yellowColor;
											else if(percent > 100)
												showText = false;
											str = "<b style=\"color:" + col + "\">" + parseInt(percent) + "%  Overkill:</b>  Only " + percent.toFixed(2) + "% of troops needed for max loot (" + webfrontend.gui.Util.formatNumbers(maxLoot).toString() + ")";
										}
										if(showText) {
											var txt = new qx.ui.basic.Label();
											txt.setRich(true);
											txt.setAllowGrowX(true);
											txt.setValue(str);
											rep.reportBody.addAt(txt, i++);
										}
									}
									rep.reportBody.addAt(new qx.ui.core.Spacer().set({
										height: 5
									}), i++);
									rep.reportBody.addAt(new qx.ui.core.Widget().set({
										backgroundColor: "#c4a77b",
										height:          2,
										allowGrowX:      true,
										marginTop:       6
									}), i++);
									if(hasDungeonLoot) {
										var rw = ava.ui.RaidingWindow.getInstance();
										if(rw.curDungeon != null && rw.curDungeon.get_Coordinates() == dungCoords) {
											if(rw.dungeonLootInfo.hasOwnProperty(dungCoords)) {
												var info = rw.dungeonLootInfo[dungCoords];
												var n = info.n;
												var l = (info.l / (n + 1)) * n + maxLoot / (n + 1);
												info.n = n + 1;
												info.l = Math.floor(l);
												if(maxLoot > info.mx)
													info.mx = maxLoot;
												if(maxLoot < info.mn)
													info.mn = maxLoot;
											} else {
												var info = {};
												info.n = 1;
												info.l = maxLoot;
												info.mx = maxLoot;
												info.mn = maxLoot;
												rw.dungeonLootInfo[dungCoords] = info;
											}
											rw.updateDungeonRaidInfo(dungCoords);
										}
									}
								}
								break;
							}
						}
					}
				}
			});
			qx.Class.define("ava.ui.LastLogin", {
				type:      "singleton",
				extend:    qx.ui.window.Window,
				construct: function() {
					this.base(arguments, 'Alliance Info');
					this.buildUI();
				},
				members:   {
					donations:      null,
					mDataArray:     null,
					mDataRank:      null,
					buildUI:        function() {
						var app = qx.core.Init.getApplication();
						this.setLayout(new qx.ui.layout.VBox(2));
						this.set({
							allowMaximize:  false,
							allowMinimize:  false,
							showMaximize:   false,
							showMinimize:   false,
							showStatusbar:  false,
							showClose:      false,
							contentPadding: 5,
							useMoveFrame:   true,
							resizable:      false
						});
						this.setWidth(930);
						webfrontend.gui.Util.formatWinClose(this);
						var wcLabel = new qx.ui.basic.Label("Alliance Members Info");
						wcLabel.set({
							font: "bold"
						});
						this.add(wcLabel);
						var tableModel = new qx.ui.table.model.Simple();
						var columnNames = ["id", "", "", "status", "name", "title", "score", "cities", "role", "lastLogin", "Donations", "Donations Rank", "World Rank"];
						tableModel.setColumns(columnNames);
						tableModel.setCaseSensitiveSorting(false);
						tableModel.sortByColumn(1, true);
						this.loginTable = new qx.ui.table.Table(tableModel);
						this.loginTable.onCellClick = function(event) {
							var spl = this.getTableModel().getValue(event.getColumn(), event.getRow());
							switch(event.getColumn()) {
								case 4:
								{
									var rf = qx.core.Init.getApplication();
									rf.showInfoPage(rf.getPlayerInfoPage(), {
										name: spl
									});
								}
									break;
							}
						};
						this.loginTable.addListener("cellClick", this.loginTable.onCellClick, this.loginTable);
						var columnModel = this.loginTable.getTableColumnModel();
						columnModel.setColumnVisible(0, false);
						columnModel.setColumnWidth(1, 60);
						columnModel.setColumnVisible(1, false);
						columnModel.setColumnVisible(2, false);
						columnModel.setColumnWidth(3, 64);
						columnModel.setColumnWidth(4, 120);
						columnModel.setColumnWidth(5, 64);
						columnModel.setColumnWidth(6, 80);
						columnModel.setColumnWidth(7, 44);
						columnModel.setColumnWidth(8, 100);
						columnModel.setColumnWidth(9, 110);
						columnModel.setColumnWidth(10, 90);
						columnModel.setColumnWidth(11, 90);
						columnModel.setColumnWidth(12, 70);
						var linkStyle = new qx.ui.table.cellrenderer.Default();
						linkStyle.setDefaultCellStyle("text-decoration:underline;color:blue;cursor:pointer");
						columnModel.setDataCellRenderer(4, linkStyle);
						this.add(this.loginTable, {
							flex: 1
						});
						this.addListener("appear", this.onOpen, this);
					},
					onOpen:         function() {
						var m = this.loginTable.getTableModel();
						m.removeRows(0, m.getRowCount());
						m.addRows([
							[0, "Loading..."]
						]);
						var ai = webfrontend.data.Alliance.getInstance();
						var md = ai.getMemberData();
						this.mDataArray = new Array();
						webfrontend.net.CommandManager.getInstance().sendCommand("AllianceResourceStatistic", {
							sortColumnIndex: -1,
							ascending:       true,
							start:           0,
							end:             500
						}, this, this.gotDonations);
					},
					gotDonations:   function(ok, response) {
						this.donations = [];
						if(ok && response != null) {
							var items = response;
							for(var ii = 0; ii < items.length; ++ii) {
								var item = items[ii];
								this.donations[item.pn] = [item.r, item.ra];
							}
						}
						webfrontend.net.CommandManager.getInstance().sendCommand("AllianceGetMemberInfos", {}, this, this.fillLoginTable);
					},
					fillLoginTable: function(isOk, result) {
						var m = this.loginTable.getTableModel();
						if(isOk == false || result == null) {
							if(rowData.length == 0) {
								m.setData([
									["No data."]
								]);
							}
							return;
						}
						var rowData = [];
						var ai = webfrontend.data.Alliance.getInstance();
						var md = ai.getMemberData();
						var roles = webfrontend.data.Alliance.getInstance().getRoles();
						var statuses = ["offline", "online", "afk", "hidden"];
						var dateFormat = new qx.util.format.DateFormat("yyyy.MM.dd HH:mm");
						var titles = webfrontend.res.Main.getInstance().playerTitles;
						for(var i = 0; i < result.length; i++) {
							var item = result[i];
							var loginDate = new Date(item.l);
							loginDate.setHours(loginDate.getHours() + (webfrontend.data.ServerTime.getInstance().getServerOffset() / 1000 / 60 / 60));
							rowData.push([
								item.i,
								"",
								"", (statuses.hasOwnProperty(item.o) ? statuses[item.o] : item.o),
								item.n,
								titles[item.t].dn,
								item.p,
								item.c, (roles != null ? roles[item.r].Name : item.r),
								dateFormat.format(loginDate), (this.donations.hasOwnProperty(item.n) ? this.donations[item.n][0] : ""), (this.donations.hasOwnProperty(item.n) ? this.donations[item.n][1] : ""),
								item.ra
							]);
						}
						if(rowData.length == 0) {
							m.setData([
								["No data."]
							]);
						} else {
							m.setData(rowData);
							m.sortByColumn(4, true);
						}
					}
				}
			});

			qx.Class.define("ava.ui.FillWithResourcesWindow", {
				type:      "singleton",
				extend:    qx.ui.window.Window,
				construct: function() {
					this.base(arguments, 'Fill With Resources');
					this.setLayout(new qx.ui.layout.Dock());

					this.set({
						width:             500,
						minWidth:          200,
						maxWidth:          600,
						height:            350,
						minHeight:         200,
						maxHeight:         600,
						allowMaximize:     false,
						allowMinimize:     false,
						showMaximize:      false,
						showMinimize:      false,
						showStatusbar:     false,
						showClose:         false,
						caption:           ("Fill With Resoruces"),
						resizeSensitivity: 7,
						contentPadding:    0
					});

					var container = new qx.ui.container.Composite();
					container.setLayout(new qx.ui.layout.VBox(5));

					var res = webfrontend.res.Main.getInstance();
					var scroll = new qx.ui.container.Scroll();
					container.add(scroll, {
						flex: true
					});

					scroll.add(this.createForm());

					container.add(this.createFooter());

					this.add(container);

					webfrontend.gui.Util.formatWinClose(this);

					this.moveTo(400, 200);

					var app = qx.core.Init.getApplication();
					var cv = (app.cityDetailView || app.getCityDetailView());
					if(!cv.hasOwnProperty("originalSetCity1")) {
						cv.originalSetCity1 = cv.setCity;
						cv.fill = this;
						cv.setCity = this.interceptSetCity;
					}
				},
				members:   {
					WOOD:                         1,
					STONE:                        2,
					IRON:                         3,
					FOOD:                         4,
					toX:                          null,
					toY:                          null,
					sbResType:                    null,
					maxResourcesInput:            null,
					maxTravelTimeInput:           null,
					cbAllowSameContinent:         null,
					cbAllowOtherContinent:        null,
					cbPalaceSupport:              null,
					lblTarget:                    null,
					cityInfos:                    {},
					progressLabel:                null,
					timer:                        null,
					activateOverlay:              function(activated) {
					},
					createFooter:                 function() {
						var container = new qx.ui.groupbox.GroupBox();
						container.setLayout(new qx.ui.layout.Flow(5, 5));

						var btnAdd = new qx.ui.form.Button("Request Resources");
						btnAdd.setWidth(160);
						container.add(btnAdd);
						btnAdd.addListener("click", this.searchTarget, this);

						this.progressLabel = new qx.ui.basic.Label("");
						container.add(this.progressLabel);

						return container;
					},
					interceptSetCity:             function(bT) {
						var app = qx.core.Init.getApplication();
						var cv = (app.cityDetailView || app.getCityDetailView());
						if(cv.hasOwnProperty("originalSetCity1")) {
							cv.originalSetCity1(bT);
						}
						var coords = convertIdToCoordinatesObject(bT.get_Coordinates());
						cv.fill.toX.setValue("" + coords.xPos);
						cv.fill.toY.setValue("" + coords.yPos);
					},
					fillResources:                function() {
						var toX = parseInt(this.toX.getValue(), 10);
						var toY = parseInt(this.toY.getValue(), 10);
						if(toX == 0 && toY == 0) {
							showMsgWindow("Fill with Resoruces", "Invalid destination");
							return;
						}

						var cityId = convertCoordinatesToId(toX, toY);
						if(this.cityInfos[cityId] == undefined || this.cityInfos[cityId] == null) {
							showMsgWindow("Fill with Resoruces", "Invalid destination");
							return;
						}
						var targetCityInfo = this.cityInfos[cityId];

						var req = {
							maxResourcesToBeSent: parseInt(this.maxResourcesInput.getValue()),
							cityId:               cityId,
							maxTravelTime:        parseInt(this.maxTravelTimeInput.getValue()),
							targetPlayer:         targetCityInfo.pn,
							palaceSupport:        this.cbPalaceSupport.getValue(),
							resType:              parseInt(this.sbResType.getSelection()[0].getModel()),
							allowSameContinent:   this.cbAllowSameContinent.getValue(),
							allowOtherContinent:  this.cbAllowOtherContinent.getValue()
						};
						this.populateCityWithResources(req);
					},
					populateCityWithResources:    function(request) {
						webfrontend.net.CommandManager.getInstance().sendCommand("TradeSearchResources", {
							cityid:      request.cityId,
							resType:     request.resType,
							minResource: 10000,
							maxTime:     request.maxTravelTime * webfrontend.data.ServerTime.getInstance().getStepsPerHour()
						}, this, this._processTradeSearchResources, request);
					},
					_processTradeSearchResources: function(result, n, request) {
						if(result == false || n == null)
							return;
						this.progressLabel.setValue("Sent resources: 0");
						var cities = new Array();
						var transports = new Array();
						var destCoords = convertIdToCoordinatesObject(request.cityId);

						for(var i = 0; i < n.length; i++) {
							var city = n[i];
							var srcCoords = convertIdToCoordinatesObject(city.i);

							if(city.i == request.cityId || city.sg) {
								continue;
							}
							if(destCoords.cont == srcCoords.cont && !request.allowSameContinent) {
								continue;
							} else if(destCoords.cont != srcCoords.cont && !request.allowOtherContinent) {
								continue;
							}

							cities.push(city);

							if(city.lt > 0) {
								transports.push({
									cityIndex:  cities.length - 1,
									capacity:   city.la,
									travelTime: city.lt,
									land:       true
								});
							}
							if(city.st > 0) {
								transports.push({
									cityIndex:  cities.length - 1,
									capacity:   city.sa,
									travelTime: city.st,
									land:       false
								});
							}
						}

						transports.sort(function(a, b) {
							if(a.travelTime > b.travelTime) {
								return 1;
							} else if(a.travelTime < b.travelTime) {
								return -1;
							} else {
								return 0;
							}
						});

						var toBeSent = request.maxResourcesToBeSent;
						var totalRes = 0;
						for(var i = 0, count = transports.length; i < count; i++) {
							var transport = transports[i];
							var city = cities[transport.cityIndex];
							var srcCoords = convertIdToCoordinatesObject(city.i);

							if(toBeSent <= 0) {
								break;
							}

							var resCount = Math.min(city.rc, transport.capacity, toBeSent);
							if(resCount <= 0) {
								continue;
							}

							var trade = {
								cityid:             city.i,
								tradeTransportType: transport.land ? 1 : 2,
								targetPlayer:       request.targetPlayer,
								targetCity:         destCoords.xPos + ":" + destCoords.yPos,
								palaceSupport:      request.palaceSupport,
								res:                new Array()
							};

							trade.res.push({
								t: request.resType,
								c: resCount
							});
							totalRes += resCount;
							city.rc -= resCount;
							toBeSent -= resCount;
							this.progressLabel.setValue("Sent resources: " + totalRes);
							webfrontend.net.CommandManager.getInstance().sendCommand("TradeDirect", trade, this, this._onTradeDirectSendDone, trade);
						}
					},
					_onTradeDirectSendDone:       function(isOk, result, param) {
					},
					createForm:                   function() {
						var box = new qx.ui.container.Composite(new qx.ui.layout.Dock());

						var container = new qx.ui.groupbox.GroupBox();
						container.setLayout(new qx.ui.layout.Grid(20, 10));

						box.add(container);

						var selectWidth = 320;
						var row = 0;

						container.add(new qx.ui.basic.Label("Resource Type"), {
							row:    row,
							column: 0
						});
						this.sbResType = new qx.ui.form.SelectBox().set({
							width:  selectWidth,
							height: 28
						});
						this.sbResType.add(new qx.ui.form.ListItem("Wood", null, this.WOOD));
						this.sbResType.add(new qx.ui.form.ListItem("Stone", null, this.STONE));
						this.sbResType.add(new qx.ui.form.ListItem("Iron", null, this.IRON));
						this.sbResType.add(new qx.ui.form.ListItem("Food", null, this.FOOD));
						container.add(this.sbResType, {
							row:    row,
							column: 1
						});
						row++;

						container.add(new qx.ui.basic.Label("to"), {
							row:    row,
							column: 0
						});
						var containerXY = new qx.ui.container.Composite(new qx.ui.layout.HBox(5));

						this.toX = new qx.ui.form.TextField("");
						this.toX.setWidth(40);
						containerXY.add(this.toX);
						this.toY = new qx.ui.form.TextField("");
						this.toY.setWidth(40);
						containerXY.add(this.toY);

						var btnCurrentCity = new qx.ui.form.Button("Current City");
						btnCurrentCity.setWidth(120);
						container.add(btnCurrentCity);
						btnCurrentCity.addListener("click", this.setCurrentCityAsTarget, this);
						containerXY.add(btnCurrentCity);

						container.add(containerXY, {
							row:    row,
							column: 1
						});
						row++;

						container.add(new qx.ui.basic.Label("Max Resources to Send"), {
							row:    row,
							column: 0
						});

						var resContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox(5));
						this.maxResourcesInput = new webfrontend.ui.SpinnerInt(0, 0, 100000000);
						this.maxResourcesInput.setWidth(100);
						resContainer.add(this.maxResourcesInput);

						resContainer.add(this._createIncreaseAmountBtn("500k", 500000));
						resContainer.add(this._createIncreaseAmountBtn("1M", 1000000));
						resContainer.add(this._createIncreaseAmountBtn("5M", 5000000));
						resContainer.add(this._createIncreaseAmountBtn("10M", 10000000));

						container.add(resContainer, {
							row:    row,
							column: 1
						});
						row++;

						container.add(new qx.ui.basic.Label("Max Travel Time"), {
							row:    row,
							column: 0
						});
						var timeContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox(5));
						this.maxTravelTimeInput = new webfrontend.ui.SpinnerInt(24, 1, 96);
						this.maxTravelTimeInput.setWidth(100);
						timeContainer.add(this.maxTravelTimeInput);

						timeContainer.add(this._createMaxTravelTimeBtn("24h", 24));
						timeContainer.add(this._createMaxTravelTimeBtn("48h", 48));
						timeContainer.add(this._createMaxTravelTimeBtn("96h", 96));

						container.add(timeContainer, {
							row:    row,
							column: 1
						});
						row++;

						this.cbAllowSameContinent = new qx.ui.form.CheckBox("Include cities from the same continent as target");
						this.cbAllowSameContinent.setToolTipText("Include cities from the same continent as target");
						this.cbAllowSameContinent.setValue(true);
						container.add(this.cbAllowSameContinent, {
							row:    row,
							column: 1
						});
						row++;

						this.cbAllowOtherContinent = new qx.ui.form.CheckBox("Include cities from other continents than target");
						this.cbAllowOtherContinent.setToolTipText("Include cities from other continents than target");
						this.cbAllowOtherContinent.setValue(true);
						container.add(this.cbAllowOtherContinent, {
							row:    row,
							column: 1
						});
						row++;

						this.cbPalaceSupport = new qx.ui.form.CheckBox("Palace delivery");
						this.cbPalaceSupport.setToolTipText("Sends resources as palace deliver (wood and stone only)");
						this.cbPalaceSupport.setValue(false);
						container.add(this.cbPalaceSupport, {
							row:    row,
							column: 1
						});
						row++;

						return box;
					},
					_createMaxTravelTimeBtn:      function(label, amount) {
						var btn = new qx.ui.form.Button(label).set({
							appearance: "button-recruiting",
							font:       "bold",
							width:      50
						});

						btn.addListener("click", function(event) {
							this.maxTravelTimeInput.setValue(amount);
						}, this);
						return btn;
					},
					_createIncreaseAmountBtn:     function(label, amount) {
						var btn = new qx.ui.form.Button(label).set({
							appearance: "button-recruiting",
							font:       "bold",
							width:      50
						});

						btn.addListener("click", function(event) {
							this.maxResourcesInput.setValue(this.maxResourcesInput.getValue() + amount);
						}, this);
						return btn;
					},
					searchTarget:                 function() {
						var toX = parseInt(this.toX.getValue(), 10);
						var toY = parseInt(this.toY.getValue(), 10);

						var cityId = convertCoordinatesToId(toX, toY);
						webfrontend.net.CommandManager.getInstance().sendCommand("GetPublicCityInfo", {
							id: cityId
						}, this, this._onCityInfo, cityId);
					},
					_onCityInfo:                  function(isOk, result, cityId) {
						if(isOk && result != null) {
							this.cityInfos[cityId] = result;
							this.fillResources();
						}
					},
					setCurrentCityAsTarget:       function() {
						var city = webfrontend.data.City.getInstance();
						var coords = convertIdToCoordinatesObject(city.getId());
						this.toX.setValue("" + coords.xPos);
						this.toY.setValue("" + coords.yPos);
					},
					_updateSendingProgress:       function() {
					}
				}
			});

			var distWantModifier = 0.675;

			qx.Class.define("ava.ui.RaidingWindow", {
				type:      "singleton",
				extend:    qx.ui.window.Window,
				construct: function() {
					this.base(arguments, 'Raiding');
					this.buildUI();
				},
				members:   {
					_wcText:             null,
					_lists:              null,
					_continents:         null,
					_count:              0,
					wcLabel:             null,
					curDungeon:          null,
					bossUnitLabel:       null,
					bossTable:           null,
					bossUnitImage:       null,
					bossRaider:          null,
					pvpTable:            null,
					worldData:           null,
					objData:             "none",
					playerData:          "none",
					allianceData:        "none",
					dungeonLootInfo:     {},
					ratioMode:           "count",
					raidMode:            0,
					AvaRaidMode:         1,
					raidErrorWin:        null,
					tabview:             null,
					dungeonProgressData: [
						[
							[
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1]
							],
							[
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[1243, 1243],
								[1243, 1243],
								[1243, 1243],
								[1243, 1243],
								[1243, 1243],
								[1243, 1243],
								[1243, 1243],
								[1243, 1243],
								[1243, 1243],
								[1243, 1243],
								[1243, 1243],
								[1243, 1243],
								[1243, 1243],
								[-1, -1],
								[-1, -1]
							],
							[
								[2400, 2400],
								[2448, 2443],
								[2492, 2485],
								[2538, 2528],
								[2584, 2572],
								[2637, 2614],
								[2686, 2658],
								[2736, 2702],
								[2785, 2746],
								[2833, 2789],
								[2882, 2833],
								[2930, 2876],
								[2978, 2920],
								[3027, 2964],
								[3076, 3008],
								[3124, 3051],
								[3073, 3004],
								[2999, 2938],
								[2910, 2857],
								[3213, 3130],
								[3303, 3212],
								[3389, 3289],
								[3335, 3242],
								[3249, 3166],
								[3140, 3070],
								[3486, 3378],
								[3583, 3465],
								[3675, 3547],
								[3740, 3606],
								[3797, 3656],
								[3847, 3702],
								[3899, 3748],
								[3948, 3792],
								[3997, 3836],
								[4045, 3880],
								[4094, 3924],
								[4142, 3967],
								[4191, 4011],
								[4239, 4054],
								[4288, 4098],
								[4336, 4142],
								[4313, 4137],
								[4274, 4122],
								[4224, 4099],
								[4455, 4266],
								[4533, 4329],
								[4608, 4391],
								[4666, 4441],
								[4720, 4488],
								[4670, 4459],
								[4595, 4413],
								[4504, 4355],
								[4811, 4588],
								[4902, 4662],
								[4988, 4733],
								[5050, 4787],
								[5106, 4836],
								[5157, 4881],
								[5208, 4926],
								[5257, 4970],
								[5306, 5014],
								[5355, 5058],
								[5403, 5102],
								[5452, 5146],
								[5500, 5189],
								[5548, 5233],
								[5597, 5277],
								[5645, 5320],
								[5693, 5363],
								[5742, 5407],
								[5791, 5451],
								[5839, 5494],
								[5888, 5538],
								[5936, 5582],
								[5985, 5626],
								[6033, 5669],
								[6082, 5713],
								[6130, 5756],
								[6179, 5800],
								[6227, 5844],
								[6276, 5888],
								[6324, 5931],
								[6372, 5974],
								[6421, 6018],
								[6470, 6062],
								[6518, 6105],
								[6567, 6149],
								[6615, 6193],
								[6664, 6237],
								[6712, 6280],
								[6761, 6324],
								[6809, 6367],
								[6858, 6411],
								[6906, 6455],
								[6955, 6499],
								[7003, 6542],
								[7056, 6590],
								[7111, 6640],
								[7199, 6719],
								[7199, 6719]
							],
							[
								[8450, 7651],
								[8550, 8075],
								[8568, 8073],
								[8869, 8344],
								[8742, 8395],
								[8581, 8135],
								[8333, 8012],
								[8704, 8264],
								[8924, 8444],
								[8857, 8530],
								[9423, 8953],
								[9561, 9165],
								[9819, 9252],
								[9845, 9335],
								[9721, 9375],
								[10088, 9616],
								[9852, 9535],
								[9834, 9425],
								[9178, 8989],
								[9341, 9118],
								[9290, 9090],
								[9961, 9615],
								[10695, 10349],
								[11270, 10662],
								[11570, 10905],
								[11791, 11086],
								[11697, 11059],
								[11406, 10942],
								[11035, 10781],
								[11699, 11351],
								[12250, 11663],
								[12536, 11888],
								[12564, 11957],
								[12328, 11883],
								[12004, 11759],
								[12384, 12044],
								[12974, 12419],
								[13159, 12563],
								[13275, 12667],
								[13362, 12773],
								[13193, 12685],
								[12962, 12553],
								[13741, 13210],
								[13861, 13391],
								[13944, 13552],
								[14326, 13806],
								[14408, 13946],
								[14457, 14071],
								[14567, 14054],
								[14378, 13922],
								[14130, 13749],
								[15072, 14491],
								[15185, 14643],
								[15245, 14765],
								[15042, 14728],
								[15418, 15002],
								[15410, 15066],
								[15862, 15296],
								[15787, 15245],
								[15644, 15149],
								[15936, 15622],
								[15984, 15645],
								[15696, 15515],
								[15471, 15252],
								[16083, 15732],
								[15978, 15665],
								[17038, 16510],
								[17128, 16603],
								[16752, 16320],
								[16162, 15867],
								[16373, 16054],
								[17466, 17020],
								[17821, 17481],
								[18111, 17918],
								[18725, 18509],
								[18537, 18137],
								[18573, 18137],
								[18960, 18200],
								[19259, 18576],
								[19552, 18819],
								[19460, 18825],
								[19563, 18946],
								[19668, 19067],
								[19895, 19265],
								[20141, 19535],
								[20403, 19829],
								[20261, 19873],
								[20382, 19848],
								[20250, 19769],
								[20092, 19672],
								[19898, 19563],
								[20630, 20132],
								[20863, 20339],
								[21026, 20542],
								[21023, 20670],
								[20974, 20780],
								[21154, 20888],
								[21585, 21138],
								[21970, 21422],
								[21970, 21422]
							],
							[
								[26425, 23718],
								[24475, 24074],
								[26081, 24752],
								[27174, 25026],
								[27689, 25290],
								[28020, 25494],
								[28245, 25683],
								[28496, 26159],
								[28171, 26180],
								[27026, 25731],
								[28204, 26555],
								[27736, 26427],
								[29604, 27505],
								[29600, 27543],
								[28501, 26969],
								[27627, 27057],
								[28953, 28535],
								[29508, 28818],
								[31141, 29995],
								[32095, 30627],
								[31648, 30335],
								[32880, 30678],
								[33908, 31392],
								[34848, 32595],
								[34145, 32495],
								[32879, 32261],
								[33475, 33154],
								[34460, 34062],
								[34033, 33395],
								[35182, 33937],
								[35483, 34562],
								[36239, 35037],
								[35249, 34595],
								[36758, 35624],
								[38750, 37001],
								[38586, 37217],
								[37996, 37214],
								[39942, 39049],
								[40913, 39495],
								[40756, 39641],
								[41860, 40054],
								[41905, 40127],
								[43310, 41309],
								[42836, 41351],
								[41776, 40941],
								[41899, 40728],
								[43620, 41629],
								[44363, 42467],
								[44652, 42896],
								[44322, 42889],
								[46417, 44515],
								[46017, 44603],
								[44167, 43642],
								[43214, 42940],
								[43180, 43061],
								[45818, 45761],
								[46624, 46324],
								[47792, 47171],
								[47605, 46293],
								[45317, 44319],
								[45482, 44158],
								[45552, 45148],
								[47361, 47124],
								[48671, 48302],
								[49295, 48645],
								[50885, 49887],
								[50605, 50041],
								[53388, 52465],
								[54605, 53120],
								[55249, 53878],
								[55194, 53666],
								[56697, 55034],
								[57585, 55931],
								[57308, 55362],
								[58346, 55507],
								[57030, 55385],
								[55809, 55128],
								[56799, 56158],
								[57862, 56765],
								[59721, 57957],
								[59761, 58192],
								[60228, 58555],
								[60907, 58367],
								[60898, 58079],
								[59842, 58149],
								[61610, 59614],
								[61710, 60035],
								[61961, 60846],
								[63901, 62428],
								[64853, 63625],
								[64940, 62951],
								[65350, 63221],
								[66020, 64035],
								[66783, 65075],
								[66647, 65533],
								[65295, 63669],
								[64473, 62896],
								[67432, 64880],
								[68705, 66410],
								[68705, 66410]
							],
							[
								[60325, 53311],
								[57625, 52897],
								[59896, 53827],
								[60113, 54285],
								[59386, 54478],
								[56899, 53738],
								[58966, 55425],
								[61035, 57252],
								[61641, 57482],
								[61805, 57709],
								[61600, 58122],
								[60395, 57145],
								[58150, 56433],
								[58953, 57957],
								[61248, 60204],
								[62326, 60973],
								[63237, 62087],
								[63714, 62598],
								[65162, 63029],
								[67214, 65231],
								[68937, 66182],
								[70317, 68691],
								[74460, 71410],
								[79956, 74332],
								[81224, 75100],
								[81700, 75409],
								[80526, 74643],
								[81748, 76102],
								[78960, 75074],
								[77921, 75508],
								[78064, 76453],
								[78068, 76477],
								[78911, 78378],
								[79487, 78673],
								[78121, 76844],
								[81534, 78933],
								[79768, 77704],
								[81343, 78580],
								[81523, 79875],
								[88205, 85117],
								[94305, 88608],
								[96055, 89614],
								[96772, 89873],
								[98012, 91730],
								[94423, 89840],
								[87763, 86047],
								[88674, 87783],
								[89979, 88780],
								[93633, 91647],
								[99793, 96788],
								[100009, 98308],
								[101700, 99364],
								[101311, 97604],
								[95496, 93287],
								[97960, 94751],
								[99497, 96485],
								[105470, 100733],
								[108520, 103506],
								[107499, 102581],
								[108628, 102502],
								[105969, 100637],
								[103928, 101243],
								[109553, 106598],
								[118404, 114735],
								[121895, 120367],
								[123503, 122089],
								[122767, 120569],
								[125002, 120772],
								[127561, 123220],
								[128752, 122983],
								[131508, 125865],
								[135333, 128021],
								[134730, 128674],
								[135445, 129409],
								[133276, 129589],
								[133041, 129228],
								[127452, 123963],
								[129063, 124296],
								[125655, 121714],
								[131219, 125077],
								[131455, 126535],
								[135428, 130203],
								[135500, 131522],
								[135811, 131850],
								[140492, 135007],
								[140755, 136598],
								[140522, 138154],
								[139643, 136151],
								[144381, 138636],
								[145835, 140081],
								[145014, 140461],
								[143759, 139706],
								[141819, 138737],
								[148234, 143747],
								[149920, 146062],
								[152180, 145788],
								[153629, 146738],
								[154959, 147672],
								[156845, 149270],
								[156845, 149270]
							],
							[
								[119725, 106135],
								[120400, 107908],
								[118692, 108203],
								[117708, 108522],
								[120897, 110849],
								[123364, 111833],
								[126952, 115481],
								[124362, 115237],
								[120809, 115010],
								[117723, 113784],
								[119276, 115977],
								[116497, 115000],
								[120876, 119523],
								[125664, 124218],
								[128836, 126845],
								[131641, 127535],
								[139649, 133028],
								[135692, 132370],
								[134035, 132160],
								[136333, 134744],
								[146006, 142716],
								[148683, 144477],
								[149760, 143386],
								[145840, 141674],
								[150070, 144953],
								[157435, 150394],
								[155051, 151567],
								[157195, 155538],
								[158476, 156268],
								[164305, 161026],
								[166920, 160512],
								[166470, 161624],
								[164737, 158362],
								[156089, 154134],
								[161367, 159668],
								[169428, 166477],
								[173573, 167250],
								[183049, 174271],
								[184183, 176225],
								[186785, 180501],
								[191202, 184320],
								[196806, 185373],
								[197399, 186421],
								[195841, 186052],
								[191657, 184553],
								[194389, 184093],
								[193871, 183717],
								[192208, 180363],
								[188311, 179196],
								[182718, 176525],
								[184195, 178925],
								[194236, 186284],
								[200102, 192011],
								[207703, 196269],
								[200720, 190301],
								[198782, 190500],
								[198898, 193863],
								[219143, 210685],
								[237390, 222537],
								[239788, 223743],
								[237941, 224797],
								[235994, 225107],
								[235203, 226683],
								[242247, 228928],
								[245085, 231573],
								[247363, 235026],
								[241417, 236014],
								[247551, 242375],
								[252199, 246483],
								[259882, 252857],
								[256820, 249972],
								[253406, 251104],
								[240149, 238622],
								[245492, 244388],
								[255081, 253904],
								[260865, 258926],
								[270290, 266619],
								[269315, 263619],
								[271029, 266967],
								[266497, 259837],
								[271776, 260251],
								[268983, 260906],
								[268061, 258517],
								[267422, 260565],
								[272058, 261134],
								[287217, 271292],
								[297591, 278011],
								[300762, 282777],
								[304505, 286510],
								[309152, 289465],
								[305890, 286262],
								[305822, 286998],
								[305942, 290944],
								[304503, 292470],
								[296983, 292643],
								[292206, 289126],
								[298783, 294490],
								[308447, 300110],
								[311285, 297177],
								[311285, 297177]
							],
							[
								[214600, 188677],
								[210350, 187532],
								[213989, 193938],
								[213678, 197545],
								[208667, 196387],
								[208774, 200690],
								[210035, 200085],
								[222282, 205427],
								[225307, 207035],
								[219390, 205087],
								[219114, 208357],
								[230733, 218774],
								[235094, 221640],
								[234872, 222614],
								[240009, 227025],
								[243968, 234245],
								[248972, 238593],
								[252105, 237630],
								[250975, 241057],
								[249392, 242858],
								[261766, 251597],
								[263697, 248206],
								[261168, 247105],
								[262526, 251248],
								[279536, 263502],
								[279064, 267268],
								[286516, 273050],
								[289616, 279172],
								[291980, 282013],
								[292235, 277335],
								[301909, 286236],
								[306524, 290818],
								[318699, 297947],
								[323709, 300829],
								[324025, 302468],
								[318792, 303167],
								[328013, 309482],
								[328128, 312539],
								[327428, 306690],
								[321942, 302962],
								[326563, 306768],
								[327482, 311218],
								[335657, 317790],
								[321350, 311363],
								[310249, 303670],
								[317315, 309778],
								[339426, 329464],
								[346855, 341763],
								[356011, 345844],
								[371122, 351070],
								[397642, 369708],
								[401348, 379462],
								[390145, 373207],
								[395353, 378739],
								[400054, 386160],
								[415417, 397031],
								[410333, 394683],
								[409960, 392268],
								[432765, 403468],
								[443905, 414245],
								[443907, 414696],
								[445569, 417628],
								[440139, 413290],
								[444953, 423487],
								[441043, 428832],
								[446479, 441380],
								[442953, 438109],
								[454278, 445409],
								[461067, 443285],
								[458076, 434010],
								[468776, 438302],
								[476285, 442196],
								[466020, 437097],
								[470461, 441010],
								[488601, 459229],
								[503580, 478719],
								[500125, 490263],
								[484976, 477876],
								[502477, 496584],
								[512534, 510436],
								[514702, 510356],
								[504183, 496535],
								[506140, 488789],
								[512735, 497040],
								[531464, 509119],
								[532259, 519954],
								[543662, 527701],
								[536457, 517434],
								[518192, 508932],
								[509838, 497151],
								[528825, 506445],
								[541619, 519720],
								[558726, 532109],
								[563297, 544992],
								[567209, 542141],
								[554545, 539156],
								[543496, 521533],
								[541984, 520795],
								[557960, 528295],
								[557960, 528295]
							],
							[
								[351275, 310377],
								[353850, 312821],
								[355088, 317854],
								[356676, 320891],
								[360136, 323300],
								[368405, 328848],
								[370835, 331360],
								[372010, 332020],
								[371437, 333860],
								[373974, 336908],
								[381069, 344963],
								[387967, 352314],
								[391665, 354810],
								[397105, 358944],
								[406921, 366454],
								[413098, 373575],
								[417360, 380402],
								[424532, 387390],
								[434959, 396558],
								[440951, 403991],
								[450837, 410235],
								[449602, 412004],
								[452875, 419292],
								[462177, 428585],
								[471659, 435342],
								[486755, 444364],
								[492018, 449555],
								[494584, 450120],
								[494268, 454576],
								[495171, 460950],
								[511896, 471241],
								[516800, 474072],
								[521359, 478717],
								[526164, 484187],
								[519501, 481391],
								[520231, 483644],
								[518179, 483987],
								[530459, 496708],
								[546729, 511765],
								[554205, 524826],
								[562118, 529576],
								[563357, 522583],
								[571363, 528361],
								[590014, 540300],
								[624051, 568512],
								[632124, 588953],
								[646459, 597011],
								[663948, 611415],
								[664308, 614261],
								[663110, 610832],
								[677746, 619594],
								[677783, 619257],
								[690587, 632090],
								[694112, 642214],
								[709386, 658254],
								[717058, 660285],
								[724952, 666644],
								[734108, 667010],
								[732081, 670985],
								[723460, 668484],
								[716065, 667785],
								[722308, 672433],
								[729443, 674154],
								[753039, 688017],
								[756728, 696539],
								[752781, 699307],
								[745449, 698046],
								[762199, 713551],
								[782422, 730105],
								[782952, 743706],
								[774170, 755296],
								[787387, 762704],
								[823343, 793007],
								[822009, 770486],
								[815586, 772000],
								[835279, 788218],
								[834038, 792621],
								[832800, 795280],
								[846530, 797824],
								[845206, 800196],
								[846243, 811858],
								[872765, 836361],
								[890370, 833943],
								[888712, 836606],
								[874064, 827794],
								[872199, 837342],
								[894056, 871463],
								[909069, 883898],
								[903262, 865000],
								[904306, 853327],
								[884190, 837446],
								[880659, 836541],
								[872744, 833578],
								[878847, 847103],
								[909584, 872769],
								[910073, 888862],
								[903893, 873202],
								[911034, 870815],
								[913314, 869055],
								[913314, 869055]
							],
							[
								[533250, 477043],
								[514100, 486999],
								[539791, 489432],
								[536191, 492700],
								[525671, 493011],
								[528443, 501279],
								[546175, 514271],
								[559729, 527934],
								[550622, 534312],
								[565133, 545332],
								[579856, 556449],
								[610050, 568271],
								[622076, 577182],
								[640042, 588456],
								[645989, 598753],
								[641769, 607081],
								[633953, 614861],
								[635174, 612180],
								[651623, 620732],
								[637434, 620131],
								[656285, 642897],
								[662812, 643813],
								[698678, 667919],
								[707025, 686521],
								[715402, 698554],
								[723926, 717386],
								[727783, 717350],
								[738136, 721392],
								[739619, 710459],
								[734107, 707591],
								[777006, 731533],
								[784927, 735743],
								[790454, 738545],
								[791563, 738843],
								[818404, 764728],
								[830237, 776296],
								[835137, 787078],
								[836829, 796096],
								[837037, 804635],
								[862390, 814655],
								[875555, 831362],
								[898429, 865325],
								[922106, 903864],
								[936950, 917269],
								[916715, 886427],
								[916572, 889773],
								[931402, 892281],
								[942671, 907187],
								[954812, 924754],
								[951939, 911609],
								[952557, 916516],
								[952285, 922023],
								[975551, 929292],
								[986434, 937301],
								[1009440, 963827],
								[1033765, 994553],
								[1059728, 1028267],
								[1037178, 990485],
								[1040796, 991617],
								[1044839, 993452],
								[1051885, 999768],
								[1059646, 1007158],
								[1072335, 1021525],
								[1086197, 1037561],
								[1100868, 1054743],
								[1098108, 1047405],
								[1105824, 1060246],
								[1113929, 1074846],
								[1132315, 1106923],
								[1149217, 1115960],
								[1169790, 1142158],
								[1154899, 1110236],
								[1159621, 1111835],
								[1164762, 1114426],
								[1172175, 1120962],
								[1199140, 1153257],
								[1230703, 1191716],
								[1265459, 1234406],
								[1223272, 1183102],
								[1221347, 1185701],
								[1219819, 1189833],
								[1231486, 1186403],
								[1239654, 1191881],
								[1248511, 1198500],
								[1257133, 1206363],
								[1265778, 1214627],
								[1274402, 1223119],
								[1285120, 1232290],
								[1296300, 1241637],
								[1307815, 1251098],
								[1311077, 1258273],
								[1318828, 1266702],
								[1326657, 1275153],
								[1335005, 1283751],
								[1343475, 1292383],
								[1352030, 1301039],
								[1361575, 1310667],
								[1371351, 1320515],
								[1386450, 1335720],
								[1386450, 1335720]
							]
						],
						[
							[
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1],
								[-1, -1]
							],
							[
								[690, 690],
								[703, 702],
								[715, 712],
								[729, 725],
								[742, 737],
								[755, 749],
								[769, 761],
								[783, 774],
								[797, 787],
								[811, 799],
								[825, 812],
								[839, 824],
								[853, 837],
								[867, 849],
								[881, 862],
								[895, 875],
								[908, 887],
								[922, 899],
								[936, 912],
								[950, 924],
								[964, 937],
								[978, 950],
								[992, 962],
								[1006, 975],
								[1020, 987],
								[1034, 1000],
								[1048, 1012],
								[1062, 1025],
								[1076, 1038],
								[1090, 1050],
								[1104, 1063],
								[1118, 1075],
								[1132, 1088],
								[1145, 1100],
								[1159, 1113],
								[1173, 1125],
								[1187, 1137],
								[1201, 1150],
								[1215, 1163],
								[1229, 1175],
								[1243, 1188],
								[1257, 1200],
								[1271, 1213],
								[1285, 1226],
								[1299, 1238],
								[1313, 1251],
								[1327, 1263],
								[1341, 1276],
								[1355, 1289],
								[1368, 1301],
								[1358, 1297],
								[1341, 1288],
								[1322, 1278],
								[1400, 1334],
								[1396, 1334],
								[1386, 1330],
								[1363, 1317],
								[1450, 1380],
								[1476, 1401],
								[1501, 1421],
								[1519, 1436],
								[1536, 1451],
								[1550, 1464],
								[1564, 1476],
								[1578, 1489],
								[1592, 1502],
								[1605, 1514],
								[1619, 1527],
								[1633, 1539],
								[1647, 1552],
								[1661, 1564],
								[1675, 1577],
								[1689, 1589],
								[1703, 1602],
								[1717, 1615],
								[1731, 1627],
								[1745, 1640],
								[1759, 1652],
								[1773, 1665],
								[1787, 1677],
								[1801, 1690],
								[1815, 1703],
								[1828, 1715],
								[1842, 1727],
								[1798, 1695],
								[1741, 1652],
								[1674, 1602],
								[1770, 1677],
								[1728, 1644],
								[1671, 1600],
								[1863, 1754],
								[1909, 1791],
								[1950, 1825],
								[1974, 1846],
								[1976, 1860],
								[1972, 1873],
								[1966, 1885],
								[2025, 1904],
								[2070, 1931],
								[2070, 1931]
							],
							[
								[2970, 2835],
								[3060, 3060],
								[2988, 2917],
								[2971, 2915],
								[3051, 2964],
								[3031, 2953],
								[2922, 2870],
								[3058, 2989],
								[2945, 2900],
								[3109, 3046],
								[3078, 3027],
								[3381, 3300],
								[3476, 3393],
								[3563, 3477],
								[3626, 3541],
								[3681, 3599],
								[3732, 3654],
								[3782, 3707],
								[3831, 3759],
								[3802, 3741],
								[3757, 3707],
								[3699, 3662],
								[3942, 3892],
								[4022, 3973],
								[4099, 4051],
								[4157, 4112],
								[4210, 4167],
								[4261, 4221],
								[4310, 4274],
								[4359, 4326],
								[4407, 4378],
								[4348, 4324],
								[4266, 4248],
								[4165, 4154],
								[4487, 4474],
								[4578, 4569],
								[4666, 4659],
								[4729, 4725],
								[4787, 4783],
								[4844, 4839],
								[4900, 4892],
								[4955, 4944],
								[5010, 4996],
								[5065, 5048],
								[5096, 5078],
								[5072, 5058],
								[5033, 5024],
								[5083, 5068],
								[5274, 5244],
								[5359, 5323],
								[5435, 5394],
								[5422, 5382],
								[5341, 5311],
								[5235, 5217],
								[5428, 5400],
								[5630, 5580],
								[5734, 5675],
								[5816, 5750],
								[5881, 5811],
								[5942, 5868],
								[5999, 5922],
								[6056, 5975],
								[6112, 6027],
								[6167, 6078],
								[6222, 6130],
								[6277, 6182],
								[6333, 6233],
								[6388, 6285],
								[6443, 6336],
								[6498, 6388],
								[6553, 6439],
								[6608, 6491],
								[6663, 6542],
								[6588, 6453],
								[6484, 6331],
								[6188, 6033],
								[6370, 6257],
								[6244, 6153],
								[6782, 6653],
								[6925, 6787],
								[7053, 6907],
								[7134, 6983],
								[7131, 6993],
								[7104, 6984],
								[7062, 6964],
								[7302, 7155],
								[7313, 7174],
								[7305, 7180],
								[7267, 7163],
								[7518, 7359],
								[7607, 7434],
								[7690, 7507],
								[7755, 7566],
								[7815, 7621],
								[7873, 7675],
								[7930, 7727],
								[7990, 7784],
								[8054, 7843],
								[8154, 7937],
								[8154, 7937]
							],
							[
								[9990, 9378],
								[9840, 9840],
								[9864, 9600],
								[10078, 9697],
								[9976, 9608],
								[9660, 9370],
								[10299, 9865],
								[10347, 9915],
								[11035, 10534],
								[11300, 10791],
								[11543, 11030],
								[11734, 11226],
								[11911, 11410],
								[12079, 11586],
								[12244, 11759],
								[12406, 11930],
								[12569, 12102],
								[12731, 12273],
								[12893, 12444],
								[13053, 12614],
								[13215, 12785],
								[13106, 12729],
								[12936, 12622],
								[12722, 12479],
								[13442, 13124],
								[13551, 13259],
								[13627, 13369],
								[14169, 13838],
								[14406, 14068],
								[14627, 14286],
								[14542, 14241],
								[14310, 14095],
								[14012, 13897],
								[14435, 14318],
								[14168, 14028],
								[13595, 13520],
								[14149, 14025],
								[15367, 15150],
								[15807, 15570],
								[16064, 15845],
								[16193, 16009],
								[16273, 16132],
								[16450, 16272],
								[16236, 16107],
								[15947, 15877],
								[16456, 16361],
								[17032, 16896],
								[16965, 16862],
								[16761, 16705],
								[16767, 16690],
								[17700, 17574],
								[18015, 17882],
								[18297, 18163],
								[18502, 18373],
								[18687, 18565],
								[18857, 18744],
								[19023, 18919],
								[19187, 19091],
								[19349, 19262],
								[19512, 19434],
								[19674, 19605],
								[19835, 19775],
								[19997, 19946],
								[20158, 20117],
								[20320, 20288],
								[20287, 20265],
								[20212, 20198],
								[19643, 19637],
								[19743, 19736],
								[19356, 19346],
								[20796, 20774],
								[20950, 20924],
								[21020, 20991],
								[20928, 20898],
								[21766, 21713],
								[22062, 21998],
								[22161, 22096],
								[22156, 22095],
								[21892, 21849],
								[22276, 22211],
								[22237, 22176],
								[23035, 22929],
								[23328, 23206],
								[23601, 23465],
								[23888, 23760],
								[24227, 24131],
								[24574, 24374],
								[24244, 23860],
								[23788, 23164],
								[23401, 23150],
								[24195, 23956],
								[23921, 23769],
								[23611, 23550],
								[24545, 24487],
								[25464, 25360],
								[25419, 25250],
								[25390, 25224],
								[25259, 25108],
								[26542, 26258],
								[26542, 26258]
							],
							[
								[31410, 28396],
								[32790, 29411],
								[31479, 29157],
								[30828, 29045],
								[32639, 30205],
								[32826, 30438],
								[32424, 30434],
								[31712, 30274],
								[33379, 31452],
								[34298, 32125],
								[34022, 32113],
								[34466, 32427],
								[33808, 32622],
								[33767, 32753],
								[33132, 31828],
								[34956, 32975],
								[34952, 33408],
								[33097, 32271],
								[34084, 33205],
								[35102, 34028],
								[34618, 34281],
								[35075, 34850],
								[37385, 36924],
								[38544, 37702],
								[40497, 39323],
								[40073, 39719],
								[39941, 39732],
								[40784, 40698],
								[40168, 39966],
								[42031, 41656],
								[41844, 40781],
								[43110, 41879],
								[43852, 42031],
								[43318, 42475],
								[45235, 44106],
								[46359, 44538],
								[45835, 44296],
								[47395, 45816],
								[46485, 45522],
								[46840, 45707],
								[46582, 45724],
								[46088, 45771],
								[46791, 46332],
								[48698, 47657],
								[50963, 49166],
								[50469, 48873],
								[50842, 50036],
								[49292, 48556],
								[50109, 49855],
								[50205, 50067],
								[51380, 51321],
								[52582, 52263],
								[53680, 52738],
								[54120, 52437],
								[55695, 53946],
								[54966, 53548],
								[55847, 53547],
								[56011, 54237],
								[56189, 53579],
								[56632, 55055],
								[57935, 56276],
								[56673, 55849],
								[56050, 55646],
								[57917, 57390],
								[56646, 55829],
								[58919, 57861],
								[57540, 56945],
								[60484, 59427],
								[64009, 62095],
								[65459, 63309],
								[66512, 64219],
								[66837, 64758],
								[67177, 65364],
								[67442, 65945],
								[69045, 67085],
								[68834, 67182],
								[69029, 67662],
								[70209, 68161],
								[70832, 68669],
								[70289, 68288],
								[69422, 67707],
								[68634, 66832],
								[71353, 68620],
								[71258, 68390],
								[69383, 68280],
								[71958, 70818],
								[71524, 70158],
								[71541, 70357],
								[70023, 69360],
								[72996, 72220],
								[76730, 75143],
								[79122, 77246],
								[80453, 77582],
								[78052, 76469],
								[76033, 75200],
								[73655, 72399],
								[76354, 74114],
								[79211, 76141],
								[81666, 79508],
								[81666, 79508]
							],
							[
								[72150, 62745],
								[71580, 65594],
								[70122, 64150],
								[72488, 65902],
								[72167, 66872],
								[70873, 66606],
								[70106, 67454],
								[69416, 67732],
								[71800, 69316],
								[73346, 69597],
								[76113, 72200],
								[76934, 73490],
								[77509, 72721],
								[73898, 71076],
								[76393, 72836],
								[77642, 73777],
								[77912, 74597],
								[83166, 78625],
								[82859, 79247],
								[85301, 81830],
								[86659, 80960],
								[90887, 84468],
								[90823, 85467],
								[91590, 87462],
								[93798, 87831],
								[92049, 88028],
								[95764, 90854],
								[94373, 91709],
								[96679, 93288],
								[101653, 96358],
								[100838, 97552],
								[100406, 95351],
								[101545, 96640],
								[106456, 98636],
								[105942, 98736],
								[102908, 97908],
								[103275, 99703],
								[103416, 100912],
								[107339, 104077],
								[110891, 106425],
								[107986, 106630],
								[105802, 103839],
								[108601, 105683],
								[112300, 107937],
								[110532, 108064],
								[114671, 110225],
								[118901, 111920],
								[118299, 111505],
								[119796, 113283],
								[123921, 115090],
								[123867, 117468],
								[122182, 118270],
								[123869, 119430],
								[124628, 119337],
								[121497, 118048],
								[122644, 118018],
								[127180, 120955],
								[124289, 119359],
								[130969, 122961],
								[128399, 121491],
								[132604, 124865],
								[132888, 127860],
								[138820, 132968],
								[139812, 136682],
								[144251, 139759],
								[147168, 139315],
								[149721, 141320],
								[152735, 146297],
								[155812, 152206],
								[155320, 151321],
								[156127, 149867],
								[157662, 152083],
								[157518, 148024],
								[158980, 148610],
								[161105, 149546],
								[159759, 148800],
								[158245, 148925],
								[155110, 151035],
								[159515, 155125],
								[163217, 159250],
								[160026, 154362],
								[157858, 155185],
								[161650, 158509],
								[166125, 162931],
								[166437, 161438],
								[170273, 164241],
								[171249, 167922],
								[171083, 167527],
								[167712, 165255],
								[168288, 163865],
								[172980, 164756],
								[174049, 165158],
								[178031, 167312],
								[179813, 168597],
								[181430, 169882],
								[182763, 171071],
								[184147, 172365],
								[185509, 173672],
								[187590, 175685],
								[187590, 175685]
							],
							[
								[145710, 127730],
								[140070, 126769],
								[144371, 130483],
								[144207, 130695],
								[146255, 132804],
								[146665, 134693],
								[146795, 137116],
								[143822, 136576],
								[148042, 138368],
								[148800, 141032],
								[150498, 141711],
								[149642, 141583],
								[150211, 144438],
								[156875, 149117],
								[157527, 152442],
								[156813, 152040],
								[159172, 156134],
								[165871, 161840],
								[170659, 163448],
								[169844, 164317],
								[167378, 160132],
								[164127, 161902],
								[170705, 168108],
								[178973, 173999],
								[180128, 169853],
								[187498, 174142],
								[193295, 179362],
								[196368, 183399],
								[195268, 184526],
								[207634, 193285],
								[210539, 197725],
								[209742, 200356],
								[210523, 199238],
								[201932, 196230],
								[200750, 198229],
								[195568, 194057],
								[207282, 203569],
								[218282, 209060],
								[228606, 212521],
								[230939, 214089],
								[227960, 213556],
								[230049, 216383],
								[225688, 216744],
								[236271, 226305],
								[233449, 230240],
								[231414, 229433],
								[230423, 227134],
								[235372, 227421],
								[246151, 233154],
								[245367, 232888],
								[241152, 230529],
								[256080, 239515],
								[258987, 241433],
								[267397, 248504],
								[271160, 251838],
								[271990, 252690],
								[271654, 252576],
								[271994, 255361],
								[283687, 268426],
								[287394, 276595],
								[288272, 273521],
								[285192, 275009],
								[297038, 282194],
								[291670, 279609],
								[296385, 280902],
								[296706, 283534],
								[299131, 291097],
								[303994, 292761],
								[315149, 305951],
								[309924, 297918],
								[299318, 293641],
								[294709, 286389],
								[310548, 296340],
								[315072, 301206],
								[318195, 306689],
								[320608, 314137],
								[324046, 314351],
								[326545, 309898],
								[328210, 311049],
								[329587, 312929],
								[332009, 319492],
								[336885, 323083],
								[337278, 328224],
								[334005, 322438],
								[331121, 322983],
								[340180, 329089],
								[346011, 335715],
								[346311, 342791],
								[343086, 340190],
								[335322, 330022],
								[344729, 333338],
								[354913, 337817],
								[359791, 340729],
								[364843, 344581],
								[369343, 348469],
								[372247, 353324],
								[369932, 354017],
								[370078, 357371],
								[378846, 357643],
								[378846, 357643]
							],
							[
								[258540, 227156],
								[249240, 230153],
								[261488, 236793],
								[260876, 238118],
								[260779, 238515],
								[264906, 243864],
								[268628, 246620],
								[273111, 250992],
								[275097, 252534],
								[273836, 253411],
								[269533, 255038],
								[275436, 260915],
								[279053, 261725],
								[279384, 264317],
								[274154, 265831],
								[283966, 270899],
								[301940, 281602],
								[316956, 295582],
								[316548, 300568],
								[311680, 294320],
								[306369, 291714],
								[315489, 295940],
								[323445, 302232],
								[331389, 309774],
								[340846, 320402],
								[341632, 324343],
								[347007, 336355],
								[349151, 340812],
								[347876, 341738],
								[354072, 344913],
								[364209, 349982],
								[366434, 345181],
								[375584, 351389],
								[377136, 351528],
								[369629, 351840],
								[385742, 365158],
								[386872, 370706],
								[389352, 375787],
								[391922, 375606],
								[403010, 386323],
								[417986, 390789],
								[419262, 392446],
								[416741, 393905],
								[417678, 393727],
								[429614, 404720],
								[428090, 405554],
								[423179, 405864],
								[436625, 410361],
								[439079, 412515],
								[440200, 413374],
								[451790, 430293],
								[471884, 449564],
								[487167, 470323],
								[484845, 465768],
								[516205, 483151],
								[522808, 488230],
								[533592, 496995],
								[531086, 504807],
								[529870, 503512],
								[536445, 510052],
								[544713, 508752],
								[539450, 507386],
								[531600, 501479],
								[534760, 506015],
								[543376, 512706],
								[543131, 519624],
								[532167, 519846],
								[532948, 520257],
								[522783, 511311],
								[545611, 525305],
								[548746, 524354],
								[549672, 525353],
								[539701, 520255],
								[553100, 530676],
								[551982, 541695],
								[556419, 539853],
								[574787, 550703],
								[582987, 554501],
								[575104, 554528],
								[589189, 562223],
								[593549, 570852],
								[586992, 568597],
								[586402, 562258],
								[579435, 557618],
								[575985, 560483],
								[597593, 577412],
								[612490, 588463],
								[625331, 597910],
								[636646, 595656],
								[625469, 592591],
								[619053, 592009],
								[603071, 587103],
								[617444, 602726],
								[609112, 597369],
								[627426, 611200],
								[621712, 600676],
								[646196, 608305],
								[666435, 624376],
								[672204, 636036],
								[672204, 636036]
							],
							[
								[428430, 370853],
								[419670, 373273],
								[426662, 381635],
								[431352, 384942],
								[431378, 385825],
								[432531, 389181],
								[433143, 393249],
								[439538, 398137],
								[448237, 402754],
								[457258, 407415],
								[459156, 410786],
								[460132, 416257],
								[471887, 428306],
								[487026, 437487],
								[497560, 446644],
								[506570, 454565],
								[509542, 462047],
								[511843, 467453],
								[515373, 470645],
								[517025, 474310],
								[531752, 485823],
								[551939, 498533],
								[564951, 511734],
								[564948, 520289],
								[567245, 520761],
								[570058, 522621],
								[581542, 531409],
								[598736, 542385],
								[600545, 548790],
								[605240, 556574],
								[607854, 557672],
								[618284, 566943],
								[628603, 570867],
								[628852, 575625],
								[624468, 580764],
								[617939, 578101],
								[617410, 578831],
								[623700, 585206],
								[654577, 602115],
								[665006, 611523],
								[673682, 615225],
								[672685, 621843],
								[685634, 634440],
								[718296, 664528],
								[759770, 689841],
								[775566, 711870],
								[782975, 718029],
								[793308, 725070],
								[796268, 738206],
								[807724, 754367],
								[833366, 776146],
								[851929, 775989],
								[860615, 778039],
								[857288, 774788],
								[846961, 776490],
								[838022, 775328],
								[852692, 787752],
								[868791, 800842],
								[861979, 803808],
								[862188, 800473],
								[843629, 801044],
								[854989, 810280],
								[846878, 807305],
								[865805, 817357],
								[887740, 827375],
								[914472, 835929],
								[923173, 842036],
								[926047, 853638],
								[914561, 859298],
								[920235, 857584],
								[903520, 850133],
								[923978, 860354],
								[931475, 867511],
								[925158, 867772],
								[932749, 883989],
								[950076, 908216],
								[943870, 907505],
								[931448, 894375],
								[964690, 905548],
								[977741, 922290],
								[994629, 949955],
								[1003301, 968944],
								[993584, 947871],
								[985230, 933555],
								[988968, 940311],
								[977098, 944041],
								[1005972, 960242],
								[1017161, 965089],
								[1019684, 975408],
								[1009552, 969064],
								[1011257, 977525],
								[1015073, 983210],
								[1047988, 996586],
								[1052590, 1005194],
								[1041338, 990914],
								[1052111, 1005714],
								[1096654, 1022537],
								[1102263, 1025920],
								[1113918, 1038388],
								[1113918, 1038388]
							],
							[
								[656160, 582434],
								[579390, 535504],
								[615839, 576340],
								[631357, 588023],
								[657902, 609625],
								[651402, 613625],
								[657924, 619713],
								[653784, 607233],
								[662378, 616073],
								[708418, 649532],
								[711964, 653876],
								[729296, 670121],
								[702157, 659912],
								[691110, 666931],
								[719991, 693491],
								[781600, 740155],
								[796464, 765542],
								[802766, 761966],
								[796893, 769165],
								[813642, 786468],
								[828058, 794264],
								[815045, 804123],
								[809163, 793965],
								[864091, 833627],
								[893752, 835898],
								[913516, 847869],
								[917386, 854920],
								[916624, 861956],
								[902521, 866137],
								[928490, 881368],
								[922390, 888120],
								[943581, 899461],
								[935636, 903967],
								[951560, 914874],
								[997940, 936774],
								[1017085, 949911],
								[1033562, 962324],
								[1046421, 973602],
								[1059191, 984732],
								[1071537, 995702],
								[1085381, 1016484],
								[1092072, 1043556],
								[1110070, 1091633],
								[1135305, 1115720],
								[1181790, 1146925],
								[1197503, 1140750],
								[1190137, 1140576],
								[1209994, 1167859],
								[1194087, 1126266],
								[1211389, 1143635],
								[1221512, 1164146],
								[1181985, 1161709],
								[1164626, 1145465],
								[1189317, 1157961],
								[1217612, 1158822],
								[1233713, 1167461],
								[1247505, 1176536],
								[1242971, 1178405],
								[1236148, 1187848],
								[1226778, 1198172],
								[1282417, 1242204],
								[1294695, 1232817],
								[1310675, 1242683],
								[1307169, 1243701],
								[1299744, 1244891],
								[1289284, 1245137],
								[1345154, 1279194],
								[1368953, 1299083],
								[1392995, 1319581],
								[1391623, 1317703],
								[1401059, 1326622],
								[1410073, 1335455],
								[1420194, 1345470],
								[1410758, 1344295],
								[1397098, 1340765],
								[1380327, 1335469],
								[1441424, 1375284],
								[1467426, 1391542],
								[1494282, 1407577],
								[1517429, 1420947],
								[1510967, 1429941],
								[1500381, 1430022],
								[1466536, 1416915],
								[1427064, 1399887],
								[1452494, 1424276],
								[1511552, 1468928],
								[1525621, 1487703],
								[1557653, 1502204],
								[1555453, 1512999],
								[1557712, 1533775],
								[1555642, 1520577],
								[1604274, 1543761],
								[1621920, 1554506],
								[1638316, 1566530],
								[1650989, 1577455],
								[1662698, 1588280],
								[1674955, 1600135],
								[1687228, 1612209],
								[1706015, 1630814],
								[1706015, 1630814]
							]
						]
					],
					buildUI:             function() {
						console.log("build ui raiding 0");
						var worldDataRoot = webfrontend.net.UpdateManager.getInstance().requester["WORLD"].obj;
						for(var key in worldDataRoot) {
							if(worldDataRoot[key] instanceof Object) {
								if(worldDataRoot[key].hasOwnProperty("d") && worldDataRoot[key].hasOwnProperty("c")) {
									this.worldData = worldDataRoot[key];
									break;
								}
							}
						}
						var CI = webfrontend.data.City.getInstance();
						var app = qx.core.Init.getApplication();
						this.setLayout(new qx.ui.layout.VBox(2));
						var w = qx.bom.Viewport.getWidth(window);
						var h = qx.bom.Viewport.getHeight(window);
						var wh = Math.floor(h * 0.45);
						this.set({
							allowMaximize:  false,
							allowMinimize:  false,
							showMaximize:   false,
							showMinimize:   false,
							showStatusbar:  false,
							showClose:      false,
							contentPadding: 5,
							useMoveFrame:   true,
							useResizeFrame: false,
							resizable:      true,
							width:          500,
							height:         500
						});
						console.log("build ui raiding 1");

						this.setMaxHeight(500);
						webfrontend.gui.Util.formatWinClose(this);
						console.log("build ui raiding 2");
						this.setCaption(CI.getName() + "  " + webfrontend.gui.Util.formatCityCoordsFromId(CI.getId(), true));
						this.tabview = new qx.ui.tabview.TabView();
						this.tabview.add(this.createDungeonPage());
						this.tabview.add(this.createBossPage());
						this.tabview.add(this.createIdleUnitsPage());
						console.log("build ui raiding 3");
						this.tabview.add(this.createPvpPage());
						this.tabview.setHeight(500 - 39);
						this.add(this.tabview);
						console.log("build ui raiding 4");
						this.stat = new qx.ui.basic.Image();
						this.stat.setVisibility("hidden");
						this.add(this.stat);
						var app = qx.core.Init.getApplication();
						var dv = (app.dungeonDetailView || app.getDungeonDetailView());
						if(!dv.hasOwnProperty("originalSetDungeon")) {
							dv.originalSetDungeon = dv.setDungeon;
							dv.AvaRaid = this;
							dv.setDungeon = this.interceptSetDungeon;
						}
						var cv = (app.cityDetailView || app.getCityDetailView());
						if(!cv.hasOwnProperty("originalSetCity")) {
							cv.originalSetCity = cv.setCity;
							cv.AvaRaid = this;
							cv.setCity = this.interceptSetCity;
						}
						console.log("starting part 2");
						var _this = this;

						window.setTimeout(function() {
							console.log("in part 2");
							_this.updateAvailableUnits();
							_this.updateBossRaidCity();
							webfrontend.data.City.getInstance().addListener("changeVersion", _this.updateAvailableUnits, _this);


							webfrontend.data.City.getInstance().addListener("changeCity", _this.onCityChange, _this);
							_this.addListener("appear", _this.onOpen, _this);
							_this.addListener("disappear", _this.onClose, _this);
						}, 1.0); // wait for 1 second so that it doesn't recurse
						//this.addListener("resize", this.onResize, this);

					},
					onResize:            function(e) {
						var h = e.getData().height;
						//this.tabview.setHeight(h-40);
					},
					onOpen:              function() {
						ava.ui.IdleRaidUnitsTable.getInstance().refresh();
					},
					onClose:             function() {
						var rw = ava.ui.IdleRaidUnitsTable.getInstance();
						removeConsumer("COMO", rw.DispatchResultsRw, rw);

					},
					interceptSetDungeon: function(bn, bo) {
						var app = qx.core.Init.getApplication();
						var dv = (app.dungeonDetailView || app.getDungeonDetailView());
						dv.originalSetDungeon(bn, bo);
						dv.AvaRaid.curDungeon = bn;
						dv.AvaRaid.addDungeonToRaid(bn);
					},
					interceptSetCity:    function(bT) {
						var app = qx.core.Init.getApplication();
						var cv = (app.cityDetailView || app.getCityDetailView());
						if(cv.hasOwnProperty("originalSetCity")) {
							cv.originalSetCity(bT);
						}
						cv.AvaRaid.curCity = bT;
						cv.AvaRaid.addCityToRaid(bT);
					},
					getSpeed:            function(unitType) {
						var retVal = 0;
						var CI = webfrontend.data.City.getInstance();
						var resMain = webfrontend.res.Main.getInstance();
						var tech = webfrontend.data.Tech.getInstance();
						for(var unitType in CI.units) {
							var u = CI.units[unitType];
							if(u.count > 0 && resMain.units[unitType].c > 0 && resMain.units[unitType].ls) {
								retVal = Math.max(0, resMain.units[unitType].s / (1 + tech.getBonus("unitSpeed", webfrontend.data.Tech.research, parseInt(unitType)) / 100 + tech.getBonus("unitSpeed", webfrontend.data.Tech.shrine, parseInt(unitType)) / 100));
								break;
							}
						}
						return retVal;
					},
					addCityToRaid:       function(c) {
						var CI = webfrontend.data.City.getInstance();
						var ocid = CI.getId();
						var cid = c.get_Coordinates();
						var playerName = webfrontend.data.Player.getInstance().getName();
						var pn = c.get_PlayerName();
						var x = cid & 0xFFFF;
						var y = cid >> 16;
						var cx = ocid & 0xFFFF;
						var cy = ocid >> 16;
						var dist = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy)).toFixed(2);
						var cstr = leftPad(x, 3, "0") + ":" + leftPad(y, 3, "0");

						var pid = c.get_PlayerId();
						var an = c.get_AllianceName();
						//var nid=c.get_AllianceId();
						var cn = c.get_Name();
						var row = ["0", cn, cstr, pn, an, "ref", dist.toString(), "max", ocid, pid, "webfrontend/ui/icons/icon_close_btn_small.png"];
						/*
						 var pvpColumnNames = [
						 "x",
						 "City",
						 "Coords",
						 "Player",
						 "Alliance",
						 "ref",
						 "Dist",
						 "TS",
						 "cid",
						 "pid",
						 "Remove"
						 ];
						 */

						//console.dir(m);
						var m = this.pvpTable.getTableModel();
						var rowCount = m.getRowCount();
						for(var ii = 0; ii < rowCount; ++ii) {
							console.log(m.getValue(9, ii));
							if(m.getValue(9, ii) == cid) {
								m.removeRows(ii, 1);
								break;
							}
						}

						console.dir(row);
						if(rowCount >= 15) {
							for(var i = 0; i < 6; ++i) {
								var id = rowCount - 1 - i;
								console.log(m.getValue(0, id));

								if(m.getValue(0, id) != "0") // not locked?
								{
									console.log("Remove: " + id);

									m.removeRows(id, 1);
								}
							}
						}

						console.log("Rows Pre: " + m.getRowCount());
						m.addRows([row], 0);
						console.log("Rows Post: " + m.getRowCount());

					},
					addDungeonToRaid:    function(d, retBtn) {

						var retVal = null;
						if(webfrontend.res.Main.getInstance().dungeons[d.type].b == 0) {
							var bv = d.get_Coordinates();
							var dungX = bv & 0xFFFF;
							var dungY = bv >> 16;
							var cstr = leftPad(dungX, 3, "0") + ":" + leftPad(dungY, 3, "0");
							var found = false;
							var children = this.targetContainer.getChildren();
							for(var i = 0; i < children.length; i++) {
								var coords = children[i].getChildren()[3];
								if(coords.getValue() == cstr) {
									if(retBtn) {
										retVal = children[i].getChildren()[0];
									}
									found = true;
								}
							}
							if(!found) {
								var CI = webfrontend.data.City.getInstance();
								var cId = CI.getId();
								var cx = cId & 0xFFFF;
								var cy = cId >> 16;
								var dist = Math.sqrt((dungX - cx) * (dungX - cx) + (dungY - cy) * (dungY - cy)).toFixed(2);

								//debug( "GETTING MAX/AVG" );
								var dpt = this.dungProgressType(d.type);
								var dpl = d.get_Level() - 1;
								var dpp = d.get_Progress();
								var max = this.dungeonProgressData[dpt][dpl][dpp][0].toString();
								var avg = this.dungeonProgressData[dpt][dpl][dpp][1].toString();
								var subcontainer = new qx.ui.container.Composite();
								subcontainer.setLayout(new qx.ui.layout.Basic());
								btn = new qx.ui.form.Button("Add").set({
									paddingLeft:   5,
									paddingRight:  5,
									paddingTop:    0,
									paddingBottom: 0
								});
								subcontainer.add(btn, {
									top:  0,
									left: 0
								});
								btn.raidcontainer = new qx.ui.container.Composite();
								btn.raidcontainer.setLayout(new qx.ui.layout.VBox());
								//  btn.rw = this;
								btn.d = d;
								btn.addListener("click", function() {
									this.onAddRaidButton(btn);
								});

								retVal = btn;
								var raidcontainer = btn.raidcontainer;
								btn.maxLoot = parseInt(max);
								btn = new qx.ui.basic.Label("L" + d.get_Level() + " " + dungShortName(d.type)).set({
									rich:      true,
									textColor: "blue"
								});
								btn.d = d;
								btn.AvaWin = this;
								if(d.hasOwnProperty("get_StartStep")) {
									paDebug("getStartStep");
									btn.addListener("click", function() {
										this.AvaWin.curDungeon = this.d;
										webfrontend.gui.Util.openDungeonProfile(this.d);
									});
								} else {
									btn.addListener("click", function() {
										this.AvaWin.curDungeon = this.d;
										var app = qx.core.Init.getApplication();
										app.showInfoPage(app.getCityInfoPage(), {
											"id": bv
										});
									});
								}
								subcontainer.add(btn, {
									top:  4,
									left: 50 * 1 + 30
								});
								subcontainer.add(new qx.ui.basic.Label(d.get_Progress() + "%"), {
									top:  4,
									left: 50 * 2 + 30
								});
								btn = new qx.ui.basic.Label(cstr).set({
									rich:      true,
									textColor: "blue"
								});
								btn.dungX = dungX;
								btn.dungY = dungY;
								btn.addListener("click", function() {
									webfrontend.gui.Util.showMapModeViewPos('r', 0, this.dungX, this.dungY);
								});
								subcontainer.add(btn, {
									top:  4,
									left: 50 * 3 + 30
								});
								subcontainer.add(new qx.ui.basic.Label(dist), {
									top:  4,
									left: 50 * 4 + 30
								});
								btn = new qx.ui.basic.Label(max);
								btn.AvaWin = this;
								btn.addListener("click", function() {
									if(Number(this.getValue()) > 0)
										this.AvaWin.addRaid(this.getLayoutParent().getChildren()[0], this.getValue());
								});
								subcontainer.add(btn, {
									top:  4,
									left: 50 * 5 + 30
								});
								btn = new qx.ui.basic.Label(avg);
								subcontainer.add(btn, {
									top:  4,
									left: 50 * 6 + 30
								});
								btn = new qx.ui.form.Button("X").set({
									paddingLeft:   5,
									paddingRight:  5,
									paddingTop:    0,
									paddingBottom: 0
								});
								//   btn.rw = this;
								btn.addListener("click", function() {
									// todo: should I add/remove from COMO?
									this.getLayoutParent().destroy();
									this.updateAvailableUnits();
								});
								subcontainer.add(btn, {
									top:  0,
									left: 50 * 8
								});
								subcontainer.add(raidcontainer, {
									top:  24,
									left: 16
								});
								this.targetContainer.add(subcontainer);
								this.updateDungeonRaidInfo(d.get_Coordinates());
							}
						}
						return retVal;
					},
					dungProgressType:    function(dungType) {
						switch(dungType) {
							case 4:
								return 1;
						}
						return 0;
						// use the forest progress
					},
					getMinBossLevel:     function() {
						var retVal = 1;
						var title = webfrontend.data.Player.getInstance().getTitle();
						var resMain = webfrontend.res.Main.getInstance();
						for(var i = 6; i >= 1; i--) {
							if(resMain.dungeonLevels[i].t < title - 1) {
								retVal = title > 5 ? (i + 1) : i;
								break;
							}
						}
						return retVal;
					},
					pickBossRaider:      function() {
						var retVal = {
							t: -1,
							s: 0
						};
						var CI = webfrontend.data.City.getInstance();
						var resMain = webfrontend.res.Main.getInstance();
						var tech = webfrontend.data.Tech.getInstance();
						for(var unitType in CI.units) {
							if(unitType == 3 || unitType == 6 || unitType == 7 || unitType == 9 || unitType == 10 || unitType == 11 || unitType == 12 || unitType == 13 || unitType == 17) {
								var u = CI.units[unitType];
								if(u.count > 0 && resMain.units[unitType].c > 0 && (resMain.units[unitType].ls || unitType == 17)) {
									var uspeed = Math.max(0, resMain.units[unitType].s / (1 + tech.getBonus("unitSpeed", webfrontend.data.Tech.research, parseInt(unitType)) / 100 + tech.getBonus("unitSpeed", webfrontend.data.Tech.shrine, parseInt(unitType)) / 100));
									retVal = {
										t: parseInt(unitType),
										s: uspeed
									};
									break;
								}
							}
						}
						return retVal;
					},
					formatNumber:        function(str) {
						var num = String(str).replace(/\,/g, '');
						var pos = num.indexOf('.');
						if(pos >= 0) {
							num = num.substring(0, pos);
						}
						;
						if(num.length == 0 || isNaN(num)) {
							return "";
						}
						var val = "";
						for(var i = 0, numLen = num.length; i < numLen; ++i) {
							if(val.length > 0 && (((num.length - i) % 3) == 0)) {
								val = val + ",";
							}
							val += num.substring(i, i + 1);
						}
						return val;
					},
					updateBossRaidCity:  function() {
						this.bossRaider = this.pickBossRaider();
						this.bossTable.bossRaider = this.bossRaider;
						var vis = "hidden";
						var t = this.bossRaider.t;
						if(t != -1) {
							var CI = webfrontend.data.City.getInstance();
							var bS = webfrontend.res.Main.getInstance();
							this.bossUnitImage.setSource("webfrontend/" + bS.imageFiles[bS.units[t].mimg]);
							var uinfo = CI.getUnitTypeInfo(t);
							this.bossUnitLabel.setValue(this.formatNumber(uinfo.count));
							vis = "visible";
						}
						this.bossUnitImage.setVisibility(vis);
						this.bossUnitLabel.setVisibility(vis);
					},
					getObfuscatedNames:  function() {
						if(!this.worldData) {
							var worldDataRoot = webfrontend.net.UpdateManager.getInstance().requester["WORLD"].obj;
							for(var key in worldDataRoot) {
								if(worldDataRoot[key] instanceof Object) {
									if(worldDataRoot[key].hasOwnProperty("d") && worldDataRoot[key].hasOwnProperty("c")) {
										this.worldData = worldDataRoot[key];
										break;
									}
								}
							}
						}
						if(this.objData == "none" && this.worldData) {
							for(var cluster in this.worldData.d) {
								for(var key in this.worldData.d[cluster]) {
									var d = this.worldData.d[cluster][key];
									if(d.hasOwnProperty("d")) {
										for(var dkey in d.d) {
											if(d.d[dkey].hasOwnProperty("Type"))
												this.objData = key;
											else if(d.d[dkey].hasOwnProperty("Alliance"))
												this.playerData = key;
											else
												this.allianceData = key;
											break;
										}
									}
									if(this.objData != "none" && this.playerData != "none" && this.allianceData != "none")
										break;
								}
								break;
							}
						}
					},
					safeGetProperty:     function(obj, prop) {
						if(obj && obj.hasOwnProperty(prop))
							return obj[prop];
						return null;
					},
					coordsFromCluster:   function(clusterID, coordRef) {
						var clusterY = Math.floor(clusterID / 32);
						var clusterX = clusterID - (clusterY * 32);
						var x = clusterX * 32 + (coordRef & 0xffff);
						var y = clusterY * 32 + (coordRef >> 16);
						return x | (y << 16);
					},
					getAttackType:       function(unitType) {
						switch(unitType) {
							case 17:

							case 16:

							case 15:

							case 14:

							case 13:

							case 2:
								//ballista
								return 3;

							case 12:

							case 7:
								// mage
								return 4;

							case 11:

							case 8:

							case 9:

							case 10:
								// pal
								return 2;

							case 3:

							case 4:

							case 5:

							case 6:
								// zerk
								return 1;
						}
						return 3;
					},
					getUnitsToKill:      function(unitType, boss) {
						var tech = webfrontend.data.Tech.getInstance();
						var resMain = webfrontend.res.Main.getInstance();
						var bossUnit = bossUnitType(boss.BossType, boss.BossLevel);
						var attack = resMain.units[unitType].av;
						var attackType = this.getAttackType(unitType);
						var bonus = tech.getBonus("unitDamage", webfrontend.data.Tech.research, parseInt(unitType)) + tech.getBonus("unitDamage", webfrontend.data.Tech.shrine, parseInt(unitType));
						var def = resMain.units[bossUnit].def[attackType] * 4;
						var units = Math.ceil(def / attack);
						units = Math.ceil(units / (1.0 + (bonus / 100)));
						return units;
					},
					fillBossList:        function() {
						var tech = webfrontend.data.Tech.getInstance();
						var CI = webfrontend.data.City.getInstance();
						var resMain = webfrontend.res.Main.getInstance();
						var bv = CI.getId();
						var cx = bv & 0xFFFF;
						var cy = bv >> 16;
						var raider = this.bossRaider;
						var moveSpeed = raider.s;
						var minLevel = this.getMinBossLevel();
						var cont = webfrontend.data.Server.getInstance().getContinentFromCoords(cx, cy);
						var m = this.bossTable.getTableModel();
						if(moveSpeed == 0) {
							m.setData([
								["No units"]
							]);
							return;
						}
						m.setData([]);
						this.getObfuscatedNames();
						if(this.worldData && this.worldData.hasOwnProperty("d")) {
							for(var cluster in this.worldData.d) {
								var objectData = this.safeGetProperty(this.worldData.d[cluster][this.objData], "d");
								if(objectData) {
									for(var obj in objectData) {
										var coord = this.coordsFromCluster(cluster, obj);
										var x = coord & 0xffff;
										var y = coord >> 16;
										var bossCont = webfrontend.data.Server.getInstance().getContinentFromCoords(x, y);
										if(bossCont == cont || raider.t == 17) {
											var o = objectData[obj];
											switch(o.Type) {
												case 3:
													if(o.State && o.BossType != 12 && raider.t != 17 && o.BossLevel >= minLevel) {
														/*
														 var tmp = "";
														 for( var key in o ){
														 tmp += ":" + key;
														 }
														 alert(tmp);
														 */
														var dist = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy));
														m.addRows([
															[bossName(o.BossType), o.BossLevel, x + ":" + y, dist.toFixed(2), webfrontend.Util.getTimespanString(dist * moveSpeed), this.getUnitsToKill(raider.t, o)]
														]);
													} else if(o.State && o.BossType == 12 && raider.t == 17 && o.BossLevel >= minLevel) {
														var dist = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy));
														m.addRows([
															[bossName(o.BossType), o.BossLevel, x + ":" + y, dist.toFixed(2), webfrontend.Util.getTimespanString(dist * moveSpeed), this.getUnitsToKill(raider.t, o)]
														]);
													}
													break;
											}
										}
									}
								}
							}
						}
						m.sortByColumn(4, true);
					},

					createIdleUnitsPage:    function() {
						var idleUnitsPage = new qx.ui.tabview.Page("Lazy Troops");
						idleUnitsPage.setLayout(new qx.ui.layout.VBox(2));
						var container = new qx.ui.container.Composite();
						container.setLayout(new qx.ui.layout.HBox());
						this.cityGroups = new qx.ui.form.SelectBox().set({
							width:    50,
							alignY:   "middle",
							tabIndex: 1
						});
						var li = new qx.ui.form.ListItem("All cities", null, 0);
						li.cids = [];
						this.cityGroups.add(li);
						var img = new qx.ui.basic.Image("webfrontend/ui/icons/icon_citybar_groups_hilighted.png");
						img.setAlignY("middle");
						this.cityGroups._addAt(img, 0);
						var player = webfrontend.data.Player.getInstance();
						for(var ii = 0; ii < player.citygroups.length; ++ii) {
							li = new qx.ui.form.ListItem(player.citygroups[ii].n + " [" + player.citygroups[ii].c.length + "]", null, player.citygroups[ii].i);
							li.cids = player.citygroups[ii].c;
							this.cityGroups.add(li);
						}
						container.add(this.cityGroups);
						var btn = new qx.ui.form.Button("Refresh");
						btn.addListener("click", function() {
							this.targetTable.refresh();
						});
						container.add(btn);
						var value = localStorage.getItem("mt__autoUpdateCB");
						this.autoUpdate = new qx.ui.form.CheckBox("Rfrsh").set({
							marginLeft: 2
						});
						;
						this.autoUpdate.setToolTipText("If unchecked, the data won't refresh until you click the refresh button.<br/>May solve some performance issues with flashing screen.");
						container.add(this.autoUpdate);
						this.autoUpdate.setValue(value == null || value.toLowerCase() == "true");
						this.autoUpdate.addListener("changeValue", function(e) {
							var val = this.autoUpdate.getValue();
							localStorage.setItem("mt__autoUpdateCB", val);
						}, this);
						value = localStorage.getItem("mt__excludeShipsCB");
						this.excludeShips = new qx.ui.form.CheckBox("No ships").set({
							marginLeft: 3
						});
						;
						this.excludeShips.setToolTipText("Won't list ships when checked");
						container.add(this.excludeShips);
						this.excludeShips.setValue(value != null && value.toLowerCase() == "true");
						this.excludeShips.addListener("changeValue", function(e) {
							var val = this.excludeShips.getValue();
							localStorage.setItem("mt__excludeShipsCB", val);
						}, this);
						container.add(new qx.ui.core.Spacer(), {
							flex: 1
						});
						var excludeLabel = new qx.ui.basic.Label().set({
							alignY:      "middle",
							marginRight: 4,
							marginLeft:  4
						});
						excludeLabel.setValue("Min ts");
						container.add(excludeLabel);
						value = localStorage.getItem("mt__excludeTsLt");
						this.excludeTs = new qx.ui.form.TextField();
						this.excludeTs.setWidth(40);
						this.excludeTs.addListener("input", function(e) {
							var value = this.getValue();
							var clean = value.match(/\d+/g);
							clean = clean ? clean.join("") : "";
							if(value != clean) {
								this.setValue(null);
								this.setValue(clean);
							}
						}, this.excludeTs);
						this.excludeTs.set({
							toolTipText: "Exclude cities where the idle ts less than this value."
						});
						var app = qx.core.Init.getApplication();
						app.setElementModalInput(this.excludeTs);
						this.excludeTs.setValue(value && value.length > 0 ? value : "");
						container.add(this.excludeTs);
						this.excludeTs.addListener("changeValue", function(e) {
							var val = this.excludeTs.getValue();
							localStorage.setItem("mt__excludeTsLt", val);
						}, this);
						var excludeLabel = new qx.ui.basic.Label().set({
							alignY:      "middle",
							marginRight: 4,
							marginLeft:  4
						});
						excludeLabel.setValue("Exclude ref");
						container.add(excludeLabel);
						value = localStorage.getItem("mt__excludeIdleRefs");
						this.excludeIf = new qx.ui.form.TextField();
						this.excludeIf.set({
							toolTipText: "Exclude cities where the city reference contains this text. (comma separated list)"
						});
						this.excludeIf.setWidth(80);
						var app = qx.core.Init.getApplication();
						app.setElementModalInput(this.excludeIf);
						this.excludeIf.setValue(value && value.length > 0 ? value : "");
						container.add(this.excludeIf);
						this.excludeIf.addListener("changeValue", function(e) {
							var val = this.excludeIf.getValue();
							localStorage.setItem("mt__excludeIdleRefs", val);
						}, this);
						idleUnitsPage.add(container);
						idleUnitsPage.add(ava.ui.IdleRaidUnitsTable.getInstance(), {
							flex: 1
						});

						//ava.ui.IdleRaidUnitsTable.getInstance().setHeight(300);
						btn.targetTable = ava.ui.IdleRaidUnitsTable.getInstance();
						btn.autoUpdate = this.autoUpdate;
						return idleUnitsPage;
					},
					cityGroupSelected:      function(e) {
						paDebug("Execute button: " + this.getLabel());
					},
					createBossPage:         function() {
						var bossPage = new qx.ui.tabview.Page("Boss Raiding");
						bossPage.setLayout(new qx.ui.layout.VBox(2));
						var container = new qx.ui.container.Composite();
						container.setLayout(new qx.ui.layout.HBox());
						var btn = new qx.ui.form.Button("World");
						btn.addListener("click", function() {
							var bv = webfrontend.data.City.getInstance().getId();
							var cx = bv & 0xFFFF;
							var cy = bv >> 16;
							var app = qx.core.Init.getApplication();
							webfrontend.gui.Util.showMapModeViewPos('r', 0, cx, cy);
							var server = webfrontend.data.Server.getInstance();
							var cont = server.getContinentFromCoords(cx, cy);
							var cent = server.getContinentCentrePoint(cont);
							webfrontend.gui.Util.showMapModeViewPos('w', 0, cent.x, cent.y);
						});
						container.add(btn);
						btn = new qx.ui.form.Button("Find Bosses");
						btn.addListener("click", this.fillBossList, this);
						container.add(btn);
						container.add(new qx.ui.core.Spacer(), {
							flex: 1
						});
						var lbl = new qx.ui.basic.Label();
						lbl.setRich(true);
						lbl.setAlignY("middle");
						this.bossUnitLabel = lbl;
						container.add(lbl);
						container.add(new qx.ui.core.Spacer().set({
							width: 10
						}));
						var img = new qx.ui.basic.Image();
						img.setWidth(24);
						img.setHeight(24);
						img.setScale(true);
						img.setAlignY("middle");
						this.bossUnitImage = img;
						container.add(img);
						bossPage.add(container);
						var tableModel = new qx.ui.table.model.Simple();
						var columnNames = ["Type", "Level", "Pos", "Dist", "Travel", "Units"];
						tableModel.setColumns(columnNames);
						tableModel.setSortMethods(4, function(row1, row2) {
							return Number(row1[3]) - Number(row2[3]);
						});
						var custom = {
							tableColumnModel: function(obj) {
								return new qx.ui.table.columnmodel.Resize(obj);
							}
						};
						this.bossTable = new qx.ui.table.Table(tableModel, custom);

						//this.bossTable.setHeight(300);
						this.bossTable.onCellClick = function(event) {
							switch(event.getColumn()) {
								case 2:
									// coords
									var spl = this.getTableModel().getValue(event.getColumn(), event.getRow()).split(":");
									var x = Number(spl[0]);
									var y = Number(spl[1]);
									var app = qx.core.Init.getApplication();
									app.showSendArmy(x, y, false, webfrontend.gui.SendArmyWindow.pages.raid);
									webfrontend.gui.Util.showMapModeViewPos('r', 0, x, y);
									if(this.bossRaider && this.bossRaider.t != -1) {
										var saw = app.sendArmyWidget;
										var units = null;

										for(var key in saw) {
											if(saw[key] && saw[key].hasOwnProperty("1")) {
												if(saw[key]["1"] && saw[key]["1"].hasOwnProperty("cityinfo") && saw[key]["1"].hasOwnProperty("ui")) {
													//debug( "Found it! at " + key );
													units = saw[key];
													units[this.bossRaider.t].ui.input.setValue(this.getTableModel().getValue(5, event.getRow()));
													break;
												}
											}
										}
									}
									break;
								case 6:
									break;
							}
						};
						this.bossTable.addListener("cellClick", this.bossTable.onCellClick, this.bossTable);
						var columnModel = this.bossTable.getTableColumnModel();
						columnModel.setColumnVisible(3, false);
						var linkStyle = new qx.ui.table.cellrenderer.Default();
						linkStyle.setDefaultCellStyle("text-decoration:underline;color:blue");
						columnModel.setDataCellRenderer(2, linkStyle);
						bossPage.add(this.bossTable, {
							flex: 1
						});
						return bossPage;
					},
					createPvpPage:          function() {

						var pvpPage = new qx.ui.tabview.Page("Cache/Pvp");
						pvpPage.setLayout(new qx.ui.layout.VBox(2));
						var tableModel = new qx.ui.table.model.Simple();

						//						var columnNames = ["x", "City", "Coords", "Player", "ref", "Dist", "TS", "Alliance","cid", "Remove"];
						var pvpColumnNames = [
							"X",
							"City",
							"Coords",
							"Player",
							"Alliance",
							"ref",
							"Dist",
							"TS",
							"cid",
							"pid",
							"XX"
						];

						tableModel.setColumns(pvpColumnNames);
						/* tableModel.setSortMethods(5,function(row1,row2) {
						 return Number(row1[5])-Number(row2[5]);
						 });*/
						var custom = {
							tableColumnModel: function(obj) {
								return new qx.ui.table.columnmodel.Resize(obj);
							}
						};
						this.pvpTable = new qx.ui.table.Table(tableModel, custom);

						//this.bossTable.setHeight(300);
						this.pvpTable.onDataEdited = function(e) {
							var m = this.getTableModel();

							var data = e.getData();
							/* switch (data.col) {
							 case 6:
							 if (data.value != "max")
							 m.setValue(7, data.row, "1");
							 break;
							 case 7:
							 if (data.value != "1")
							 m.setValue(6, data.row, "max");
							 break;
							 }*/
						};
						this.pvpTable.onCellClick = function(event) {
							var col = event.getColumn();
							var row = event.getRow();
							console.log(col);
							var colName = this.getTableModel().getValue(0, row);
							console.log(colName);
							var currentData = this.getTableModel().getValue(col, row);
							console.log(col + " " + row + " " + currentData);
							var rf = qx.core.Init.getApplication();

							switch(col) {
								case 0:
								{
									if(currentData != "0")
										m.setValue(0, row, "0");
									else
										m.setValue(0, row, "1");
								}
									break;
								case 3:
								{
									rf.showInfoPage(rf.getPlayerInfoPage(), {
										name: currentData
									});
								}
									break;
								case 4:
								{
									rf.showAllianceInfo(webfrontend.gui.Alliance.Info.MainWindow.tabs.info, {
										name: currentData
									});
								}
									break;
								case 1:
								{
									var spl = currentData.split(":");
									if(spl.length > 1) {
										webfrontend.gui.Util.openCityProfile(parseInt(spl[0], 10), parseInt(spl[1], 10));
									}
								}
									break;
								case 2:
								{
									var spl = currentData.split(":");
									var x = Number(spl[0]);
									var y = Number(spl[1]);
									rf.showSendArmy(x, y, false, webfrontend.gui.SendArmyWindow.pages.pvp);
									webfrontend.gui.Util.showMapModeViewPos('r', 0, x, y);
								}
									break;
								case 10:
								{
									this.setShowCellFocusIndicator(false);
									this.getTableModel().removeRows(event.getRow(), 1);
								}
									break;
							}
						};
						this.pvpTable.setShowCellFocusIndicator(false);
						this.pvpTable.addListener("cellClick", this.pvpTable.onCellClick, this.pvpTable);
						this.pvpTable.addListener("dataEdited", this.pvpTable.onDataEdited, this.pvpTable);
						var columnModel = this.pvpTable.getTableColumnModel();
						columnModel.setColumnVisible(3, false);
						var imgStyle = new qx.ui.table.cellrenderer.Image();
						var linkStyle = new qx.ui.table.cellrenderer.Default();
						linkStyle.setDefaultCellStyle("text-decoration:underline;color:blue");

						///       var pvpColumnNames = [0 "x",1 "City",2 "Coords",3 "Player",
						///							/* 4 */ "Alliance",/* 5 */ "ref",/* 6 */ "Dist",
						///                          /* 7 */ "TS",/* 8 */"cid",/* 9 */ "pid",/*10*/ "Remove"];
						tableModel.setColumnEditable(0, true);
						columnModel.setDataCellRenderer(1, linkStyle);
						columnModel.setDataCellRenderer(2, linkStyle);
						columnModel.setDataCellRenderer(3, linkStyle);
						columnModel.setDataCellRenderer(4, linkStyle);

						tableModel.setColumnEditable(5, true);
						tableModel.setColumnEditable(6, true);
						tableModel.setColumnEditable(7, true);
						tableModel.setColumnEditable(8, true);
						tableModel.setColumnEditable(9, true);
						//  tableModel.setColumnEditable(10,true);
						columnModel.setColumnVisible(5, false);
						columnModel.setColumnVisible(6, false);
						columnModel.setColumnVisible(7, false);
						columnModel.setColumnVisible(8, false);
						columnModel.setColumnVisible(9, false);

						// columnModel.setDataCellRenderer(4, linkStyle);
						columnModel.setDataCellRenderer(10, imgStyle);
						// columnModel.setColumnWidth(8, 20, false);

						pvpPage.add(new qx.ui.basic.Label("Stores a cache of all cities that you have clicked.  I.e. click the first on to go back to the most recently click city "));
						var row = new qx.ui.container.Composite();
						row.setLayout(new qx.ui.layout.HBox());

						row.add(new qx.ui.basic.Label("Expected Losses:").set({
							alignY: "middle"
						}));
						var sel = new qx.ui.form.SelectBox().set({
							width:         55,
							alignY:        "middle",
							paddingLeft:   4,
							paddingRight:  4,
							paddingTop:    0,
							paddingBottom: 0,
							marginRight:   8,
							toolTipText:   "Amount of troops to remove from subsequent plunders to account for losses from each plunder."
						});
						sel.add(new qx.ui.form.ListItem("None"));
						sel.add(new qx.ui.form.ListItem("5%"));
						sel.add(new qx.ui.form.ListItem("10%"));
						sel.add(new qx.ui.form.ListItem("15%"));
						sel.add(new qx.ui.form.ListItem("20%"));
						sel.add(new qx.ui.form.ListItem("25%"));
						sel.setSelection([sel.getChildren()[0]]);
						sel.pvp = this;
						this.lossPercent = 0;
						sel.addListener("changeSelection", function(e) {
							this.pvp.lossPercent = e.getData()[0].getLabel() == "None" ? 0 : parseInt(e.getData()[0].getLabel());
						});
						row.add(sel);

						row.add(new qx.ui.basic.Label("Max TS:").set({
							alignY: "middle"
						}));
						sel = new qx.ui.form.SelectBox().set({
							width:         60,
							alignY:        "middle",
							paddingLeft:   4,
							paddingRight:  4,
							paddingTop:    0,
							paddingBottom: 0,
							marginRight:   8,
							toolTipText:   "Allows you to reserve some troops to account for losses rather than only assume % loss."
						});
						sel.add(new qx.ui.form.ListItem("100%"));
						sel.add(new qx.ui.form.ListItem("95%"));
						sel.add(new qx.ui.form.ListItem("90%"));
						sel.setSelection([sel.getChildren()[1]]);
						sel.pvp = this;
						this.startingPercent = 95;
						sel.addListener("changeSelection", function(e) {
							this.pvp.startingPercent = parseInt(e.getData()[0].getLabel());
						});
						row.add(sel);
						var btn = new qx.ui.form.Button("Plunder").set({
							marginLeft:    10,
							paddingLeft:   8,
							paddingRight:  8,
							paddingTop:    2,
							paddingBottom: 2,
							alignY:        "center",
							enabled:       true
						});
						btn.pvp = this;
						btn.addListener("click", function() {
							// this.pvp.clearRaidErrorWindow();
							this.pvp.pvpTable.stopEditing();
							var sendTime = this.pvp.getDelay5sOffsetTime();
							var startingPctMultiplier = (this.pvp.startingPercent / 100);
							var lossDivisor = (this.pvp.lossPercent / 100) + 1;
							var CI = webfrontend.data.City.getInstance();
							var cid = CI.getId();
							var x = cid & 0xFFFF;
							var y = cid >> 16;
							var m = this.pvp.pvpTable.getTableModel();
							var data = m.getData();
							var numRows = m.getRowCount();
							var sendMode = 2;
							var availUnits = ava.CombatTools.getAvailableUnits(CI, false);
							var speed = 0;
							var units = [];
							for(var ii = 0; ii < availUnits.land.length; ++ii) {
								if(!ava.CombatTools.DO_NOT_PLUNDER_UNITS[availUnits.land[ii].type]) {
									var tmpCount = Math.floor(availUnits.land[ii].count * startingPctMultiplier);
									if(tmpCount > 0) {
										speed = Math.max(speed, this.pvp.getSpeed(availUnits.land[ii].type));
										units.push({
											ts: availUnits.land[ii].unitTS,
											t:  availUnits.land[ii].type,
											c:  tmpCount
										});
									}
								}
							}
							var sendTime = this.pvp.getDelay5sOffsetTime();
							var commandManager = webfrontend.net.CommandManager.getInstance();
							var secs = 0;
							for(var ii = 0; ii < numRows; ++ii) {
								if(data[ii][6] == "max") {
									var rpt = parseInt(data[ii][7]);
									for(b = rpt; b > 0; --b) {
										var sndUnits = [];
										for(var a = 0; a < units.length; ++a) {
											if(units[a].c > 0) {
												sndUnits.push({
													t: units[a].t,
													c: units[a].c
												});
												var amt = Math.floor(units[a].c / lossDivisor);
												units[a].c = Math.max(0, amt);
											}
										}
										var request = {
											cityid:                     cid,
											units:                      sndUnits,
											targetPlayer:               data[ii][0],
											targetCity:                 data[ii][4],
											order:                      2,
											transport:                  1,
											createCity:                 "",
											timeReferenceType:          sendMode,
											referenceTimeUTCMillis:     sendTime + 1000,
											raidTimeReferenceType:      0,
											raidReferenceTimeUTCMillis: 0,
											iUnitOrderOptions:          0,
											iOrderCountRaid:            0
										};
										commandManager.sendCommand("OrderUnits", request, null, function() {
										});
										var tcid = Number(String(data[ii][3]).replace(',', ''));
										var cx = tcid & 0xFFFF;
										var cy = tcid >> 16;
										var dist = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy));
										secs += Math.ceil(5 + (speed * 2 * dist));
										var hours = Math.floor(secs / (60 * 60));
										var divisor_for_minutes = secs % (60 * 60);
										var minutes = Math.floor(divisor_for_minutes / 60);
										var divisor_for_seconds = divisor_for_minutes % 60;
										var seconds = Math.ceil(divisor_for_seconds);
										sendTime = this.pvp.getDelayWithOffsetTime(hours, minutes, seconds);
									}
								}
							}
							var remainingTs = 0;
							for(var a = 0; a < units.length; ++a) {
								if(units[a].c > 0) {
									remainingTs += units[a].c * units[a].ts;
								}
							}
							var totalTs = remainingTs;
							var tsSent = 0;
							var dist = 0;
							for(var ii = 0; ii < numRows; ++ii) {
								if(data[ii][6] != "max") {
									var tsSpecified = parseInt(data[ii][6]);
									if(tsSpecified > 0) {
										if(tsSpecified > remainingTs) {
											remainingTs = 0;
											for(var a = 0; a < units.length; ++a) {
												var amt = Math.floor(units[a].c / lossDivisor);
												units[a].c = Math.max(0, amt);
												if(amt > 0) {
													remainingTs += amt * units[a].ts;
												}
											}
											totalTs = remainingTs;
											secs += Math.ceil(5 + (speed * 2 * dist));
											var hours = Math.floor(secs / (60 * 60));
											var divisor_for_minutes = secs % (60 * 60);
											var minutes = Math.floor(divisor_for_minutes / 60);
											var divisor_for_seconds = divisor_for_minutes % 60;
											var seconds = Math.ceil(divisor_for_seconds);
											sendTime = this.pvp.getDelayWithOffsetTime(hours, minutes, seconds);
											dist = 0;
										}
										if(remainingTs > 0 && tsSpecified < remainingTs) {
											var sendMultiplier = tsSpecified / totalTs;
											var sndUnits = [];
											for(var a = 0; a < units.length; ++a) {
												var amt = Math.floor(units[a].c * sendMultiplier);
												if(amt > 0) {
													remainingTs -= amt * units[a].ts;
													sndUnits.push({
														t: units[a].t,
														c: amt
													});
												}
											}
											var request = {
												cityid:                     cid,
												units:                      sndUnits,
												targetPlayer:               data[ii][0],
												targetCity:                 data[ii][4],
												order:                      2,
												transport:                  1,
												createCity:                 "",
												timeReferenceType:          sendMode,
												referenceTimeUTCMillis:     sendTime + 1000,
												raidTimeReferenceType:      0,
												raidReferenceTimeUTCMillis: 0,
												iUnitOrderOptions:          0,
												iOrderCountRaid:            0
											};
											commandManager.sendCommand("OrderUnits", request, null, function() {
											});
											var tcid = Number(String(data[ii][3]).replace(',', ''));
											var cx = tcid & 0xFFFF;
											var cy = tcid >> 16;
											dist = Math.max(dist, Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy)));
										}
									}
								}
							}
							m.removeRows(0, m.getRowCount());
						});
						row.add(btn);
						btn = new qx.ui.form.Button("Clear").set({
							marginLeft:    8,
							paddingLeft:   8,
							paddingRight:  8,
							paddingTop:    2,
							paddingBottom: 2,
							alignY:        "center",
							enabled:       true
						});
						btn.pvp = this;
						btn.addListener("click", function() {
							var tm = this.pvp.pvpTable.getTableModel();
							tm.removeRows(0, tm.getRowCount());
						});
						row.add(btn);
						pvpPage.add(row);
						pvpPage.add(this.pvpTable, {
							flex: 1
						});
						this.pvpTroopContainer = new qx.ui.container.Composite();
						this.pvpTroopContainer.setLayout(new qx.ui.layout.HBox().set({
							spacing: 4
						}));
						pvpPage.add(this.pvpTroopContainer);
						return pvpPage;
					},
					GetDungeonModifier:     function(dungeonType) {
						var rv = 1;
						if(this.wantWood.getValue() && dungeonType == 5)
							rv *= distWantModifier;

						if(this.wantStone.getValue() && dungeonType == 3)
							rv *= distWantModifier;

						return rv;
					},
					createDungeonPage:      function() {
						var dungeonPage = new qx.ui.tabview.Page("Dungeons");
						dungeonPage.setLayout(new qx.ui.layout.Dock());

						var layoutContainer = new qx.ui.container.Composite();
						layoutContainer.setLayout(new qx.ui.layout.VBox());

						layoutContainer.add(new qx.ui.basic.Label("Targets"));

						var container = new qx.ui.container.Composite();
						container.setLayout(new qx.ui.layout.Basic());
						container.add(new qx.ui.basic.Label("Type").set({
							alignY: "middle"
						}), {
							top:  0,
							left: 80
						});
						container.add(new qx.ui.basic.Label("Prog").set({
							alignY: "middle"
						}), {
							top:  0,
							left: 130
						});
						container.add(new qx.ui.basic.Label("Coords").set({
							alignY: "middle"
						}), {
							top:  0,
							left: 180
						});
						container.add(new qx.ui.basic.Label("Dist").set({
							alignY: "middle"
						}), {
							top:  0,
							left: 230
						});
						container.add(new qx.ui.basic.Label("Max").set({
							alignY: "middle"
						}), {
							top:  0,
							left: 280
						});
						container.add(new qx.ui.basic.Label("Avg").set({
							alignY: "middle"
						}), {
							top:  0,
							left: 330
						});
						var sel = new qx.ui.form.SelectBox().set({
							width:         77,
							alignY:        "middle",
							paddingLeft:   4,
							paddingRight:  4,
							paddingTop:    0,
							paddingBottom: 0
						});
						sel.add(new qx.ui.form.ListItem("Max+90%"));
						sel.add(new qx.ui.form.ListItem("Max+60%"));
						sel.add(new qx.ui.form.ListItem("Max+30%"));
						sel.add(new qx.ui.form.ListItem("Max+15%"));
						sel.add(new qx.ui.form.ListItem("Max"));

						//sel.add( new qx.ui.form.ListItem( "Mavg" ) );
						//sel.add( new qx.ui.form.ListItem( "Avg" ) );
						//sel.add( new qx.ui.form.ListItem( "Split" ) );
						sel.setSelection([sel.getChildren()[3]]);
						this.raidAddType = sel;
						container.add(sel, {
							top:  0,
							left: 0
						});
						sel.addListener("changeSelection", function(e) {
							localStorage.setItem("mm__addType", e.getData()[0].getLabel());
						});
						SelectFromStorage("mm__addType", sel);

						//container.add( new qx.ui.basic.Label("Min"),    {top: 0, left: 350} );
						this.targetContainer = new qx.ui.container.Composite();
						this.targetContainer.setLayout(new qx.ui.layout.VBox().set({
							spacing: 3
						}));
						var scrollContainer = new qx.ui.container.Scroll();
						scrollContainer.add(this.targetContainer);
						scrollContainer.setMaxHeight(250);
						var btn = new qx.ui.form.Button("X").set({
							paddingLeft:   5,
							paddingRight:  5,
							paddingTop:    0,
							paddingBottom: 0
						});
						btn.targetContainer = this.targetContainer;
						btn.addListener("click", function() {
							this.targetContainer.removeAll();
						});
						container.add(btn, {
							top:  0,
							left: 460
						});
						layoutContainer.add(container);
						layoutContainer.add(new qx.ui.core.Widget().set({
							backgroundColor: "#c4a77b",
							height:          2,
							allowGrowX:      true,
							marginTop:       4,
							marginBottom:    2
						}));
						dungeonPage.add(layoutContainer, {
							edge: "north"
						});
						dungeonPage.add(scrollContainer, {
							edge:  "center",
							width: "100%"
						});
						container = new qx.ui.container.Composite();
						container.setLayout(new qx.ui.layout.VBox());
						container.add(new qx.ui.core.Widget().set({
							backgroundColor: "#c4a77b",
							height:          2,
							allowGrowX:      true,
							marginTop:       4,
							marginBottom:    4
						}));
						var subContainer = new qx.ui.container.Composite();
						subContainer.setLayout(new qx.ui.layout.HBox().set({
							spacing: 4
						}));
						subContainer.add(new qx.ui.basic.Label("Troops").set({
							alignY: "middle"
						}));
						this.split = new qx.ui.form.CheckBox("Split").set({
							marginLeft: 5
						});
						this.split.setToolTipText("If checked, adds as many groups as possible at around the level indicated.");
						this.split.initValue(false);
						subContainer.add(this.split);
						this.wantWood = new qx.ui.form.CheckBox("wantWood").set({
							marginLeft: 5
						});
						this.wantWood.setToolTipText("If checked, forests are favoured when dungeontype is flexible.\nCan be used with wantStone.\nExample:  If a the best mountain is up to 5 away and the best forest is 7 away, it will choose the forest.\nIf the mountain is closer or the forest farther, it will choose the mountain.\nThe setting will have no effect if there a many close forest dungeons.");
						this.wantWood.initValue(localStorage.getItem("mm__wantWood"));
						subContainer.add(this.wantWood);
						this.wantStone = new qx.ui.form.CheckBox("wantStone").set({
							marginLeft: 5
						});
						this.wantStone.setToolTipText("See 'getWood'.\n");
						this.wantStone.initValue(localStorage.getItem("mm__wantStone") ? true : false);
						subContainer.add(this.wantStone);

						subContainer.add(new qx.ui.core.Spacer(), {
							flex: 1
						});

						subContainer.add(new qx.ui.basic.Label("Raid:").set({
							alignY: "middle"
						}));
						sel = new qx.ui.form.SelectBox().set({
							width:  80,
							alignY: "middle"
						});

						sel.add(new qx.ui.form.ListItem("Manual"));
						sel.add(new qx.ui.form.ListItem("AvaRaid"));
						sel.add(new qx.ui.form.ListItem("null"));
						sel.add(new qx.ui.form.ListItem("really null")); // don't use this
						sel.add(new qx.ui.form.ListItem("undefined"));
						sel.add(new qx.ui.form.ListItem("NaN"));
						sel.add(new qx.ui.form.ListItem("404"));
						sel.add(new qx.ui.form.ListItem("+0.0"));

						sel.setSelection([sel.getChildren()[0]]);

						//	sel.setToolTipText("Send to the dungeons you have selected.");
						sel.addListener("changeSelection", function(e) {
							localStorage.setItem("mm__raidMode", e.getData()[0].getLabel());

							if(e.getData()[0].getLabel() == "NaN") {
								// polite

								this.AvaRaidMode = 3;
							} else if(e.getData()[0].getLabel() == "AvaRaid") {
								sel.setToolTipText("Selects dungeons and raids to send");

								this.AvaRaidMode = 1;
							} else if(e.getData()[0].getLabel() == "+0.0") {

								this.AvaRaidMode = 2;
							} else {
								// default
								sel.setToolTipText("Manual, tedius mode.");
								this.AvaRaidMode = 0;
							}
						}, this);

						// set the initial raid mode

						subContainer.add(sel);
						this.raidModeSel = sel;
						SetSelectionFromStore(sel, "mm__raidMode");
						subContainer.add(new qx.ui.basic.Label("Ratio:").set({
							alignY: "middle"
						}));
						sel = new qx.ui.form.SelectBox().set({
							width:  80,
							alignY: "middle"
						});
						sel.add(new qx.ui.form.ListItem("Available"));
						sel.add(new qx.ui.form.ListItem("Total"));
						sel.add(new qx.ui.form.ListItem("None"));
						if(this.ratioMode == "total")
							sel.setSelection([sel.getChildren()[1]]);
						else if(this.ratioMode == "none")
							sel.setSelection([sel.getChildren()[2]]);

						subContainer.add(sel);
						sel.addListener("changeSelection", function(e) {
							localStorage.setItem("mm__ratioOpts", e.getData()[0].getLabel());
							var readOnly = false;
							if(e.getData()[0].getLabel() == "Available")
								this.ratioMode = "count";
							else if(e.getData()[0].getLabel() == "Total")
								this.ratioMode = "total";
							else {
								this.ratioMode = "none";
								readOnly = true;
							}
							this.setTotalsReadOnly(readOnly);
						});
						container.add(subContainer);
						SetSelectionFromStore(sel, "mm__ratioOpts");

						this.troopContainer = new qx.ui.container.Composite();
						this.troopContainer.setLayout(new qx.ui.layout.HBox().set({
							spacing: 4
						}));
						container.add(this.troopContainer);
						container.add(new qx.ui.core.Widget().set({
							backgroundColor: "#c4a77b",
							height:          2,
							allowGrowX:      true,
							marginTop:       4,
							marginBottom:    4
						}));
						this.commandContainer = new qx.ui.container.Composite();
						this.commandContainer.setLayout(new qx.ui.layout.VBox().set({
							spacing: 2
						}));
						var defVis = "hidden";
						subContainer = new qx.ui.container.Composite();
						subContainer.setLayout(new qx.ui.layout.HBox().set({
							spacing: 2
						}));
						sel = new qx.ui.form.SelectBox().set({
							width:    80,
							alignY:   "middle",
							tabIndex: 1
						});
						var _sendTime = sel;
						sel.add(new qx.ui.form.ListItem("Arrive", null, webfrontend.gui.SendArmyWindow.timings.arrive));
						sel.add(new qx.ui.form.ListItem("Depart", null, webfrontend.gui.SendArmyWindow.timings.depart));
						sel.add(new qx.ui.form.ListItem("Delay 5s", null, 100));
						sel.add(new qx.ui.form.ListItem("Now", null, webfrontend.gui.SendArmyWindow.timings.now));
						sel.setSelection([sel.getChildren()[3]]);
						//   sel.rw = this;
						sel.addListener("changeSelection", function(e) {
							localStorage.setItem("mm__timingOpts", e.getData()[0].getLabel());
							var ch = this.getLayoutParent().getChildren();
							var vis = "visible";
							if(e.getData()[0].getLabel() == "Now" || e.getData()[0].getLabel() == "Delay 5s")
								vis = "hidden";
							for(var i = 1; i <= 6; i++)
								ch[i].setVisibility(vis);
							this.updateAvailableUnits();
						});
						subContainer.add(sel);
						subContainer.add(this.createHMSTextField(defVis, 2));
						subContainer.add(new qx.ui.basic.Label(":").set({
							visibility: defVis,
							alignY:     "middle"
						}));
						subContainer.add(this.createHMSTextField(defVis, 3));
						subContainer.add(new qx.ui.basic.Label(":").set({
							visibility: defVis,
							alignY:     "middle"
						}));
						subContainer.add(this.createHMSTextField(defVis, 4));
						sel = new qx.ui.form.SelectBox().set({
							width:      100,
							visibility: defVis,
							alignY:     "middle",
							tabIndex:   5
						});
						var _sendDay = sel;
						sel.add(new qx.ui.form.ListItem("7 days", null, 7));
						sel.add(new qx.ui.form.ListItem("6 days", null, 6));
						sel.add(new qx.ui.form.ListItem("5 days", null, 5));
						sel.add(new qx.ui.form.ListItem("4 days", null, 4));
						sel.add(new qx.ui.form.ListItem("3 days", null, 3));
						sel.add(new qx.ui.form.ListItem("2 days", null, 2));
						sel.add(new qx.ui.form.ListItem("Tomorrow", null, 1));
						sel.add(new qx.ui.form.ListItem("Today", null, 0));
						sel.setSelection([sel.getChildren()[7]]);
						subContainer.add(sel);
						subContainer.add(new qx.ui.core.Spacer(), {
							flex: 1
						});
						sel.addListener("changeSelection", function(e) {
							localStorage.setItem("mm__delayDayOpts", e.getData()[0].getLabel());
						});
						SetSelectionFromStore(sel, "mm__delayDayOpts");
						if(value != null) {
							var opts = sel.getChildren();
							for(var ii = 0; ii < opts.length; ++ii) {
								if(opts[ii].getLabel() == value) {
									sel.setSelection([opts[ii]]);
									break;
								}
							}
						}

						this.departOptions = new qx.ui.form.SelectBox().set({
							width:    88,
							alignY:   "middle",
							tabIndex: 6
						});
						this.departOptions.add(new qx.ui.form.ListItem("Stagger opt", null, 0));
						this.departOptions.add(new qx.ui.form.ListItem("1 min", null, 1));
						this.departOptions.add(new qx.ui.form.ListItem("2 min", null, 2));
						this.departOptions.add(new qx.ui.form.ListItem("5 min", null, 5));
						this.departOptions.add(new qx.ui.form.ListItem("10 min", null, 10));
						this.departOptions.add(new qx.ui.form.ListItem("20 min", null, 20));
						this.departOptions.add(new qx.ui.form.ListItem("30 min", null, 30));
						this.departOptions.add(new qx.ui.form.ListItem("45 min", null, 45));
						this.departOptions.add(new qx.ui.form.ListItem("60 min", null, 60));
						subContainer.add(this.departOptions);
						value = localStorage.getItem("mm__departOpts");
						if(value != null) {
							var opts = this.departOptions.getChildren();
							for(var ii = 0; ii < opts.length; ++ii) {
								if(opts[ii].getLabel() == value) {
									this.departOptions.setSelection([opts[ii]]);
									break;
								}
							}
						}
						this.departOptions.addListener("changeSelection", function(e) {
							localStorage.setItem("mm__departOpts", e.getData()[0].getLabel());
						});
						this.nextIdleCityButton = new webfrontend.ui.SoundButton(null, "webfrontend/theme/scrollbar/scrollbar-right.png").set({
							paddingLeft:   8,
							paddingRight:  8,
							paddingTop:    2,
							paddingBottom: 2,
							marginLeft:    15,
							marginRight:   15,
							alignY:        "center",
							enabled:       false,
							toolTipText:   "Next idle city"
						});
						this.nextIdleCityButton.addListener("click", this.nextIdleRaidCity);
						subContainer.add(this.nextIdleCityButton);

						btn = new qx.ui.form.Button("GO").set({
							paddingLeft:   4,
							paddingRight:  4,
							paddingTop:    2,
							paddingBottom: 2,
							alignY:        "center",
							enabled:       true
						});
						this.autoRaidButton = btn;
						this.goButton = btn;
						btn.setToolTipText("AvaRaid yay!");
						btn.addListener("execute", this.autoRaidPleaseToggle, this);
						subContainer.add(btn);
						this.commandContainer.add(subContainer);

						// detect when user is idle
						window.addEventListener('mousemove', function() {
							ava.ui.RaidingWindow.getInstance().lastMouseMoveTime = webfrontend.Util.getCurrentTime().getTime();
						}, false);

						subContainer = new qx.ui.container.Composite();
						subContainer.setLayout(new qx.ui.layout.HBox().set({
							spacing: 2
						}));
						sel = new qx.ui.form.SelectBox().set({
							width:    80,
							alignY:   "middle",
							tabIndex: 6
						});
						sel.add(new qx.ui.form.ListItem("Once", null, webfrontend.gui.SendArmyWindow.timings.once - webfrontend.gui.SendArmyWindow.timings.once));
						sel.add(new qx.ui.form.ListItem("Return", null, webfrontend.gui.SendArmyWindow.timings.latest - webfrontend.gui.SendArmyWindow.timings.once));
						sel.add(new qx.ui.form.ListItem("Complete", null, webfrontend.gui.SendArmyWindow.timings.completed - webfrontend.gui.SendArmyWindow.timings.once));
						sel.add(new qx.ui.form.ListItem("24 Hours", null, 8));
						sel.add(new qx.ui.form.ListItem("72 Hours", null, 7));
						sel.setSelection([sel.getChildren()[2]]);
						sel.addListener("changeSelection", function(e) {
							localStorage.setItem("mm__retOpts", e.getData()[0].getLabel());
							var ch = this.getLayoutParent().getChildren();
							var vis = "hidden";
							if(e.getData()[0].getLabel() == "Return")
								vis = "visible";
							for(var i = 1; i <= 6; i++)
								ch[i].setVisibility(vis);
						});
						sel.addListenerOnce("appear", function() {
							SetSelectionFromStore(sel, "mm__retOpts");
						}, sel);
						subContainer.add(sel);
						var tf = this.createHMSTextField(defVis, 7);
						tf.addListenerOnce("appear", function() {
							var value = localStorage.getItem("mm__retHr");
							this.setValue(value != null ? value : "0");
							if(this.getValue().length == 0) {
								this.setValue("0");
							}
						}, tf);

						console.warn("1");
						tf.addListener("input", function() {
							localStorage.setItem("mm__retHr", this.getValue());
						}, tf);
						subContainer.add(tf);
						subContainer.add(new qx.ui.basic.Label(":").set({
							visibility: defVis,
							alignY:     "middle"
						}));
						console.warn("2");
						var tf = this.createHMSTextField(defVis, 8);
						tf.addListenerOnce("appear", function() {
							var value = localStorage.getItem("mm__retMin");
							this.setValue(value != null ? value : "0");
							if(this.getValue().length == 0) {
								this.setValue("0");
							}
						}, tf);
						tf.addListener("input", function() {
							localStorage.setItem("mm__retMin", this.getValue());
						}, tf);
						subContainer.add(tf);
						subContainer.add(new qx.ui.basic.Label(":").set({
							visibility: defVis,
							alignY:     "middle"
						}));
						console.warn("3");

						var tf = this.createHMSTextField(defVis, 9);
						tf.addListenerOnce("appear", function() {
							var value = localStorage.getItem("mm__retSec");
							this.setValue(value != null ? value : "0");
							if(this.getValue().length == 0) {
								this.setValue("0");
							}
						}, tf);
						tf.addListener("input", function() {
							localStorage.setItem("mm__retSec", this.getValue());
						}, tf);
						subContainer.add(tf);
						sel = new qx.ui.form.SelectBox().set({
							width:      100,
							visibility: defVis,
							alignY:     "middle",
							tabIndex:   10
						});
						sel.add(new qx.ui.form.ListItem("7 days", null, 7));
						sel.add(new qx.ui.form.ListItem("6 days", null, 6));
						sel.add(new qx.ui.form.ListItem("5 days", null, 5));
						sel.add(new qx.ui.form.ListItem("4 days", null, 4));
						sel.add(new qx.ui.form.ListItem("3 days", null, 3));
						sel.add(new qx.ui.form.ListItem("2 days", null, 2));
						sel.add(new qx.ui.form.ListItem("Tomorrow", null, 1));
						sel.add(new qx.ui.form.ListItem("Today", null, 0));
						sel.setSelection([sel.getChildren()[7]]);
						subContainer.add(sel);
						sel.addListener("changeSelection", function(e) {
							localStorage.setItem("mm__retDayOpts", e.getData()[0].getLabel());
						});
						SetSelectionFromStore(sel, "mm__retDayOpts");
						var btn = new qx.ui.form.Button("Refresh").set({
							paddingLeft:   5,
							paddingRight:  5,
							paddingTop:    0,
							paddingBottom: 0
						});
						btn.addListener("click", this.findDungeons, this);

						subContainer.add(btn);
						var btn = new qx.ui.form.Button("Refresh All Types").set({
							paddingLeft:   5,
							paddingRight:  5,
							paddingTop:    0,
							paddingBottom: 0
						});
						btn.rw = this;
						btn.addListener("click", ava.ui.RaidingWindow.findAllDungeons);
						subContainer.add(btn);
						this.commandContainer.add(subContainer);
						container.add(this.commandContainer);
						dungeonPage.add(container, {
							edge: "south"
						});
						return dungeonPage;
					},
					GetRaidGain:            function() {
						var atype = this.raidAddType.getSelection()[0].getLabel();
						var mul = 1;
						if(this.ratioMode == "none")
							return 1;
						if(atype == "Max+90%") {
							mul = 1.9;
						} else if(atype == "Max+60%") {
							mul = 1.6;
						} else if(atype == "Max+30%") {
							mul = 1.3;
						} else if(atype == "Max+15%") {
							mul = 1.15;
						} else if(atype == "Max") {
							mul = 1;
						}
						return mul;
					},
					getTotalCarry:          function(dType) {
						var CI = webfrontend.data.City.getInstance();
						var bS = webfrontend.res.Main.getInstance();
						var totalCarry = 0;
						var AvailOrders = CI.getOrderLimit() - this.getAllocatedOrders();
						if(AvailOrders > 0) {
							var delayedOrders = new Object();
							for(var ii = 0; CI.unitOrders != null && ii < CI.unitOrders.length; ++ii) {
								if(CI.unitOrders[ii].isDelayed == true) {
									for(var jj = 0; jj < CI.unitOrders[ii].units.length; ++jj) {
										if(!delayedOrders.hasOwnProperty(CI.unitOrders[ii].units[jj].type)) {
											delayedOrders[CI.unitOrders[ii].units[jj].type] = 0;
										}
										delayedOrders[CI.unitOrders[ii].units[jj].type] += CI.unitOrders[ii].units[jj].count;
									}
								}
							}
							for(var key in CI.units) {
								var carry = bS.units[key].c;
								if(carry > 0 && ((bS.units[key].ls && dType != 2) || (!bS.units[key].ls && dType == 2))) {
									var uinfo = CI.getUnitTypeInfo(key);
									var cnt = uinfo[this.ratioMode] - this.getAllocatedUnits(key);
									if((this.ratioMode != "total") && delayedOrders.hasOwnProperty(key)) {
										cnt -= delayedOrders[parseInt(key)];
									}
									totalCarry = totalCarry + cnt * carry;
								}
							}
						}
						return totalCarry;
					},
					getTotalDefenseCarry:   function(dType) {
						var CI = webfrontend.data.City.getInstance();
						var bS = webfrontend.res.Main.getInstance();
						var totalCarry = 0;
						var AvailOrders = CI.getOrderLimit() - this.getAllocatedOrders();
						if(AvailOrders > 0) {
							var delayedOrders = new Object();
							for(var ii = 0; CI.unitOrders != null && ii < CI.unitOrders.length; ++ii) {
								if(CI.unitOrders[ii].isDelayed == true) {
									for(var jj = 0; jj < CI.unitOrders[ii].units.length; ++jj) {
										if(!delayedOrders.hasOwnProperty(CI.unitOrders[ii].units[jj].type)) {
											delayedOrders[CI.unitOrders[ii].units[jj].type] = 0;
										}
										delayedOrders[CI.unitOrders[ii].units[jj].type] += CI.unitOrders[ii].units[jj].count;
									}
								}
							}
							for(var key in CI.units) {
								if(this.isUnitDefense(key) && key != "4") {
									var carry = bS.units[key].c;
									if(carry > 0 && ((bS.units[key].ls && dType != 2) || (!bS.units[key].ls && dType == 2))) {
										var uinfo = CI.getUnitTypeInfo(key);
										var cnt = uinfo[this.ratioMode] - this.getAllocatedUnits(key);
										if((this.ratioMode != "total") && delayedOrders.hasOwnProperty(key)) {
											cnt -= delayedOrders[parseInt(key)];
										}
										totalCarry = totalCarry + cnt * carry;
									}
								}
							}
						}
						return totalCarry;
					},
					isUnitDefense:          function(type) {
						var retVal = true;
						switch(type) {
							case "1":
							case "2":
							case "3":
							case "4":
							case "5":
							case "8":
							case "9":
							case "10":
							case "13":
							case "14":
							case "15":
							case "16":
							case "19":
							case "77":
								break;
							default:
								retVal = false;
								break;
						}
						return retVal;
					},
					isDefense:              function() {
						var retVal = true;
						for(var key in CI.units) {
							switch(key) {
								case "1":
								case "2":
								case "3":
								case "4":
								case "5":
								case "8":
								case "9":
								case "10":
								case "13":
								case "14":
								case "15":
								case "16":
								case "19":
								case "77":
									break;
								default:
									retVal = false;
									break;
							}
						}
						return retVal;
					},
					getUnitBonus:           function(unitType) {
						var research = webfrontend.data.Tech.getInstance().getBonus("unitDamage", webfrontend.data.Tech.research, Number(unitType));
						var shrine = webfrontend.data.Tech.getInstance().getBonus("unitDamage", webfrontend.data.Tech.shrine, Number(unitType));
						return (research + shrine) / 100;
					},
					getRemainingTs:         function(dType) {
						var CI = webfrontend.data.City.getInstance();
						var bS = webfrontend.res.Main.getInstance();
						var ts = 0;
						var delayedOrders = new Object();
						for(var ii = 0; CI.unitOrders != null && ii < CI.unitOrders.length; ++ii) {
							if(CI.unitOrders[ii].isDelayed == true) {
								for(var jj = 0; jj < CI.unitOrders[ii].units.length; ++jj) {
									if(!delayedOrders.hasOwnProperty(CI.unitOrders[ii].units[jj].type)) {
										delayedOrders[CI.unitOrders[ii].units[jj].type] = 0;
									}
									delayedOrders[CI.unitOrders[ii].units[jj].type] += CI.unitOrders[ii].units[jj].count;
								}
							}
						}
						for(var key in CI.units) {
							var carry = bS.units[key].c;
							if(carry > 0 && ((bS.units[key].ls && dType != 2) || (!bS.units[key].ls && dType == 2))) {
								var uinfo = CI.getUnitTypeInfo(key);
								var cnt = uinfo[this.ratioMode] - this.getAllocatedUnits(key);
								if((this.ratioMode != "total") && delayedOrders.hasOwnProperty(key)) {
									cnt -= delayedOrders[parseInt(key)];
								}
								ts = ts + cnt;
							}
						}
						return ts;
					},
					hasMtnOnly:             function(useResearch, zerkMtnOnly) {
						var retVal = false;
						var hasZerk = false;
						var zerkResearch = 0;
						var hasTemplar = false;
						var hasRanger = false;
						var hasGuardian = false;
						var CI = webfrontend.data.City.getInstance();
						var AvailOrders = CI.getOrderLimit() - this.getAllocatedOrders();
						var seaOnly = this.hasSeaOnly();
						if(AvailOrders > 0 && !seaOnly) {
							retVal = true;
							for(var key in CI.units) {
								switch(key) {
									case "1":
										break;
									case "5":
										// temp
										hasTemplar = true;
										break;
									case "6":
										// berserker
										hasZerk = true;
										zerkResearch = this.getUnitBonus(key);
										break;
									case "3":
										// ranger
										hasRanger = true;

										break;
									case "4":
										// guardian
										hasGuardian = true;
										break;
									case "19":
										break;
									case "15":
									case "16":
									case "17":
										break;
									default:
										retVal = false;
										break;
								}
							}
						}
						if(hasGuardian || hasRanger || hasTemplar) {
							retVal = true;
						} else if(hasZerk) {
							retVal = false;
						}
						return retVal;
					},
					hasForestOnly:          function(useResearch) {
						var retVal = false;
						var CI = webfrontend.data.City.getInstance();
						var AvailOrders = CI.getOrderLimit() - this.getAllocatedOrders();
						var seaOnly = this.hasSeaOnly();
						if(AvailOrders > 0 && !seaOnly) {
							for(var key in CI.units) {
								switch(key) {
									case "1":

									case "8":
										break;
									case "9":
										// xbow
										retVal = true;
										break;
									case "10":
										// paladin
										retVal = true;
										break;
									case "19":
										break;
									case "15":
									case "16":
									case "17":
										break;
									default:
										break;
								}
							}
						}
						return retVal;
					},
					hasCav:                 function() {
						var CI = webfrontend.data.City.getInstance();
						var AvailOrders = CI.getOrderLimit() - this.getAllocatedOrders();
						if(AvailOrders > 0) {
							for(var key in CI.units) {
								switch(key) {
									case "9":

									case "10":

									case "11":
										// Knight
										return true;
										break;
									default:
										break;
								}
							}
						}
						return false;
					},
					hasSeaOnly:             function() {
						var retVal = false;
						var CI = webfrontend.data.City.getInstance();
						var AvailOrders = CI.getOrderLimit() - this.getAllocatedOrders();
						if(AvailOrders > 0) {
							retVal = true;
							for(var key in CI.units) {
								switch(key) {
									case "1":
									case "19":
									case "15":
									case "16":
									case "17":
										break;
									default:
										retVal = false;
										break;
								}
							}
						}
						return retVal;
					},
					hasSeaOffense:          function() {
						var retVal = false;
						var CI = webfrontend.data.City.getInstance();
						var AvailOrders = CI.getOrderLimit() - this.getAllocatedOrders();
						if(AvailOrders > 0) {
							retVal = true;
							for(var key in CI.units) {
								switch(key) {
									case "17":
										retVal |= true;
										break;
									default:
										retVal |= false;
										break;
								}
							}
						}
						return retVal;
					},
					getDungeonArray:        function(filterBadTypes) {
						var bS = webfrontend.res.Main.getInstance();
						paDebug("Get Dungeon Array");
						var rw = ava.ui.RaidingWindow.getInstance();
						rw.getObfuscatedNames();
						var dArray = new Array();
						var CI = webfrontend.data.City.getInstance();
						var bv = CI.getId();
						var cx = bv & 0xFFFF;
						var cy = bv >> 16;
						var mul = rw.GetRaidGain();
						var cityCont = webfrontend.data.Server.getInstance().getContinentFromCoords(cx, cy);
						var mtnOnly = filterBadTypes && rw.hasMtnOnly(false);
						var forestOnly = filterBadTypes && rw.hasForestOnly(false);
						var seaOnly = rw.hasSeaOnly();
						var maxDist = seaOnly ? 70 : (rw.hasCav() ? 30 : 15);
						console.log("mtnonly " + mtnOnly + " foestOnly " + forestOnly + "SeaOnly " + seaOnly);
						var st = webfrontend.data.ServerTime.getInstance().getServerStep() - (21 * 3600);
						for(var cluster in rw.worldData.d) {
							var objectData = rw.safeGetProperty(rw.worldData.d[cluster][rw.objData], "d");
							if(objectData) {
								//  console.log("objdata ");  console.dir(objectData);
								for(var obj in objectData) {
									var o = objectData[obj];
									//console.log("o: "); console.dir(o);
									if(o.Type == 2) {
										//console.log("Dungeon!!!");
										var startStep = o.StartStep;
										var coord = rw.coordsFromCluster(cluster, obj);
										var x = coord & 0xffff;
										var y = coord >> 16;
										var cordCont = webfrontend.data.Server.getInstance().getContinentFromCoords(x, y);
										var cstr = leftPad(x, 3, "0") + ":" + leftPad(y, 3, "0");
										var dist = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy));

										// bias for wood / stone
										dist *= rw.GetDungeonModifier(o.DungeonType);

										var totalCarry = rw.getTotalCarry(o.DungeonType);
										var dpt = rw.dungProgressType(o.DungeonType);
										var dpl = o.DungeonLevel - 1;
										var dpp = o.Progress;

										//  var avg=rw.dungeonProgressData[dpt][dpl][dpp][1].toString();
										var max = rw.dungeonProgressData[dpt][dpl][dpp][0]; //.toString();
										// console.log("test " + startStep + " " + st +" " + dist +" " + maxDist +" " + totalCarry +" " + mul +" " + max );
										if(o.State && (o.Progress > 0 || startStep >= st) && (dist < maxDist) && o.Progress < 80 && max > 0 && (totalCarry / (mul * max) > 0.75)) {
											//  console.log("Good!");

											if(mtnOnly) {
												if(o.DungeonType == 4) {
													dArray.push([o.DungeonType, o.DungeonLevel, o.Progress, cordCont, dist, x, y, coord]);
												}
											} else if(forestOnly) {
												if(o.DungeonType == 5) {
													dArray.push([o.DungeonType, o.DungeonLevel, o.Progress, cordCont, dist, x, y, coord]);
												}
											} else if(seaOnly) {
												if(o.DungeonType == 2) {
													dArray.push([o.DungeonType, o.DungeonLevel, o.Progress, cordCont, dist, x, y, coord]);
												}
											} else {
												dArray.push([o.DungeonType, o.DungeonLevel, o.Progress, cordCont, dist, x, y, coord]);
											}
										}
										// break;
									}
								}
							}
						}
						// sort dungeons by distance
						if(dArray.length > 0) {
							dArray.sort(function(a, b) {
								return Number(a[4]) - Number(b[4]);
							});
						}
						console.log(dArray);
						return dArray;
					},
					findDungeonsI:          function(filterBadTypes) {
						var rw = ava.ui.RaidingWindow.getInstance();
						rw.targetContainer.removeAll();
						rw.updateAvailableUnits();
						// first pass, enumerate and sort
						console.log(rw);
						var dArray = rw.getDungeonArray(filterBadTypes);
						console.log(dArray);
						for(var ii = 0; ii < 16 && ii < dArray.length; ++ii) {
							var found = false;
							var cstr = leftPad(dArray[ii][5], 3, "0") + ":" + leftPad(dArray[ii][6], 3, "0");
							var children = rw.targetContainer.getChildren();
							for(var i = 0; i < children.length; i++) {
								var coords = children[i].getChildren()[3];
								if(coords.getValue() == cstr)
									found = true;
							}
							if(!found) {
								var d = new dung(dArray[ii][0], dArray[ii][1], dArray[ii][2], dArray[ii][7], dArray[ii][4]);
								;
								rw.addDungeonToRaid(d);
							}
						}
					},
					findDungeons:           function() {
						this.findDungeonsI(true);
					},
					findAllDungeons:        function() {
						this.findDungeonsI(false);
					},
					nextIdleRaidCityI:      function(moveView) {
						var table = ava.ui.IdleRaidUnitsTable.getInstance();

						var tm = table.getTableModel();

						if(tm.getRowCount() > table.curRow && tm.getColumnCount() > 0) {
							if(tm.getValue(0, table.curRow) == table.curId) {
								++table.curRow;
								if(tm.getRowCount() <= table.curRow) {
									table.curRow = 0;
								}
							}
							table.curId = tm.getValue(0, table.curRow);
						}
						var x = table.curId & 0xffff;
						var y = table.curId >> 16;
						webfrontend.data.City.getInstance().setRequestId(table.curId);
						if(moveView)
							webfrontend.gui.Util.showMapModeViewPos('r', 0, x, y);
					},
					nextIdleRaidCity:       function() {
						this.nextIdleRaidCityI(true);
					},
					nextIdleRaidCityNoMove: function() {
						this.nextIdleRaidCityI(false);
					},
					setTotalsReadOnly:      function(readOnly) {
						var targets = this.targetContainer.getChildren();
						for(var target = 0; target < targets.length; target++) {
							var raids = targets[target].getChildren()[0].raidcontainer.getChildren();
							for(var raid = 0; raid < raids.length; raid++) {
								var thisRaid = raids[raid];
								var ch = thisRaid.getChildren();
								for(var i = 0; i < ch.length; i++) {
									if(ch[i] instanceof qx.ui.form.TextField) {
										if(ch[i].unitType == null) {
											ch[i].setReadOnly(readOnly);
											ch[i].setEnabled(!readOnly);
										}
									}
								}
							}
						}
					},
					onRaidCountInput:       function(textField) {
						var CI = webfrontend.data.City.getInstance();
						var bS = webfrontend.res.Main.getInstance();
						var unitType = textField.unitType;
						var delayedOrders = new Object();
						for(var ii = 0; CI.unitOrders != null && ii < CI.unitOrders.length; ++ii) {
							if(CI.unitOrders[ii].isDelayed == true) {
								for(var jj = 0; jj < CI.unitOrders[ii].units.length; ++jj) {
									if(!delayedOrders.hasOwnProperty(CI.unitOrders[ii].units[jj].type)) {
										delayedOrders[CI.unitOrders[ii].units[jj].type] = 0;
									}
									delayedOrders[CI.unitOrders[ii].units[jj].type] += CI.unitOrders[ii].units[jj].count;
								}
							}
						}
						if(unitType == null) {
							if(this.ratioMode != "none") {
								// figure out how many units are needed to bring this much loot
								var lootToCarry = Number(textField.getValue());
								var totalCarry = 0;
								var hch = textField.getLayoutParent().getChildren();
								for(var k = 0; k < hch.length; k++) {
									if(hch[k] instanceof qx.ui.form.TextField) {
										if(hch[k].unitType != null) {
											var uinfo = CI.getUnitTypeInfo(hch[k].unitType);
											var cnt = uinfo[this.ratioMode];
											if(this.ratioMode != "total" && delayedOrders.hasOwnProperty(hch[k].unitType)) {
												cnt -= delayedOrders[parseInt(hch[k].unitType)];
											}
											totalCarry = totalCarry + (cnt * bS.units[hch[k].unitType].c);
										}
									}
								}
								for(var k = 0; k < hch.length; k++) {
									if(hch[k] instanceof qx.ui.form.TextField) {
										if(hch[k].unitType != null) {
											var uinfo = CI.getUnitTypeInfo(hch[k].unitType);
											var tcnt = uinfo[this.ratioMode];
											if(this.ratioMode != "total" && delayedOrders.hasOwnProperty(hch[k].unitType)) {
												tcnt -= delayedOrders[parseInt(hch[k].unitType)];
											}
											var cnt = Math.floor((lootToCarry / totalCarry) * tcnt);
											hch[k].setValue(cnt.toString());
										}
									}
								}
							}
						} else {
							// set the other unit types to the same percentage, and then set the total loot field
							var uinfo = CI.getUnitTypeInfo(unitType);
							var cnt = Number(textField.getValue());
							var tcnt = uinfo[this.ratioMode];
							if((this.ratioMode != "total") && delayedOrders.hasOwnProperty(unitType)) {
								tcnt -= delayedOrders[parseInt(unitType)];
							}
							var pct = cnt == 0 ? 0 : cnt / tcnt;
							var lootTotal = cnt * bS.units[unitType].c;
							var hch = textField.getLayoutParent().getChildren();
							for(var k = 0; k < hch.length; k++) {
								if(hch[k] instanceof qx.ui.form.TextField) {
									if(hch[k] != textField) {
										if(hch[k].unitType == null) {
											// set the total
											hch[k].setValue(lootTotal.toString());
										} else {
											uinfo = CI.getUnitTypeInfo(hch[k].unitType);
											if(this.ratioMode == "none") {
												cnt = Number(hch[k].getValue());
											} else {
												cnt = Math.floor(pct * tcnt);
												hch[k].setValue(cnt.toString());
											}
											lootTotal = lootTotal + cnt * bS.units[hch[k].unitType].c;
										}
									}
								}
							}
						}
						this.updateAvailableUnits();
					},

					onAddMaxRaids:         function(addButton) {
						var c = addButton.getLayoutParent();
						var max = Number(c.getChildren()[5].getValue());
						var avg = Number(c.getChildren()[6].getValue());
						var val = 0;
						var mul = this.GetRaidGain();
						val = Math.floor(max * mul);

						return this.addMaxRaids(addButton, max, avg, val, mul);
					},
					onAddMaxRaid:          function(addButton, maxOrders, allowMin, keepAlive) {
						var atype = this.raidAddType.getSelection()[0].getLabel();
						var c = addButton.getLayoutParent();
						var max = Number(c.getChildren()[5].getValue());
						var avg = Number(c.getChildren()[6].getValue());
						var val = 0;
						var mul = 1;
						if(this.ratioMode != "none") {
							if(atype == "Max+90%") {
								mul = 1.9;
							} else if(atype == "Max+60%") {
								mul = 1.6;
							} else if(atype == "Max+30%") {
								mul = 1.3;
							} else if(atype == "Max+15%") {
								mul = 1.15;
							} else if(atype == "Max") {
								mul = 1;
							}
						}
						val = keepAlive ? 30 : Math.floor(max * mul);
						return this.addConserveRaids(addButton, max, avg, val, mul, maxOrders, allowMin);
					},
					onAddRaidButton:       function(addButton) {
						var atype = this.raidAddType.getSelection()[0].getLabel();
						var c = addButton.getLayoutParent();
						var max = Number(c.getChildren()[5].getValue());
						var avg = Number(c.getChildren()[6].getValue());
						var val = 0;
						var mul = 1;
						if(this.ratioMode != "none") {
							if(atype == "Max+90%") {
								mul = 1.9;
							} else if(atype == "Max+60%") {
								mul = 1.6;
							} else if(atype == "Max+30%") {
								mul = 1.3;
							} else if(atype == "Max+15%") {
								mul = 1.15;
							} else if(atype == "Max") {
								mul = 1;
							}
							/*
							 else if( atype == "Mavg" )
							 val = (max + avg)/2;
							 else if( atype == "Avg" )
							 val = avg;
							 */
						}
						val = Math.floor(max * mul);
						if(this.split.getValue()) {
							this.addSplit(addButton, max, avg, val, mul);
						} else {
							this.addRaid(addButton, Math.floor(val));
						}
					},
					addSplit:              function(addButton, max, avg, val, mul) {
						var CI = webfrontend.data.City.getInstance();
						var bS = webfrontend.res.Main.getInstance();
						var totalCarry = 0;
						var AvailOrders = CI.getOrderLimit() - this.getAllocatedOrders();
						if(AvailOrders == 0)
							return;
						var dType = addButton.d.type;
						var delayedOrders = new Object();
						for(var ii = 0; CI.unitOrders != null && ii < CI.unitOrders.length; ++ii) {
							if(CI.unitOrders[ii].isDelayed == true) {
								for(var jj = 0; jj < CI.unitOrders[ii].units.length; ++jj) {
									if(!delayedOrders.hasOwnProperty(CI.unitOrders[ii].units[jj].type)) {
										delayedOrders[CI.unitOrders[ii].units[jj].type] = 0;
									}
									delayedOrders[CI.unitOrders[ii].units[jj].type] += CI.unitOrders[ii].units[jj].count;
								}
							}
						}
						for(var key in CI.units) {
							var carry = bS.units[key].c;
							if(carry > 0 && ((bS.units[key].ls && dType != 2) || (!bS.units[key].ls && dType == 2))) {
								var uinfo = CI.getUnitTypeInfo(key);
								var cnt = uinfo[this.ratioMode] - this.getAllocatedUnits(key);
								if((this.ratioMode != "total") && delayedOrders.hasOwnProperty(key)) {
									cnt -= delayedOrders[parseInt(key)];
								}
								totalCarry = totalCarry + cnt * carry;
							}
						}
						var min = Math.floor(max * (mul - 0.1));
						var orders = totalCarry / val;
						if(orders < 1)
							orders = 1;
						else {
							var iOrders = Math.floor(orders);
							var carryPerOrder = totalCarry / iOrders;
							if(carryPerOrder / val > 1.1 && totalCarry / (iOrders + 1) > min && iOrders + 1 <= AvailOrders)
								orders = iOrders + 1;
							else
								orders = iOrders;
						}
						if(orders > AvailOrders)
							orders = AvailOrders;
						var c = Math.floor(totalCarry / orders);
						for(var i = 0; i < orders; i++)
							this.addRaid(addButton, c);
					},
					addMaxRaids:           function(addButton, max, avg, val, mul) {
						var retVal = 0;
						var CI = webfrontend.data.City.getInstance();
						var bS = webfrontend.res.Main.getInstance();
						var totalCarry = 0;
						var AvailOrders = CI.getOrderLimit() - this.getAllocatedOrders();
						if(AvailOrders == 0)
							return 0;
						var dType = addButton.d.type;
						var delayedOrders = new Object();
						for(var ii = 0; CI.unitOrders != null && ii < CI.unitOrders.length; ++ii) {
							if(CI.unitOrders[ii].isDelayed == true) {
								for(var jj = 0; jj < CI.unitOrders[ii].units.length; ++jj) {
									if(!delayedOrders.hasOwnProperty(CI.unitOrders[ii].units[jj].type)) {
										delayedOrders[CI.unitOrders[ii].units[jj].type] = 0;
									}
									delayedOrders[CI.unitOrders[ii].units[jj].type] += CI.unitOrders[ii].units[jj].count;
								}
							}
						}
						for(var key in CI.units) {
							var carry = bS.units[key].c;
							if(carry > 0 && ((bS.units[key].ls && dType != 2) || (!bS.units[key].ls && dType == 2))) {
								var uinfo = CI.getUnitTypeInfo(key);
								var cnt = uinfo[this.ratioMode] - this.getAllocatedUnits(key);
								if((this.ratioMode != "total") && delayedOrders.hasOwnProperty(key)) {
									cnt -= delayedOrders[parseInt(key)];
								}
								totalCarry = totalCarry + cnt * carry;
							}
						}
						var min = Math.floor(max * (mul - 0.1));
						var orders = totalCarry / val;
						if(orders >= 0.75) {
							if(orders < 1)
								orders = 1;
							var iOrders = Math.floor(orders);
							var carryPerOrder = totalCarry / iOrders;
							var minCarry = totalCarry / (iOrders + 1);
							if(carryPerOrder / val > 1.1 && minCarry > min && iOrders + 1 <= AvailOrders)
								orders = iOrders + 1;
							else {
								orders = iOrders;
							}
						}
						if(orders > 0 && orders <= AvailOrders) {
							var c = Math.floor(totalCarry / orders);
							c = (c / val > 1.1) ? val : c;
							for(var i = 0; i < orders; i++) {
								++retVal;
								this.addRaid(addButton, c);
							}
						}
						return retVal;
					},
					addConserveRaids:      function(addButton, max, avg, val, mul, maxOrders, allowMin) {
						var retVal = 0;
						var CI = webfrontend.data.City.getInstance();
						var bS = webfrontend.res.Main.getInstance();
						var totalCarry = 0;
						var AvailOrders = CI.getOrderLimit() - this.getAllocatedOrders();
						if(AvailOrders == 0)
							return 0;
						if(maxOrders > AvailOrders) {
							maxOrders = AvailOrders;
						}
						var dType = addButton.d.type;
						var delayedOrders = new Object();
						for(var ii = 0; CI.unitOrders != null && ii < CI.unitOrders.length; ++ii) {
							if(CI.unitOrders[ii].isDelayed == true) {
								for(var jj = 0; jj < CI.unitOrders[ii].units.length; ++jj) {
									if(!delayedOrders.hasOwnProperty(CI.unitOrders[ii].units[jj].type)) {
										delayedOrders[CI.unitOrders[ii].units[jj].type] = 0;
									}
									delayedOrders[CI.unitOrders[ii].units[jj].type] += CI.unitOrders[ii].units[jj].count;
								}
							}
						}
						for(var key in CI.units) {
							var carry = bS.units[key].c;
							if(carry > 0 && ((bS.units[key].ls && dType != 2) || (!bS.units[key].ls && dType == 2))) {
								var uinfo = CI.getUnitTypeInfo(key);
								var cnt = uinfo[this.ratioMode] - this.getAllocatedUnits(key);
								if((this.ratioMode != "total") && delayedOrders.hasOwnProperty(key)) {
									cnt -= delayedOrders[parseInt(key)];
								}
								totalCarry = totalCarry + cnt * carry;
							}
						}
						var orders = Math.floor(totalCarry / val);
						if(orders < 1 && allowMin) {
							orders = 1;
						}
						if(orders > maxOrders) {
							orders = maxOrders;
						}
						if((orders >= 1) && (orders <= AvailOrders)) {
							var c = Math.floor(totalCarry / orders);
							c = (c >= val) ? val : ((allowMin && c >= Math.floor(val * 0.6)) ? c : 0);
							if(c > 50000) {
								for(var i = 0; i < orders; i++) {
									++retVal;
									this.addRaid(addButton, c);
								}
							}
						}
						return retVal;
					},
					addRaid:               function(addButton, value) {
						var rc = addButton.raidcontainer;
						var bS = webfrontend.res.Main.getInstance();
						var CI = webfrontend.data.City.getInstance();
						var uk = [];
						var dType = addButton.d.type;
						for(var key in CI.units) {
							if(bS.units[key].c > 0 && ((bS.units[key].ls && dType != 2) || (!bS.units[key].ls && dType == 2))) {
								uk[uk.length] = key;
							}
						}
						if(uk.length == 0)
							return;
						var c = new qx.ui.container.Composite();
						c.setLayout(new qx.ui.layout.HBox().set({
							spacing: 5
						}));
						console.log("Sory by unuts");

						uk.sort(function(a, b) {
							return bS.units[a].y - bS.units[b].y;
						});
						for(var i = 0; i < uk.length; i++) {
							var key = uk[i];
							var img = new qx.ui.basic.Image("webfrontend/" + bS.imageFiles[bS.units[key].simg]);
							img.setAlignY("middle");
							c.add(img);
							var tf = new qx.ui.form.TextField("").set({
								paddingTop:    0,
								paddingBottom: 0
							});
							tf.setWidth(50);
							tf.unitType = key;
							tf.setAlignY("middle");
							tf.setTextAlign("right");
							tf.rw = this;
							tf.addListener("input", function() {
								this.rw.onRaidCountInput(this);
							});
							tf.addListener("click", function() {
								this.selectAllText();
							});
							c.add(tf);
							c.add(new qx.ui.core.Spacer().set({
								width: 10
							}));
						}
						c.add(new qx.ui.core.Spacer().set({
							width: 30
						}));
						var tf = new qx.ui.form.TextField(value.toString()).set({
							paddingTop:    0,
							paddingBottom: 0
						});
						tf.setWidth(60);
						tf.unitType = null;
						tf.setAlignY("middle");
						tf.setTextAlign("right");
						tf.rw = this;
						tf.addListener("input", function() {
							this.onRaidCountInput();
						});
						tf.addListener("click", function() {
							this.selectAllText();
						});
						if(this.ratioMode == "none") {
							tf.setReadOnly(true);
							tf.setEnabled(false);
						}
						c.add(tf);
						var btn = new qx.ui.form.Button("X").set({
							paddingLeft:   5,
							paddingRight:  5,
							paddingTop:    0,
							paddingBottom: 0,
							alignY:        "middle"
						});
						btn.rw = this;
						btn.addListener("click", function() {
							this.getLayoutParent().destroy();
							this.rw.updateAvailableUnits();
						});
						c.add(btn);
						rc.add(c);
						this.onRaidCountInput(tf);
					},
					updateDungeonRaidInfo: function(dcoord) {
						var x = dcoord & 0xFFFF;
						var y = dcoord >> 16;
						var cstr = leftPad(x, 3, "0") + ":" + leftPad(y, 3, "0");
						var children = this.targetContainer.getChildren();
						for(var i = 0; i < children.length; i++) {
							var coords = children[i].getChildren()[3];
							if(coords.getValue() == cstr) {
								if(this.dungeonLootInfo.hasOwnProperty(dcoord)) {
									var di = this.dungeonLootInfo[dcoord];
									children = children[i].getChildren();
									children[5].setValue(di.mx);
									children[6].setValue(di.l);
								}
								break;
							}
						}
					},
					/*
					 */
					createHMSTextField:    function(visibility, tabIndex) {
						var tf = new qx.ui.form.TextField("0").set({
							width:      25,
							visibility: visibility,
							alignY:     "middle",
							tabIndex:   tabIndex
						});
						tf.addListener("click", function() {
							this.selectAllText();
						});
						return tf;
					},
					getAllocatedUnits:     function(unitType) {
						var c = this.targetContainer;
						var ch = c.getChildren();
						var total = 0;
						for(var i = 0; i < ch.length; i++) {
							var addButton = ch[i].getChildren()[0];
							var rch = addButton.raidcontainer.getChildren();
							for(var j = 0; j < rch.length; j++) {
								var hch = rch[j].getChildren();
								for(var k = 0; k < hch.length; k++) {
									if(hch[k] instanceof qx.ui.form.TextField) {
										if(hch[k].unitType == unitType) {
											total += Number(hch[k].getValue());
										}
									}
								}
							}
						}
						return total;
					},
					getAllocatedOrders:    function() {
						var c = this.targetContainer;
						var ch = c.getChildren();
						var total = 0;
						for(var i = 0; i < ch.length; i++) {
							var addButton = ch[i].getChildren()[0];
							var rch = addButton.raidcontainer.getChildren();
							for(var j = 0; j < rch.length; j++) {
								var hch = rch[j].getChildren();
								for(var k = 0; k < hch.length; k++) {
									if(hch[k] instanceof qx.ui.form.TextField) {
										if(Number(hch[k].getValue()) > 0) {
											total++;
											break;
										}
									}
								}
							}
						}
						var CI = webfrontend.data.City.getInstance();
						if(CI.getUnitOrders())
							total += CI.getUnitOrders().length;
						return total;
					},
					pickAndSendRaids:      function() {
						var raidMode = this.raidMode;
						if(raidMode == 0) {
							this.sendRaids(); // manual
						} else {
							//  raidMode == 1, AvaRaid
							this.targetContainer.removeAll();
							var CI = webfrontend.data.City.getInstance();
							var AvailOrders = CI.getOrderLimit() - this.getAllocatedOrders();
							var dArray = this.getDungeonArray(true);
							var cnt = 0;
							var numRaids = 0;
							while(dArray.length > 0 && AvailOrders > 0) {
								cnt = 0;
								for(ii = 0; ii < dArray.length && cnt == 0; ++ii) {

									var d = new dung(dArray[ii][0], dArray[ii][1], dArray[ii][2], dArray[ii][7], dArray[ii][4]);
									;
									var btn = this.addDungeonToRaid(d);
									if(btn != null) {
										cnt += this.onAddMaxRaids(btn);
										AvailOrders -= cnt;
										numRaids += cnt;
										if(this.AvaRaidMode > 1)
											this.addRaidError("Raid [reps:" + cnt + "; ");
										console.dir(d);
									}
								}
								if(cnt <= 0 || AvailOrders <= 0)
									break;
								dArray = this.getDungeonArray(true);
							}
							if(numRaids > 0) {
								this.sendRaids();
							}
						}
					},

					autoRaidPleaseToggle:   function() {
						// manual mode
						if(this.AvaRaidMode == 0) {
							this.pickAndSendRaids();
							return;
						}

						// save settings here in cast we crash or browser closes
						localStorage.setItem("mm__wantStone", this.wantStone.getValue());
						localStorage.setItem("mm__wantWood", this.wantWood.getValue());

						var isAutoRaid = this.AvaRaidMode > 1;
						if(!isAutoRaid) {
							this.raidMode = true; // thurn it on
						} else {
							this.raidMode = !this.raidMode;

							console.log("AutoRaid " + this.raidMode + "--" + this.AvaRaidMode + "--");
						}

						if((this.raidMode == 1) || (!isAutoRaid)) {
							if(isAutoRaid) {
								this.autoRaidButton.setTextColor("Green");

								this.lastMouseMoveTime = webfrontend.Util.getCurrentTime().getTime();

								this.addRaidError("Please do not leave your computer unattended.  Do not get coffee.  Do not go to the bathroom.  You must sit throught this or you are cheating.\n");
							}
							this.autoRaidPlease();
						} else {
							// request stop
							// we enabled again once the stop has actually executed.
							// this.autoRaidButton.setEnabled(false);
							this.autoRaidButton.setTextColor("red");

							this.addRaidError(" Waiting for the raid threads to exit.\n\nWhen done you can turn AvaRaid back on for more raiding goodness. :) ");
						}
					},
					// this gets called every coupld of seconds when AvaRaid is on and permiscuous more is on
					autoRaidPlease:         function() {
						var AvaRaidMode = this.AvaRaidMode;
						var raidMode = this.raidMode;
						var isAutoRaid = AvaRaidMode > 1;

						if(raidMode == 1) {
							var now = webfrontend.Util.getCurrentTime().getTime();
							var lastTime = this.lastMouseMoveTime;

							var timeTillAvaRaidUpdate = (AvaRaidMode == 2) ? 1 * 3 * 1000 : ((AvaRaidMode == 3) ? 5 * 60 * 1000 : -1);
							var timeElapsed = now - lastTime;
							var timeLeft = (timeTillAvaRaidUpdate - timeElapsed) / 1000.0;
							var sTimeLeft = timeLeft;

							if((timeLeft < 0) || (!isAutoRaid)) {
								if(isAutoRaid) {
									this.addRaidError("Player seems to be sleeping.\nTime to send the troops out to play.");
								}
								this.pickAndSendRaids();
								this.nextIdleRaidCity();
							} else {
								this.addRaidError("Player has been idle for long.  Waiting " + sTimeLeft + "more seconds");
								// addRaidError("Idle .. " + sTimeLeft  );
							}
						}

						var timeTillMoveCheck = (AvaRaidMode == 2) ? 5 * 1000 : 60 * 1000;

						if(isAutoRaid && raidMode)
							window.setTimeout(this.autoRaidPlease.bind(this), timeTillMoveCheck);
						else
							this.raidMode = 0;

						if(this.raidMode != 1) {
							// This means that we have recieved a request to terminate
							this.autoRaidButton.setTextColor("Yellow");
							this.autoRaidButton.setEnabled(true);
							return;
						}
					},
					sendRaids:              function() {
						// clearRaidErrorWindow();
						console.log("Sending raids");
						var rw = ava.ui.RaidingWindow.getInstance();
						var CI = webfrontend.data.City.getInstance();
						var sendTime = 0;
						var sendContainer = rw.commandContainer.getChildren()[0];
						var sendMode = sendContainer.getChildren()[0].getSelection()[0].getModel();
						var staggerMin = rw.departOptions.getSelection()[0].getModel();
						if(sendMode != webfrontend.gui.SendArmyWindow.timings.now) {
							if(sendMode == 100) {
								sendMode = webfrontend.gui.SendArmyWindow.timings.depart;
								sendTime = rw.getDelay5sOffsetTime();
							} else {
								sendTime = rw.getOffsetTime(sendContainer.getChildren()[6].getSelection()[0].getModel(), Number(sendContainer.getChildren()[1].getValue()), Number(sendContainer.getChildren()[3].getValue()), Number(sendContainer.getChildren()[5].getValue()));
							}
						}
						if(staggerMin > 0 && sendMode == webfrontend.gui.SendArmyWindow.timings.now) {
							sendMode = webfrontend.gui.SendArmyWindow.timings.depart;
							sendTime = rw.getDelay5sOffsetTime();
						}

						//sendTime = ava.CombatTools.convertGameTimeToUtc(sendTime);
						var returnTime = 0;
						var returnContainer = rw.commandContainer.getChildren()[1];
						var returnMode = returnContainer.getChildren()[0].getSelection()[0].getModel();
						if(returnMode == 7 || returnMode == 8 || (returnMode + webfrontend.gui.SendArmyWindow.timings.once) == webfrontend.gui.SendArmyWindow.timings.latest) {
							if(returnMode == 7) {
								returnMode = webfrontend.gui.SendArmyWindow.timings.latest - webfrontend.gui.SendArmyWindow.timings.once;
								returnTime = rw.getDelay72HrOffsetTime();
							} else if(returnMode == 8) {
								returnMode = webfrontend.gui.SendArmyWindow.timings.latest - webfrontend.gui.SendArmyWindow.timings.once;
								returnTime = rw.getDelay24HrOffsetTime();
							} else {
								returnTime = rw.getOffsetTime(returnContainer.getChildren()[6].getSelection()[0].getModel(), Number(returnContainer.getChildren()[1].getValue()), Number(returnContainer.getChildren()[3].getValue()), Number(returnContainer.getChildren()[5].getValue()));
							}
						}

						var targets = rw.targetContainer.getChildren();
						console.log(targets);
						var tmpSendTime = sendTime;
						for(var target = 0; target < targets.length; target++) {
							var raids = targets[target].getChildren()[0].raidcontainer.getChildren();
							for(var raid = 0; raid < raids.length; raid++) {
								var units = [];
								var thisRaid = raids[raid];
								var ch = thisRaid.getChildren();
								for(var i = 0; i < ch.length; i++) {
									if(ch[i] instanceof qx.ui.form.TextField) {
										if(ch[i].unitType && Number(ch[i].getValue()) > 0) {
											units.push({
												t: ch[i].unitType,
												c: Number(ch[i].getValue())
											});
										}
									}
								}

								var updateManager = webfrontend.net.UpdateManager.getInstance();
								sendTime = tmpSendTime + (raid * staggerMin * 60000);
								var data = {
									cityid:                     CI.getId(),
									units:                      units,
									targetPlayer:               "",
									targetCity:                 targets[target].getChildren()[3].getValue(),
									order:                      8,
									transport:                  1,
									createCity:                 "",
									timeReferenceType:          sendMode,
									referenceTimeUTCMillis:     sendTime,
									raidTimeReferenceType:      returnMode,
									raidReferenceTimeUTCMillis: returnTime,
									iUnitOrderOptions:          0,
									iOrderCountRaid:            1
								};

								//rw.OrderData = data;
								webfrontend.net.CommandManager.getInstance().sendCommand("OrderUnits", data, rw, rw.onRaidSent, thisRaid);
							}
						}
					},
					clearRaidErrorWindow:   function() {
						if(ava.ui.RaidingWindow.getInstance().raidErrorWin) {
							ava.ui.RaidingWindow.getInstance().raidErrorWin.lbl.setValue("");
						}
					},
					showRaidErrorWindow:    function() {
						if(ava.ui.RaidingWindow.getInstance().raidErrorWin == null || ava.ui.RaidingWindow.getInstance().raidErrorWin.lbl == null) {
							var win = new qx.ui.window.Window("Raid Status");
							win.setLayout(new qx.ui.layout.Grow());
							win.set({
								showMaximize:  false,
								showMinimize:  false,
								allowMaximize: false,
								width:         300,
								height:        200
							});

							var container = new qx.ui.container.Scroll();

							win.lbl = new qx.ui.basic.Label("").set({
								rich: true
							});

							container.add(win.lbl);
							win.add(container);

							win.addListener("close", function() {
								ava.ui.RaidingWindow.getInstance().raidErrorWin = null;
							}, this);

							//this.a.desktop.add( win );
							win.center();
							win.open();
							ava.ui.RaidingWindow.getInstance().raidErrorWin = win;
						}
					},
					addRaidError:           function(msg) {
						ava.ui.RaidingWindow.getInstance().showRaidErrorWindow();
						if(ava.ui.RaidingWindow.getInstance().raidErrorWin)
							ava.ui.RaidingWindow.getInstance().raidErrorWin.lbl.setValue(msg + "<br><br>" + ava.ui.RaidingWindow.getInstance().raidErrorWin.lbl.getValue());
					},
					onRaidSent:             function(comm, result, v) {
						if(!comm || result == null) {
							this.addRaidError("Comm failed");
						} else if(result.r0 == 0 && result.r1 == 0) {
							v.destroy();
						} else {
							switch(result.r0) {
								case 0:
									logEntry = "Successful raid sent";
									break;
								case (1 << 2):
									logEntry = "Not enough units.";
									break;
								case (1 << 6):
									logEntry = "Not enough command slots.";
									break;
								case (1 << 22):
									logEntry = "Delayed order in the past";
									break;
								case 2097152:
									logEntry = "War minister is not appointed.";
									break;
								default:
									logEntry = "Unknown Error: " + result.r0;
									break;
							}
							this.addRaidError(logEntry);
						}
					},
					getOffsetTime:          function(dayOffset, hours, mins, secs) {
						var curTime = webfrontend.Util.getCurrentTime();
						var hourOffset = 0;
						if(webfrontend.config.Config.getInstance().getTimeZone() > 0) {
							//curTime.setHours(curTime.getHours() + curTime.getTimezoneOffset() / 60);
							hourOffset += curTime.getTimezoneOffset() / 60;
							if(webfrontend.config.Config.getInstance().getTimeZone() == 1)
								hourOffset += webfrontend.data.ServerTime.getInstance().getServerOffset() / 1000 / 60 / 60;
							else if(webfrontend.config.Config.getInstance().getTimeZone() == 2)
								hourOffset += webfrontend.config.Config.getInstance().getTimeZoneOffset() / 1000 / 60 / 60;
						}
						var hI = new Date(curTime.getTime());
						hI.setDate(hI.getDate() + dayOffset);
						hI.setHours(hours - hourOffset);
						hI.setMinutes(mins);
						hI.setSeconds(secs);
						hI.setMilliseconds(500);
						if(webfrontend.config.Config.getInstance().getTimeZone() == 0)
							hI = new Date(hI.getTime() - webfrontend.data.ServerTime.getInstance().getDiff());
						return hI.getTime();
					},
					getDelay72HrOffsetTime: function() {
						var curTime = webfrontend.Util.getCurrentTime();
						var hourOffset = 0;
						if(webfrontend.config.Config.getInstance().getTimeZone() > 0) {
							//curTime.setHours(curTime.getHours() + curTime.getTimezoneOffset() / 60);
							hourOffset += curTime.getTimezoneOffset() / 60;
							if(webfrontend.config.Config.getInstance().getTimeZone() == 1)
								hourOffset += webfrontend.data.ServerTime.getInstance().getServerOffset() / 1000 / 60 / 60;
							else if(webfrontend.config.Config.getInstance().getTimeZone() == 2)
								hourOffset += webfrontend.config.Config.getInstance().getTimeZoneOffset() / 1000 / 60 / 60;
						}
						var hI = new Date(curTime.getTime());
						hI.setDate(hI.getDate() + 3);
						hI.setHours(hI.getHours() - hourOffset);
						hI.setSeconds(hI.getSeconds());
						hI.setMilliseconds(500);
						if(webfrontend.config.Config.getInstance().getTimeZone() == 0)
							hI = new Date(hI.getTime() - webfrontend.data.ServerTime.getInstance().getDiff());
						return hI.getTime();
					},
					getDelay24HrOffsetTime: function() {
						// FIXME, merge with getDelay72HrOffsetTime
						var curTime = webfrontend.Util.getCurrentTime();
						var hourOffset = 0;
						if(webfrontend.config.Config.getInstance().getTimeZone() > 0) {
							hourOffset += curTime.getTimezoneOffset() / 60;
							if(webfrontend.config.Config.getInstance().getTimeZone() == 1)
								hourOffset += webfrontend.data.ServerTime.getInstance().getServerOffset() / 1000 / 60 / 60;
							else if(webfrontend.config.Config.getInstance().getTimeZone() == 2)
								hourOffset += webfrontend.config.Config.getInstance().getTimeZoneOffset() / 1000 / 60 / 60;
						}
						var hI = new Date(curTime.getTime());
						hI.setDate(hI.getDate() + 1);
						hI.setHours(hI.getHours() - hourOffset);
						hI.setSeconds(hI.getSeconds());
						hI.setMilliseconds(500);
						if(webfrontend.config.Config.getInstance().getTimeZone() == 0)
							hI = new Date(hI.getTime() - webfrontend.data.ServerTime.getInstance().getDiff());
						return hI.getTime();
					},
					getDelayWithOffsetTime: function(hours, minutes, seconds) {
						var curTime = webfrontend.Util.getCurrentTime();
						var hourOffset = 0;
						if(webfrontend.config.Config.getInstance().getTimeZone() > 0) {
							//curTime.setHours(curTime.getHours() + curTime.getTimezoneOffset() / 60);
							hourOffset += curTime.getTimezoneOffset() / 60;
							if(webfrontend.config.Config.getInstance().getTimeZone() == 1)
								hourOffset += webfrontend.data.ServerTime.getInstance().getServerOffset() / 1000 / 60 / 60;
							else if(webfrontend.config.Config.getInstance().getTimeZone() == 2)
								hourOffset += webfrontend.config.Config.getInstance().getTimeZoneOffset() / 1000 / 60 / 60;
						}
						var hI = new Date(curTime.getTime());
						hI.setDate(hI.getDate());
						hI.setHours(hI.getHours() + hours - hourOffset);
						hI.setMinutes(hI.getMinutes() + minutes);
						hI.setSeconds(hI.getSeconds() + seconds + 5);
						hI.setMilliseconds(500);
						if(webfrontend.config.Config.getInstance().getTimeZone() == 0)
							hI = new Date(hI.getTime() - webfrontend.data.ServerTime.getInstance().getDiff());
						return hI.getTime();
					},
					getDelay5sOffsetTime:   function() {
						var curTime = webfrontend.Util.getCurrentTime();
						var hourOffset = 0;
						if(webfrontend.config.Config.getInstance().getTimeZone() > 0) {
							//curTime.setHours(curTime.getHours() + curTime.getTimezoneOffset() / 60);
							hourOffset += curTime.getTimezoneOffset() / 60;
							if(webfrontend.config.Config.getInstance().getTimeZone() == 1)
								hourOffset += webfrontend.data.ServerTime.getInstance().getServerOffset() / 1000 / 60 / 60;
							else if(webfrontend.config.Config.getInstance().getTimeZone() == 2)
								hourOffset += webfrontend.config.Config.getInstance().getTimeZoneOffset() / 1000 / 60 / 60;
						}
						var hI = new Date(curTime.getTime());
						hI.setDate(hI.getDate());
						hI.setHours(hI.getHours() - hourOffset);
						hI.setSeconds(hI.getSeconds() + 5);
						hI.setMilliseconds(500);
						if(webfrontend.config.Config.getInstance().getTimeZone() == 0)
							hI = new Date(hI.getTime() - webfrontend.data.ServerTime.getInstance().getDiff());
						return hI.getTime();
					},
					getDelay8sOffsetTime:   function() {
						var curTime = webfrontend.Util.getCurrentTime();
						var hourOffset = 0;
						if(webfrontend.config.Config.getInstance().getTimeZone() > 0) {
							//curTime.setHours(curTime.getHours() + curTime.getTimezoneOffset() / 60);
							hourOffset += curTime.getTimezoneOffset() / 60;
							if(webfrontend.config.Config.getInstance().getTimeZone() == 1)
								hourOffset += webfrontend.data.ServerTime.getInstance().getServerOffset() / 1000 / 60 / 60;
							else if(webfrontend.config.Config.getInstance().getTimeZone() == 2)
								hourOffset += webfrontend.config.Config.getInstance().getTimeZoneOffset() / 1000 / 60 / 60;
						}
						var hI = new Date(curTime.getTime());
						hI.setDate(hI.getDate());
						hI.setHours(hI.getHours() - hourOffset);
						hI.setSeconds(hI.getSeconds() + 8);
						hI.setMilliseconds(500);
						if(webfrontend.config.Config.getInstance().getTimeZone() == 0)
							hI = new Date(hI.getTime() - webfrontend.data.ServerTime.getInstance().getDiff());
						return hI.getTime();
					},
					updateAvailableUnits:   function() {
						console.log("here1");
						;
						var rw = ava.ui.RaidingWindow.getInstance();
						console.log("here2");
						;
						var departNow = (rw.commandContainer.getChildren()[0].getChildren()[0].getSelection()[0].getLabel() == "Now");
						var okToSend = true;
						var haveOrders = false;
						var CI = webfrontend.data.City.getInstance();
						var delayedOrders = new Object();
						for(var ii = 0; CI.unitOrders != null && ii < CI.unitOrders.length; ++ii) {
							if(CI.unitOrders[ii].isDelayed == true) {
								for(var jj = 0; jj < CI.unitOrders[ii].units.length; ++jj) {
									if(!delayedOrders.hasOwnProperty(CI.unitOrders[ii].units[jj].type)) {
										delayedOrders[CI.unitOrders[ii].units[jj].type] = 0;
									}
									delayedOrders[CI.unitOrders[ii].units[jj].type] += CI.unitOrders[ii].units[jj].count;
								}
							}
						}
						var pvpContainer = rw.pvpTroopContainer;
						console.log("here2");
						pvpContainer.removeAll();
						var img = new qx.ui.basic.Image("webfrontend/ui/icons/icon_command_slots.png");
						img.setWidth(16);
						img.setHeight(16);
						img.setScale(true);
						img.setAlignY("middle");
						pvpContainer.add(img);
						var orders = rw.getAllocatedOrders();
						if(orders > 0)
							haveOrders = true;
						var lbl = new qx.ui.basic.Label((CI.getOrderLimit() - orders).toString() + "/" + CI.getOrderLimit());
						lbl.setRich(true);
						lbl.setAlignY("middle");
						if(orders > CI.getOrderLimit()) {
							lbl.setTextColor("red");
							okToSend = false;
						}
						pvpContainer.add(lbl);
						pvpContainer.add(new qx.ui.core.Spacer().set({
							width: 10
						}));
						var bS = webfrontend.res.Main.getInstance();
						var uk = [];
						var totalTS = 0;
						for(var key in CI.units) {
							if(bS.units[key].c > 0) {
								uk[uk.length] = key;
							}
						}
						console.log("helllo sort");

						uk.sort(function(a, b) {
							return bS.units[a].y - bS.units[b].y;
						});
						for(var i = 0; i < uk.length; i++) {
							var key = uk[i];
							var img = new qx.ui.basic.Image("webfrontend/" + bS.imageFiles[bS.units[key].mimg]);
							img.setWidth(24);
							img.setHeight(24);
							img.setScale(true);
							img.setAlignY("middle");
							pvpContainer.add(img);
							var uinfo = CI.getUnitTypeInfo(key);
							var cnt = uinfo.count - rw.getAllocatedUnits(key);
							if(delayedOrders.hasOwnProperty(key)) {
								cnt -= delayedOrders[parseInt(key)];
							}
							var lbl = new qx.ui.basic.Label(cnt + " / " + uinfo.total);
							lbl.setRich(true);
							lbl.setAlignY("middle");
							if(cnt < 0) {
								lbl.setTextColor("red");
								if(departNow)
									okToSend = false;
							}
							totalTS += cnt * bS.units[key].uc;
							pvpContainer.add(lbl);
						}
						console.log(uk.length);

						if(uk.length == 0) {
							var lbl = new qx.ui.basic.Label("No Available Units");
							lbl.setRich(true);
							lbl.setAppearance("textheader_sub1");
							pvpContainer.add(lbl);
						}
						var container = rw.troopContainer;
						container.removeAll();
						var CI = webfrontend.data.City.getInstance();
						var img = new qx.ui.basic.Image("webfrontend/ui/icons/icon_command_slots.png");
						img.setWidth(16);
						img.setHeight(16);
						img.setScale(true);
						img.setAlignY("middle");
						container.add(img);
						var orders = rw.getAllocatedOrders();
						if(orders > 0)
							haveOrders = true;
						var lbl = new qx.ui.basic.Label((CI.getOrderLimit() - orders).toString() + "/" + CI.getOrderLimit());
						lbl.setRich(true);
						lbl.setAlignY("middle");
						if(orders > CI.getOrderLimit()) {
							lbl.setTextColor("red");
							okToSend = false;
						}
						container.add(lbl);
						container.add(new qx.ui.core.Spacer().set({
							width: 10
						}));
						var bS = webfrontend.res.Main.getInstance();
						var uk = [];
						var totalTS = 0;
						for(var key in CI.units) {
							if(bS.units[key].c > 0) {
								uk[uk.length] = key;
							}
						}
						console.log("helllo by unuts");

						uk.sort(function(a, b) {
							return bS.units[a].y - bS.units[b].y;
						});
						for(var i = 0; i < uk.length; i++) {
							var key = uk[i];
							var img = new qx.ui.basic.Image("webfrontend/" + bS.imageFiles[bS.units[key].mimg]);
							img.setWidth(24);
							img.setHeight(24);
							img.setScale(true);
							img.setAlignY("middle");
							container.add(img);
							var uinfo = CI.getUnitTypeInfo(key);
							var cnt = uinfo.count - rw.getAllocatedUnits(key);
							if(delayedOrders.hasOwnProperty(key)) {
								cnt -= delayedOrders[parseInt(key)];
							}
							var lbl = new qx.ui.basic.Label(cnt + " / " + uinfo.total);
							lbl.setRich(true);
							lbl.setAlignY("middle");
							if(cnt < 0) {
								lbl.setTextColor("red");
								if(departNow)
									okToSend = false;
							}
							totalTS += cnt * bS.units[key].uc;
							container.add(lbl);
						}
						if(uk.length == 0) {
							var lbl = new qx.ui.basic.Label("No Available Units");
							lbl.setRich(true);
							lbl.setAppearance("textheader_sub1");
							container.add(lbl);
						}
						console.log("done!");

						var btn = this.commandContainer.getChildren()[0].getChildren()[10];
					},
					updateDungeonRaidCity:  function() {
						var CI = webfrontend.data.City.getInstance();
						var bv = CI.getId();
						var cx = bv & 0xFFFF;
						var cy = bv >> 16;
						this.setCaption(CI.getName() + "  " + webfrontend.gui.Util.formatCityCoordsFromId(CI.getId(), true));
						this.targetContainer.removeAll();
						this.updateAvailableUnits();
					},
					clearPvpCities:         function() {
						var tm = this.pvpTable.getTableModel();
						tm.removeRows(0, tm.getRowCount());
					},
					onCityChange:           function() {
						this.updateDungeonRaidCity();
						this.updateBossRaidCity();

						//this.clearPvpCities();
						this.fillBossList();
						this.findDungeons();
					}
				}
			});
			;

			function refreshItems() {
				var dialog = ava.ui.PalaceItemsWindow.getInstance();
				dialog.fillItemRow();
			}

			function waitForItem() {
				window.setTimeout(refreshItems, 1500);
			}

			qx.Class.define("ava.ui.PalaceItemsWindow", {
				type:      "singleton",
				extend:    qx.ui.window.Window,
				construct: function() {
					console.debug("Palace Construct");
					this.base(arguments, 'Use Palace Items');


					// Refresh info every time
					this.addListener("appear", this.fillItemRow, this);
				},
				members:   {
					_returnTime:            null,
					palaceItemMessageLabel: null,
					palaceItemRow:          null,
					buildUI:                function() {
						var app = qx.core.Init.getApplication();
						this.setLayout(new qx.ui.layout.VBox(2));
						this.set({
							allowMaximize:  false,
							allowMinimize:  false,
							showMaximize:   false,
							showMinimize:   false,
							showStatusbar:  false,
							showClose:      false,
							contentPadding: 5,
							useMoveFrame:   true,
							resizable:      false
						});
						this.setWidth(350);
						webfrontend.gui.Util.formatWinClose(this);
						var wcLabel = new qx.ui.basic.Label("Select the city then click the item to apply");
						wcLabel.set({
							font: "bold"
						});
						this.add(wcLabel);
						this.palaceItemRow = new qx.ui.container.Composite();
						this.palaceItemRow.setLayout(new qx.ui.layout.HBox());
						this.add(this.palaceItemRow);
						var row = new qx.ui.container.Composite();
						row.setLayout(new qx.ui.layout.HBox());
						this.palaceItemMessageLabel = new qx.ui.basic.Label("");
						this.palaceItemMessageLabel.set({
							minWidth:    30,
							allowGrowX:  true,
							font:        "bold",
							textColor:   "red",
							toolTipText: " "
						});
						row.add(this.palaceItemMessageLabel);
						this.add(row);
						var row = new qx.ui.container.Composite();
						row.setLayout(new qx.ui.layout.HBox());

						// Close button
						var closeButton = new qx.ui.form.Button("Close");
						closeButton.addListener("execute", this.hide, this);
						row.add(closeButton);
						this.add(row);
					},
					fillItemRow:            function() {
						this.palaceItemRow.removeAll();
						this.palaceItemMessageLabel.setValue("");
						var i = webfrontend.data.Inventory.getInstance();
						var bS = webfrontend.res.Main.getInstance();
						var itemCount = 0;
						var title = webfrontend.data.Player.getInstance().getTitle();
						for(var ii = 178; ii < 188; ++ii) {
							var itemUseable = false;
							switch(ii) {
								case 178:
								case 183:
									itemUseable = title >= 10;
									break;
								case 179:
								case 184:
									itemUseable = title >= 9;
									break;
								case 180:
								case 185:
									itemUseable = title >= 8;
									break;
								case 181:
								case 186:
									itemUseable = title >= 7;
									break;
								case 182:
								case 187:
									itemUseable = title >= 6;
									break;
							}
							if(i.hasItem(ii) && itemUseable) {
								++itemCount;
								var inv = i.getInventorySorted();
								var num = 0;
								for(var ix = 0; ix < inv.length; ++ix) {
									if(inv[ix].id == ii) {
										num = inv[ix].count;
										break;
									}
								}
								var itemImg = new qx.ui.basic.Image("webfrontend/" + bS.imageFiles[bS.items[ii].i]);
								itemImg.itemId = String(ii);
								itemImg.thisObj = this;
								itemImg.set({
									padding:     5,
									toolTipText: "You own " + String(num) + " artifact" + (num > 1 ? "s" : "") + " <br/>" + bS.items[ii].dn + "<br/>" + bS.items[ii].sds
								});
								itemImg.setWidth(40);
								itemImg.setHeight(40);
								itemImg.setScale(true);
								this.palaceItemRow.add(itemImg);
								itemImg.addListener("click", this.useItem, this);
							}
						}
						if(itemCount == 0) {
							this.palaceItemMessageLabel.setValue("No useable palace items found");
						}
						/*
						 178 - Valorite Arch
						 179 - Verite Arch
						 180 - Platinum Arch
						 181 - Golden Arch
						 182 - Silver Arch
						 183 - Valorite Pillar
						 184 - Verite Pillar
						 185 - Platinum Pillar
						 186 - Golden Pillar
						 187 - Silver Pillar
						 */
					},
					useItem:                function(e) {
						var currentTarget = e.getCurrentTarget();
						var itemId = currentTarget.itemId;
						var app = qx.core.Init.getApplication();
						var selectedCity = (app.cityDetailView || app.getCityDetailView()).city;
						var myAllianceName = webfrontend.data.Alliance.getInstance().getName().toLowerCase();
						if(!selectedCity || !selectedCity.get_IsEnlighted()) {
							this.palaceItemMessageLabel.setValue("Select an enlightened city");
							return;
						}
						if(selectedCity.get_AllianceName().iCompare(myAllianceName)) {
							this.palaceItemMessageLabel.setValue("Enlightend city must belong to " + myAllianceName);
							return;
						}
						var i = webfrontend.data.Inventory.getInstance();
						if(!i.hasItem(itemId)) {
							this.palaceItemMessageLabel.setValue("You do not own the item selected");
							return;
						}
						var bS = webfrontend.res.Main.getInstance();
						var coords = selectedCity.get_Coordinates();
						this.palaceItemMessageLabel.setValue("Please wait, using 1 " + bS.items[itemId].dn);
						var commandManager = webfrontend.net.CommandManager.getInstance();
						commandManager.sendCommand("UseItem", {
							"itemid": itemId,
							"amount": 1,
							"target": [
								{
									"t": bS.items[itemId].tt,
									"i": coords
								}
							]
						}, currentTarget.thisObj, waitForItem);
					}
				}
			});
			qx.Class.define("ava.ui.AllianceMailingListWindow", {
				type:      "singleton",
				extend:    qx.ui.window.Window,
				construct: function(cityAllianceName, cityAllianceID) {
					this.base(arguments, 'Mailing Lists');
					this.buildUI();

					// Refresh info every time
					this.addListener("appear", this.getAllianceMailingLists, this);
				},
				members:   {
					_wcText:                 null,
					_lists:                  null,
					_continents:             null,
					_count:                  0,
					buildUI:                 function() {
						var app = qx.core.Init.getApplication();
						this.setLayout(new qx.ui.layout.VBox(10));
						this.set({
							allowMaximize:  false,
							allowMinimize:  false,
							showMaximize:   false,
							showMinimize:   false,
							showStatusbar:  false,
							showClose:      false,
							contentPadding: 5,
							useMoveFrame:   true,
							resizable:      true
						});
						this.setWidth(400);
						webfrontend.gui.Util.formatWinClose(this);
						var wcLabel = new qx.ui.basic.Label("Alliance Mailing Lists").set({
							font: "bold"
						});
						this.add(wcLabel);
						this._wcText = new qx.ui.form.TextArea();
						this._wcText.set({
							readOnly:   true,
							allowGrowY: false,
							autoSize:   false,
							tabIndex:   303,
							height:     280
						});
						app.setElementModalInput(this._wcText);
						this._wcText.setValue("Loading...");
						this.add(this._wcText);

						// Close button
						var closeButton = new qx.ui.form.Button("Close");
						closeButton.addListener("execute", this.hide, this);
						this.add(closeButton);
					},
					getAllianceMailingLists: function() {
						var allianceID = webfrontend.data.Alliance.getInstance().getId();
						this._count = 0;

						// Send command
						var commandManager = webfrontend.net.CommandManager.getInstance();
						commandManager.sendCommand("GetPublicAllianceMemberList", {
							id: allianceID
						}, this, this.gotAlliancePlayers);
					},
					gotAlliancePlayers:      function(ok, response) {
						if(ok) {
							this._lists = new Array();
							this._continents = new Array();
							var commandManager = webfrontend.net.CommandManager.getInstance();
							this._count = response.length;
							for(var ii = 0; ii < response.length; ++ii) {
								commandManager.sendCommand("GetPublicPlayerInfo", {
									id: response[ii].i
								}, this, this.gotPlayerInfo);
							}
						}
					},
					gotPlayerInfo:           function(ok, response) {
						--this._count;
						if(ok) {
							var server = webfrontend.data.Server.getInstance();
							var str = this._wcText.getValue();
							var cities = response.c;
							for(var ii = 0; ii < cities.length; ++ii) {
								var continent = server.getContinentFromCoords(cities[ii].x, cities[ii].y);
								var found = false;
								for(var a = 0; a < this._continents.length; ++a) {
									if(this._continents[a] == continent) {
										found = true;
										break;
									}
								}
								if(!found) {
									this._continents[this._continents.length] = continent;
								}
								if(!this._lists[continent]) {
									this._lists[continent] = "";
								}
								if(this._lists[continent].indexOf(response.n) < 0) {
									this._lists[continent] += (this._lists[continent].length > 0 ? ";" : "") + response.n;
								}
							}
							if(this._count == 0) {
								var str = "";
								this._wcText.setValue(str);
								for(var ii = 0; ii < this._continents.length; ++ii) {
									this._wcText.setValue(this._wcText.getValue() + "Continent " + this._continents[ii] + "\r\n" + this._lists[this._continents[ii]] + "\r\n\r\n");
								}
							}
						}
					}
				}
			});
			qx.Class.define("ava.ui.ReturnByWindow", {
				type:      "singleton",
				extend:    qx.ui.window.Window,
				construct: function() {
					this.base(arguments, 'Return raids by');
					this.buildUI();
					// Refresh info every time
					//this.addListener("appear", this.returnRaidsBy, this);
				},
				members:   {
					_returnTime:         null,
					buildUI:             function() {
						var app = qx.core.Init.getApplication();
						this.setLayout(new qx.ui.layout.VBox(2));
						this.set({
							allowMaximize:  false,
							allowMinimize:  false,
							showMaximize:   false,
							showMinimize:   false,
							showStatusbar:  false,
							showClose:      false,
							contentPadding: 5,
							useMoveFrame:   true,
							resizable:      false
						});
						this.setWidth(200);
						webfrontend.gui.Util.formatWinClose(this);
						var wcLabel = new qx.ui.basic.Label("Return all raids by:").set({
							font: "bold"
						});
						this.add(wcLabel);
						this._returnTime = new ava.ui.components.TimePicker("Return time:");
						this.add(this._returnTime);
						var firstRow = new qx.ui.container.Composite();
						firstRow.setLayout(new qx.ui.layout.HBox());
						this.add(firstRow);

						// Apply button
						var applyButton = new qx.ui.form.Button("Apply");
						applyButton.addListener("execute", this.returnRaidsBy, this);
						firstRow.add(applyButton);

						// Apply button
						var applyAllButton = new qx.ui.form.Button("Apply to all");
						applyAllButton.set({
							marginLeft:  5,
							marginRight: 5,
							toolTipText: "Apply all raids in current city group."
						});
						var _this = this;
						applyAllButton.addListener("execute", (function() {
							addConsumer("COMO", _this.returnAllRaidsBy, _this, "a");
						}), this);
						firstRow.add(applyAllButton);

						// Close button
						var closeButton = new qx.ui.form.Button("Close");
						closeButton.addListener("execute", this.hide, this);
						firstRow.add(closeButton);
					},
					sendReturnOrder:     function(request) {
						// Send command
						var commandManager = webfrontend.net.CommandManager.getInstance();
						commandManager.sendCommand("UnitOrderSetRecurringOptions", request, null, function(unknown, ok) {
						});
					},
					returnOrder:         function(request, delay) {
						var _this = this;
						setTimeout(function() {

							_this.sendReturnOrder(request);

						}, delay);
					},
					hasCity:             function(cityList, cityId) {
						var retVal = false;
						for(elem in cityList) {
							if(cityId == elem) {
								retVal = true;
								break;
							}
						}
						return retVal;
					},
					showContinueMessage: function(msgText, sendingMsgText, requestArray, thisObj) {
						var win = new qx.ui.window.Window("Continue?");
						win.setLayout(new qx.ui.layout.VBox(2));
						win.set({
							showMaximize:  false,
							showMinimize:  false,
							allowMaximize: false,
							width:         400,
							height:        80
						});

						win.lbl = new qx.ui.basic.Label(msgText).set({
							rich: true
						});

						win.add(win.lbl);
						var row = new qx.ui.container.Composite(new qx.ui.layout.HBox(2));
						win.add(row);
						var btn = new qx.ui.form.Button("Yes").set({
							appearance:    "button-text-small",
							width:         80,
							paddingLeft:   5,
							paddingRight:  5,
							paddingTop:    0,
							paddingBottom: 0
						});
						btn.win = win;
						btn.requestArray = requestArray;
						row.add(btn);
						btn.addListener("click", function() {
							ava.Chat.getInstance().addChatMessage(sendingMsgText, false);
							var requests = this.requestArray;
							var delay = 500;
							for(var i = 0; i < requests.length; i++) {
								thisObj.returnOrder(JSON.parse(requests[i]), delay);
								delay += 1000;
							}
							this.win.hide();
						});
						var btn2 = new qx.ui.form.Button("No").set({
							appearance:    "button-text-small",
							width:         80,
							paddingLeft:   5,
							paddingRight:  5,
							paddingTop:    0,
							paddingBottom: 0
						});
						btn2.win = win;
						row.add(btn2);
						btn2.addListener("click", function() {
							this.win.hide();
						});
						win.addListener("close", function() {
						}, this);
						win.center();
						win.open();
					},
					returnAllRaidsBy:    function(results, thisObj) {
						if(results == null)
							return;
						removeConsumer("COMO", thisObj.returnAllRaidsBy, thisObj);
						var combatTools = ava.CombatTools;
						var returnBy = thisObj._returnTime.getValue().getTime();
						var rb = new Date(returnBy);
						var app = qx.core.Init.getApplication();
						returnBy = rb.getTime();
						var st = webfrontend.data.ServerTime.getInstance();
						var serverStep = st.getServerStep();
						var gn = webfrontend.Util.getCurrentTime();
						var gameNow = gn.getTime();
						var delta = Math.floor((returnBy - gameNow) / 1000) + 1;
						returnBy = serverStep + delta;
						var player = webfrontend.data.Player.getInstance();
						var cityList = player.cities;
						var cids;
						var groupId = app.cityBar.citiesSelect.getSelectedGroupId();
						for(var ii = 0; ii < player.citygroups.length; ++ii) {
							if(player.citygroups[ii].i == groupId) {
								cids = player.citygroups[ii].c;
								break;
							}
						}
						if(!cids) {
							cids = new Array();
							for(elem in cityList) {
								cids.push(Number(elem));
							}
						}
						var count = 0;
						var requestArray = new Array();
						for(var i = 0; i < results.length; i++) {
							var result = results[i];
							if(result.hasOwnProperty("c") && cids.indexOf(result.i) >= 0 && (cityList.length == 0 || thisObj.hasCity(cityList, result.i))) {
								for(var j = 0; j < result.c.length; j++) {
									var order = result.c[j];
									if(order.t == ava.CombatTools.RAID_ORDER_ID) {
										++count;
										var request = '{"cityid":' + result.i + ', "id":' + order.i + ', "isDelayed":' + (order.s == 0) + ', "recurringType": 2, "recurringEndStep": ' + (returnBy) + '}';
										requestArray.push(request);
									}
								}
							}
						}
						if(count > 0) {
							var steps = count;
							var hr = steps / 3600;
							var remHr = parseInt(hr);
							var min = (steps - (remHr * 3600)) / 60;
							var remMin = parseInt(min);
							var sec = (steps - (remHr * 3600) - (remMin * 60));
							var remSec = parseInt(sec);
							var remainingTime = checkTime(remHr) + ":" + checkTime(remMin) + ":" + checkTime(remSec);
							thisObj.showContinueMessage('Are you sure? ' + count + ' orders will be sent.  This will take approximately ' + remainingTime + '.', ' Sending ' + count + ' orders.  This will take approximately ' + remainingTime + '.', requestArray, thisObj);
						} else {
							ava.Chat.getInstance().addChatMessage(' No raids found.', false);
						}
						thisObj.hide();
					},
					returnRaidsBy:       function() {
						var combatTools = ava.CombatTools;
						var returnBy = this._returnTime.getValue().getTime();
						var rb = new Date(returnBy);
						var app = qx.core.Init.getApplication();
						var groupId = app.cityBar.citiesSelect.getSelectedGroupId();
						returnBy = rb.getTime();
						var st = webfrontend.data.ServerTime.getInstance();
						var serverStep = st.getServerStep();
						var gn = webfrontend.Util.getCurrentTime();
						var gameNow = gn.getTime();
						var delta = Math.floor((returnBy - gameNow) / 1000) + 1;
						returnBy = serverStep + delta;
						var currRecurrType = 2;
						var orders = webfrontend.data.City.getInstance().unitOrders;
						for(var i in orders) {
							if(orders[i].type == ava.CombatTools.RAID_ORDER_ID) {
								webfrontend.net.CommandManager.getInstance().sendCommand("UnitOrderSetRecurringOptions", {
									cityid:           webfrontend.data.City.getInstance().getId(),
									id:               orders[i].id,
									isDelayed:        orders[i].isDelayed,
									recurringType:    currRecurrType,
									recurringEndStep: (returnBy)
								}, null, function() {
								});
							}
						}
						this.hide();
					}
				}
			});

			function formatDate(tme) {
				var serverTime = webfrontend.data.ServerTime.getInstance();
				var dte = new Date();
				dte.setTime(tme);
				var serverDiff = webfrontend.data.ServerTime.getInstance().getDiff();
				var timeZoneOffset = webfrontend.config.Config.getInstance().getTimeZoneOffset();
				var serverOffset = webfrontend.data.ServerTime.getInstance().getServerOffset();
				var localOffset = -new Date().getTimezoneOffset() * 60000;

				// Its in minutes
				dte.setTime(dte.getTime() + serverOffset - localOffset);
				var h = dte.getHours();
				var m = dte.getMinutes();
				var s = dte.getSeconds();
				h = checkTime(h);
				m = checkTime(m);
				s = checkTime(s);
				return dte.getFullYear() + '/' + (dte.getMonth() + 1) + '/' + dte.getDate() + ' ' + h + ':' + m + ':' + s;
			}

			function convertCoordinatesToId(x, y) {
				var id = parseInt(x, 10) | (parseInt(y, 10) << 16);
				return id;
			}

			function convertIdToCoordinatesObject(id) {
				var x = (id & 0xFFFF);
				var y = (id >> 16);

				return {
					xPos: x,
					yPos: y,
					cont: webfrontend.data.Server.getInstance().getContinentFromCoords(x, y)
				};
			}

			function leftPad(num, minsize, padstring) {
				var str = num.toString();
				while(str.length < minsize)
					str = padstring + str;
				return str;
			}

			function unitShortName(unitType) {
				switch(unitType) {
					case 3:
						return "Rng";
					case 4:
						return "Grd";
					case 5:
						return "Tmp";
					case 6:
						return "Zrk";
					case 7:
						return "Mge";
					case 9:
						return "Xbw";
					case 10:
						return "Pal";
					case 11:
						return "Knt";
					case 12:
						return "Lck";
					case 15:
						return "Frg";
					case 16:
						return "Slp";
					case 17:
						return "WG";
				}
				return webfrontend.res.Main.getInstance().units[unitType].dn;
			}

			function dungShortName(dungType) {
				switch(dungType) {
					case 2:
						return "Sea";
					case 3:
						return "Hil";
					case 4:
						return "Mtn";
					case 5:
						return "For";
				}
				return "Unk";
			}

			function dungName(dungType) {
				switch(dungType) {
					case 2:
						return "Sea";
					case 3:
						return "Hill";
					case 4:
						return "Mountain";
					case 5:
						return "Forest";
				}
				return "Unknown";
			}

			function dungProgressType(dungType) {
				switch(dungType) {
					case 4:
						return 1;
				}
				return 0;
				// use the forest progress
			}

			function bossName(bossType) {
				switch(bossType) {
					case 6:
						return "Dragon";
					case 7:
						return "Moloch";
					case 8:
						return "Hydra";
					case 12:
						return "Octopus";
				}
				return "Unknown";
			}

			function getBossType(bossName) {
				switch(bossName) {
					case "Dragon":
						return 6;
					case "Moloch":
						return 7;
					case "Hydra":
						return 8;
					case "Octopus":
						return 12;
				}
				return 0;
			}

			function bossUnitType(bossType, bossLevel) {
				var ut = null;
				switch(bossType) {
					case 6:
						// dragon
						ut = [33, 36, 39, 42, 45, 48, 49, 50, 51, 52];
						break;
					case 8:
						// hydra
						ut = [34, 37, 40, 43, 46, 53, 54, 55, 56, 57];
						break;
					case 7:
						// moloch
						ut = [35, 38, 41, 44, 47, 58, 59, 60, 61, 62];
						break;
					case 12:
						// octopus
						ut = [67, 68, 69, 70, 71, 72, 73, 74, 75, 76];
						break;
				}
				return ut[parseInt(bossLevel) - 1];
			}

			var shrineNames = ["Inactive", "Compassion", "Honesty", "Honor", "Humility", "Justice", "Sacrifice", "Spirituality", "Valor"];

			function convertIdToCoordinates(id) {
				var o = convertIdToCoordinatesObject(id);
				return o.xPos + ":" + o.yPos;
			}

			var playerIds = null;
			var cityIds = null;
			var cityArray = null;
			var reportIds = null;
			var playerIx = 0;
			var cityIx = 0;
			var reportIx = 0;
			var wcTextBox = null;
			var wcTextBox1 = null;
			var wcpTextBox = null;
			var numDays = null;
			var myAllianceName = null;
			var commandManager = null;
			var server = null;
			var dNow = new Date();

			function gotOwnPlayerReportHeader(ok, response) {
				if(ok) {
					for(var ii = 0; ii < response.length; ++ii) {
						var serverOffset = webfrontend.data.ServerTime.getInstance().getServerOffset();
						var localOffset = -new Date().getTimezoneOffset() * 60000;
						var rDate = new Date();
						rDate.setTime(Number(response[ii].d) + serverOffset - localOffset);
						var dif = (rDate.getTime() - dNow.getTime()) / 1000;
						if(dif > 0) {
							var rId = response[ii].i;
							reportIds[reportIds.length] = String(rId);
						}
					}
				}
				sendOwnReportCommands();
			}

			function getPlayerOwnReports() {
				var serverOffset = webfrontend.data.ServerTime.getInstance().getServerOffset();
				var localOffset = -new Date().getTimezoneOffset() * 60000;
				dNow.setTime((new Date()).getTime() + serverOffset - localOffset);
				dNow.setHours(0);
				dNow.setMinutes(0);
				dNow.setSeconds(0);
				dNow.setDate(dNow.getDate() - Number(numDays));
				wcpTextBox.setValue('scan own reports');
				commandManager.sendCommand("ReportGetHeader", {
					sPlayerName: webfrontend.data.Player.getInstance().getName(),
					folder:      0,
					city:        -1,
					start:       0,
					end:         100,
					sort:        1,
					ascending:   false,
					mask:        200703
				}, this, gotOwnPlayerReportHeader);
			}

			function getPlayerOwnReportCities() {
				if(cityIds.length > cityIx) {
					wcpTextBox.setValue('retrieve cityId[' + cityIds[cityIx] + ']');
					commandManager.sendCommand("GetPublicCityInfo", {
						id: cityIds[cityIx++]
					}, this, gotPlayerOwnCityInfo);
					window.setTimeout(getPlayerOwnReportCities, 1000);
				} else {
					wcpTextBox.setValue('Done.');
				}
			}

			function gotPlayerOwnCityInfo(ok, response) {
				if(ok) {
					var w = new RegExp("##" + convertCoordinatesToId(response.x, response.y) + "ll##", "g");
					var s = new RegExp("##" + convertCoordinatesToId(response.x, response.y) + "hc##", "g");
					wcTextBox.setValue(wcTextBox.getValue().replace(w, (response.w == "0" ? "true" : "false")));
					wcTextBox.setValue(wcTextBox.getValue().replace(s, (response.s == "0" ? "false" : "true")));
					wcTextBox1.setValue(wcTextBox1.getValue().replace(w, (response.w == "0" ? "onWater" : "landlocked")));
					wcTextBox1.setValue(wcTextBox1.getValue().replace(s, (response.s == "0" ? "noCastle" : "hasCastle")));
					w = new RegExp("##0ll##", "g");
					s = new RegExp("##0hc##", "g");
					wcTextBox.setValue(wcTextBox.getValue().replace(w, "MISSING CITY"));
					wcTextBox.setValue(wcTextBox.getValue().replace(s, "MISSING CITY"));
					wcTextBox1.setValue(wcTextBox1.getValue().replace(w, "MISSING CITY"));
					wcTextBox1.setValue(wcTextBox1.getValue().replace(s, "MISSING CITY"));
				}
			}

			function sendOwnReportCommands() {
				if(reportIds.length > reportIx) {
					wcpTextBox.setValue('retrieve reportId[' + reportIds[reportIx] + ']');
					commandManager.sendCommand("GetReport", {
						id: reportIds[reportIx++]
					}, this, gotOwnPlayerReport);
					window.setTimeout(sendOwnReportCommands, 1000);
				} else {
					getPlayerOwnReportCities();
				}
			}

			function gotOwnPlayerReport(ok, response) {
				if(ok && response.s) {
					wcpTextBox.setValue('got report [' + formatDate(response.h.d) + '] ');
					var str = wcTextBox.getValue();
					var str1 = wcTextBox1.getValue();
					if(response.a[1] && response.a[1].c) {
						cityIds[cityIds.length] = String(response.a[1].c[0].i);
						var troops = "";
						var fortifications = "";
						var buildings = " ";
						for(var ii = 0; ii < response.s.length; ++ii) {
							switch(String(response.s[ii].t)) {
								case "15":
									if(!buildings.indexOf(" CG ") >= 0) {
										buildings += "CG ";
									}
									break;
								case "16":
									if(!buildings.indexOf(" TG ") >= 0) {
										buildings += "TG ";
									}
									break;
								case "17":
									if(!buildings.indexOf(" ST ") >= 0) {
										buildings += "ST ";
									}
									break;
								case "18":
									if(!buildings.indexOf(" WS ") >= 0) {
										buildings += "WS ";
									}
									break;
								case "19":
									if(!buildings.indexOf(" SY ") >= 0) {
										buildings += "SY ";
									}
									break;
								case "36":
									if(!buildings.indexOf(" MT ") >= 0) {
										buildings += "MT ";
									}
									break;
								case "37":
									if(!buildings.indexOf(" TT ") >= 0) {
										buildings += "TT ";
									}
									break;
								case "38":
									if(!fortifications.indexOf(" L ") >= 0) {
										fortifications += "L ";
									}
									break;
								case "39":
									if(!fortifications.indexOf(" BT ") >= 0) {
										fortifications += "BT ";
									}
									break;
								case "40":
									if(!fortifications.indexOf(" GT ") >= 0) {
										fortifications += "GT ";
									}
									break;
								case "41":
									if(!fortifications.indexOf(" RT ") >= 0) {
										fortifications += "RT ";
									}
									break;
								case "42":
									if(!fortifications.indexOf(" TP ") >= 0) {
										fortifications += "TP ";
									}
									break;
								case "43":
									if(!fortifications.indexOf(" PF ") >= 0) {
										fortifications += "PF ";
									}
									break;
								case "44":
									if(!buildings.indexOf(" BR ") >= 0) {
										buildings += "BR ";
									}
									break;
								case "45":
									if(!fortifications.indexOf(" AT ") >= 0) {
										fortifications += "AT ";
									}
									break;
								case "46":
									if(!fortifications.indexOf(" CT ") >= 0) {
										fortifications += "CT ";
									}
									break;
								default:
									break;
							}
						}
						for(var ii = 0; ii < response.a[1].u.length; ++ii) {
							switch(String(response.a[1].u[ii].t)) {
								case "1":
									troops += "CG ";
									break;
								case "2":
									troops += "BL ";
									break;
								case "3":
									troops += "RG ";
									break;
								case "4":
									troops += "GD ";
									break;
								case "5":
									troops += "TP ";
									break;
								case "6":
									troops += "ZK ";
									break;
								case "7":
									troops += "MG ";
									break;
								case "8":
									troops += "SC ";
									break;
								case "9":
									troops += "XB ";
									break;
								case "10":
									troops += "PL ";
									break;
								case "11":
									troops += "KN ";
									break;
								case "12":
									troops += "WL ";
									break;
								case "13":
									troops += "RM ";
									break;
								case "14":
									troops += "CT ";
									break;
								case "15":
									troops += "FR ";
									break;
								case "16":
									troops += "SL ";
									break;
								case "17":
									troops += "WG ";
									break;
								case "19":
									troops += "BA ";
									break;
								default:
									break;
							}
						}
						var tmpStr = formatDate(response.h.d) + "," + convertIdToCoordinates(response.a[1].c[0].i) + "," + buildings + "," + fortifications + "," + troops + "," + formatReportId(response.sid);
						wcTextBox.setValue(str.substring(0, str.length - 1) + (str.length > 2 ? "," : "") + "{\"cityId\":" + response.a[1].c[0].i + ",\"name\":\"" + response.a[1].c[0].n + "\",\"isLandlocked\":" + ("##" + response.a[1].c[0].i + "ll##") + ",\"hasCastle\":" + ("##" + response.a[1].c[0].i + "hc##") + ",\"owner\":\"" + response.a[1].pn + "\",\"description\":\"" + tmpStr + "\",\"lastModified\":" + response.h.d + ",\"modifiedBy\":\"Serpent Isle\"}]");
						wcTextBox1.setValue(str1 + "\r\n" + tmpStr.replace(/,/g, "\t") + "\t" + ("##" + response.a[1].c[0].i + "ll##") + "\t" + ("##" + response.a[1].c[0].i + "hc##"));
					}
				}
			}

			qx.Class.define("ava.ui.PlayerReportsWindow", {
				type:      "singleton",
				extend:    qx.ui.window.Window,
				construct: function() {
					this.base(arguments, 'Scouting Reports');
					this.buildUI();
				},
				members:   {
					_wcpText:         null,
					_wcText:          null,
					_wcText1:         null,
					cityArray:        null,
					buildUI:          function() {
						var app = qx.core.Init.getApplication();
						this.setLayout(new qx.ui.layout.VBox(10));
						this.set({
							allowMaximize:  false,
							allowMinimize:  false,
							showMaximize:   false,
							showMinimize:   false,
							showStatusbar:  false,
							showClose:      false,
							contentPadding: 5,
							useMoveFrame:   true,
							resizable:      true
						});
						this.setWidth(400);
						webfrontend.gui.Util.formatWinClose(this);
						var wcLabel = new qx.ui.basic.Label("Scouting Reports").set({
							font: "bold"
						});
						this.add(wcLabel);
						this._wcpText = new qx.ui.form.TextArea();
						this._wcpText.set({
							readOnly:   true,
							allowGrowY: false,
							autoSize:   false,
							tabIndex:   302,
							height:     30
						});
						app.setElementModalInput(this._wcpText);
						this._wcpText.setValue("");
						this.add(this._wcpText);
						wcpTextBox = this._wcpText;
						wcLabel = new qx.ui.basic.Label("BOS Tools Intelligence Format").set({
							font: "bold"
						});
						this.add(wcLabel);
						this._wcText = new qx.ui.form.TextArea();
						this._wcText.set({
							readOnly:   true,
							allowGrowY: false,
							autoSize:   false,
							tabIndex:   303,
							height:     150
						});
						app.setElementModalInput(this._wcText);
						this._wcText.setValue("");
						this.add(this._wcText);
						wcTextBox = this._wcText;
						wcLabel = new qx.ui.basic.Label("Ava Format").set({
							font: "bold"
						});
						this.add(wcLabel);
						this._wcText1 = new qx.ui.form.TextArea();
						this._wcText1.set({
							readOnly:   true,
							allowGrowY: false,
							autoSize:   false,
							tabIndex:   303,
							height:     150
						});
						app.setElementModalInput(this._wcText1);
						this._wcText1.setValue("");
						this.add(this._wcText1);
						wcTextBox1 = this._wcText1;
						var row = new qx.ui.container.Composite(new qx.ui.layout.HBox(2));
						var label = new qx.ui.basic.Label("Number of days to get");
						label.set({
							font: "bold"
						});
						row.add(label, {
							left: 13,
							top:  8
						});
						this._numDays = new qx.ui.form.TextField();
						this._numDays.set({
							toolTipText: "Number of days to get"
						});
						app.setElementModalInput(this._numDays);
						this._numDays.setValue("1");
						row.add(this._numDays);
						numDays = "1";
						this._numDays.addListener("changeValue", this.setNumDays, this);

						// go button
						var goButton = new qx.ui.form.Button("Go");
						goButton.addListener("execute", this.getplayerReports, this);
						row.add(goButton);

						// Close button
						var closeButton = new qx.ui.form.Button("Close");
						closeButton.addListener("execute", this.hide, this);
						row.add(closeButton);
						this.add(row);
						myAllianceName = webfrontend.data.Alliance.getInstance().getName().toLowerCase();
					},
					setNumDays:       function(e) {
						numDays = this._numDays.getValue();
					},
					getplayerReports: function() {
						playerGetRange = new Array();
						this.cityArray = new Array();
						server = webfrontend.data.Server.getInstance();
						playerIds = new Array();
						cityIds = new Array();
						cities = new Array();
						cityArray = new Array();
						reportIds = new Array();
						playerIx = 0;
						reportIx = 0;
						cityIx = 0;
						reportIx = 0;
						reportIds = new Array();
						commandManager = webfrontend.net.CommandManager.getInstance();
						this._wcText.setValue("[]");
						this._wcText1.setValue("");
						getPlayerOwnReports();
					}
				}
			});
			qx.Class.define("ava.CombatTools", {
				type:    "static",
				statics: {
					DO_NOT_ATTACK_UNITS:     {
						"1": true
					},
					DO_NOT_PLUNDER_UNITS:    {
						"77": true,
						"13": true,
						"14": true,
						"2":  true
					},
					SCOUT_ORDER_ID:          1,
					PLUNDER_ORDER_ID:        2,
					ATTACK_ORDER_ID:         3,
					SUPPORT_ORDER_ID:        4,
					SIEGE_ORDER_ID:          5,
					RAID_ORDER_ID:           8,
					NOW_TIMING_ID:           1,
					DEPATATURE_TIMING_ID:    2,
					ARRIVAL_TIMING_ID:       3,
					ORDER_CANCEL_PERIOD_S:   600,
					DEFAULT_MIN_TS:          3000,
					/**
					 * Units in format {type,name,ts,kind,transport,off,forceSiege}, where
					 *
					 * ts - space one unit takes
					 * kind - l=land, s=siege, t=transport, w=ship, c=scout, b=baron
					 * off - attack type - i=infantry, c=cAvalry, m=magic, s=siege, d=demolish
					 * forceSiege - this unit is always supposed to siege (never assault or plunder)
					 */
					UNITS:                   {
						CITY_GUARD: {
							type:      "1",
							name:      "City Guard",
							ts:        0,
							kind:      "g",
							defensive: true
						},
						BALLISTA:   {
							type:      "2",
							name:      "Ballista",
							ts:        10,
							kind:      "s",
							defensive: true
						},
						RANGER:     {
							type:      "3",
							name:      "Ranger",
							ts:        1,
							kind:      "l",
							off:       "i",
							defensive: true
						},
						GUARDIAN:   {
							type:      "4",
							name:      "Guardian",
							ts:        1,
							kind:      "l",
							off:       "i",
							defensive: true
						},
						TEMPLAR:    {
							type:      "5",
							name:      "Templar",
							ts:        1,
							kind:      "l",
							off:       "i",
							defensive: true
						},
						BERSEKER:   {
							type:      "6",
							name:      "Berseker",
							ts:        1,
							kind:      "l",
							off:       "i",
							defensive: false
						},
						MAGE:       {
							type:      "7",
							name:      "Mage",
							ts:        1,
							kind:      "l",
							off:       "m",
							defensive: false
						},
						SCOUT:      {
							type:      "8",
							name:      "Scout",
							ts:        2,
							kind:      "c",
							off:       "c",
							defensive: false
						},
						XBOW:       {
							type:      "9",
							name:      "Crossbow",
							ts:        2,
							kind:      "l",
							off:       "c",
							defensive: true
						},
						PALADIN:    {
							type:      "10",
							name:      "Paladin",
							ts:        2,
							kind:      "l",
							off:       "c",
							defensive: true
						},
						KNIGHT:     {
							type:      "11",
							name:      "Knight",
							ts:        2,
							kind:      "l",
							off:       "c",
							defensive: false
						},
						WARLOCK:    {
							type:      "12",
							name:      "Warlock",
							ts:        2,
							kind:      "l",
							off:       "m",
							defensive: false
						},
						RAM:        {
							type:       "13",
							name:       "Ram",
							ts:         10,
							kind:       "s",
							off:        "s",
							forceSiege: true,
							defensive:  false
						},
						CATAPULT:   {
							type:       "14",
							name:       "Catapult",
							ts:         10,
							kind:       "s",
							off:        "d",
							forceSiege: true,
							defensive:  false
						},
						FRIGATE:    {
							type:      "15",
							name:      "Frigate",
							ts:        100,
							kind:      "t",
							transport: 500,
							off:       "s",
							defensive: false
						},
						SLOOP:      {
							type:      "16",
							name:      "Sloop",
							ts:        100,
							kind:      "w",
							off:       "s",
							defensive: true
						},
						GALLEON:    {
							type:       "17",
							name:       "War Galleon",
							ts:         400,
							kind:       "w",
							off:        "d",
							forceSiege: true,
							defensive:  false
						},
						BARON:      {
							type:       "19",
							name:       "Baron",
							ts:         1,
							kind:       "b",
							off:        "d",
							forceSiege: true,
							defensive:  false
						},
						DRAGON:     {
							type:       "77",
							name:       "dragon",
							ts:         10000,
							kind:       "l",
							off:        "c",
							forceSiege: false,
							defensive:  false
						}
					},
					_unitsByType:            null,
					/**
					 * Regex to remove all BB code tags from text.
					 *
					 * @param str String to clean.
					 */
					removeBBcode:            function(str) {
						return str.replace(/\[\/?\w+\]/g, "");
					},
					/**
					 * Normalizes format of coordinations to xxx:yyy form.
					 *
					 * @param value Coords in x:y format, may be wrapped in BB code.
					 * @return String in xxx:yyy format.
					 */
					normalizeCoords:         function(value) {
						if(value == null)
							return null;

						// Remove potential BB code
						value = this.removeBBcode(value).trim();

						// Parse value
						var m = value.match(/^(\d{1,3}):(\d{1,3})$/);
						if(m == null)
							return null;

						// Pad zeroes
						var x = m[1],
							y = m[2];
						return qx.lang.String.pad(x, 3, "0") + ":" + qx.lang.String.pad(y, 3, "0");
					},
					/**
					 * Parses the coordinates in format xxx:yyy.
					 *
					 * @param value Coordinates in string.
					 * @return [x, y]
					 */
					parseCoords:             function(value) {
						var m = value.match(/^0*(\d{1,3}):0*(\d{1,3})$/);
						if(m == null)
							return null;
						return [parseInt(m[1]), parseInt(m[2])];
					},
					/**
					 * Converts city ID to coordinates.
					 *
					 * @param id City ID.
					 * @return [x, y]
					 */
					cityIdToCoords:          function(id) {
						var x = id & 0xFFFF;
						var y = (id >> 16) & 0xFFFF;
						return [x, y];
					},
					cityIdToCont:            function(id) {
						var sourceCoords = this.cityIdToCoords(id);
						return webfrontend.data.Server.getInstance().getContinentFromCoords(sourceCoords[0], sourceCoords[1]);
					},
					/**
					 * Returns unit details by its type.
					 *
					 * @param type Unit type (number).
					 * @return Unit details or null.
					 */
					getUnitByType:           function(type) {
						if(this._unitsByType == null) {
							var map = {};

							// Initialize
							qx.lang.Object.getValues(this.UNITS).forEach(function(u) {
								map[u.type] = u;
							});
							this._unitsByType = map;
						}

						// Return value
						return this._unitsByType[type];
					},
					/**
					 * Gets Available units for attack. Includes all scheduled orders, except raids.
					 * Raids are supposed to be cancelled manually.
					 *
					 * @param city {Object} Source city object.
					 * @param includeActive {Boolean} if true, active orders will be included as Available.
					 * @param excludeDefense {Boolean} if true, only offensive units will be used.
					 * @param excludeNavy {Boolean} If true, only land units will be used.
					 * @return {Object} Unit lists in format {all, land, siege, ships, transport}.
					 */
					getAvailableUnits:       function(city, includeActive, excludeDefense, excludeNavy) {
						var units = city.getUnits();
						var unitOrders = city.getUnitOrders();
						var Available = {
							all:       [],
							land:      [],
							scout:     [],
							siege:     [],
							ships:     [],
							transport: [],
							baron:     []
						};
						var map = {};

						if(units == null) {
							return Available;
						}

						// First fill in total counts
						qx.lang.Object.getKeys(units).forEach(function(type) {
							if(type == this.UNITS.CITY_GUARD.type)
								return;
							var u = units[type];
							if(u.total > 0) {
								// Add to info to the list
								var info = this.getUnitByType(type);

								if(excludeDefense && info.defensive) {
									return;
								}

								if(excludeNavy && (info.kind == "w" || info.kind == "t")) {
									return;
								}
								var unit = {
									type:         type,
									name:         info.name,
									count:        u.total,
									unitTS:       info.ts,
									kind:         info.kind,
									unitCapacity: info.transport,
									off:          info.off,
									forceSiege:   info.forceSiege,
									defensive:    info.defensive
								};
								Available.all.push(unit);
								map[unit.type] = unit;

								switch(info.kind) {
									case "l":
										Available.land.push(unit);
										break;
									case "c":
										Available.scout.push(unit);
										break;
									case "s":
										Available.siege.push(unit);
										break;
									case "t":
										Available.transport.push(unit);
										break;
									case "w":
										Available.ships.push(unit);
										break;
									case "b":
										Available.baron.push(unit);
										break;
								}
							}
						}, this);

						if(unitOrders != null) {
							unitOrders.forEach(function(order) {
								if(includeActive && order.state != 0) {
									return;
								}

								// Iterate thru units
								order.units.forEach(function(u) {
									var unit = map[u.type];

									if(unit != undefined) {
										unit.count -= u.count;
									}
								});
							}, this);
						}
						return Available;
					},
					/**
					 * Send troops to specified target.
					 *
					 * @param units Unit array, in format {"type":"11","count":555}
					 * @param target Target city coordinates, string in format "xxx:yyy"
					 * @param attackType Id of the attack type
					 * @param timingType Type of attack schedule (now/deparature/arrival)
					 * @param timeMillis Time of attack execution, in milliseconds, UTC based
					 * @param callback Function to call after command issueincom
					 */
					orderUnits:              function(units, target, attackType, timingType, timeMillis, callback) {
						// Inspired by LoUDefiant extension
						var _this = this;
						var activeCity = webfrontend.data.City.getInstance();

						// Validate target format
						target = this.removeBBcode(target).trim();
						if(!target.match(/^\d{3}:\d{3}$/)) {
							throw new Error("Invalid target format '" + target + "'");
						}

						// Validate and prepare final list
						var unitList = [];
						var isNAval = false;
						units.forEach(function(u) {
							if(u.count < 1)
								return;
							isNAval = isNAval || (u.type >= 15 && u.type <= 17);

							if(_this.DO_NOT_ATTACK_UNITS[u.type])
								throw new Error("Invalid unit ordered to attack");
							if(attackType == _this.PLUNDER_ORDER_ID && _this.DO_NOT_PLUNDER_UNITS[u.type])
								throw new Error("Invalid unit ordered to plunder");

							// Convert to order format {t,c}
							unitList.push({
								t: u.type,
								c: u.count
							});
						});
						if(unitList.length < 1) {
							throw new Error("No units selected");
						}

						// Prepare request
						var request = {
							cityid:                     activeCity.getId(),
							units:                      unitList,
							targetCity:                 target,
							order:                      attackType,
							transport:                  isNAval ? 2 : 1,
							timeReferenceType:          timingType,
							referenceTimeUTCMillis:     timeMillis + 1000,
							raidTimeReferenceType:      0,
							raidReferenceTimeUTCMillis: 0
						};

						// Send command
						var commandManager = webfrontend.net.CommandManager.getInstance();
						commandManager.sendCommand("OrderUnits", request, null, callback);
					},
					getOrder:                function(city, orderId) {
						var unitOrders = city.getUnitOrders();
						if(unitOrders != null) {
							for(var i = 0; i < unitOrders.length; i++) {
								if(unitOrders[i].id == orderId) {
									return unitOrders[i];
								}
							}
						}
						return null;
					},
					canOrderBeCancelled:     function(order) {
						var serverTime = webfrontend.data.ServerTime.getInstance();
						return (order.state != 2) && (order.start > serverTime.getServerStep() - this.ORDER_CANCEL_PERIOD_S);
					},
					/**
					 * Cancels the given order, if exists in the current city.
					 *
					 * @param orderId Attack order ID.
					 * @param callback Callback function, when order has been processed, signature "void function(error)". Mandatory.
					 * @param self Callback context.
					 */
					cancelUnitOrder:         function(orderId, callback, self) {
						var activeCity = webfrontend.data.City.getInstance();
						var order = this.getOrder(activeCity, orderId);

						if(order == null) {
							throw new Error("Order not found");
						}

						if(!this.canOrderBeCancelled(order)) {
							throw new Error("Order cannot be cancelled");
						}

						// Prepare request
						var command = "CancelUnitOrder";
						var request = {
							cityid:    activeCity.getId(),
							id:        orderId,
							isDelayed: order.state == 0
						};

						// Send command
						var commandManager = webfrontend.net.CommandManager.getInstance();
						commandManager.sendCommand(command, request, null, function(unknown, ok) {
							callback.call(self, ok ? null : new Error("Error executing " + command + " command"));
						});
					},
					/**
					 * Cancels the given order, if exists in the current city.
					 *
					 * @param orderId Attack order ID.
					 * @param callback Callback function, when order has been processed, signature "void function(error)". Mandatory.
					 * @param self Callback context.
					 */
					cancelRaidOrder:         function(orderId, callback, self) {
						var activeCity = webfrontend.data.City.getInstance();
						var order = this.getOrder(activeCity, orderId);

						if(order == null) {
							throw new Error("Order not found");
						}
						if(order.type != this.RAID_ORDER_ID) {
							throw new Error("Order is not a raid");
						}

						// Prepare request
						var command = "UnitOrderSetRecurringOptions";
						var request = {
							cityid:        activeCity.getId(),
							id:            orderId,
							isDelayed:     order.state == 0,
							recurringType: 0
						};

						// Send command
						var commandManager = webfrontend.net.CommandManager.getInstance();
						commandManager.sendCommand(command, request, null, function(unknown, ok) {
							callback.call(self, ok ? null : new Error("Error executing " + command + " command"));
						});
					},
					cancelOrder:             function(orderId, callback, self) {
						var activeCity = webfrontend.data.City.getInstance();
						var order = this.getOrder(activeCity, orderId);

						if(order == null) {
							throw new Error("Order not found");
						}

						if(this.canOrderBeCancelled(order)) {
							// Cancel order
							this.cancelUnitOrder(orderId, callback, self);
						} else if(order.type == this.RAID_ORDER_ID) {
							// Reschedule order
							this.cancelRaidOrder(orderId, callback, self);
						} else {
							throw new Error("Order cannot be cancelled");
						}
					},
					/**
					 * Cancelles all orders from the list.
					 *
					 * @param orderIdList List of order IDs.
					 * @param callback Callback function, when order has been processed, signature "void function(error)". Mandatory.
					 * @param self Callback context.
					 */
					cancelOrders:            function(orderIdList, callback, self) {
						var _this = this;

						// Create local copy of the list
						var listCopy = [].concat(orderIdList);
						var delay = 0;

						// Prepare callback
						var cancelFunc;
						cancelFunc = function(error) {
							if(error) {
								callback.call(self, error);
								return;
							}

							// Get next order
							var orderId = listCopy.pop();
							if(orderId) {
								// Issue next order - delay it, so we dont spam server
								paDebug("Next cancelOrder in " + delay);
								setTimeout(function() {
									delay = 500;
									{
										_this.cancelOrder(orderId, cancelFunc);
									}
									/* (ex) {
									 callback.call(self,ex);
									 } */
								}, delay);
							} else {
								// Success
								callback.call(self, null);
							}
						};

						// Initiate sequence
						cancelFunc(null);
					},
					/**
					 * Makes a list of troops for real attack, according to parameters.
					 *
					 * @param AvailUnits Units in format from #getAvailableUnits().
					 * @param nAval true for nAval attack.
					 * @param siege allow demolishen of the target - cats and wgs.
					 * @param baron true for baron siege.
					 * @param scouts true to include Available scouts in the attack
					 * @param limitToTransport send only what ships can carry.
					 * @return Order details in format {totalTS,units}.
					 */
					prepareRealAttackUnits:  function(AvailUnits, nAval, siege, baron, scouts, limitToTransport, minTS) {
						// Send all we can
						var activeCity = webfrontend.data.City.getInstance();
						var order = {
							totalTS: 0,
							units:   []
						};
						if(minTS == undefined || minTS == null) {
							minTS = this.getMinAttackStrength(activeCity.getUnitLimit());
						}

						// Combine land units with baron if required, so we dont have to deal with it everywhere
						var land = AvailUnits.land;
						if(baron) {
							land = AvailUnits.baron.concat(AvailUnits.land);
							// Put baron first, so we never exclude him
						}
						if(nAval) {
							if(AvailUnits.siege.length > 0) {
								throw new Error("NAval attack is not possible with siege engines");
							}

							// Calculate required transport capacity
							var requiredCapacity = 0;
							land.forEach(function(u) {
								requiredCapacity += u.count * u.unitTS;
							});

							// Calculate transport capacity
							var transportCapacity = 0;
							AvailUnits.transport.forEach(function(u) {
								transportCapacity += u.count * u.unitCapacity;
							});

							if(!limitToTransport && transportCapacity < requiredCapacity) {
								throw new Error("Not enough ships to carry your troops");
							}

							// Add ships
							var AvailableCapacity = transportCapacity;
							order.units = AvailUnits.transport.concat(AvailUnits.ships);
							order.isPartial = false;

							if(scouts) {
								// Note: By adding scouts last, they will be included only when they fit
								land = land.concat(AvailUnits.scout);
							}

							// Add only units that fit
							land.forEach(function(u) {
								if(AvailableCapacity > u.unitTS) {
									// Copy unit with Available count
									var unitOrder = qx.lang.Object.clone(u);
									unitOrder.count = Math.min(unitOrder.count, Math.floor(AvailableCapacity / u.unitTS));
									order.isPartial = order.isPartial || (unitOrder.count < u.count);
									order.units.push(unitOrder);
									AvailableCapacity -= unitOrder.count * unitOrder.unitTS;
								}
							});
						} else {
							// Ignore ships, no other validation needed
							order.units = land.concat(AvailUnits.siege);

							if(scouts) {
								order.units = order.units.concat(AvailUnits.scout);
							}
						}

						if(!siege) {
							console.log("!seige");
							// Iterate over copy of the array
							[].concat(order.units).forEach(function(u) {
								if(u.kind != "b" && u.off == "d") {
									order.units.splice(order.units.indexOf(u), 1);
								}
							});
						}

						if(order.units.length < 1) {
							throw new Error("No troops Available");
						}

						// Calculate total TS
						order.units.forEach(function(u) {
							order.totalTS += (u.count * u.unitTS);
						});
						if(order.totalTS < minTS) {
							throw new Error("Not enough troops Available");
						}
						return order;
					},
					prepareFakeAttackUnits:  function(AvailUnits, nAval, minTS, baron) {
						var activeCity = webfrontend.data.City.getInstance();
						var sorted,
							fake,
							neededCount,
							unitOrder;
						if(minTS == undefined || minTS == null) {
							minTS = this.getMinAttackStrength(activeCity.getUnitLimit());
						}

						// Return value
						var order = {
							totalTS: 0,
							units:   []
						};

						// Helper function
						var sortFunc = function(a, b) {
							return (b.count * b.unitTS) - (a.count * a.unitTS);
						};

						// Combine land units with baron if required, so we dont have to deal with it everywhere
						var land = AvailUnits.land;
						if(nAval) {
							// Sort units from largest bunch to smallest
							sorted = land.concat(AvailUnits.ships).sort(sortFunc);
							if(sorted.length < 1) {
								throw new Error("No troops Available");
							}
							fake = sorted[0];

							if(fake.kind != "w") {
								if(AvailUnits.transport.length < 1) {
									throw new Error("No ships Available");
								}
								var transport = AvailUnits.transport[0];
								var shipCount = Math.ceil(minTS / (transport.unitTS + transport.unitCapacity));
								var landTS = minTS - (shipCount * transport.unitTS);
								var landCount = Math.ceil(landTS / fake.unitTS);

								if(fake.count < landCount) {
									throw new Error("Not enough troops Available");
								}

								if(transport.count < shipCount) {
									throw new Error("Not enough ships to carry your troops");
								}

								// Clone, set count and return
								unitOrder = qx.lang.Object.clone(fake);
								unitOrder.count = landCount;
								var shipOrder = qx.lang.Object.clone(transport);
								shipOrder.count = shipCount;
								order.units = [unitOrder, shipOrder];
							} else {
								neededCount = Math.ceil(minTS / fake.unitTS);

								if(fake.count < neededCount) {
									throw new Error("Not enough troops Available");
								}

								// Clone, set count and return
								unitOrder = qx.lang.Object.clone(fake);
								unitOrder.count = neededCount;
								order.units = [unitOrder];
							}
						} else {
							sorted = land.concat(AvailUnits.siege).sort(sortFunc);
							if(sorted.length < 1) {
								throw new Error("No troops Available");
							}
							fake = sorted[0];
							neededCount = Math.ceil(minTS / fake.unitTS);
							for(var x = 0; x < sorted.length; ++x) {
								if(sorted[x].type == "13") {
									fake = sorted[x];
									neededCount = Math.ceil(minTS / fake.unitTS);
									if(sorted[x].count < neededCount) {
										fake = sorted[0];
										neededCount = Math.ceil(minTS / fake.unitTS);
									}
									break;
								}
							}

							if(fake.count < neededCount) {
								throw new Error("Not enough troops Available");
							}

							// Clone, set count and return
							unitOrder = qx.lang.Object.clone(fake);
							unitOrder.count = neededCount;
							if(baron) {
								var baronOrder = {
									"type":       "19",
									"name":       "Baron",
									"count":      1,
									"unitTS":     1,
									"kind":       "b",
									"off":        "d",
									"forceSiege": true,
									"defensive":  false
								};
								order.units = [unitOrder, baronOrder];
							} else {
								order.units = [unitOrder];
							}
						}

						// Calculate total TS
						order.units.forEach(function(u) {
							order.totalTS += u.count * u.unitTS;
						});
						return order;
					},
					prepareScoutAttackUnits: function(AvailUnits, nAval, minimal, limitToTransport, minTS) {
						var activeCity = webfrontend.data.City.getInstance();
						if(minTS == undefined || minTS == null) {
							minTS = this.getMinAttackStrength(activeCity.getUnitLimit());
						}

						// Return value
						var order = {
							totalTS: 0,
							units:   []
						};

						if(AvailUnits.scout.length < 1) {
							throw new Error("No scouts Available");
						}
						var scout = qx.lang.Object.clone(AvailUnits.scout[0]);
						if(scout.count * scout.unitTS < minTS) {
							throw new Error("Not enough troops Available");
						}

						if(minimal) {
							scout.count = Math.ceil(minTS / scout.unitTS);
						}

						if(nAval) {
							if(AvailUnits.transport.length < 1) {
								throw new Error("No ships Available");
							}
							var transport = qx.lang.Object.clone(AvailUnits.transport[0]);
							var AvailableCapacity = transport.count * transport.unitCapacity;

							if(AvailableCapacity < minTS) {
								throw new Error("Not enough ships to carry your troops");
							}

							if(!limitToTransport) {
								// Validate
								var scoutTS = scout.count * scout.unitTS;
								var shipCount = Math.ceil(scoutTS / transport.unitCapacity);
								if(transport.count < shipCount) {
									throw new Error("Not enough ships to carry your troops");
								}

								// Set ship needed count
								transport.count = shipCount;
							} else {
								// Decrease count (adjustment of transport should not be nescessary)
								scout.count = Math.floor(AvailableCapacity / scout.unitTS);
							}
							order.units.push(transport);
						}
						order.units.push(scout);

						// Calculate total TS
						order.units.forEach(function(u) {
							order.totalTS += u.count * u.unitTS;
						});
						return order;
					},
					getUnitBonus:            function(unitType) {
						var research = webfrontend.data.Tech.getInstance().getBonus("unitDamage", webfrontend.data.Tech.research, Number(unitType));
						var shrine = webfrontend.data.Tech.getInstance().getBonus("unitDamage", webfrontend.data.Tech.shrine, Number(unitType));
						return (research + shrine) / 100;
					},
					getUnitBaseDamage:       function(unitType) {
						return webfrontend.res.Main.getInstance().units[unitType].av;
					},
					getUnitDamage:           function(unitType) {
						var base = this.getUnitBaseDamage(unitType);
						var bonus = this.getUnitBonus(unitType);
						return Math.floor(base * (1 + bonus));
					},
					getMinAttackStrength:    function(maxTS) {
						var retVal = 3000;
						if(maxTS <= 20000)
							retVal = 1;
						else if(maxTS <= 40000)
							retVal = 200;
						else if(maxTS <= 60000)
							retVal = 500;
						else if(maxTS <= 80000)
							retVal = 800;
						else if(maxTS <= 100000)
							retVal = 1000;
						else if(maxTS <= 120000)
							retVal = 1200;
						else if(maxTS <= 160000)
							retVal = 1600;
						else if(maxTS <= 200000)
							retVal = 2000;
						else if(maxTS <= 240000)
							retVal = 2500;
						else
							retVal = 3000;
						var oPlayer = webfrontend.data.Player.getInstance();
						var numCities = oPlayer.getNumCities();
						if(numCities >= 100)
							retVal = Math.max(1600, retVal);
						else if(numCities >= 50)
							retVal = Math.max(1200, retVal);
						else if(numCities >= 20)
							retVal = Math.max(800, retVal);
						else if(numCities >= 10)
							retVal = Math.max(500, retVal);
						else if(numCities >= 5)
							retVal = Math.max(200, retVal);
						else if(numCities >= 2)
							retVal = Math.max(20, retVal);
						return retVal;
					},
					/**
					 *
					 * @param units Array of units.
					 * @return
					 */
					getMajorAttackType:      function(units) {
						var i;

						for(i = 0; i < units.length; i++) {
							if(units[i].forceSiege) {
								return "d";
							}
						}

						// Clone and sort list
						var sorted = [].concat(units).sort(function(a, b) {
							return (b.count * b.unitTS) - (a.count * a.unitTS);
						});

						for(i = 0; i < sorted.length; i++) {
							if("lswc".indexOf(sorted[i].kind) > -1) {
								return sorted[i].off;
							}
						}

						throw new Error("Unable to determine attack type");
					},
					/**
					 * Converts the given game time to the UTC time.
					 *
					 * @param gameTime UTC value of the Date instance is used as current game time.
					 *                 Local time of the instance is nonsense.
					 * @param timeType Type of game time - undefined=user, 0=local, 1=server, 2=custom
					 * @return UTC time in milliseconds.
					 */
					convertGameTimeToUtc:    function(gameTime, timeType) {
						if(!(gameTime instanceof Date)) {
							return null;
						}
						timeType = timeType != null ? timeType : webfrontend.config.Config.getInstance().getTimeZone();
						var timeZoneOffset = webfrontend.config.Config.getInstance().getTimeZoneOffset();
						var serverOffset = webfrontend.data.ServerTime.getInstance().getServerOffset();
						var localOffset = -new Date().getTimezoneOffset() * 60000;

						// Its in minutes
						var serverDiff = webfrontend.data.ServerTime.getInstance().getDiff();
						switch(timeType) {
							case 0:
								// Local time - no need for conversion
								return gameTime.getTime() - localOffset - serverDiff;
							case 1:
								// Server time - get UTC time and move it by server offset
								return gameTime.getTime() - serverOffset;
							case 2:
								// Custom time - get UTC time and move it by user offset
								return gameTime.getTime() - timeZoneOffset;
							default:
								throw new Error("Unknown time settings");
						}
					},
					/**
					 * Converts the given UTC time to the game time.
					 *
					 * @param utcTime UTC time in milliseconds.
					 * @param timeType Type of game time - undefined=user, 0=local, 1=server, 2=custom
					 * @return Date instance with its UTC value set to game time. Local time of the instance is nonsense.
					 */
					convertUtcToGameTime:    function(utcTime, timeType) {
						if(isNaN(utcTime)) {
							return null;
						}
						timeType = timeType != null ? timeType : webfrontend.config.Config.getInstance().getTimeZone();
						var timeZoneOffset = webfrontend.config.Config.getInstance().getTimeZoneOffset();
						var serverOffset = webfrontend.data.ServerTime.getInstance().getServerOffset();
						var localOffset = -new Date().getTimezoneOffset() * 60000;

						// Its in minutes
						var serverDiff = webfrontend.data.ServerTime.getInstance().getDiff();
						switch(timeType) {
							case 0:
								// Local time - to get local time in UTC value (as required by game), add local offset
								return new Date(utcTime + localOffset + serverDiff);
							case 1:
								// Server time - add server offset
								return new Date(utcTime + serverOffset);
							case 2:
								// Custom time - add user offset
								return new Date(utcTime + timeZoneOffset);
							default:
								throw new Error("Unknown time settings");
						}
					},
					getErrorMessage:         function(code) {
						if(code == 0) {
							return "Success";
						} else if(code & 0x400000) {
							return "The chosen time is in the past";
						} else if(code & 0x1) {
							return "No target or unreachable by moongate";
						} else if(code & 0x2) {
							return "Not enough units";
						} else if(code & 0x4) {
							return "Not enough moonstones";
						} else if(code & 0x10) {
							return "Target city has no castle";
						} else if(code & 0x80000) {
							return "Target is not reachable on water";
						} else if(code & 0x400) {
							return "Dungeons can only be raided";
						} else {
							return "Unknown error " + code;
						}
					}
				}
			});
			qx.Class.define("ava.CoordUtils", {
				type:    "singleton",
				extend:  qx.core.Object,
				statics: {
					convertCoordinatesToId:       function(x, y) {
						var id = parseInt(x, 10) | (parseInt(y, 10) << 16);
						return id;
					},
					convertIdToCoodrinates:       function(id) {
						var o = this.convertIdToCoordinatesObject(id);
						return o.xPos + ":" + o.yPos;
					},
					convertIdToCoordinatesObject: function(id) {
						var x = (id & 0xFFFF);
						var y = (id >> 16);

						return {
							xPos: x,
							yPos: y,
							cont: window.webfrontend.data.Server.getInstance().getContinentFromCoords(x, y)
						};
					}
				}
			});
			qx.Class.define("ava.BossUtils", {
				type:      "static",
				extend:    qx.lang.Object,
				construct: function() {
					this.base(arguments);
				},
				statics:   {
					BOSS_DEFENSE_STRONG: [2500, 15000, 100000, 200000, 500000, 750000, 1000000, 1500000, 2250000, 3000000],
					BOSS_DEFENSE_WEAK:   [1700, 10000, 68000, 132000, 332000, 500000, 680000, 1000000, 1500000, 2000000],
					requestBossInfo:     function(x, y, callback) {
						var _this = this;
						var activeCity = webfrontend.data.City.getInstance();
						var request = {
							cityid: activeCity.getId(),
							x:      x,
							y:      y
						};
						var commandManager = webfrontend.net.CommandManager.getInstance();
						commandManager.sendCommand("GetOrderTargetInfo", request, null, function(ok, data) {
							var info = _this.getBossInfo(data);
							if(info) {
								info.name = info.cn;
								info.coords = ava.CombatTools.normalizeCoords(x + ":" + y);
								callback(info);
							} else {
								paDebug("Unable to get target info");
							}
						});
					},
					getBossInfo:         function(data) {
						// Get level
						var m = data.cn.match(/^([^:]+):(\d+)$/);
						if(m == null) {
							return null;
						}
						var lvl = Number(m[2]);

						switch(data.t) {
							case 6:
								// Boss Forest
								return {
									weakness: "c",
									level:    lvl,
									water:    false
								};
							case 7:
								// Boss Mountain
								return {
									weakness: "i",
									level:    lvl,
									water:    false
								};
							case 8:
								// Boss Hill
								return {
									weakness: "i",
									level:    lvl,
									water:    false
								};
							case 12:
								// Boss Sea
								// Note: we need both siege and demo attacks here
								return {
									weakness: "sd",
									level:    lvl,
									water:    true
								};
							default:
								return null;
						}
					},
					prepareAttack:       function(bossInfo) {
						// Get Available units
						var city = webfrontend.data.City.getInstance();
						var AvailUnits = ava.CombatTools.getAvailableUnits(city, false);

						// Which group to use?
						var units = [].concat(bossInfo.water ? AvailUnits.ships : AvailUnits.land);

						// Enrich unit list by strength
						units.forEach(function(u) {
							var dmg = ava.CombatTools.getUnitDamage(u.type);
							if(dmg > 0) {
								u.dmg = dmg;
							}
						});

						// Sort units by total dmg
						units.sort(function(a, b) {
							return (b.count * b.dmg) - (a.count * a.dmg);
						});

						// Go thru units and try to issue an order
						var order;
						for(var i = 0; i < units.length; i++) {
							order = this.getOrder(bossInfo, units[i]);
							if(order != null) {
								break;
							}
						}

						if(order == null) {
							throw new Error("No unit to attack with");
						}
						return order;
					},
					getOrder:            function(bossInfo, unit) {
						// Boss strength
						var str;
						if(bossInfo.weakness.indexOf(unit.off) > -1) {
							str = ava.BossUtils.BOSS_DEFENSE_WEAK[bossInfo.level - 1];
						} else {
							str = ava.BossUtils.BOSS_DEFENSE_STRONG[bossInfo.level - 1];
						}

						// How many units we need?
						var reqCount = Math.ceil(str / unit.dmg);

						if(unit.count < reqCount) {
							return null;
						}

						// Return order
						var unitOrder = qx.lang.Object.clone(unit);
						unitOrder.count = reqCount;
						return [unitOrder];
					},
					sendAttack:          function(x, y, callback) {
						var _this = this;
						this.requestBossInfo(x, y, function(bossInfo) {
							{
								var units = _this.prepareAttack(bossInfo);
								ava.CombatTools.orderUnits(units, bossInfo.coords, 8, 1, 0, function(ok, errorCode) {
									var error = ava.CombatTools.getErrorMessage(errorCode);
									paDebug("Hunt result=" + error);
									if(callback) {
										callback(ok, errorCode, error);
									}
								});
							}
							/* (e) {
							 console.log("Error");
							 console.dir(e);
							 } */
						});
					}
				}
			});
			qx.Class.define("ava.ui.components.AttackOrder", {
				extend:    qx.ui.container.Composite,
				construct: function() {
					this.base(arguments);
					var combatTools = ava.CombatTools;
					var PLUNDER = {
						label: "Plunder",
						type:  combatTools.PLUNDER_ORDER_ID
					};
					var SIEGE = {
						label: "Siege",
						type:  combatTools.SIEGE_ORDER_ID
					};
					var ASSAULT = {
						label: "Assault",
						type:  combatTools.ATTACK_ORDER_ID
					};
					var SCOUT = {
						label: "Scout",
						type:  combatTools.SCOUT_ORDER_ID
					};
					this.ATTACK_ACTIONS = [];
					this.ATTACK_ACTIONS.push({
						name:    "fake",
						label:   "Fake",
						allowed: [SIEGE, ASSAULT, PLUNDER, SCOUT],
						tooltip: "Minimal troop count will be sent."
					});
					this.ATTACK_ACTIONS.push({
						name:    "capture",
						label:   "Capture",
						allowed: [SIEGE, ASSAULT],
						tooltip: "Barons will be included in the attack, if Available. No Catapults or Galleons will be sent, only Rams."
					});
					this.ATTACK_ACTIONS.push({
						name:    "fakecap",
						label:   "Fake Cap",
						allowed: [SIEGE, PLUNDER],
						tooltip: "Minimal troop count will be sent. One barons will be included in the attack, if Available."
					});
					this.ATTACK_ACTIONS.push({
						name:    "demo",
						label:   "Demolish",
						allowed: [SIEGE, ASSAULT],
						tooltip: "Catapults and Galleons will be included in the attack."
					});
					this.ATTACK_ACTIONS.push({
						name:    "attack",
						label:   "Attack",
						allowed: [SIEGE, PLUNDER, ASSAULT],
						tooltip: "Simple attack, no Catapults, Galleons or Barons will be included. Rams will be used, if Available."
					});
					this.ATTACK_ACTIONS.push({
						name:    "scout",
						label:   "Scout",
						allowed: [SCOUT],
						tooltip: "Only scouts will be sent."
					});
					this.buildUI();
					this.selectAction(this.ATTACK_ACTIONS[0]);
				},
				events:    {
					attack:      "qx.event.type.Data",
					changeValue: "qx.event.type.Event"
				},
				members:   {
					ATTACK_ACTIONS:     null,
					_attackButton:      null,
					_actionButton:      null,
					_coordsText:        null,
					_toggleButton:      null,
					_noteText:          null,
					_counterLabel:      null,
					_selectedAction:    null,
					_selectedTypeIndex: -1,
					_applyingValue:     false,
					buildUI:            function() {
						var _this = this;
						var app = qx.core.Init.getApplication();
						this.setLayout(new qx.ui.layout.HBox(5));

						// Attack button
						var actionMenu = new qx.ui.menu.Menu();
						this.ATTACK_ACTIONS.forEach(function(action) {
							var menuButton = new qx.ui.menu.Button(action.label);
							menuButton.addListener("execute", function() {
								_this.selectAction(action);
							});
							actionMenu.add(menuButton);
						});
						this._attackButton = new qx.ui.form.Button("[Select]");
						this._attackButton.set({
							appearance: "button-text-small",
							width:      80
						});
						this._attackButton.addListener("execute", this.fireAttack, this);
						this._actionButton = new qx.ui.form.MenuButton("?", null, actionMenu);
						this._actionButton.set({
							appearance: "button-text-small",
							width:      20
						});
						var attackControl = new qx.ui.container.Composite();
						attackControl.setLayout(new qx.ui.layout.HBox(1));
						attackControl.add(this._attackButton);
						attackControl.add(this._actionButton);

						// Toggle button
						this._toggleButton = new qx.ui.form.Button("[Select]");
						this._toggleButton.set({
							appearance:  "button-text-small",
							width:       60,
							toolTipText: "Siege Engines and Baron will always siege the target, regardless the option."
						});
						this._toggleButton.addListener("execute", this.onModeToggle, this);

						// Coords
						this._coordsText = new qx.ui.form.TextField();
						this._coordsText.set({
							width:       60,
							marginTop:   1,
							maxLength:   40,
							toolTipText: "Coordinates in xxx:yyy format."
						});
						app.setElementModalInput(this._coordsText);
						this._coordsText.addListener("changeValue", this.onNormalizeCoords, this);
						this._coordsText.addListener("changeValue", this.fireChangeValue, this);
						this.centerImage = new qx.ui.basic.Image("webfrontend/ui/icons/icon_buildings_centerview.png");
						this.centerImage.setWidth(18);
						this.centerImage.setHeight(12);
						this.centerImage.setScale(true);
						this.centerImage.setAlignY("middle");
						this.centerViewBtn = new qx.ui.form.Button();
						this.centerViewBtn.set({
							width:       20,
							appearance:  "button-text-small",
							toolTipText: "Go to city"
						});
						this.centerViewBtn.addListener("click", this.findCity, this);
						this.centerViewBtn._add(this.centerImage);

						// Note
						this._noteText = new qx.ui.form.TextField();
						this._noteText.set({
							width:       210,
							toolTipText: "Just a note."
						});
						this._noteText.addListener("changeValue", this.fireChangeValue, this);
						app.setElementModalInput(this._noteText);
						this._counterLabel = new qx.ui.basic.Label();
						this._counterLabel.set({
							minWidth:    30,
							allowGrowX:  true,
							toolTipText: "Indicative count of attacks you have sent to this target. DblClick to remove last entry. I=Infrantry, C=CAvalry, M=Magic, D=Siege Engines"
						});
						this._counterLabel.addListener("dblclick", this.removeLastCount, this);

						// Add to page
						this.add(attackControl);
						this.add(this._coordsText);
						this.add(this._toggleButton);
						this.add(this.centerViewBtn);
						this.add(this._noteText);
						this.add(this._counterLabel);
					},
					findCity:           function() {
						var coords = String(this._noteText.getValue() || "");
						var coordPat = /[0-9][0-9][0-9]:[0-9][0-9][0-9]/i;
						var coordPat1 = /[0-9][0-9][0-9]:[0-9][0-9]/i;
						var coordPat2 = /[0-9][0-9]:[0-9][0-9][0-9]/i;
						var coordPat3 = /[0-9][0-9]:[0-9][0-9]/i;
						coords = coords.match(coordPat) || coords.match(coordPat1) || coords.match(coordPat2) || coords.match(coordPat3);
						if(coords) {
							coords = coords[0].split(":");
							var x = Number(coords[0]);
							var y = Number(coords[1]);
							var cityID = convertCoordinatesToId(x, y);
							var player = webfrontend.data.Player.getInstance();
							var cityList = player.getCities();
							if(cityList && cityList.hasOwnProperty(cityID)) {
								webfrontend.data.City.getInstance().setRequestId(cityID);
							}
							webfrontend.gui.Util.showMapModeViewPos('r', 0, x, y);
						}
					},
					selectAction:       function(action) {
						this._selectedAction = action;
						this._attackButton.setLabel(action.label.toUpperCase());
						this._attackButton.setToolTipText(action.tooltip);

						// Update mode
						this._selectedTypeIndex = -1;
						this.onModeToggle();
						// Note: Change event is fired in onModeToggle
					},
					onModeToggle:       function() {
						var allowed = this._selectedAction.allowed;
						this._selectedTypeIndex++;
						if(this._selectedTypeIndex >= allowed.length) {
							this._selectedTypeIndex = 0;
						}

						// Set label
						this._toggleButton.setLabel(allowed[this._selectedTypeIndex].label);

						// Fire change event
						this.fireChangeValue();
					},
					onNormalizeCoords:  function(e) {
						var str = ava.CombatTools.normalizeCoords(e.getData());
						if(str != null && str != e.getData()) {
							e.stopPropagation();
							this._coordsText.setValue(str);
						}
					},
					fireAttack:         function() {
						var value = this.getValue();
						if(value != null) {
							// Fire the event
							this.fireDataEvent("attack", value);
						}
					},
					fireChangeValue:    function() {
						if(!this._applyingValue) {
							this.fireEvent("changeValue");
						}
					},
					setAttackEnabled:   function(value) {
						attackButton.setEnabled(value);
					},
					getValue:           function() {
						// Get target
						var coords = ava.CombatTools.normalizeCoords(this._coordsText.getValue());
						var type = this._selectedAction.allowed[this._selectedTypeIndex];
						var note = (this._noteText.getValue() || "").trim();
						if(coords == null || type == null) {
							return null;
						}

						// Return attack detail
						return {
							attack: this._selectedAction.name,
							type:   type.type,
							target: coords,
							note:   note
						};
					},
					setValue:           function(data) {
						if(data == null) {
							// Defaults
							data = {
								fake: true
							};
						}
						{
							this._applyingValue = true;

							// Action
							var action = this._actionByName(data.attack);
							this.selectAction(action);

							// Type (TODO do it better)
							var allowed = this._selectedAction.allowed;
							this._selectedTypeIndex = 0;
							for(var i = 0; i < allowed.length; i++) {
								if(allowed[i].type == data.type) {
									this._selectedTypeIndex = i;
									break;
								}
							}
							this._toggleButton.setLabel(allowed[this._selectedTypeIndex].label);

							// Coords
							var coords = ava.CombatTools.normalizeCoords(data.target);
							this._coordsText.setValue(coords);

							// Note
							this._noteText.setValue(data.note || "");
						}
						/* {
						 this._applyingValue=false;
						 }*/

						// Fire change event
						this.fireChangeValue();
					},
					setActionEnabled:   function(value) {
						this._attackButton.setEnabled(value);
					},
					getActionEnabled:   function() {
						return this._attackButton.getEnabled();
					},
					addCount:           function(type) {
						var old = this._counterLabel.getValue() || "";
						this._counterLabel.setValue(old + type);
					},
					removeLastCount:    function() {
						var old = this._counterLabel.getValue() || "";
						if(old.length > 0) {
							this._counterLabel.setValue(old.substr(0, old.length - 1));
						}
					},
					resetCount:         function() {
						this._counterLabel.resetValue();
					},
					_actionByName:      function(name) {
						for(var i = 0; i < this.ATTACK_ACTIONS.length; i++) {
							if(this.ATTACK_ACTIONS[i].name == name) {
								return this.ATTACK_ACTIONS[i];
							}
						}

						// Return fake as default
						return this.ATTACK_ACTIONS[0];
					}
				}
			});
			qx.Class.define("ava.ui.components.LeftPanel", {
				extend:    qx.ui.container.Composite,
				construct: function(label) {
					this.base(arguments);
					this.buildPanelUI(label);
				},
				members:   {
					content:          null,
					closeAvaToolsBtn: null,
					titleRow:         null,
					buildPanelUI:     function(labelText) {
						this.setLayout(new qx.ui.layout.Canvas());
						this.set({
							marginTop:    3,
							marginBottom: 3
						});
						var background = new qx.ui.basic.Image('resource/webfrontend/ui/menues/main_menu/bgr_subheader_citinfo_scaler.png');
						background.set({
							width:      338,
							scale:      true,
							allowGrowY: true
						});
						this.add(background, {
							left:   0,
							top:    27,
							bottom: 34
						});
						background = new qx.ui.basic.Image('resource/webfrontend/ui/menues/main_menu/bgr_subheader_citinfo_end.png');
						background.set({
							width:  338,
							height: 35
						});
						this.add(background, {
							left:   0,
							bottom: 0
						});
						background = new qx.ui.basic.Image("resource/webfrontend/ui/menues/main_menu/bgr_subheader_citinfo_wide.png");
						background.set({
							width:  338,
							height: 32
						});
						this.add(background, {
							left: 0,
							top:  0
						});
						this.titleRow = new qx.ui.container.Composite();
						this.titleRow.setLayout(new qx.ui.layout.HBox(0));
						this.titleRow.set({
							width: 325
						});
						this.add(this.titleRow, {
							left: 8,
							top:  6
						});
						var label = new qx.ui.basic.Label(labelText);
						label.set({
							font:       "bold",
							textColor:  "#ffCC82",
							paddingTop: 2
						});
						this.titleRow.add(label);
						this.content = new qx.ui.container.Composite();
						this.content.setLayout(new qx.ui.layout.VBox(5));
						this.content.set({
							width:        322,
							marginBottom: 8
						});
						this.add(this.content, {
							top:  35,
							left: 8
						});
						this.aboutAvaToolsBtn = new qx.ui.form.Button("?");
						this.aboutAvaToolsBtn.set({
							appearance:  "button-text-small",
							toolTipText: "About Ava Tools"
						});
						this.aboutAvaToolsBtn.addListener("execute", this.showHelp, this);
						this.titleRow.add(this.aboutAvaToolsBtn);
						this.AvaToolsOptionsBtn = new qx.ui.form.Button("O");
						this.AvaToolsOptionsBtn.set({
							visibility:  "hidden",
							width:       20,
							appearance:  "button-text-small",
							toolTipText: "Options"
						});
						this.AvaToolsOptionsBtn.addListener("execute", this.showOptionsPage, this);
						this.titleRow.add(this.AvaToolsOptionsBtn);
						this.showIncomingAttacksBtn = new qx.ui.form.Button("I");
						this.showIncomingAttacksBtn.set({
							visibility:  "hidden",
							width:       20,
							appearance:  "button-text-small",
							toolTipText: "Incoming Attacks Window"
						});
						this.showIncomingAttacksBtn.addListener("execute", this.showIncomingAttacks, this);
						this.titleRow.add(this.showIncomingAttacksBtn);
						this.showCombatButtonBtn = new qx.ui.form.Button("C");
						this.showCombatButtonBtn.set({
							visibility:  "hidden",
							width:       20,
							appearance:  "button-text-small",
							toolTipText: "Combat/PvP Attack Setup Window"
						});
						this.showCombatButtonBtn.addListener("execute", this.showCombatWindow, this);
						this.titleRow.add(this.showCombatButtonBtn);
						this.showRaidButtonBtn = new qx.ui.form.Button("R");
						this.showRaidButtonBtn.set({
							visibility:  "hidden",
							width:       20,
							appearance:  "button-text-small",
							toolTipText: "Raiding Tools Window"
						});
						this.showRaidButtonBtn.addListener("execute", this.showRaidingWindow, this);
						this.titleRow.add(this.showRaidButtonBtn);
						this.showAllianceInfoBtn = new qx.ui.form.Button("A");
						this.showAllianceInfoBtn.set({
							visibility:  "hidden",
							width:       20,
							appearance:  "button-text-small",
							toolTipText: "Alliance Info"
						});
						this.showAllianceInfoBtn.addListener("execute", this.showAllianceInfo, this);
						this.titleRow.add(this.showAllianceInfoBtn);
						this.showMailingListBtn = new qx.ui.form.Button("M");
						this.showMailingListBtn.set({
							visibility:  "hidden",
							width:       20,
							appearance:  "button-text-small",
							toolTipText: "Mailing Lists Window"
						});
						this.showMailingListBtn.addListener("execute", this.showMailingLists, this);
						this.titleRow.add(this.showMailingListBtn);
						this.showPalaceItemsBtn = new qx.ui.form.Button("P");
						this.showPalaceItemsBtn.set({
							visibility:  "hidden",
							width:       20,
							appearance:  "button-text-small",
							toolTipText: "Palace Items Window"
						});
						this.showPalaceItemsBtn.addListener("execute", this.showPalaceItems, this);
						this.titleRow.add(this.showPalaceItemsBtn);
						subIncomingImg = new qx.ui.basic.Image('resource/webfrontend/ui/icons/icon_attack_warning.gif');
						subIncomingImg.setScale(true);
						subIncomingImg.setVisibility("hidden");
						subIncomingImg.setMaxWidth(17);
						subIncomingImg.setMaxHeight(20);
						this.titleRow.add(subIncomingImg);
						fortuneAvailImg = new qx.ui.basic.Image('resource/webfrontend/ui/icons/icon_alliance_red_17.png');
						fortuneAvailImg.setVisibility("hidden");
						fortuneAvailImg.addListener("click", setNextFortuneTime);
						this.titleRow.add(fortuneAvailImg);

						this.closeImage = new qx.ui.basic.Image("webfrontend/ui/icons/icon_chat_resize_smaller.png");
						this.closeImage.setWidth(16);
						this.closeImage.setHeight(16);
						this.closeImage.setScale(true);
						this.closeImage.setAlignY("middle");
						this.closeAvaToolsBtn = new qx.ui.form.Button();
						this.closeAvaToolsBtn.set({
							width:       15,
							appearance:  "button-text-small",
							toolTipText: "Hide Ava Tools"
						});
						this.closeAvaToolsBtn.addListener("click", this.toggleAvaTools, this);
						this.closeAvaToolsBtn._add(this.closeImage);
						this.titleRow.add(this.closeAvaToolsBtn);
						var options = ava.Main.getInstance().options;
						if(options.hideAvaTools) {
							this.addListenerOnce("appear", function() {
								ava.Main.getInstance().panel.toggleAvaTools();
							});
						}
					},
					getContent:       function() {
						return this.content;
					},
					toggleAvaTools:   function() {
						var barButtonsVisibility = "hidden";
						if(this.getMaxHeight() != 84) {
							barButtonsVisibility = "visible";
							this.closeImage.setSource("webfrontend/ui/icons/icon_chat_resize.png");
							this.closeAvaToolsBtn.setToolTipText("Show Ava Tools");
							this.setMaxHeight(84);
						} else {
							this.closeImage.setSource("webfrontend/ui/icons/icon_chat_resize_smaller.png");
							this.setMaxHeight(242);
							this.closeAvaToolsBtn.setToolTipText("Hide Ava Tools");
						}
						this.showCombatButtonBtn.setVisibility(barButtonsVisibility);
						this.showRaidButtonBtn.setVisibility(barButtonsVisibility);
						this.showIncomingAttacksBtn.setVisibility(barButtonsVisibility);
						this.AvaToolsOptionsBtn.setVisibility(barButtonsVisibility);
						this.showAllianceInfoBtn.setVisibility(barButtonsVisibility);
						this.showMailingListBtn.setVisibility(barButtonsVisibility);
						this.showPalaceItemsBtn.setVisibility(barButtonsVisibility);
					},
					addContent:       function(widget, args) {
						this.content.add(widget, args);
					}
				}
			});
			qx.Class.define("ava.ui.components.TimePicker", {
				extend:     qx.ui.container.Composite,
				construct:  function(caption) {
					this.base(arguments);
					this.buildUI(caption);
				},
				properties: {
					value: {
						check: "Date",
						init:  new Date(0),
						apply: "_applyValue"
					}
				},
				events:     {
					changeValue: "qx.event.type.Data"
				},
				members:    {
					_dateSelect:       null,
					_hourText:         null,
					_minuteText:       null,
					_secondText:       null,
					_applyingValue:    false,
					_updatingValue:    false,
					buildUI:           function(caption) {
						var app = qx.core.Init.getApplication();
						this.setLayout(new qx.ui.layout.HBox(5));

						if(caption != null) {
							var captionLabel = new qx.ui.basic.Label(caption);
							captionLabel.set({
								width:      60,
								allowGrowX: false
							});
							this.add(captionLabel);
						}
						this._hourText = new qx.ui.form.TextField("0");
						this._hourText.set({
							width:     26,
							maxLength: 2
						});
						this._hourText.addListener("changeValue", this._onValidateHour, this._hourText);
						app.setElementModalInput(this._hourText);
						this.add(this._hourText);
						this._minuteText = new qx.ui.form.TextField("0");
						this._minuteText.set({
							width:     26,
							maxLength: 2
						});
						this._minuteText.addListener("changeValue", this._onValidateMinute, this._minuteText);
						app.setElementModalInput(this._minuteText);
						this.add(this._minuteText);
						this._secondText = new qx.ui.form.TextField("0");
						this._secondText.set({
							width:     26,
							maxLength: 2
						});
						this._secondText.addListener("changeValue", this._onValidateMinute, this._secondText);
						app.setElementModalInput(this._secondText);
						this.add(this._secondText);
						this._dateSelect = new qx.ui.form.SelectBox();
						this._dateSelect.set({
							width: 90
						});
						this._dateSelect.add(new qx.ui.form.ListItem("Today", null, 0));
						this._dateSelect.add(new qx.ui.form.ListItem("Tomorrow", null, 1));
						this._dateSelect.add(new qx.ui.form.ListItem("2 Days", null, 2));
						this._dateSelect.add(new qx.ui.form.ListItem("3 Days", null, 3));
						this._dateSelect.add(new qx.ui.form.ListItem("4 Days", null, 4));
						this._dateSelect.add(new qx.ui.form.ListItem("5 Days", null, 5));
						this._dateSelect.add(new qx.ui.form.ListItem("6 Days", null, 6));
						this._dateSelect.add(new qx.ui.form.ListItem("7 Days", null, 7));
						this.add(this._dateSelect);

						// changeValue listeners
						this._hourText.addListener("changeValue", this._updateValue, this);
						this._minuteText.addListener("changeValue", this._updateValue, this);
						this._secondText.addListener("changeValue", this._updateValue, this);
						this._dateSelect.addListener("changeSelection", this._updateValue, this);
					},
					fireChangeValue:   function() {
						this.fireDataEvent("changeValue", this.getValue());
					},
					_applyValue:       function(value) {
						if(this._updatingValue) {
							return;
						}

						// We need to get date difference
						var st = webfrontend.data.ServerTime.getInstance();
						var serverStep = st.getServerStep();
						var gameNow = webfrontend.Util.getCurrentTime().getTime();
						{
							//gameNow.setTime(gameNow.getTime() + serverOffset);// - localOffset);
							var tmp1 = new Date(gameNow);
							var tmp2 = new Date(value.getTime());
							tmp1.setHours(0);
							tmp1.setMinutes(0);
							tmp1.setSeconds(0);
							tmp1.setMilliseconds(0);
							tmp2.setHours(0);
							tmp2.setMinutes(0);
							tmp2.setSeconds(0);
							tmp2.setMilliseconds(0);
							var totalDaysNow = Math.floor(tmp1.getTime() / (24 * 3600 * 1000));
							var totalDaysValue = Math.floor(tmp2.getTime() / (24 * 3600 * 1000));
							var daysOffset = totalDaysValue - totalDaysNow;
						}
						/* (e) {
						 console.log("Error");
						 console.dir(e);
						 } */

						{
							this._applyingValue = true;
							this._hourText.setValue(String(value.getHours()));
							this._minuteText.setValue(String(value.getMinutes()));
							this._secondText.setValue(String(value.getSeconds()));
							this._dateSelect.setModelSelection([daysOffset]);
						}
						/* {
						 this._applyingValue=false;
						 }*/
						this.fireChangeValue();
					},
					_updateValue:      function() {
						if(this._applyingValue) {
							return;
						}

						// Parse fields
						var hours = Number(this._hourText.getValue());
						var minutes = Number(this._minuteText.getValue());
						var seconds = Number(this._secondText.getValue());
						var dayValue = this._dateSelect.getSelection()[0].getModel();
						var dateOffset = Number(dayValue);

						// This function is a bit wierd, returned instance UTC value
						// corresponds to visible time to user.
						var st = webfrontend.data.ServerTime.getInstance();
						var serverStep = st.getServerStep();
						var gameNow = webfrontend.Util.getCurrentTime().getTime();
						gameNow += (dateOffset * 24 * 3600 * 1000);

						//gameNow += serverStep + (dateOffset * 24 * 3600 * 1000);
						// Prepare return date object
						var date = new Date(gameNow);
						date.setHours(hours);
						date.setMinutes(minutes);
						date.setSeconds(seconds);
						date.setMilliseconds(0);
						{
							this._updatingValue = true;
							this.setValue(date);
						}
						/* {
						 this._updatingValue=false;
						 }*/
						this.fireChangeValue();
					},
					_onValidateHour:   function(e) {
						var num = Math.floor(Number(e.getData()));
						if(num > 23) {
							e.stopPropagation();
							this.setValue("23");
						} else if(num < 0 || isNaN(num)) {
							e.stopPropagation();
							this.setValue("0");
						} else if(String(num) != e.getData()) {
							e.stopPropagation();
							this.setValue(String(num));
						}
					},
					_onValidateMinute: function(e) {
						var num = Math.floor(Number(e.getData()));
						if(num > 59) {
							e.stopPropagation();
							this.setValue("59");
						} else if(num < 0 || isNaN(num)) {
							e.stopPropagation();
							this.setValue("0");
						} else if(String(num) != e.getData()) {
							e.stopPropagation();
							this.setValue(String(num));
						}
					}
				}
			});
			qx.Class.define("ava.ui.AboutWindow", {
				type:      "singleton",
				extend:    qx.ui.window.Window,
				construct: function() {
					this.base(arguments, 'AvaTools v' + ava.Version.PAversion);
					this.buildUI();
				},
				members:   {
					buildUI: function() {
						var app = qx.core.Init.getApplication();
						this.setLayout(new qx.ui.layout.VBox(10));
						this.set({
							allowMaximize:  false,
							allowMinimize:  false,
							showMaximize:   false,
							showMinimize:   false,
							showStatusbar:  false,
							showClose:      false,
							contentPadding: 5,
							useMoveFrame:   true,
							resizable:      true
						});
						this.setWidth(400);
						webfrontend.gui.Util.formatWinClose(this);

						// Licensing
						var licenseLabel = new qx.ui.basic.Label("License").set({
							font: "bold"
						});
						this.add(licenseLabel);
						var license = "AvaSuite  - Not (c) Not (tm)\n";
						license += "\n\ntodo";
						var licenseText = new qx.ui.form.TextArea();
						licenseText.set({
							readOnly:  true,
							wrap:      true,
							autoSize:  true,
							tabIndex:  303,
							minHeight: 280
						});
						licenseText.setValue(license);
						this.add(licenseText);

						// Close button
						var closeButton = new qx.ui.form.Button("Close");
						closeButton.addListener("execute", this.hide, this);
						this.add(closeButton);
					}
				}
			});
			qx.Class.define("ava.ui.CancelOrderPanel", {
				extend:    qx.ui.container.Composite,
				construct: function() {
					this.base(arguments);
					this.buildUI();
				},
				statics:   {
					/**
					 * Returns list of order IDs, filtered by provided function.
					 *
					 * @param filterFunc Filter function, with signature "boolean function(order)". Return true to include the order.
					 * @return Array of order IDs.
					 */
					getOrderList:   function(filterFunc) {
						var activeCity = webfrontend.data.City.getInstance();
						var unitOrders = activeCity.getUnitOrders();
						var idList = [];
						if(unitOrders != null) {
							unitOrders.forEach(function(order) {
								if(filterFunc(order)) {
									idList.push(order.id);
								}
							});
						}
						return idList;
					},
					cancelAll:      function(callback, self) {
						// Get list
						var orderList = this.getOrderList(function(order) {
							return ava.CombatTools.canOrderBeCancelled(order) || (order.type == ava.CombatTools.RAID_ORDER_ID && order.recurringType != 0);
						});

						// Issue order
						paDebug("Orders to cancel: " + orderList.length);
						ava.CombatTools.cancelOrders(orderList, callback, self);
					},
					cancelAllRaids: function(callback, self) {
						// Get list
						var orderList = this.getOrderList(function(order) {
							return order.type == ava.CombatTools.RAID_ORDER_ID && (order.recurringType != 0 || ava.CombatTools.canOrderBeCancelled(order));
						});

						// Issue order
						paDebug("Orders to cancel: " + orderList.length);
						ava.CombatTools.cancelOrders(orderList, callback, self);
					}
				},
				members:   {
					//_cancelAllButton:null,
					_cancelRaidsButton:  null,
					_cancelRaidsSelect:  null,
					buildUI:             function() {
						this.setLayout(new qx.ui.layout.VBox(5));
						var firstRow = new qx.ui.container.Composite();
						firstRow.setLayout(new qx.ui.layout.HBox(2));
						firstRow.set({
							width: 118
						});

						/*
						 var secondRow = new qx.ui.container.Composite();
						 secondRow.setLayout(new qx.ui.layout.HBox(2));
						 secondRow.set({width:100})
						 // Return By
						 this._returnByButton = new qx.ui.form.Button("Rtn");
						 this._returnByButton.set({width:30, maxWidth:30, appearance:"button-text-small", toolTipText:"All raids return by XX:XX:XX"});
						 this._returnByButton.addListener("execute", this.returnBy, this);
						 // Cancel All
						 this._cancelAllButton = new qx.ui.form.Button("C All");
						 this._cancelAllButton.set({width:50, maxWidth:50, appearance:"button-text-small", toolTipText:"Cancel all orders. Careful!"});
						 this._cancelAllButton.addListener("execute", this.cancelAll, this);
						 */
						// Cancel Raids
						this._cancelRaidsSelect = new qx.ui.form.SelectBox().set({
							width:         80,
							maxWidth:      80,
							toolTipText:   "Cancel all raid orders or alter to return in the specified number of hours.",
							paddingTop:    0,
							paddingBottom: 0
						});
						this._cancelRaidsSelect.add(new qx.ui.form.ListItem("C Raids", null, 0));
						this._cancelRaidsSelect.add(new qx.ui.form.ListItem("C All", null, 1));
						this._cancelRaidsSelect.add(new qx.ui.form.ListItem("C all city group raids", null, 110));
						this._cancelRaidsSelect.add(new qx.ui.form.ListItem("Complete", null, 100));
						this._cancelRaidsSelect.add(new qx.ui.form.ListItem("Set rtn time", null, 2));
						this._cancelRaidsSelect.add(new qx.ui.form.ListItem("Rtn 6h", null, 6));
						this._cancelRaidsSelect.add(new qx.ui.form.ListItem("Rtn 12h", null, 12));
						this._cancelRaidsSelect.add(new qx.ui.form.ListItem("Rtn 18h", null, 18));
						this._cancelRaidsSelect.add(new qx.ui.form.ListItem("Rtn 24h", null, 24));
						this._cancelRaidsSelect.add(new qx.ui.form.ListItem("Rtn 36h", null, 36));
						this._cancelRaidsSelect.add(new qx.ui.form.ListItem("Rtn 48h", null, 48));
						this._cancelRaidsSelect.add(new qx.ui.form.ListItem("Rtn 72h", null, 72));
						this._cancelRaidsSelect.setMaxListHeight(500);

						//this._cancelRaidsSelect.setSelection( [this._cancelRaidsSelect.getChildren()[0]] );
						this._cancelRaidsButton = new qx.ui.form.Button("Go");
						this._cancelRaidsButton.set({
							width:       23,
							maxWidth:    23,
							appearance:  "button-text-small",
							toolTipText: "Apply to raid orders."
						});
						this._cancelRaidsButton.addListener("execute", this.cancelAllRaids, this);

						// Add to layout
						firstRow.add(this._cancelRaidsSelect);
						firstRow.add(this._cancelRaidsButton);

						//secondRow.add(this._returnByButton);
						//secondRow.add(this._cancelAllButton);
						this.add(firstRow);

						//this.add(secondRow);
						var secondRow = new qx.ui.container.Composite();
						secondRow.setLayout(new qx.ui.layout.HBox(2));
						secondRow.set({
							width: 100
						});

						//secondRow.add(this._applyToAll);
						this.add(secondRow);
					},
					_setButtonsEnabled:  function(value) {
						//this._cancelAllButton.setEnabled(value);
						this._cancelRaidsButton.setEnabled(value);
						//this._returnByButton.setEnabled(value);
					},
					returnBy:            function() {
						var dialog = ava.ui.ReturnByWindow.getInstance();
						dialog.center();
						dialog.show();
						this._setButtonsEnabled(true);
					},
					cancelAll:           function() {
						if(!confirm("Do you want to cancel all orders?")) {
							this._setButtonsEnabled(true);
							return;
						}
						this._setButtonsEnabled(false);
						this.self(arguments).cancelAll(function(error) {
							this._setButtonsEnabled(true);
							if(error) {
								paDebug(error);
							}
						}, this);
					},
					cancelAllRaids:      function() {
						this._setButtonsEnabled(false);
						var opt = this._cancelRaidsSelect.getSelection()[0].getModel();
						if(opt == 0) {
							this.self(arguments).cancelAllRaids(function(error) {
								this._setButtonsEnabled(true);
								if(error) {
									paDebug(error);
								}
							}, this);
						} else if(opt == 1) {
							this.cancelAll();
						} else if(opt == 2) {
							this.returnBy();
						} else if(opt == 100) {
							var orders = webfrontend.data.City.getInstance().unitOrders;
							var commandManager = webfrontend.net.CommandManager.getInstance();
							for(var i in orders) {
								if(orders[i].type == ava.CombatTools.RAID_ORDER_ID) {
									commandManager.sendCommand("UnitOrderSetRecurringOptions", {
										cityid:           webfrontend.data.City.getInstance().getId(),
										id:               orders[i].id,
										isDelayed:        orders[i].isDelayed,
										recurringType:    1,
										recurringEndStep: webfrontend.Util.getCurrentTime().getTime()
									}, this, function(error) {
										if(error) {
											paDebug(error);
										}
									});
								}
							}
							this._setButtonsEnabled(true);
						} else if(opt == 110) {
							addConsumer("COMO", this.cancelRaids, this, "a");
						} else {
							var combatTools = ava.CombatTools;
							var st = webfrontend.data.ServerTime.getInstance();
							var curTime = webfrontend.Util.getCurrentTime();
							curTime.setHours(curTime.getHours() + parseInt(opt));
							var returnBy = curTime.getTime();
							var serverStep = st.getServerStep();
							var gameNow = webfrontend.Util.getCurrentTime().getTime();
							var delta = Math.floor((returnBy - gameNow) / 1000) + 1;
							returnBy = serverStep + delta;
							var currRecurrType = 2;
							var orders = webfrontend.data.City.getInstance().unitOrders;
							var commandManager = webfrontend.net.CommandManager.getInstance();
							for(var i in orders) {
								if(orders[i].type == ava.CombatTools.RAID_ORDER_ID) {
									commandManager.sendCommand("UnitOrderSetRecurringOptions", {
										cityid:           webfrontend.data.City.getInstance().getId(),
										id:               orders[i].id,
										isDelayed:        orders[i].isDelayed,
										recurringType:    currRecurrType,
										recurringEndStep: returnBy
									}, this, function(error) {
										if(error) {
											paDebug(error);
										}
									});
								}
							}
							this._setButtonsEnabled(true);
						}
					},
					sendCancelOrder:     function(request) {
						// Send command
						webfrontend.net.CommandManager.getInstance().sendCommand("UnitOrderSetRecurringOptions", request, null, function(unknown, ok) {
							//if (!ok) ava.Chat.getInstance().addChatMessage(' Error cancelling order ' + count + ' cancel orders.', true);
						});
					},
					cancelOrder:         function(request, delay) {
						var _this = this;
						setTimeout(function() {
							{
								_this.sendCancelOrder(request);
							}
							/* (e) {
							 console.log("Error");
							 console.dir(e);
							 } */
						}, delay);
					},
					hasCity:             function(cityList, cityId) {
						var retVal = false;
						for(elem in cityList) {
							if(cityId == elem) {
								retVal = true;
								break;
							}
						}
						return retVal;
					},
					showContinueMessage: function(msgText, sendingMsgText, requestArray, thisObj) {
						var win = new qx.ui.window.Window("Continue?");
						win.setLayout(new qx.ui.layout.VBox(2));
						win.set({
							showMaximize:  false,
							showMinimize:  false,
							allowMaximize: false,
							width:         400,
							height:        80
						});

						win.lbl = new qx.ui.basic.Label(msgText).set({
							rich: true
						});

						win.add(win.lbl);
						var row = new qx.ui.container.Composite(new qx.ui.layout.HBox(2));
						win.add(row);
						var btn = new qx.ui.form.Button("Yes").set({
							appearance:    "button-text-small",
							width:         80,
							paddingLeft:   5,
							paddingRight:  5,
							paddingTop:    0,
							paddingBottom: 0
						});
						btn.win = win;
						btn.requestArray = requestArray;
						row.add(btn);
						btn.addListener("click", function() {
							ava.Chat.getInstance().addChatMessage(sendingMsgText, false);
							var requests = this.requestArray;
							var delay = 500;
							for(var i = 0; i < requests.length; i++) {
								thisObj.cancelOrder(JSON.parse(requests[i]), delay);
								delay += 1000;
							}
							this.win.hide();
						});
						var btn2 = new qx.ui.form.Button("No").set({
							appearance:    "button-text-small",
							width:         80,
							paddingLeft:   5,
							paddingRight:  5,
							paddingTop:    0,
							paddingBottom: 0
						});
						btn2.win = win;
						row.add(btn2);
						btn2.addListener("click", function() {
							this.win.hide();
						});
						win.addListener("close", function() {
						}, this);
						win.center();
						win.open();
					},
					cancelRaids:         function(results, thisObj) {
						if(results == null) {
							thisObj._setButtonsEnabled(true);
							return;
						}
						removeConsumer("COMO", thisObj.cancelRaids, thisObj);
						var serverTime = webfrontend.data.ServerTime.getInstance();
						var cityList = webfrontend.data.Player.getInstance().cities;
						var orderList = new Array();
						var delay = 500;
						var data = new qx.util.StringBuilder(2048);
						var count = 0;
						var app = qx.core.Init.getApplication();
						var player = webfrontend.data.Player.getInstance();
						var cids;
						var groupId = app.cityBar.citiesSelect.getSelectedGroupId();
						for(var ii = 0; ii < player.citygroups.length; ++ii) {
							if(player.citygroups[ii].i == groupId) {
								cids = player.citygroups[ii].c;
								break;
							}
						}
						if(!cids) {
							cids = new Array();
							for(elem in cityList) {
								cids.push(Number(elem));
							}
						}

						var requestArray = new Array();
						for(var i = 0; i < results.length; i++) {
							var result = results[i];
							if(result.hasOwnProperty("c") && cids.indexOf(result.i) >= 0 && (cityList.length == 0 || thisObj.hasCity(cityList, result.i))) {
								for(var j = 0; j < result.c.length; j++) {
									var order = result.c[j];
									if(order.t == ava.CombatTools.RAID_ORDER_ID && (order.r != 0 || ((order.s != 2) && (order.es > serverTime.getServerStep() - 600)))) {
										++count;
										var request = '{"cityid":' + result.i + ', "id":' + order.i + ', "isDelayed":' + (order.s == 0) + ', "recurringType": 0}';
										requestArray.push(request);
									}
								}
							}
						}
						if(count > 0) {
							var resObj = new Object();
							var steps = count;
							var hr = steps / 3600;
							var remHr = parseInt(hr);
							var min = (steps - (remHr * 3600)) / 60;
							var remMin = parseInt(min);
							var sec = (steps - (remHr * 3600) - (remMin * 60));
							var remSec = parseInt(sec);
							var remainingTime = checkTime(remHr) + ":" + checkTime(remMin) + ":" + checkTime(remSec);
							thisObj.showContinueMessage('Are you sure? ' + count + ' orders will be sent.  This will take approximately ' + remainingTime + '.', ' Sending ' + count + ' cancel orders.  This will take approximately ' + remainingTime + '.', requestArray, thisObj);
						} else {
							ava.Chat.getInstance().addChatMessage(' No raids found to be cancelled.', false);
						}
						thisObj._setButtonsEnabled(true);
					}
				}
			});
			qx.Class.define("ava.ui.CombatWindow", {
				type:      "singleton",
				extend:    qx.ui.window.Window,
				construct: function() {
					this.base(arguments, "Combat Tool");

					// Build UI
					this._rows = [];
					this.buildUI();

					// Load prev config
					this.loadData();

					// Listeners
					this._listener_cityChanged = webfrontend.data.City.getInstance().addListener("changeVersion", function() {
						if(!this.isVisible()) {
							return;
						}
						this.refresh();
						this._setActionEnabled(true);
						this._lock_safeguard = null;
					}, this);
					this.addListener("appear", function() {
						this.refresh();
						this.resetMessage();
					}, this);
					this.addListener("changeActive", function(e) {
						if(!e.getData()) {
							this.storeData();
						}
					}, this);
				},
				destruct:  function() {
					var city = webfrontend.data.City.getInstance();
					if(this._listener_cityChanged)
						city.removeListenerById(this._listener_cityChanged);
				},
				members:   {
					_addButton:            null,
					_resetButton:          null,
					_messageLabel:         null,
					_AvailableLabel:       null,
					_includeActive:        null,
					_allowPartial:         null,
					_useScouts:            null,
					_useSmallestForFakes:  null,
					_excludeDefenseCheck:  null,
					_forceMsCheck:         null,
					_travelModeGroup:      null,
					_rows:                 null,
					_magicTime:            null,
					_infTime:              null,
					_cavTime:              null,
					_siegeTime:            null,
					_copyButton:           null,
					_listener_cityChanged: null,
					_lock_safeguard:       null,
					buildUI:               function() {
						this.setLayout(new qx.ui.layout.VBox(5));
						this.set({
							allowMaximize:  false,
							allowMinimize:  false,
							showMaximize:   false,
							showMinimize:   false,
							showStatusbar:  false,
							showClose:      false,
							contentPadding: 5,
							useMoveFrame:   true,
							resizable:      false,
							minWidth:       545
						});
						webfrontend.gui.Util.formatWinClose(this);

						// Message
						this._messageLabel = new qx.ui.basic.Label();
						this._messageLabel.set({
							textColor: "#D10600",
							wrap:      true
						});
						this.add(this._messageLabel);

						// Times
						this._magicTime = new ava.ui.components.TimePicker("Magic");
						this._cavTime = new ava.ui.components.TimePicker("CAvalry");
						this._infTime = new ava.ui.components.TimePicker("Infantry");
						this._siegeTime = new ava.ui.components.TimePicker("Siege");
						this._copyButton = new qx.ui.form.Button("Copy");
						this._copyButton.set({
							appearance: "button-text-small"
						});
						this._copyButton.addListener("execute", this.copyTimes, this);
						var firstTimeRow = new qx.ui.container.Composite();
						firstTimeRow.setLayout(new qx.ui.layout.HBox(5));
						firstTimeRow.add(this._magicTime);
						firstTimeRow.add(this._copyButton);

						// Put it in standalone box
						var timesBox = new qx.ui.container.Composite(new qx.ui.layout.VBox(5));
						timesBox.add(firstTimeRow);
						timesBox.add(this._cavTime);
						timesBox.add(this._infTime);
						timesBox.add(this._siegeTime);

						// Import/Export button
						var importButton = new qx.ui.form.Button("Import/Export");
						importButton.set({
							appearance:  "button-text-small",
							allowGrowX:  false,
							toolTipText: "Import or export attacks configuration."
						});
						importButton.addListener("execute", function() {
							var win = ava.ui.CombatWindowExport.getInstance();
							win.center();
							win.open();
						}, this);

						// Reset button
						this._resetButton = new qx.ui.form.Button("Reset");
						this._resetButton.set({
							appearance:  "button-text-small",
							allowGrowX:  false,
							toolTipText: "Resets all values in the dialog."
						});
						this._resetButton.addListener("execute", function() {
							if(confirm("Are you sure you want to throw away all your plans?")) {
								this.reset();
							}
						}, this);
						var buttonsRow = new qx.ui.container.Composite(new qx.ui.layout.HBox(5));
						buttonsRow.add(importButton);
						buttonsRow.add(this._resetButton);

						// Include check
						this._includeActive = new qx.ui.form.CheckBox("Include units out of the city");
						this._includeActive.setToolTipText("If checked, units currently out of the city (raiding/plundering etc) will be included into commands. You are supposed to get them home in time by yourself.");
						this._includeActive.initValue(true);
						this._includeActive.addListener("changeValue", this.refresh, this);

						// Allow partial check
						this._allowPartial = new qx.ui.form.CheckBox("Allow partial nAval attack");
						this._allowPartial.setToolTipText("When there are not enough Frigates to carry your troops, it allows to send only part of the army that will fit on the ships. Has no effect on land attacks.");

						// Use scouts
						this._useScouts = new qx.ui.form.CheckBox("Include scouts in the attacks");
						this._useScouts.setToolTipText("All Available scouts will be sent along other units. If there will be enough scouts, they will be also used for fakes.");
						this._useScouts.setValue(true);
						this._useScouts.addListener("changeValue", this.refresh, this);

						// Use smallest for fakes
						this._useSmallestForFakes = new qx.ui.form.CheckBox("Prefer smallest stack for fakes instead of largest");
						this._useSmallestForFakes.setToolTipText("By default, unit you have the most of is used for fakes. This changes the order.");
						this._useSmallestForFakes.setEnabled(false);
						this._useSmallestForFakes.exclude();

						// Hidden for now
						// Force 3000 min score
						this._forceMsCheck = new qx.ui.form.CheckBox("Always use 3000 min TS");
						this._forceMsCheck.set({
							toolTipText: "Always use 3000 min TS."
						});
						this._forceMsCheck.setValue(true);

						// Exclude Defense
						this._excludeDefenseCheck = new qx.ui.form.CheckBox("Exclude Defense");
						this._excludeDefenseCheck.set({
							toolTipText: "Don't use defensive troops."
						});
						this._excludeDefenseCheck.setValue(true);
						this._excludeDefenseCheck.addListener("changeValue", this.refresh, this);

						// Travel mode
						var travelModeLabel = new qx.ui.basic.Label("Travel mode");
						var autoMode = new qx.ui.form.RadioButton("Auto");
						autoMode.set({
							model:       "auto",
							toolTipText: "Units will be sent on foot if the target is on the same continent. Otherwise ships will be used."
						});
						var navyMode = new qx.ui.form.RadioButton("Navy");
						navyMode.set({
							model:       "navy",
							toolTipText: "Units will be send on Frigates even to the target on the same continent. Does not affect ships."
						});
						var landMode = new qx.ui.form.RadioButton("Land (Moongate)");
						landMode.set({
							model:       "land",
							toolTipText: "Units will be sent on foot even if the target is on different continent. Does not use ships at all."
						});
						var travelModeContainer = new qx.ui.container.Composite(new qx.ui.layout.Grid(5, 2));
						travelModeContainer.add(travelModeLabel, {
							row:    0,
							column: 0
						});
						travelModeContainer.add(autoMode, {
							row:    0,
							column: 1
						});
						travelModeContainer.add(navyMode, {
							row:    1,
							column: 1
						});
						travelModeContainer.add(landMode, {
							row:    2,
							column: 1
						});
						this._travelModeGroup = new qx.ui.form.RadioGroup(autoMode, navyMode, landMode);
						this._travelModeGroup.addListener("changeSelection", this.refresh, this);

						// Layout
						var optionsBox = new qx.ui.container.Composite(new qx.ui.layout.VBox(5));
						optionsBox.add(buttonsRow);
						optionsBox.add(this._includeActive);
						optionsBox.add(this._allowPartial);
						optionsBox.add(this._useScouts);
						optionsBox.add(this._useSmallestForFakes);
						optionsBox.add(this._forceMsCheck);
						optionsBox.add(this._excludeDefenseCheck);
						optionsBox.add(travelModeContainer);
						var outerBox = new qx.ui.container.Composite(new qx.ui.layout.HBox(40));
						outerBox.add(timesBox);
						outerBox.add(optionsBox);
						this.add(outerBox);

						// Units
						var AvailableLabel = this._AvailableLabel = new qx.ui.basic.Label();
						AvailableLabel.set({
							width: 250,
							wrap:  true
						});
						var refreshButton = new qx.ui.form.Button("Refresh");
						refreshButton.set({
							appearance: "button-text-small"
						});
						refreshButton.addListener("execute", this.refresh, this);
						var resetCounterButton = new qx.ui.form.Button("RC");
						resetCounterButton.set({
							appearance:  "button-text-small",
							toolTipText: "Reset the indicative counter."
						});
						resetCounterButton.addListener("execute", this.resetCounter, this);
						var AvailControl = new qx.ui.container.Composite();
						AvailControl.setLayout(new qx.ui.layout.HBox(5));
						AvailControl.add(AvailableLabel);
						AvailControl.add(refreshButton);
						AvailControl.add(new qx.ui.core.Widget().set({
							height: 1
						}), {
							flex: 1
						});
						AvailControl.add(resetCounterButton);
						this.add(AvailControl);
						this.scrollContainer = new qx.ui.container.Scroll().set({
							width:  550,
							height: 20
						});
						this.scrollContainer.setMaxHeight(300);
						this.scrollContainer.setMinHeight(20);
						this.insideScrollContainer = new qx.ui.container.Composite();
						this.scrollArea = new qx.ui.layout.VBox();
						this.insideScrollContainer.setLayout(this.scrollArea);
						this.scrollContainer.add(this.insideScrollContainer);
						this.add(this.scrollContainer);

						// Add button
						var addButton = this._addButton = new qx.ui.form.Button("Add");
						addButton.set({
							appearance:  "button-text-small",
							allowGrowX:  false,
							toolTipText: "Adds new target field."
						});
						addButton.addListener("execute", this.addRow, this);
						this.add(addButton);

						// Note
						var noteLabel = new qx.ui.basic.Label("<em>Note: Send fake before real attacks.</em>");
						noteLabel.setRich(true);
						this.add(noteLabel);

						// First data row
						this.addRow();
					},
					addRow:                function() {
						var row = new ava.ui.components.AttackOrder();
						row.addListener("attack", this.onAttack, this);
						this.scrollContainer.setHeight(this.scrollContainer.getHeight() + 23);
						this.insideScrollContainer.add(row);
						this._rows.push(row);
						if(this._rows.length > 15) {
							this._addButton.setEnabled(false);
						}
						return row;
					},
					_removeRow:            function(row) {
						// Remove from window
						this.insideScrollContainer.remove(row);
						this.scrollContainer.setHeight(this.scrollContainer.getHeight() - 23);

						// Dispose it
						row.dispose();
					},
					_setActionEnabled:     function(value) {
						this._rows.forEach(function(row) {
							row.setActionEnabled(value);
						});
					},
					reset:                 function() {
						// Delete rows
						this._rows.forEach(this._removeRow, this);
						this._rows = [];

						// We need at least one row
						this.addRow();
						this._addButton.setEnabled(true);

						// Reset times
						this._magicTime.resetValue();
						this._cavTime.resetValue();
						this._infTime.resetValue();
						this._siegeTime.resetValue();

						// Options
						this._includeActive.setValue(false);
						this._allowPartial.setValue(false);
						this._useScouts.setValue(true);
						this._useSmallestForFakes.setValue(false);
						this._forceMsCheck.setValue(true);
						this._excludeDefenseCheck.setValue(true);
						this._travelModeGroup.resetSelection();
					},
					resetCounter:          function() {
						this._rows.forEach(function(row) {
							row.resetCount();
						}, this);
					},
					refresh:               function() {
						{
							var city = webfrontend.data.City.getInstance();

							// Parameters
							var combatTools = ava.CombatTools;
							var includeActive = this._includeActive.getValue();
							var excludeDefense = this._excludeDefenseCheck.getValue();
							var travelMode = this.getTravelMode();
							var excludeNavy = (travelMode == "land");

							// Get units
							var AvailUnits = combatTools.getAvailableUnits(city, includeActive, excludeDefense, excludeNavy);

							// Format it
							var text = "";
							AvailUnits.all.forEach(function(u) {
								if(u.count > 0) {
									if(text.length > 0)
										text += ", ";
									text += u.count + " " + u.name;
								}
							});
							if(text.length == 0) {
								text = "No troops Available";
							}
							this._AvailableLabel.setValue(text);
						}
						/* (e) {
						 console.log("Error");
						 console.dir(e);
						 this.setMessage(e);
						 } */
					},
					onAttack:              function(e) {
						var _this = this;
						{
							// Assemble attack info
							var data = e.getData();
							var target = e.getTarget();
							var attack = this.getAttackDetails(data.target, data.type, data.attack);

							// Validate TS
							var minTS = this.getMinAttackTS();
							if(minTS > 0 && data.attack != "fake" && data.attack != "fakecap" && attack.attackTS < minTS) {
								throw new Error("Minimal troop count for the attack not met");
							}

							// Disable buttons - they will be enabled automatically on city update
							_this._setActionEnabled(false);
							var lockId = _this._lock_safeguard = Math.random();
							paDebug("Attack lock = " + lockId);
							setTimeout(function() {
								paDebug("Attack lock timeout: _this._lock_safeguard=" + _this._lock_safeguard + " lockId=" + lockId);
								if(_this._lock_safeguard == lockId) {
									_this._setActionEnabled(true);
								}
							}, 10000);

							// Send attack order
							ava.CombatTools.orderUnits(attack.units, attack.target, attack.type, attack.timingType, attack.time, function(ok, errorCode) {
								if(errorCode.r0 == 0) {
									// Nice message
									var msg = attack.isPartial ? "Partial attack sent" : "Attack sent";
									msg += " (" + attack.attackTS + " TS)";
									_this.setMessage(msg);

									// Simple counter
									target.addCount((attack.attackType || "").toUpperCase());
								} else {
									paDebug(errorCode.r0 + ":" + errorCode.r1);
									var error = ava.CombatTools.getErrorMessage(errorCode.r0);
									_this.setMessage("Unable to dispatch troops: " + error);
									_this._setActionEnabled(true);
									_this._lock_safeguard = null;
								}
							});
						}
						/* (ex) {
						 this.setMessage(ex);
						 } */

						// Store data
						this.storeData();
					},
					getTravelMode:         function() {
						var sel = this._travelModeGroup.getSelection()[0];
						return sel ? sel.getModel() : null;
					},
					getAttackTimes:        function() {
						var combatTools = ava.CombatTools;
						var serverOffset = webfrontend.data.ServerTime.getInstance().getServerOffset();
						var localOffset = -new Date().getTimezoneOffset() * 60000;
						var siege = new Date(this._siegeTime.getValue().getTime() - serverOffset + localOffset).getTime();
						return {
							i: new Date(this._infTime.getValue().getTime() - serverOffset + localOffset).getTime(),
							m: new Date(this._magicTime.getValue().getTime() - serverOffset + localOffset).getTime(),
							c: new Date(this._cavTime.getValue().getTime() - serverOffset + localOffset).getTime(),
							s: siege,
							d: siege
						};
						/*
						 var siege = combatTools.convertGameTimeToUtc(this._siegeTime.getValue());
						 return {
						 i : combatTools.convertGameTimeToUtc(this._infTime.getValue()),
						 m : combatTools.convertGameTimeToUtc(this._magicTime.getValue()),
						 c : combatTools.convertGameTimeToUtc(this._cavTime.getValue()),
						 s : siege,
						 d : siege
						 };
						 */
					},
					getAttackDetails:      function(target, type, attack) {
						var city = webfrontend.data.City.getInstance();
						var server = webfrontend.data.Server.getInstance();
						var combatTools = ava.CombatTools;

						// Parameters
						var includeActive = this._includeActive.getValue();
						var useScouts = this._useScouts.getValue();
						var excludeDefense = this._excludeDefenseCheck.getValue();
						var allowPartial = this._allowPartial.getValue();
						var travelMode = this.getTravelMode();
						var minTS = this._forceMsCheck.getValue() ? ava.CombatTools.DEFAULT_MIN_TS : null;

						// Get Available units
						var AvailUnits = combatTools.getAvailableUnits(city, includeActive, excludeDefense, travelMode == "land");

						// Determine, whether we need nAval attack
						var nAval = (travelMode == "navy" || AvailUnits.ships.length > 0);
						if(!nAval && travelMode != "land") {
							var targetCoords = combatTools.parseCoords(target);
							var targetCont = server.getContinentFromCoords(targetCoords[0], targetCoords[1]);
							var sourceCoords = combatTools.cityIdToCoords(city.getId());
							var sourceCont = server.getContinentFromCoords(sourceCoords[0], sourceCoords[1]);
							nAval = (targetCont != sourceCont);
						}

						if(nAval) {
							if(!city.getOnWater()) {
								throw new Error("Unable to launch nAval attack from land-locked castle");
							}
						}

						// Get units for attack
						var attackUnits = null;
						if(attack == "fake" || attack == "fakecap") {
							if(useScouts) {
								{
									attackUnits = combatTools.prepareScoutAttackUnits(AvailUnits, nAval, true, false, minTS);
									type = combatTools.SCOUT_ORDER_ID;
								}
								/* (ignored) {
								 } */
							}

							if(attackUnits == null) {
								attackUnits = combatTools.prepareFakeAttackUnits(AvailUnits, nAval, minTS, attack == "fakecap");
							}
						} else if(attack == "scout") {
							attackUnits = combatTools.prepareScoutAttackUnits(AvailUnits, nAval, false, allowPartial, minTS);
						} else {
							attackUnits = combatTools.prepareRealAttackUnits(AvailUnits, nAval, attack == "demo", attack == "capture", useScouts, allowPartial, minTS);
						}

						// Determine attack time
						var attackType = combatTools.getMajorAttackType(attackUnits.units);
						var times = this.getAttackTimes();
						var attackTime = times[attackType];
						if(attackTime == null) {
							throw new Error("Unknown time of the attack");
						}

						if(attackType == "d") {
							type = combatTools.SIEGE_ORDER_ID;
						}

						// Put it all together
						return {
							target:     target,
							type:       type,
							units:      attackUnits.units,
							attackTS:   attackUnits.totalTS,
							timingType: combatTools.ARRIVAL_TIMING_ID,
							time:       attackTime,
							isPartial:  attackUnits.isPartial,
							attackType: attackType
						};
					},
					copyTimes:             function() {
						var value = this._magicTime.getValue();
						this._cavTime.setValue(value);
						this._infTime.setValue(value);
						this._siegeTime.setValue(value);
					},
					getMinAttackTS:        function() {
						return 1;
					},
					resetMessage:          function() {
						this._messageLabel.setValue("");
					},
					setMessage:            function(text) {
						this._messageLabel.setValue(text || "");
					},
					getData:               function() {
						var combatTools = ava.CombatTools;
						var data = {};

						// Get times
						data.times = {
							magic: combatTools.convertGameTimeToUtc(this._magicTime.getValue()),
							inf:   combatTools.convertGameTimeToUtc(this._infTime.getValue()),
							cav:   combatTools.convertGameTimeToUtc(this._cavTime.getValue()),
							siege: combatTools.convertGameTimeToUtc(this._siegeTime.getValue())
						};

						// Targets
						data.targets = [];
						this._rows.forEach(function(row) {
							var value = row.getValue();
							if(value != null) {
								data.targets.push(value);
							}
						});

						// Options
						data.includeActive = this._includeActive.getValue();
						data.allowPartial = this._allowPartial.getValue();
						data.useScouts = this._useScouts.getValue();
						data.useSmallestForFakes = this._useSmallestForFakes.getValue();
						data.excludeDefense = this._excludeDefenseCheck.getValue();
						data.forceMs = this._forceMsCheck.getValue();
						data.travelMode = this.getTravelMode();
						return data;
					},
					setData:               function(data) {
						var _this = this;
						var combatTools = ava.CombatTools;

						// Reset
						this.reset();

						if(data.times) {
							var now = new Date().getTime();
							if(data.times.magic && data.times.magic > now)
								this._magicTime.setValue(combatTools.convertUtcToGameTime(data.times.magic));
							if(data.times.inf && data.times.inf > now)
								this._infTime.setValue(combatTools.convertUtcToGameTime(data.times.inf));
							if(data.times.cav && data.times.cav > now)
								this._cavTime.setValue(combatTools.convertUtcToGameTime(data.times.cav));
							if(data.times.siege && data.times.siege > now)
								this._siegeTime.setValue(combatTools.convertUtcToGameTime(data.times.siege));
						}

						if(data.targets && data.targets.length > 0) {
							// Delete rows
							this._rows.forEach(this._removeRow, this);
							this._rows = [];

							// Add new
							data.targets.forEach(function(rowData) {
								var row = _this.addRow();
								row.setValue(rowData);
							});
						}

						// Include active
						this._includeActive.setValue(data.includeActive != null ? data.includeActive : true);
						this._allowPartial.setValue(!!data.allowPartial);
						this._useScouts.setValue(data.useScouts != null ? data.useScouts : true);
						this._useSmallestForFakes.setValue(!!data.useSmallestForFakes);
						this._excludeDefenseCheck.setValue(!!data.excludeDefense);
						this._forceMsCheck.setValue(!!data.forceMs);
						this._travelModeGroup.setModelSelection([data.travelMode || "auto"]);
					},
					getStoragePath:        function() {
						return "ava.ui.CombatWindow." + webfrontend.data.Player.getInstance().getId();
					},
					storeData:             function() {
						{
							var path = this.getStoragePath();
							var data = this.getData();
							localStorage.setItem(path, JSON.stringify(data));
							paDebug("CombatWindow data stored");
						}
						/* (e) {
						 console.log("Error");
						 console.dir(e);
						 } */
					},
					loadData:              function() {
						{
							var path = this.getStoragePath();
							var data = JSON.parse(localStorage.getItem(path));
							if(data != null) {
								this.setData(data);
								paDebug("CombatWindow data loaded");
							} else {
								this.reset();
								paDebug("CombatWindow data had no data to load");
							}
						}
						/* (e) {
						 console.log("Error");
						 console.dir(e);
						 } */
					}
				}
			});
			qx.Class.define("ava.ui.CombatWindowExport", {
				type:      "singleton",
				extend:    qx.ui.window.Window,
				construct: function() {
					this.base(arguments, "Commands Import/Export");
					this.buildUI();
				},
				statics:   {
					ORDER_TYPES:  {
						"1": "scout",
						"2": "plunder",
						"3": "assault",
						"4": "support",
						"5": "siege"
					},
					_formatTime:  function(utcTime) {
						// Get time in server time
						var gameTime = ava.CombatTools.convertUtcToGameTime(utcTime, 1);
						var text = qx.lang.String.pad(String(gameTime.getFullYear()), 4, "0") + "/";
						text += qx.lang.String.pad(String(gameTime.getMonth() + 1), 2, "0") + "/";
						text += qx.lang.String.pad(String(gameTime.getDate()), 2, "0") + " ";
						text += qx.lang.String.pad(String(gameTime.getHours()), 2, "0") + ":";
						text += qx.lang.String.pad(String(gameTime.getMinutes()), 2, "0") + ":";
						text += qx.lang.String.pad(String(gameTime.getSeconds()), 2, "0");
						return text;
					},
					_parseTime:   function(text) {
						var m = text.match(/^\s*(\d{4})\/?(\d{1,2})\/?(\d{1,2})\s+(\d{1,2}):(\d{1,2}):(\d{1,2})\s*$/);
						if(!m) {
							return null;
						}
						var date = new Date(m[1], m[2] - 1, m[3], m[4], m[5], m[6], 0);
						if(!isNaN(date)) {
							// Note: Times are always in server time
							return ava.CombatTools.convertGameTimeToUtc(new Date(date), 1);
						} else {
							return null;
						}
					},
					dataToString: function(data, separator) {
						var segments = [];

						// Name
						var name = webfrontend.data.Server.getInstance().getName();
						segments.push(name.replace(/\s*\(.*\)\s*/, ""));

						if(data.times) {
							var now = new Date().getTime();
							if(data.times.magic && data.times.magic > now)
								segments.push("Magic " + this._formatTime(data.times.magic));
							if(data.times.cav && data.times.cav > now)
								segments.push("Cavalry " + this._formatTime(data.times.cav));
							if(data.times.inf && data.times.inf > now)
								segments.push("Infantry " + this._formatTime(data.times.inf));
							if(data.times.siege && data.times.siege > now)
								segments.push("Siege " + this._formatTime(data.times.siege));
						}

						if(data.targets && data.targets.length > 0) {
							data.targets.forEach(function(target) {
								var typeText = ava.ui.CombatWindowExport.ORDER_TYPES[target.type] || target.type;
								var noteText = (target.note && target.note.length > 0) ? " - " + target.note : "";
								segments.push(qx.lang.String.capitalize(target.target + " " + target.attack + " " + typeText) + noteText);
							});
						}

						// Join
						return segments.join(separator);
					},
					parseData:    function(text, separator) {
						var segments = text.split(separator);
						var data = {
							times:   {},
							targets: []
						};

						// Go thru lines and parse them
						segments.forEach(function(segment) {
							segment = ava.CombatTools.removeBBcode(segment).trim();
							var time, m;

							if(m = segment.match(/^magic\s+(.*)$/i)) {
								time = ava.ui.CombatWindowExport._parseTime(m[1]);
								if(time != null) {
									data.times.magic = time;
								}
								return;
							} else if(m = segment.match(/^infantry\s+(.*)$/i)) {
								time = ava.ui.CombatWindowExport._parseTime(m[1]);
								if(time != null) {
									data.times.inf = time;
								}
								return;
							} else if(m = segment.match(/^cavalry\s+(.*)$/i)) {
								time = ava.ui.CombatWindowExport._parseTime(m[1]);
								if(time != null) {
									data.times.cav = time;
								}
								return;
							} else if(m = segment.match(/^siege\s+(.*)$/i)) {
								time = ava.ui.CombatWindowExport._parseTime(m[1]);
								if(time != null) {
									data.times.siege = time;
								}
								return;
							}

							// Target
							var targetMatch = segment.match(/^(\d{1,3}:\d{1,3})\s+(fake|capture|demo|attack|scout)\s+(plunder|siege|assault|scout)\b\s*(.*)$/i);
							if(targetMatch) {
								var type = qx.lang.Object.getKeyFromValue(ava.ui.CombatWindowExport.ORDER_TYPES, targetMatch[3].toLowerCase());
								data.targets.push({
									target: targetMatch[1],
									attack: targetMatch[2].toLowerCase(),
									type:   type,
									note:   (targetMatch[4] || "").replace(/^\s*-\s*/, "")
								});
							}
						});

						if(qx.lang.Object.getValues(data.times).length < 1) {
							delete data.times;
						}
						if(data.targets.length < 1) {
							delete data.targets;
						}
						return data;
					}
				},
				members:   {
					_compactCheck: null,
					_contentText:  null,
					_importButton: null,
					_exportButton: null,
					_closeButton:  null,
					buildUI:       function() {
						var app = qx.core.Init.getApplication();
						this.setLayout(new qx.ui.layout.VBox(5));
						this.set({
							allowMaximize:  false,
							allowMinimize:  false,
							showMaximize:   false,
							showMinimize:   false,
							showStatusbar:  false,
							showClose:      false,
							contentPadding: 5,
							useMoveFrame:   true,
							resizable:      true
						});
						this.set({
							width:  250,
							height: 300
						});
						webfrontend.gui.Util.formatWinClose(this);

						// Note
						var note = new qx.ui.basic.Label("<em>Note: Time is always in Server Time</em>");
						note.setRich(true);
						this.add(note, {
							flex: 0
						});

						// Text area
						var contentText = this._contentText = new qx.ui.form.TextArea("");

						//this._contentText.set({});
						app.setElementModalInput(contentText);
						this.add(contentText, {
							flex: 1
						});

						// Compact
						var compactCheck = this._compactCheck = new qx.ui.form.CheckBox("Compact");
						compactCheck.set({
							toolTipText: "Use single-line format."
						});
						compactCheck.addListener("changeValue", this.exportData, this);
						this.add(compactCheck, {
							flex: 0
						});

						// Buttons
						var exportButton = this._exportButton = new qx.ui.form.Button("Refresh");
						exportButton.set({
							width:       80,
							toolTipText: "Generate text from the Advanced Commands window."
						});
						exportButton.addListener("execute", this.exportData, this);
						var importButton = this._importButton = new qx.ui.form.Button("Import!");
						importButton.set({
							width:       80,
							toolTipText: "Import data into the dialog."
						});
						importButton.addListener("execute", this.importData, this);
						var closeButton = this._closeButton = new qx.ui.form.Button("Close");
						closeButton.set({
							width:       80,
							toolTipText: "Closes the dialog."
						});
						closeButton.addListener("execute", this.hide, this);
						var buttonsRow = new qx.ui.container.Composite();
						buttonsRow.setLayout(new qx.ui.layout.HBox(5));
						buttonsRow.set({
							alignX: "right"
						});
						buttonsRow.add(exportButton);
						buttonsRow.add(importButton);
						buttonsRow.add(closeButton);
						this.add(buttonsRow, {
							flex: 0
						});
					},
					exportData:    function() {
						this._contentText.setValue("");
						var sep = this._compactCheck.getValue() ? "|" : "\n";
						var data = ava.ui.CombatWindow.getInstance().getData();
						var text = ava.ui.CombatWindowExport.dataToString(data, sep);
						this._contentText.setValue(text);
						this._contentText.selectAllText();
						this._contentText.focus();
					},
					importData:    function() {
						var text = this._contentText.getValue();
						var data = ava.ui.CombatWindowExport.parseData(text, /[\n|]/);
						var cw = ava.ui.CombatWindow.getInstance();
						cw.setData(data);
						cw._forceMsCheck.setValue(true);
					}
				}
			});
			qx.Class.define("ava.ui.IdleRaidUnitsTable", {
				extend:    qx.ui.table.Table,
				implement: [webfrontend.net.IUpdateConsumer],
				type:      "singleton",
				construct: function() {
					console.debug("Idel raid Units ctor");
					var tableModel = new qx.ui.table.model.Simple();
					var columnNames = ["CityID", "TS", "Type", "City", "Ref", "Cont", "Coords", "%TS"];
					tableModel.setColumns(columnNames);
					var custom = {
						tableColumnModel: function(obj) {
							return new qx.ui.table.columnmodel.Resize(obj);
						}
					};
					qx.ui.table.Table.call(this, tableModel, custom);
					this.addListener("cellClick", this.onCellClick, this);
					var columnModel = this.getTableColumnModel();
					columnModel.setColumnVisible(0, false);
					var linkStyle = new qx.ui.table.cellrenderer.Default();
					linkStyle.setDefaultCellStyle("text-decoration:underline;color:blue");
					columnModel.setDataCellRenderer(3, linkStyle);
					columnModel.setDataCellRenderer(6, linkStyle);
					//this.refresh();
				},
				members:   {
					curRow:       0,
					curId:        0,
					onCellClick:  function(event) {
						this.curRow = event.getRow();
						this.curId = this.getTableModel().getValue(0, this.curRow);
						var cityID;
						switch(event.getColumn()) {
							case 3:
							{
								cityID = this.getTableModel().getValue(0, event.getRow());
								var spl = this.getTableModel().getValue(6, event.getRow()).split(":");
								var x = Number(spl[0]);
								var y = Number(spl[1]);
								window.webfrontend.data.City.getInstance().setRequestId(cityID);
								window.webfrontend.gui.Util.showMapModeViewPos('r', 0, x, y);
							}
								break;
							case 6:
							{
								cityID = this.getTableModel().getValue(0, event.getRow());
								var spl = this.getTableModel().getValue(6, event.getRow()).split(":");
								var x = Number(spl[0]);
								var y = Number(spl[1]);
								window.webfrontend.gui.Util.showMapModeViewPos('r', 0, x, y);
							}
								break;
						}
					},
					updateCityTS: function(cid, count) {
						console.trace();
						var tm = this.getTableModel();
						for(var i = 0; i < tm.getRowCount(); i++) {
							if(tm.getValue(0, i) == cid) {
								tm.setValue(1, i, count);
								break;
							}
						}
					},

					refresh:           function() {
						console.trace();
						var tm = this.getTableModel();
						tm.removeRows(0, tm.getRowCount());
						tm.addRows([
							[0, "Loading..."]
						]);
						var rw = ava.ui.IdleRaidUnitsTable.getInstance();
						removeConsumer("COMO", rw.DispatchResultsRw, rw);
						addConsumer("COMO", rw.DispatchResultsRw, rw, "a");
						//  addConsumer("DEFO", this.dispatchResults, this, "a");
					},
					getRequestDetails: function(details) {
						return "a";
					},
					DispatchResultsRw: function(results) {
						console.debug("dispatchResultsRw");
						console.dir(results);


						if(results == null)
							return;
						var rt = ava.ui.IdleRaidUnitsTable.getInstance();
						var rw = ava.ui.RaidingWindow.getInstance();

						var resMain = webfrontend.res.Main.getInstance();
						var sI = webfrontend.data.Server.getInstance();
						var pC = webfrontend.data.Player.getInstance().cities;
						var tm = rt.getTableModel();
						var CI = webfrontend.data.City.getInstance();
						var curCityId = CI.getId();

						if(rw.rnf) {
							rw.rnf.length = 0;
						}
						if(rw.rnmts) {
							rw.rnmts.length = 0;
						}
						var bossT = rw.bossRaider.t;
						var bossTcount = 0;
						var idleCities = [];
						var cityList = rw.cityGroups.getSelection();
						if(cityList.length > 0) {
							cityList = cityList[0].cids;
						}

						//tm.removeRows( 0, tm.getRowCount() );
						var excludeIfTxt = rw.excludeIf.getValue();
						var excludeShips = rw.excludeShips.getValue();
						var excludeRefs = "";
						var hasExcludes = false;
						var excludeTs = Number(rw.excludeTs.getValue());
						var sortIx = tm.getSortColumnIndex();
						var dir = tm.isSortAscending();
						if(excludeIfTxt.length > 0) {
							excludeRefs = excludeIfTxt.split(',');
							for(var ii = 0; ii < excludeRefs.length; ++ii) {
								if(excludeRefs[ii].length > 0) {
									hasExcludes = true;
									break;
								}
							}
						}
						for(var i = 0; i < results.length; i++) {
							var result = results[i];
							if(result.hasOwnProperty("c") && (cityList.length == 0 || cityList.indexOf(result.i) >= 0)) {
								var x = result.i & 0xffff;
								var y = result.i >> 16;
								var first = true;
								var unitStr = "";
								var ts = 0;
								var totalTS = 0;
								for(var j = 0; j < result.c.length; j++) {
									var command = result.c[j];
									if(command.i == 0) {
										for(var k = 0; k < command.u.length; k++) {
											var unitInfo = resMain.units[command.u[k].t];
											var count = command.u[k].c;
											if(count > 0 && unitInfo.c > 0 && (!excludeShips || unitInfo.ls)) {
												if(!first) {
													unitStr += ",";
												}
												unitStr += unitShortName(command.u[k].t);
												ts += count * unitInfo.uc;
												totalTS += count * unitInfo.uc;
												first = false;
												if(result.i == curCityId) {
													bossTcount += count;
												}
											}
										}
									} else if(parseInt(command.i, 10) < 0) {
										for(var k = 0; k < command.u.length; k++) {
											var unitInfo = resMain.units[command.u[k].t];
											var count = command.u[k].c;
											if(count > 0 && unitInfo.c > 0 && (!excludeShips || unitInfo.ls)) {
												ts -= count * unitInfo.uc;
												if(result.i == curCityId) {
													bossTcount -= count;
												}
											}
										}
									} else {
										for(var k = 0; k < command.u.length; k++) {
											var unitInfo = resMain.units[command.u[k].t];
											var count = command.u[k].c;
											if(count > 0 && unitInfo.c > 0 && (!excludeShips || unitInfo.ls)) {
												totalTS += count * unitInfo.uc;
											}
										}
									}
								}
								if(!first) {
									//var columnNames = ["CityID", "TS", "Type", "City", "Ref", "Cont", "Coords", "% TS"];
									var cont = sI.getContinentFromCoords(x, y);
									var ref = "";
									if(pC.hasOwnProperty(result.i))
										ref = pC[result.i].reference;
									var exclude = (excludeTs > 0 && ts < excludeTs);
									if(hasExcludes) {
										for(var ii = 0; !exclude && ii < excludeRefs.length; ++ii) {
											exclude = ref.indexOf(excludeRefs[ii]) >= 0;
										}
									}
									if(!exclude) {
										var pct = Math.floor(Math.min(100, (ts / totalTS) * 100) * 100) / 100;
										if(pct == 100 && rw.rnf) {
											rw.rnf.push([result.i, ts, unitStr, result.n, ref, cont, x.toString() + ":" + y.toString(), pct]);
										}
										if(ts >= 30000 && rw.rnmts) {
											rw.rnmts.push([result.i, ts, unitStr, result.n, ref, cont, x.toString() + ":" + y.toString(), pct]);
										}
										idleCities.push([result.i, ts, unitStr, result.n, ref, cont, x.toString() + ":" + y.toString(), pct]);
									}
								}
							}
							if(result.i == curCityId) {
								rw.bossUnitLabel.setValue(rw.formatNumber(bossTcount));
							}
						}
						tm.setData(idleCities);
						tm.sortByColumn((sortIx >= 0) ? sortIx : "1", (sortIx >= 0) ? dir : false);
						if(!rw.autoUpdate.getValue()) {
							removeConsumer("COMO", rw.DispatchResultsRw, rw);
						}
						rw.nextIdleCityButton.setEnabled(true);
					} // DispatchResults

				}
			});
			var citySort = null;
			String.prototype.iCompare = function(str) {
				var str1 = this.toLowerCase();
				var str2 = str.toLowerCase();
				return (str1 < str2) ? -1 : (str1 == str2 ? 0 : 1);
			};

			function stricmp(str1, str2) {
				return str1.iCompare(str2);
			};
			var curCity;
			qx.Class.define("ava.optionsPage", {
				extend:    webfrontend.gui.OverlayWidget,
				type:      "singleton",
				construct: function() {
					webfrontend.gui.OverlayWidget.call(this);
					var _this = this; // ensure this doesn't get overridden in a sub func
					var app = qx.core.Init.getApplication();
					var cMain = ava.Main.getInstance();
					this.clientArea.setLayout(new qx.ui.layout.Canvas());
					this.setTitle("Ava Tools Options");
					this.tabView = new qx.ui.tabview.TabView().set({
						contentPaddingLeft:   15,
						contentPaddingRight:  10,
						contentPaddingTop:    10,
						contentPaddingBottom: 10
					});
					this.tabPages = [
						{
							name: "General",
							page: null,
							vbox: null
						}
					];
					for(i = 0; i < this.tabPages.length; i++) {
						page = new qx.ui.tabview.Page(this.tabPages[i].name);
						page.setLayout(new qx.ui.layout.Canvas());
						vbox = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
						scroll = new qx.ui.container.Scroll(vbox);
						page.add(scroll, {
							top:    0,
							left:   0,
							right:  0,
							bottom: 0
						});
						this.tabPages[i].vbox = vbox;
						this.tabPages[i].page = page;
					}

					// ----- Page 1
					// ----- Show city buildings window
					var cb = new qx.ui.form.CheckBox("Hide Ava Tools panel at load");
					cb.cMain = cMain;
					if(cMain.options.hideAvaTools)
						cb.setValue(true);
					cb.addListener("click", function() {
						_this.cMain.options.hideAvaTools = _this.getValue() ? true : false;
					}, cb);
					this.tabPages[0].vbox.add(cb);

					// ----- Sort by reference
					cb = new qx.ui.form.CheckBox("Sort by reference at start");
					cb.cMain = cMain;
					if(cMain.options.sortByReference)
						cb.setValue(true);
					cb.addListener("click", function() {
						_this.cMain.options.sortByReference = _this.getValue() ? true : false;
					}, cb);
					_this.tabPages[0].vbox.add(cb);

					// ----- Trade Minister
					cb = new qx.ui.form.CheckBox("Enable closest hub button");
					cb.cMain = cMain;
					if(cMain.options.enableClosestHub)
						cb.setValue(true);
					cb.addListener("click", function() {
						_this.cMain.options.enableClosestHub = _this.getValue() ? true : false;
						if(ava.Main.getInstance().panel.useClosestHubButton != null) {
							ava.Main.getInstance().panel.useClosestHubButton.setVisibility(_this.cMain.options.enableClosestHub ? "visible" : "excluded");
						}
					}, cb);
					this.tabPages[0].vbox.add(cb);
					var row = new qx.ui.container.Composite(new qx.ui.layout.HBox(4));
					var lab = new qx.ui.basic.Label("Name");
					lab.setAlignY("middle");
					row.add(lab);
					_this.nameTxt = new qx.ui.form.TextField();
					_this.nameTxt.set({
						toolTipText: "Name of the preset"
					});
					_this.nameTxt.setAlignY("middle");
					app.setElementModalInput(_this.nameTxt);
					_this.nameTxt.setValue("");
					row.add(_this.nameTxt);
					lab = new qx.ui.basic.Label("Wood");
					lab.setAlignY("middle");
					row.add(lab);
					_this.woodTxt = new qx.ui.form.TextField();
					_this.woodTxt.set({
						width:       60,
						toolTipText: "Amount of wood to set"
					});
					_this.woodTxt.setAlignY("middle");
					app.setElementModalInput(_this.woodTxt);
					_this.woodTxt.setValue("0");
					row.add(_this.woodTxt);
					lab = new qx.ui.basic.Label("Stone");
					lab.setAlignY("middle");
					row.add(lab);
					_this.stoneTxt = new qx.ui.form.TextField();
					_this.stoneTxt.set({
						width:       60,
						toolTipText: "Amount of stone to set"
					});
					app.setElementModalInput(_this.stoneTxt);
					_this.stoneTxt.setAlignY("middle");
					_this.stoneTxt.setValue("0");
					row.add(_this.stoneTxt);
					lab = new qx.ui.basic.Label("Iron");
					lab.setAlignY("middle");
					row.add(lab);
					_this.ironTxt = new qx.ui.form.TextField();
					_this.ironTxt.set({
						width:       60,
						toolTipText: "Amount of iron to set"
					});
					app.setElementModalInput(_this.ironTxt);
					_this.ironTxt.setAlignY("middle");
					_this.ironTxt.setValue("0");
					row.add(_this.ironTxt);
					lab = new qx.ui.basic.Label("Food");
					lab.setAlignY("middle");
					row.add(lab);
					_this.foodTxt = new qx.ui.form.TextField();
					_this.foodTxt.set({
						width:       60,
						toolTipText: "Amount of food to set"
					});
					app.setElementModalInput(_this.foodTxt);
					_this.foodTxt.setAlignY("middle");
					_this.foodTxt.setValue("0");
					row.add(_this.foodTxt);
					_this.tabPages[0].vbox.add(row);
					row = new qx.ui.container.Composite(new qx.ui.layout.HBox(4));
					_this.selBox = new qx.ui.form.SelectBox().set({
						alignY:   "middle",
						tabIndex: 1,
						width:    200
					});
					var li = new qx.ui.form.ListItem("New Item", null, -1);
					li.entry = {
						name:  "Add New Item",
						wood:  0,
						stone: 0,
						iron:  0,
						food:  0
					};
					_this.selBox.add(li);
					var templates = cMain.options.hubTemplates;
					for(var x = 0; x < templates.length; ++x) {
						var item = templates[x];
						lbl = item.name;
						li = new qx.ui.form.ListItem(lbl, null, x);
						li.entry = item;
						_this.selBox.add(li);
					}
					_this.selBox.setAlignY("middle");
					row.add(_this.selBox);
					_this.selBox.addListener("changeSelection", function(e) {
						if(e != null && e.getData().length > 0) {
							var item = e.getData()[0].entry;
							_this.nameTxt.setValue(item.name == "Add New Item" ? "" : item.name);
							_this.woodTxt.setValue(item.wood.toString());
							_this.stoneTxt.setValue(item.stone.toString());
							_this.ironTxt.setValue(item.iron.toString());
							_this.foodTxt.setValue(item.food.toString());
						}
					}, _this);
					var btn = new qx.ui.form.Button("Save");
					btn.setToolTipText("Save amounts for later use.");
					btn.selBox = _this.selBox;
					btn.addListener("execute", function() {
						var cMain = ava.Main.getInstance();
						var name = _this.nameTxt.getValue();
						var wood = _this.woodTxt.getValue();
						var stone = _this.stoneTxt.getValue();
						var iron = _this.ironTxt.getValue();
						var food = _this.foodTxt.getValue();
						var templates = cMain.options.hubTemplates;
						var found = false;
						for(var x = 0; x < templates.length; ++x) {
							var item = templates[x];
							if(item.name == name) {
								found = true;
								item.wood = isNaN(wood) ? 0 : parseInt(wood);
								item.stone = isNaN(stone) ? 0 : parseInt(stone);
								item.iron = isNaN(iron) ? 0 : parseInt(iron);
								item.food = isNaN(food) ? 0 : parseInt(food);
							}
						}
						if(!found) {
							cMain.options.hubTemplates[cMain.options.hubTemplates.length] = {
								"name":  name.trim(),
								"wood":  isNaN(wood) ? 0 : parseInt(wood),
								"stone": isNaN(stone) ? 0 : parseInt(stone),
								"iron":  isNaN(iron) ? 0 : parseInt(iron),
								"food":  isNaN(food) ? 0 : parseInt(food)
							};
						}
						_this.selBox.removeAll();
						li = new qx.ui.form.ListItem("Add New Item", null, -1);
						li.entry = {
							name:  "Add New Item",
							wood:  0,
							stone: 0,
							iron:  0,
							food:  0
						};
						_this.selBox.add(li);
						templates = cMain.options.hubTemplates;
						for(var x = 0; x < templates.length; ++x) {
							var item = templates[x];
							var lbl = item.name;
							li = new qx.ui.form.ListItem(lbl, null, x);
							li.entry = item;
							_this.selBox.add(li);
						}
						if(cMain.hubSelBox != null) {
							cMain.hubSelBox.removeAll();
							for(var x = 0; x < templates.length; ++x) {
								var item = templates[x];
								var lbl = item.name;
								li = new qx.ui.form.ListItem(lbl, null, x);
								li.entry = item;
								cMain.hubSelBox.add(li);
							}
						}
					}, _this);
					row.add(btn);
					console.debug("erere1");
					btn = new qx.ui.form.Button("Remove");
					btn.setToolTipText("Remove the selected entry.");
					btn.selBox = _this.selBox;
					btn.addListener("execute", function() {
						var cMain = ava.Main.getInstance();
						if(_this.getSelection()[0].getModel() != -1) {
							var selItem = _this.getSelection()[0].entry;
							templates = cMain.options.hubTemplates;
							for(var x = 0; x < templates.length; ++x) {
								var item = templates[x];
								if(item.name == selItem.name) {
									templates.splice(x, 1);
									break;
								}
							}

							_this.removeAll();
							li = new qx.ui.form.ListItem("Add New Item", null, -1);
							li.entry = {
								name:  "Add New Item",
								wood:  0,
								stone: 0,
								iron:  0,
								food:  0
							};
							_this.add(li);
							templates = cMain.options.hubTemplates;
							for(var x = 0; x < templates.length; ++x) {
								var item = templates[x];
								var lbl = item.name;
								li = new qx.ui.form.ListItem(lbl, null, x);
								li.entry = item;
								_this.add(li);
							}
						}
					}, _this.selBox);
					row.add(btn);
					_this.tabPages[0].vbox.add(row);
					console.debug("33");
					// ----- Show city buildings window
					var cont = new qx.ui.container.Composite(new qx.ui.layout.HBox());
					cont.add(new qx.ui.core.Spacer(20));
					lab = new qx.ui.basic.Label("Show city buildings window");
					cont.add(lab);
					cont.add(new qx.ui.core.Spacer(10));

					rg = new qx.ui.form.RadioGroup();
					rg.cMain = cMain;
					rbs = ["Disabled", "Always on", "On in city view"];
					for(i = 0; i < rbs.length; i++) {
						rb = new qx.ui.form.RadioButton(rbs[i]);
						rb.setUserData("id", i);
						rb.setGroup(rg);
						cont.add(rb);
						cont.add(new qx.ui.core.Spacer(10));
					}

					rg.cMain = cMain;
					rg.setSelection([rg.getChildren()[cMain.options.showCityBuildings]]);
					rg.addListener("changeSelection", function() {
						_this.cMain.options.showCityBuildings = _this.getSelection()[0].getUserData("id");
						var app = qx.core.Init.getApplication();
						_this.cMain.cityBuildings.bldgsCont.setVisibility((_this.cMain.options.showCityBuildings == 1 || (_this.cMain.options.showCityBuildings == 2 && (app.visMain.mapmode == "c"))) ? "visible" : "excluded");
						_this.cMain.cityBuildings.updateCityBuildings();
					}, rg);
					_this.tabPages[0].vbox.add(cont);

					// ----- Alert me if my name is mentioned in chat
					cb = new qx.ui.form.CheckBox("Alert if name mentioned in chat");
					cb.cMain = cMain;
					if(cMain.options.showChatAlert)
						cb.setValue(true);
					cb.addListener("click", function() {
						_this.cMain.options.showChatAlert = _this.getValue() ? true : false;
					}, cb);
					_this.tabPages[0].vbox.add(cb);

					// ----- Alert me if my name is mentioned in chat
					cb = new qx.ui.form.CheckBox("Alert if someone whispers");
					cb.cMain = cMain;
					if(cMain.options.showWhisperAlert)
						cb.setValue(true);
					cb.addListener("click", function() {
						_this.cMain.options.showWhisperAlert = _this.getValue() ? true : false;
					}, cb);
					_this.tabPages[0].vbox.add(cb);

					// ----- Alert me if a word is mentioned in chat
					cb = new qx.ui.form.CheckBox("Alert if one of these phrases is mentioned in chat");
					cb.cMain = cMain;
					if(cMain.options.showChatAlertPhrases)
						cb.setValue(true);
					cb.addListener("click", function() {
						_this.cMain.options.showChatAlertPhrases = _this.getValue() ? true : false;
					}, cb);
					_this.tabPages[0].vbox.add(cb);
					tf = new qx.ui.form.TextField();
					tf.cMain = cMain;
					tf.setMaxWidth(300);
					tf.set({
						toolTipText: "Notify me if any of these phrases are mentioned in chat. (comma or semicolon separated list)"
					});
					tf.setValue(cMain.options.chatAlertPhrases);
					tf.addListener("changeValue", function() {
						_this.cMain.options.chatAlertPhrases = _this.getValue();
					}, tf);
					_this.tabPages[0].vbox.add(tf);
					_this.tabPages[0].vbox.add(new qx.ui.core.Spacer(0, 10));

					// ----- Save Button
					cont = new qx.ui.container.Composite(new qx.ui.layout.HBox());
					btn = new qx.ui.form.Button("Save").set({
						width:      90,
						marginLeft: 30
					});
					btn.addListener("click", _this.saveOptions, _this);
					cont.add(btn);
					_this.expImpWin = _this.createExpImpWindow();

					// ----- Export button
					btn = new qx.ui.form.Button("Export").set({
						appearance: "button-text-small",
						marginLeft: 280
					});
					btn.addListener("click", function() {
						var options = ava.Main.getInstance().options;
						_this.expImpWin.setCaption("Export");
						_this.expImpWin.setUserData("id", 2);
						_this.expImpWin.getUserData("lab").setValue("You can save _this string in a text file and import it later when needed.");
						_this.expImpWin.getUserData("ta").setValue(JSON.stringify(options));
						_this.expImpWin.open();
					}, _this);
					cont.add(btn);

					// ----- Import button
					btn = new qx.ui.form.Button("Import").set({
						appearance: "button-text-small"
					});
					btn.addListener("click", function() {
						_this.expImpWin.setCaption("Import");
						_this.expImpWin.setUserData("id", 1);
						_this.expImpWin.getUserData("lab").setValue("Insert saved Options into text field and press OK.");
						_this.expImpWin.getUserData("ta").setValue("");
						_this.expImpWin.open();
					}, _this);
					cont.add(btn);

					for(i = 0; i < _this.tabPages.length; i++) {
						_this.tabView.add(_this.tabPages[i].page);
					}
					_this.clientArea.add(_this.tabView, {
						top:    0,
						right:  3,
						bottom: 30,
						left:   3
					});
					_this.clientArea.add(cont, {
						right:  3,
						bottom: 3,
						left:   3
					});
					_this.tabView.setSelection([_this.tabView.getChildren()[0]]);
				},
				members:   {
					tabView:            null,
					tabPages:           null,
					clrSel:             null,
					expImpWin:          null,
					woodTxt:            null,
					stoneTxt:           null,
					ironTxt:            null,
					foodTxt:            null,
					nameTxt:            null,
					selBox:             null,
					createExpImpWindow: function() {
						var _this = this;
						win = new qx.ui.window.Window("");
						win.setLayout(new qx.ui.layout.VBox(10));
						win.set({
							showMaximize:  false,
							showMinimize:  false,
							allowMaximize: false
						});
						win.setWidth(450);
						win.setHeight(200);

						//win.open();
						var app = qx.core.Init.getApplication();
						app.getRoot().add(win, {
							left: 250,
							top:  200
						});
						lab = new qx.ui.basic.Label("");
						win.add(lab);
						win.setUserData("lab", lab);

						var options = ava.Main.getInstance().options;
						ta = new qx.ui.form.TextArea(JSON.stringify(options));
						ta.addListener("click", function() {
							_this.selectAllText();
						});
						win.add(ta, {
							height: 65
						});
						win.setUserData("ta", ta);
						btn = new qx.ui.form.Button("OK").set({
							maxWidth: 50,
							alignX:   "center"
						});
						btn.addListener("click", function() {
							id = _this.getUserData("id");
							if(id == 1) {
								txt = _this.getUserData("ta").getValue();
								{
									obj = JSON.parse(txt);
								}
								/* (e) {
								 obj="error";
								 } */
								if(typeof obj == "object" && obj != null) {
									ava.Main.getInstance().options = JSON.parse(txt);
									paDebug(":AvaLoad Options");
									paDebug(txt);
									localStorage.setItem("Ava_options", txt);
									_this.close();
								} else {
									console.error("Inserted string is invalid");
								}
							} else if(id == 2) {
								_this.close();
							}
						}, win);
						win.add(btn);
						return win;
					},
					saveOptions:        function() {
						var options = ava.Main.getInstance().options;
						str = JSON.stringify(options);
						localStorage.setItem("Ava_options", str);

						paDebug(str);

						qx.core.Init.getApplication().switchOverlay(null);
						var cMain = ava.Main.getInstance();
						if(cMain.hubSelBox != null) {
							templates = cMain.options.hubTemplates;
							cMain.hubSelBox.removeAll();
							for(var x = 0; x < templates.length; ++x) {
								var item = templates[x];
								var lbl = item.name;
								li = new qx.ui.form.ListItem(lbl, null, x);
								li.entry = item;
								cMain.hubSelBox.add(li);
							}
						}
					}
				}
			});
			/// globals

			function SelectByName(value, list) {
				if(value !== null) {
					var opts = selistl.getChildren();
					for(var ii = 0; ii < opts.length; ++ii) {
						if(opts[ii].getLabel() === value) {
							list.setSelection([opts[ii]]);
							break;
						}
					}
				}
			}

			function SelectFromStorage(value, list) {
				SelectByName(localStorage.getItem(value), list);
			}

			qx.Class.define("ava.ui.CityBuildings", {
				extend:    qx.core.Object,
				construct: function() {
					this.bldgsCont = new qx.ui.container.Composite(new qx.ui.layout.VBox(4));
					this.row = new qx.ui.container.Composite(new qx.ui.layout.HBox(8));
					this.row.setWidth(338);
					this.bldgsCont.add(this.row);
					this.row2 = new qx.ui.container.Composite(new qx.ui.layout.HBox(8));
					this.row2.setWidth(338);
					this.bldgsCont.add(this.row2);
					this.row3 = new qx.ui.container.Composite(new qx.ui.layout.HBox(8));
					this.row3.setWidth(338);
					this.bldgsCont.add(this.row3);
					this.row4 = new qx.ui.container.Composite(new qx.ui.layout.HBox(8));
					this.row4.setWidth(338);
					this.bldgsCont.add(this.row4);
				},
				members:   {
					bldgsCont:           null,
					bldgsContBgr:        null,
					lastId:              "",
					prevCount:           0,
					row:                 null,
					row2:                null,
					row3:                null,
					row4:                null,
					cMain:               null,
					bS:                  null,
					app:                 null,
					updateCityBuildings: function() {
						var city = webfrontend.data.City.getInstance();
						if(this.app == null)
							this.app = qx.core.Init.getApplication();
						if(this.bS == null)
							this.bS = webfrontend.res.Main.getInstance();
						if(this.cMain == null)
							this.cMain = ava.Main.getInstance();
						if(!this.bS || !city || !this.cMain)
							return;
						if(this.cMain.options.showCityBuildings == 0 || (this.cMain.options.showCityBuildings == 2 && (this.app.visMain.mapmode != "c"))) {
							this.bldgsCont.setVisibility("excluded");
							return;
						}
						this.bldgsCont.setVisibility("visible");
						var bCount = city.getBuildingCount();
						if(bCount == this.prevCount && this.lastId == city.getId()) {
							return;
						}
						this.prevCount = bCount;
						this.lastId = city.getId();
						this.row.removeAll();
						this.row2.removeAll();
						this.row3.removeAll();
						this.row4.removeAll();
						this.row2.setVisibility("excluded");
						this.row3.setVisibility("excluded");
						this.row4.setVisibility("excluded");
						var i = 0;
						for(var a in this.bS.buildings) {
							var cnt = city.getBuildingCountByType(a);
							if(cnt > 0 && this.bS.buildings[a].t != 5) {
								var lbl = new qx.ui.basic.Label(" ");
								lbl.setRich(true);
								var title = this.bS.buildings[a].dn;
								lbl.setValue('<img alt="' + title + '" title="' + title + '" src="resource/webfrontend/' + this.bS.getFileInfo(this.bS.buildings[Number(a)].mimg).url + '" style="align:absmiddle;-moz-transform: scaleX(1); width: 28px; height: 28px; padding-left:4px;" /><br/><span style="margin-left: ' + (cnt > 10 ? 10 : 15) + 'px;">' + cnt + '</span>');
								++i;
								if(i <= 8) {
									this.row.add(lbl);
								} else if(i <= 16) {
									this.row2.add(lbl);
									this.row2.setVisibility("visible");
								} else if(i <= 24) {
									this.row3.add(lbl);
									this.row3.setVisibility("visible");
								} else {
									this.row4.add(lbl);
									this.row4.setVisibility("visible");
								}
							}
						}
						this.bldgsCont.setVisibility("visible");
					}
				}
			});
			var fortuneAvailImg = null;
			var subIncomingOffImg = null;
			var subIncomingImg = null;
			var subNames = null;
			var _oTech = null;

			function checkForSubAttacks(results, thisObj) {
				try {
					var hasAttacks = "";
					var IncomingAttacks;
					if(results != null) {
						if(results.hasOwnProperty("a")) {
							IncomingAttacks = results.a;
						} else {
							if(results[0].hasOwnProperty("a"))
								IncomingAttacks = results[0].a;
						}
						if(IncomingAttacks != null) {
							for(var ii = 0; ii < subNames.length; ++ii) {
								for(var i = 0; i < IncomingAttacks.length; ++i) {
									if(IncomingAttacks[i].tpn.toLowerCase() == subNames[ii]) {
										hasAttacks += (hasAttacks.length > 0 ? ", " : "") + subNames[ii];
										break;
									}
								}
							}
						}
					}
					if(hasAttacks.length > 0) {
						if(subIncomingImg.getToolTipText() != "Incoming for " + hasAttacks) {
							subIncomingImg.setSource('resource/webfrontend/ui/icons/icon_attack_warning.gif');
							subIncomingImg.setToolTipText("Incoming for " + hasAttacks);
						}
					} else {
						if(subIncomingImg.getToolTipText() != "Incoming for " + hasAttacks) {
							subIncomingImg.setSource('resource/webfrontend/ui/icons/icon_alliance_outgoing_attack_warning_inactive.png');
							var sub = subNames.join(',');
							subIncomingImg.setToolTipText("No incomings for " + sub);
						}
					}
					if(subIncomingImg.getVisibility() != "visible") {
						subIncomingImg.setVisibility("visible");
					}
				} catch(ex) {
					paDebug(ex);
				}
				/* (e) {
				 console.debug("Error");
				 console.dir(e);
				 } */
			}

			qx.Class.define("ava.ui.ExtraTools", {
				extend:    ava.ui.components.LeftPanel,
				construct: function(title) {
					this.base(arguments, title);
					this.buildUI();
				},
				members:   {
					cityInfoImg:             null,
					city:                    null,
					optionsPage:             null,
					options:                 null,
					deleteFoodCityResButton: null,
					deleteResButton:         null,
					BaronRow:                null,
					MissingResourcesRow:     null,
					reportsButton:           null,
					closestHubButton:        null,
					templatesSelBox:         null,
					buildUI:                 function() {
						var app = qx.core.Init.getApplication();
						var cInfoView = app.getCityInfoView();
						var bQc = cInfoView.buildingQueue;
						var bQh = bQc.header;
						var fillQueueButton = new qx.ui.form.Button("+");
						fillQueueButton.set({
							width:       22,
							appearance:  "button-text-small",
							toolTipText: "Click to Fill build queue"
						});
						fillQueueButton.addListener("execute", this.fillBuildingQueue, this);
						bQh.add(fillQueueButton, {
							left: 5,
							top:  33
						});
						var payQueueButton = new qx.ui.form.Button("#");
						payQueueButton.set({
							width:       22,
							appearance:  "button-text-small",
							toolTipText: "Click to Convert all builds"
						});
						payQueueButton.addListener("execute", this.payBuildingQueue, this);
						bQh.add(payQueueButton, {
							left: 28,
							top:  33
						});
						var deleteCottageButton = new qx.ui.form.Button("-");
						deleteCottageButton.set({
							width:       22,
							appearance:  "button-text-small",
							toolTipText: "Click to remove a cottage"
						});
						deleteCottageButton.addListener("execute", this.removeCottage, this);
						bQh.add(deleteCottageButton, {
							left: 49,
							top:  33
						});
						this.deleteResButton = new qx.ui.form.Button();
						this.deleteResButton.set({
							width:       22,
							appearance:  "button-text-small",
							toolTipText: "Click to remove res nodes from the center"
						});
						this.deleteResButton.addListener("execute", this.removeCenterRes, this);
						var img = new qx.ui.basic.Image("webfrontend/ui/icons/icon_playerinfo_townicon_castle_land.png");
						img.setWidth(18);
						img.setHeight(15);
						img.setScale(true);
						img.setAlignY("middle");
						this.deleteResButton._add(img);
						bQh.add(this.deleteResButton, {
							left: 72,
							top:  33
						});
						this.deleteFoodCityResButton = new qx.ui.form.Button();

						//var deleteFoodCityResButton = new qx.ui.form.Button("cf");
						this.deleteFoodCityResButton.set({
							width:       22,
							appearance:  "button-text-small",
							toolTipText: "Click to remove res nodes for a food city"
						});
						this.deleteFoodCityResButton.addListener("execute", this.removeResNode, this);
						var img = new qx.ui.basic.Image("webfrontend/ui/icons_ressource_voidFood_16.png");
						img.setWidth(16);
						img.setHeight(15);
						img.setScale(true);
						img.setAlignY("middle");
						this.deleteFoodCityResButton._add(img);
						bQh.add(this.deleteFoodCityResButton, {
							left: 250,
							top:  33
						});

						// Queue buttons (Thank you MousePak!)
						var row = new qx.ui.container.Composite(new qx.ui.layout.HBox(2));
						this.optionsPage = new ava.optionsPage();
						this.addContent(row);
						var row = new qx.ui.container.Composite(new qx.ui.layout.HBox(10));

						// ***** Options button ***** //
						var optionsBtn = new qx.ui.form.Button("Options");
						optionsBtn.set({
							width:       50,
							appearance:  "button-text-small",
							toolTipText: "Ava Tools Options"
						});
						optionsBtn.addListener("click", this.showOptionsPage, this);
						row.add(optionsBtn);
						var IncomingAttacksButton = new qx.ui.form.Button("i");
						IncomingAttacksButton.set({
							width:       20,
							appearance:  "button-text-small",
							toolTipText: "Experimental incoming attack info"
						});
						IncomingAttacksButton.addListener("execute", this.showIncomingAttacks, this);
						row.add(IncomingAttacksButton);
						var dialog = ava.ui.IncomingAttacksWindow.getInstance();
						var tmWidget = new webfrontend.gui.MinisterInfo.Trade();
						app.ministerInfoWidget = new Object();
						app.ministerInfoWidget[webfrontend.base.GameObjects.eMinisterId.TradeMinister] = tmWidget;
						tmWidget.addListenerOnce("appear", function() {
							var app = qx.core.Init.getApplication();
							if(app.hasOwnProperty("ministerInfoWidget")) {
								var tmWidget = app.ministerInfoWidget[webfrontend.base.GameObjects.eMinisterId.TradeMinister];
								var children = tmWidget._tabView.getChildren();
								if(children.length > 2) {
									children = children[2].getChildren();
									if(children.length > 1) {
										var br = children[1].getChildren()[1];
										var row = new qx.ui.container.Composite(new qx.ui.layout.HBox(1));
										var btn = new qx.ui.form.Button("Set hub");
										btn.setToolTipText("Sets trade settings to use the closest city by land in a City Group containing 'hub' in its name with resource amounts selected.");
										row.add(btn);
										var btn2 = new qx.ui.form.Button("Set res");
										btn2.setToolTipText("Sets trade settings to use the amounts selected.");
										row.add(btn2);
										var selBox = new qx.ui.form.SelectBox().set({
											alignY:   "middle",
											tabIndex: 1,
											width:    200
										});
										var cMain = ava.Main.getInstance();
										cMain.hubSelBox = selBox;
										var templates = cMain.options.hubTemplates;
										for(var x = 0; x < templates.length; ++x) {
											var item = templates[x];
											lbl = item.name;
											li = new qx.ui.form.ListItem(lbl, null, x);
											li.entry = item;
											selBox.add(li);
										}
										selBox.setAlignY("middle");
										row.add(selBox);
										ava.Main.getInstance().selBox = selBox;
										btn.addListener("execute", function() {
											ava.Main.getInstance().panel.findClosestHub();
										}, selBox);
										btn2.addListener("execute", function() {
											ava.Main.getInstance().panel.setHubAmounts();
										}, selBox);
										br.addAfter(row, br.getChildren()[0]);
										ava.Main.getInstance().panel.useClosestHubButton = row;
										if(!cMain.options.enableClosestHub) {
											row.setVisibility("excluded");
										}
									}
								}
							}
						}, tmWidget);

						// Combat command window, written by Mikee
						var combatButton = new qx.ui.form.Button("Combat");
						combatButton.set({
							width:       50,
							appearance:  "button-text-small",
							toolTipText: "Shows Advanced Commands window."
						});
						combatButton.addListener("execute", this.showCombatWindow, this);
						row.add(combatButton);
						var raidButton = new qx.ui.form.Button("Raiding");
						raidButton.set({
							width:       50,
							appearance:  "button-text-small",
							toolTipText: "Raiding"
						});
						raidButton.addListener("execute", this.showRaidingWindow, this);
						row.add(raidButton);
						dialog = ava.ui.RaidingWindow.getInstance();

						// Spacer
						row.add(new qx.ui.core.Widget().set({
							height: 0
						}), {
							flex: 1
						});
						this.addContent(row);
						row = new qx.ui.container.Composite(new qx.ui.layout.HBox(10));
						this.reportsButton = new qx.ui.form.Button("Alliance");
						this.reportsButton.set({
							width:       50,
							appearance:  "button-text-small",
							toolTipText: "Alliance Info"
						});
						this.reportsButton.addListener("execute", this.showAllianceInfo, this);
						row.add(this.reportsButton);
						var mailListButton = new qx.ui.form.Button("Mail Lists");
						mailListButton.set({
							width:       60,
							appearance:  "button-text-small",
							toolTipText: "Get alliance mailing lists"
						});
						mailListButton.addListener("execute", this.showMailingLists, this);
						row.add(mailListButton);
						var resButton = new qx.ui.form.Button("Send Res");
						resButton.set({
							width:       55,
							appearance:  "button-text-small",
							toolTipText: "Send Resources"
						});
						resButton.addListener("execute", this.showFillWithResources, this);
						row.add(resButton);
						var itemsButton = new qx.ui.form.Button("Palace");
						itemsButton.set({
							width:       50,
							appearance:  "button-text-small",
							toolTipText: "Use palace items below your level."
						});
						itemsButton.addListener("execute", this.showPalaceItems, this);
						row.add(itemsButton);
						this.addContent(row);
						try {
							this.BaronRow = new qx.ui.container.Composite(new qx.ui.layout.HBox(1));
							var ToolTip = "Total / Current / Recruiting / Available";
							this.BaronLabel = new qx.ui.basic.Label(" ");
							this.BaronLabel.setRich(true);
							this.BaronLabel.setValue('<div style="-moz-transform: scaleX(1);background-image:url(resource/webfrontend/theme/tree/open.png);background-repeat:no-repeat;width:16px;height:16px;font-weight:bold;padding-left:15px;"><img src="resource/webfrontend/ui/icons/units/icon_units_baron.png"  style="align:absmiddle;-moz-transform: scaleX(1); width: 16px; height: 16px; padding-left:4px;" /></div>');
							this.BaronLabel.setToolTipText(ToolTip);
							this.BaronLabel.addListener("click", this.toggleTable);
							this.BaronRow.add(this.BaronLabel);
							this.BaronValue = new qx.ui.basic.Label("");
							this.BaronValue.setRich(true);
							this.BaronValue.setValue("<div style='margin-left: 10px;'>0/0/0/0</div>");
							this.BaronValue.setToolTipText(ToolTip);
							this.BaronRow.add(this.BaronValue);
							var cToolTip = "Current/Needed";
							this.CastleLabel = new qx.ui.basic.Label(" ");
							this.CastleLabel.setRich(true);
							this.CastleLabel.setValue('<div style="-moz-transform: scaleX(1);background-image:url(resource/webfrontend/ui/icons/icon_playerinfo_townicon_castle_land.png);background-repeat:no-repeat;;width:21px;height:16px;font-weight:bold;margin-left:10px;"></div>');
							this.CastleLabel.setToolTipText(cToolTip);
							this.BaronRow.add(this.CastleLabel);
							this.CastleValue = new qx.ui.basic.Label("");
							this.CastleValue.setRich(true);
							if(_oTech == null) {
								_oTech = webfrontend.data.Tech.getInstance();
							}
							var ix = _oTech.getBonus("baronCount", webfrontend.data.Tech.research) + 3;
							var numCastlesNeeded = Math.floor((ix - 3) / 4) + 1;
							this.CastleValue.setValue("<div style='margin-left: 4px;'>" + player.getNumCastles() + "/" + numCastlesNeeded + "</div>");
							this.CastleValue.setToolTipText(cToolTip);
							this.BaronRow.add(this.CastleValue);
							var numOutgoing = webfrontend.data.Alliance.getInstance().getNumOutgoingAttacks();
							this.outgoing = new qx.ui.basic.Label("");
							this.outgoing.setRich(true);
							this.outgoing.setValue("<div style='margin-left: 4px;'>Outgoing Attacks: " + numOutgoing + "</div>");
							this.BaronRow.add(this.outgoing);
							this.addContent(this.BaronRow);
							var oPlayer = webfrontend.data.Player.getInstance();
							if(oPlayer.getTitle() >= 3) {
								this.MissingResourcesRow = new qx.ui.container.Composite(new qx.ui.layout.HBox(1));
								this.MissingResourcesValue = new qx.ui.basic.Label(" ");
								this.MissingResourcesValue.setRich(true);
								this.MissingResourcesRow.add(this.MissingResourcesValue);
								this.addContent(this.MissingResourcesRow);
							}
						} catch(e) {
							paDebug(e);
						}
						/* (e) {
						 console.debug("Error");
						 console.dir(e);
						 } */
						row = new qx.ui.container.Composite(new qx.ui.layout.HBox(1));
						var cs = qx.core.Init.getApplication().cityBar.citiesSelect;
						cs.prevSort = cs.getSortedPlayerCities;
						var cMain = ava.Main.getInstance();
						citySort = new qx.ui.form.CheckBox("Sort cities by reference");
						citySort.setToolTipText("Sort cities by reference when checked");
						citySort.initValue(cMain.options.sortByReference);
						citySort.addListener("click", this.toggleCityControls);
						row.add(citySort);
						this.addContent(row);
						if(cMain.options.sortByReference) {
							citySort.setValue(true);
							this.toggleCityControls();
						}
						webfrontend.base.Timer.getInstance().addListener("uiTick", this.updateCurBarons, this);
						var oPlayer = webfrontend.data.Player.getInstance();
						if(oPlayer.getTitle() >= 3) {
							webfrontend.base.Timer.getInstance().addListener("uiTick", this.updateNeededResources, this);
						}
						window.setTimeout(checkFortune, 60000);
					},
					showOptionsPage:         function() {
						var currentOverlay = qx.core.Init.getApplication().getCurrentOverlay();
						var curOverlayName = currentOverlay != null ? currentOverlay.basename : "";
						qx.core.Init.getApplication().switchOverlay((curOverlayName == "optionsPage") ? null : this.optionsPage);
					},
					setHubAmounts:           function() {
						var commandManager = webfrontend.net.CommandManager.getInstance();
						var player = webfrontend.data.Player.getInstance();
						var entry = ava.Main.getInstance().selBox.getSelection()[0].entry;
						var data = webfrontend.net.UpdateManager.getInstance().requester["MAT"].obj;
						var cts = data.getCitiesTradeStates();
						var cid = webfrontend.data.City.getInstance().getId();
						var ro = data.getResourceOptions();
						var dst = data.getBDeliverSameTarget();
						var dir = data.getBDisableIncomingTradeRequest();
						var rst = data.getBRequestSameTarget();
						var dor = data.getBDisableOutgoingTradeRequest();
						var ptr = data.getBProtectResourcesFromRequests();
						var rcr = data.getCartTransportReserveCapacity();
						var rsr = data.getShipTransportReserveCapacity();
						commandManager.sendCommand("CityAutoTradeParamsSet", {
							"cityid":          cid,
							"autoTradeParams": {
								"dst": dst,
								"rst": rst,
								"dir": dir,
								"dor": dor,
								"r":   [
									{
										"t": 1,
										"r": ro['1'].requestCityId,
										"s": ro['1'].surplusMode,
										"d": ro['1'].deliverCityId,
										"p": entry.wood
									},
									{
										"t": 2,
										"r": ro['2'].requestCityId,
										"s": ro['2'].surplusMode,
										"d": ro['2'].deliverCityId,
										"p": entry.stone
									},
									{
										"t": 3,
										"r": ro['3'].requestCityId,
										"s": ro['3'].surplusMode,
										"d": ro['3'].deliverCityId,
										"p": entry.iron
									},
									{
										"t": 4,
										"r": ro['4'].requestCityId,
										"s": ro['4'].surplusMode,
										"d": ro['4'].deliverCityId,
										"p": entry.food
									}
								],
								"ptr": ptr,
								"rcr": rcr,
								"rsr": rsr
							}
						}, null, function(ok, res) {
						});
					},
					findClosestHub:          function() {
						var commandManager = webfrontend.net.CommandManager.getInstance();
						var player = webfrontend.data.Player.getInstance();
						var hubGroupId;
						var cids;
						var nameDistance = new Array();
						for(var ii = 0; ii < player.citygroups.length; ++ii) {
							if(player.citygroups[ii].n.toLowerCase().indexOf('hub') >= 0 && player.citygroups[ii].c.length > 0) {
								hubGroupId = player.citygroups[ii].i;
								cids = player.citygroups[ii].c;
								break;
							}
						}
						commandManager.sendCommand("GetDistance", {
							target: webfrontend.data.City.getInstance().getId()
						}, this, function(ok, res) {
							var minCid = 0;
							var minDistance = 99999;
							for(var x = 0; x < cids.length; ++x) {
								for(var ii = 0; ii < res.length; ++ii) {
									if(res[ii].s == cids[x] && res[ii].l > 0) {
										nameDistance[cids[x]] = res[ii].l;
										if(res[ii].l < minDistance) {
											minDistance = res[ii].l;
											minCid = cids[x];
										}
									}
								}
							}
							if(minCid != 0) {
								var cityList = player.getCities();
								var hubX = cityList[minCid].xPos;
								var hubY = cityList[minCid].yPos;
								var entry = ava.Main.getInstance().hubSelBox.getSelection()[0].entry;
								data = webfrontend.net.UpdateManager.getInstance().requester["MAT"].obj;
								var ro = data.getResourceOptions();
								var dst = data.getBDeliverSameTarget();
								var dir = data.getBDisableIncomingTradeRequest();
								var rst = data.getBRequestSameTarget();
								var dor = data.getBDisableOutgoingTradeRequest();
								var ptr = data.getBProtectResourcesFromRequests();
								var rcr = data.getCartTransportReserveCapacity();
								var rsr = data.getShipTransportReserveCapacity();
								commandManager.sendCommand("CityAutoTradeParamsSet", {
									"cityid":          webfrontend.data.City.getInstance().getId(),
									"autoTradeParams": {
										"dst": dst,
										"rst": rst,
										"dir": dir,
										"dor": dor,
										"r":   [
											{
												"t": 1,
												"r": minCid,
												"s": 2,
												"d": minCid,
												"p": (entry.wood)
											},
											{
												"t": 2,
												"r": (rst ? 0 : minCid),
												"s": ro['2'].surplusMode,
												"d": (dst ? 0 : minCid),
												"p": (entry.stone)
											},
											{
												"t": 3,
												"r": (rst ? 0 : minCid),
												"s": ro['3'].surplusMode,
												"d": (dst ? 0 : minCid),
												"p": (entry.iron)
											},
											{
												"t": 4,
												"r": (rst ? 0 : minCid),
												"s": ro['4'].surplusMode,
												"d": (dst ? 0 : minCid),
												"p": (entry.food)
											}
										],
										"ptr": ptr,
										"rcr": rcr,
										"rsr": rsr
									}
								}, null, function(ok, res) {
								});
							} else {
								var win = new qx.ui.window.Window("Set hub");
								win.setLayout(new qx.ui.layout.VBox(2));
								win.set({
									showMaximize:  false,
									showMinimize:  false,
									allowMaximize: false,
									width:         150,
									height:        80
								});

								win.lbl = new qx.ui.basic.Label("No hub found").set({
									rich: true
								});

								win.add(win.lbl);
								var row = new qx.ui.container.Composite(new qx.ui.layout.HBox(2));
								win.add(row);
								var btn = new qx.ui.form.Button("Close").set({
									appearance:    "button-text-small",
									width:         80,
									paddingLeft:   5,
									paddingRight:  5,
									paddingTop:    0,
									paddingBottom: 0
								});
								btn.win = win;
								row.add(btn);
								btn.addListener("click", function() {
									this.win.hide();
								});
								win.addListener("close", function() {
								}, this);
								win.center();
								win.open();
							}
						});
					},
					removeResNode:           function() {
						this.getCity();
						var bqmax = webfrontend.data.Player.getInstance().getMaxBuildQueueSize();
						var bqcur = webfrontend.data.City.getInstance().buildQueue;
						var bqcur = (bqcur != null) ? bqcur.length : 0;
						var freeSlots = bqmax - bqcur;
						var ordersSent = 0;
						var delay = 500;
						this.deleteFoodCityResButton.setEnabled(false);
						for(k = 0; k < this.city.length && ordersSent < freeSlots; k++) {
							if(this.city[k] && this.city[k][2] >= 900 && this.city[k][2] != 903 && this.city[k][1] == 0) {
								var type = this.city[k][2] == 902 ? 27 : (this.city[k][2] == 901 ? 29 : (this.city[k][2] == 903 ? 30 : 28));
								var buildingId = this.city[k][0];
								this.doInsertInBuildQueue(type, buildingId, delay);
								delay += 1000;
								++ordersSent;
							}
						}
						window.setTimeout(function() {
							this.deleteFoodCityResButton.setEnabled(true);
						}.bind(this), delay);
					},
					insertInBuildQueue:      function(type, bldngId) {
						webfrontend.net.CommandManager.getInstance().sendCommand("UpgradeBuilding", {
							cityid:       webfrontend.data.City.getInstance().getId(),
							buildingid:   bldngId,
							buildingtype: type,
							isPaid:       true
						}, null, function() {
						});
					},
					doInsertInBuildQueue:    function(type, id, delay) {
						var _this = this;
						setTimeout(function() {
							try {
								_this.insertInBuildQueue(type, id);
							} catch(ex) {
								paDebug(ex);
							}
							/* (e) {
							 console.debug("Error");
							 console.dir(e);
							 } */
						}, delay);
					},
					removeCenterRes:         function() {
						this.getCityCenter();
						var bqmax = webfrontend.data.Player.getInstance().getMaxBuildQueueSize();
						var bqcur = webfrontend.data.City.getInstance().buildQueue;
						var bqcur = (bqcur != null) ? bqcur.length : 0;
						var freeSlots = bqmax - bqcur;
						var ordersSent = 0;
						var delay = 500;
						this.deleteResButton.setEnabled(false);
						for(k = 0; k < this.city.length && ordersSent < freeSlots; k++) {
							if(this.city[k] && this.city[k][2] >= 900 && this.city[k][1] == 0) {
								var type = this.city[k][2] == 902 ? 27 : (this.city[k][2] == 901 ? 29 : (this.city[k][2] == 903 ? 30 : 28));
								var buildingId = this.city[k][0];
								this.doInsertInBuildQueue(type, buildingId, delay);
								delay += 1000;
								++ordersSent;
							}
						}
						window.setTimeout(function() {
							this.deleteResButton.setEnabled(true);
						}.bind(this), delay);
					},
					removeCottage:           function() {
						this.getCity();
						var _arr = new Array();
						var _wallIn = false;
						for(k = 0; k < this.city.length; k++) {
							if(this.city[k] && this.city[k][2] == 4 && this.city[k][1] <= 10 && this.city[k][1] > -1) {
								if(!_wallIn)
									_arr.push(this.city[k]);
								if(this.city[k][2] == 23)
									_wallIn = true;
							}
						}
						if(_arr.length > 0) {
							_arr.sort(function(a, b) {
								return a[1] - b[1];
							});
							webfrontend.net.CommandManager.getInstance().sendCommand("DemolishBuilding", {
								cityid:     webfrontend.data.City.getInstance().getId(),
								buildingid: _arr[0][0]
							}, this, this.sentCommand);
						} else {
							showMsgWindow("Remove Cottage", "No cottages Available to remove.");
						}
					},
					sentCommand:             function(ok, errorCode) {
						if(!errorCode) {
							showMsgWindow("Remove", "No building queue slots Available.");
						}
					},
					getCity:                 function() {
						var app = qx.core.Init.getApplication();
						if(app.visMain.mapmode != "c")
							return;
						var _cells = app.visMain.cells;
						if(!_cells[0]) {
							window.setTimeout(function() {
								ava.Main.getInstance().panel.getCity();
							}, 1000);
							return;
						}
						var _cgi = webfrontend.data.City.getInstance();
						var waterCity = _cgi.getOnWater();
						var _se = new Array();
						for(var _c in _cells) {
							_cell = _cells[_c].entities;
							for(var d in _cell) {
								if(_cell[d].basename != "CityWallLevel" && _cell[d].basename != "CityObject") {
									if(_cell[d].selectNode2 != null && _cell[d].selectNode3 != null) {
										if(_cell[d].selectNode.getY() < 880) {
											_se.push([_cell[d], _cell[d].selectNode2.getY() * 256 + _cell[d].selectNode2.getX() + 1, _cell[d].visId]);
										} else {
											_se.push([_cell[d], _cell[d].selectNode3.getY() * 256 + _cell[d].selectNode3.getX() + 1, _cell[d].visId]);
										}
										_se.push([_cell[d], _cell[d].selectNode.getY() * 256 + _cell[d].selectNode.getX(), _cell[d].visId]);
										_se.push([_cell[d], _cell[d].selectNode.getY() * 256 + _cell[d].selectNode.getX() + 1, _cell[d].visId]);
										_se.push([_cell[d], _cell[d].selectNode2.getY() * 256 + _cell[d].selectNode2.getX(), _cell[d].visId]);
										_se.push([_cell[d], _cell[d].selectNode3.getY() * 256 + _cell[d].selectNode3.getX(), _cell[d].visId]);
									} else {
										if(_cell[d].getType) {
											if(_cell[d].getType() > 51 && _cell[d].getType() < 60) {
												_se.push([_cell[d], _cell[d].selectNode.getY() * 256 + _cell[d].selectNode.getX() + 1, _cell[d].visId]);
												_se.push([_cell[d], _cell[d].selectNode.getY() * 256 + _cell[d].selectNode.getX() + 2, _cell[d].visId]);
												_se.push([_cell[d], (_cell[d].selectNode.getY() + 80) * 256 + _cell[d].selectNode.getX(), _cell[d].visId]);
												_se.push([_cell[d], (_cell[d].selectNode.getY() + 80) * 256 + _cell[d].selectNode.getX() + 1, _cell[d].visId]);
												_se.push([_cell[d], (_cell[d].selectNode.getY() + 80) * 256 + _cell[d].selectNode.getX() + 2, _cell[d].visId]);
												_se.push([_cell[d], (_cell[d].selectNode.getY() + 160) * 256 + _cell[d].selectNode.getX(), _cell[d].visId]);
												_se.push([_cell[d], (_cell[d].selectNode.getY() + 160) * 256 + _cell[d].selectNode.getX() + 1, _cell[d].visId]);
												_se.push([_cell[d], (_cell[d].selectNode.getY() + 160) * 256 + _cell[d].selectNode.getX() + 2, _cell[d].visId]);
											}
										}
										_se.push([_cell[d], _cell[d].selectNode.getY() * 256 + _cell[d].selectNode.getX(), _cell[d].visId]);
									}
								}
							}
						}
						_se.sort(function(a, b) {
							return a[1] - b[1];
						});
						console.debug("helllo");
						this.city = new Array(441);
						_empty = [0, 1, 19, 20, 21, 41, 399, 419, 420, 421, 439, 440];
						_water = [352, 353, 373, 374, 375, 395, 396, 397, 398, 417, 418, 438];
						for(i = 0; i < this.city.length; i++)
							this.city[i] = null;
						for(i = 0; i < _empty.length; i++)
							this.city[_empty[i]] = [-1, -1, -1];

						if(waterCity) {
							for(i = 0; i < _water.length; i++)
								this.city[_water[i]] = [-1, -1, -2];
						}
						try {
							for(i = 0, c = 0; i < _se.length; i++) {
								while(this.city[c] != null)
									c++;
								if(_se[i][0].getResType != undefined)
									this.city[c] = [_se[i][0].getId(), this.checkBuilding(_se[i][0].getId()), _se[i][0].getResType() + 900];
								else if(_se[i][0].getType != undefined) {
									if(_se[i][0].getLevel != undefined)
										this.city[c] = [_se[i][0].getId(), _se[i][0].getLevel() + this.checkBuilding(_se[i][0].getId()), _se[i][0].getType()];
									else
										this.city[c] = [_se[i][0].getId(), _cgi.getWallLevel() + this.checkBuilding("wall"), _se[i][0].getType()];
									// wall
								} else if(_se[i][0].getPlaceId != undefined) {
									if(_se[i][0].drawNode != null) {
										if(_se[i][0].drawNode.image != undefined) {
											if(_se[i][0].drawNode.image.indexOf("tower") != -1) {
												this.city[c] = [_se[i][0].getPlaceId(), 0, 99];
												// tower place
											} else {
												this.city[c] = [_se[i][0].getPlaceId(), 0, 98];
												// empty, can be corn field
											}
										} else if(_se[i][0].drawNode.basename == "EffectNode") {
											this.city[c] = [_se[i][0].getPlaceId(), 0, 99];
											// ??? bottom left tower in water city
										}
									} else {
										if(waterCity && /\b(331|332|351|354|372|376|394|416)\b/.test(c)) {
											this.city[c] = [_se[i][0].getPlaceId(), 0, 97];
											// water building place
										} else {
											this.city[c] = [_se[i][0].getPlaceId(), 0, 98];
											// empty
										}
									}
								}
							}
							for(i = 0; i < this.city.length; i++) {
								if(this.city[i] == null) {
									this.city = new Array(441);
									window.setTimeout(function() {
										ava.Main.getInstance().panel.getCity()
									}, 1000);
									return;
								}
							}
							this.cityId = _cgi.getId();
						} catch(e) {
							paDebug(e);
						}
						/* (e) {
						 console.debug("Error");
						 console.dir(e);
						 } */
					},
					getCityCenter:           function() {
						var app = qx.core.Init.getApplication();
						if(app.visMain.mapmode != "c")
							return;
						var _cells = app.visMain.cells;
						if(!_cells[0]) {
							window.setTimeout(function() {
								ava.Main.getInstance().panel.getCity();
							}, 1000);
							return;
						}
						var _cgi = webfrontend.data.City.getInstance();
						var waterCity = _cgi.getOnWater();
						var _se = new Array();
						for(var _c in _cells) {
							_cell = _cells[_c].entities;
							for(var d in _cell) {
								if(_cell[d].basename != "CityWallLevel" && _cell[d].basename != "CityObject") {
									if(_cell[d].selectNode2 != null && _cell[d].selectNode3 != null) {
										if(_cell[d].selectNode.getY() < 880) {
											_se.push([_cell[d], _cell[d].selectNode2.getY() * 256 + _cell[d].selectNode2.getX() + 1, _cell[d].visId]);
										} else {
											_se.push([_cell[d], _cell[d].selectNode3.getY() * 256 + _cell[d].selectNode3.getX() + 1, _cell[d].visId]);
										}
										_se.push([_cell[d], _cell[d].selectNode.getY() * 256 + _cell[d].selectNode.getX(), _cell[d].visId]);
										_se.push([_cell[d], _cell[d].selectNode.getY() * 256 + _cell[d].selectNode.getX() + 1, _cell[d].visId]);
										_se.push([_cell[d], _cell[d].selectNode2.getY() * 256 + _cell[d].selectNode2.getX(), _cell[d].visId]);
										_se.push([_cell[d], _cell[d].selectNode3.getY() * 256 + _cell[d].selectNode3.getX(), _cell[d].visId]);
									} else {
										if(_cell[d].getType) {
											if(_cell[d].getType() > 51 && _cell[d].getType() < 60) {
												_se.push([_cell[d], _cell[d].selectNode.getY() * 256 + _cell[d].selectNode.getX() + 1, _cell[d].visId]);
												_se.push([_cell[d], _cell[d].selectNode.getY() * 256 + _cell[d].selectNode.getX() + 2, _cell[d].visId]);
												_se.push([_cell[d], (_cell[d].selectNode.getY() + 80) * 256 + _cell[d].selectNode.getX(), _cell[d].visId]);
												_se.push([_cell[d], (_cell[d].selectNode.getY() + 80) * 256 + _cell[d].selectNode.getX() + 1, _cell[d].visId]);
												_se.push([_cell[d], (_cell[d].selectNode.getY() + 80) * 256 + _cell[d].selectNode.getX() + 2, _cell[d].visId]);
												_se.push([_cell[d], (_cell[d].selectNode.getY() + 160) * 256 + _cell[d].selectNode.getX(), _cell[d].visId]);
												_se.push([_cell[d], (_cell[d].selectNode.getY() + 160) * 256 + _cell[d].selectNode.getX() + 1, _cell[d].visId]);
												_se.push([_cell[d], (_cell[d].selectNode.getY() + 160) * 256 + _cell[d].selectNode.getX() + 2, _cell[d].visId]);
											}
										}
										_se.push([_cell[d], _cell[d].selectNode.getY() * 256 + _cell[d].selectNode.getX(), _cell[d].visId]);
									}
								}
							}
						}
						_se.sort(function(a, b) {
							return a[1] - b[1];
						});
						this.city = new Array(441);
						_empty = [0, 1, 19, 20, 21, 41, 399, 419, 420, 421, 439, 440];
						_water = [352, 353, 373, 374, 375, 395, 396, 397, 398, 417, 418, 438];
						for(var i = 0; i < this.city.length; i++)
							this.city[i] = null;
						for(var i = 0; i < _empty.length; i++)
							this.city[_empty[i]] = [-1, -1, -1];

						if(waterCity) {
							for(var i = 0; i < _water.length; i++)
								this.city[_water[i]] = [-1, -1, -2];
						}
						try {
							for(i = 0, c = 0; i < _se.length; i++) {
								while(this.city[c] != null)
									c++;
								if(_se[i][0].getResType != undefined) {
									var cx = _se[i][0].selectNode.getX();
									var cy = _se[i][0].selectNode.getY();
									if(cy > 480 && cy < 1280 && cx > 768 && cx < 2048) {
										this.city[c] = [_se[i][0].getId(), this.checkBuilding(_se[i][0].getId()), _se[i][0].getResType() + 900];
										// resource node
									} else {
										this.city[c] = [_se[i][0].getId(), 0, 0];
										// resource node but not center
									}
								} else if(_se[i][0].getType != undefined) {
									if(_se[i][0].getLevel != undefined)
										this.city[c] = [_se[i][0].getId(), _se[i][0].getLevel() + this.checkBuilding(_se[i][0].getId()), _se[i][0].getType()];
									else
										this.city[c] = [_se[i][0].getId(), _cgi.getWallLevel() + this.checkBuilding("wall"), _se[i][0].getType()];
									// wall
								} else if(_se[i][0].getPlaceId != undefined) {
									if(_se[i][0].drawNode != null) {
										if(_se[i][0].drawNode.image != undefined) {
											if(_se[i][0].drawNode.image.indexOf("tower") != -1) {
												this.city[c] = [_se[i][0].getPlaceId(), 0, 99];
												// tower place
											} else {
												this.city[c] = [_se[i][0].getPlaceId(), 0, 98];
												// empty, can be corn field
											}
										} else if(_se[i][0].drawNode.basename == "EffectNode") {
											this.city[c] = [_se[i][0].getPlaceId(), 0, 99];
											// ??? bottom left tower in water city
										}
									} else {
										if(waterCity && /\b(331|332|351|354|372|376|394|416)\b/.test(c)) {
											this.city[c] = [_se[i][0].getPlaceId(), 0, 97];
											// water building place
										} else {
											this.city[c] = [_se[i][0].getPlaceId(), 0, 98];
											// empty
										}
									}
								}
							}
							for(i = 0; i < this.city.length; i++) {
								if(this.city[i] == null) {
									this.city = new Array(441);
									window.setTimeout(function() {
										ava.Main.getInstance().panel.getCityCenter();
									}, 1000);
									return;
								}
							}
						} catch(e) {
							paDebug(e);
						}
						/* (e) {
						 console.debug("Error");
						 console.dir(e);
						 } */
					},
					checkBuilding:           function(_buildingId) {
						try {
							cBuildQueue = webfrontend.data.City.getInstance().getBuildQueue();
							d = 0;
							if(cBuildQueue != null) {
								for(j = 0; j < cBuildQueue.length; j++) {
									if(cBuildQueue[j].building == _buildingId && (cBuildQueue[j].state == 2 || cBuildQueue[j].state == 5))
										return -11;

									if(cBuildQueue[j].building == _buildingId)
										d++;
									if(cBuildQueue[j].type == 23 && _buildingId == "wall")
										d++;
									// is city wall on queue?
								}
							}
						} catch(e) {
							paDebug(e);
						}
						/* (e) {
						 console.debug("Error");
						 console.dir(e);
						 } */
						return d;
					},
					update:                  function(widget, args) {
						this.updateContent(widget, args);
					},
					findObject:              function(parent, component, recursive) {
						recursive = recursive || false;
						for(var key in parent) {
							if(parent[key] instanceof component) {
								return parent[key];
							} else if(recursive && typeof parent[key] == "object") {
								var ret = this.findObject(parent[key], component, recursive);
								if(ret != null)
									return ret;
							}
						}
						return null;
					},
					toggleCityControls:      function() {
						if(citySort.getValue()) {
							qx.core.Init.getApplication().cityBar.citiesSelect.getSortedPlayerCities =
								(function() {
									var cp = this.prevSort();
									cp.sort(
										function(a, b) {
											if(a.city.reference != b.city.reference) {
												return a.city.reference.toUpperCase() < b.city.reference.toUpperCase() ? -1 : 1;
											}
											;
											return a.iId < b.iId ? -1 : 1;
										}
									);
									return cp;
								});
						} else {
							qx.core.Init.getApplication().cityBar.citiesSelect.getSortedPlayerCities =
								(function() {
									return this.prevSort();
								});
						}
						cityBar = qx.core.Init.getApplication().cityBar;
						cityBar.citiesSelect.fillCityItems();
					},
					toggleTable:             function() {
						var panel = ava.Main.getInstance().panel;
						var oPlayer = webfrontend.data.Player.getInstance();
						var title = oPlayer.getTitle();
						if(title >= 3) {
							var mr = panel.MissingResourcesValue.getValue();
							if(panel.BaronLabel.getValue().indexOf('open') >= 0) {
								panel.BaronLabel.setValue('<div style="-moz-transform: scaleX(1);background-image:url(resource/webfrontend/theme/tree/closed.png);background-repeat:no-repeat;width:16px;height:16px;font-weight:bold;padding-left:15px;"><img src="resource/webfrontend/ui/icons/units/icon_units_baron.png"  style="align:absmiddle;-moz-transform: scaleX(1); width: 16px; height: 16px; padding-left:4px;" /></div>');
								panel.MissingResourcesValue.setValue(mr.replace("margin-left: 5px", "display:none;margin-left: 5px"));
							} else {
								panel.BaronLabel.setValue('<div style="-moz-transform: scaleX(1);background-image:url(resource/webfrontend/theme/tree/open.png);background-repeat:no-repeat;width:16px;height:16px;font-weight:bold;padding-left:15px;"><img src="resource/webfrontend/ui/icons/units/icon_units_baron.png"  style="align:absmiddle;-moz-transform: scaleX(1); width: 16px; height: 16px; padding-left:4px;" /></div>');
								panel.MissingResourcesValue.setValue(mr.replace("display:none;margin-left: 5px", "margin-left: 5px"));
							}
						}
					},
					updateCurBarons:         function() {
						var panel = ava.Main.getInstance().panel;
						var oPlayer = webfrontend.data.Player.getInstance();
						if(_oTech == null) {
							_oTech = webfrontend.data.Tech.getInstance();
						}
						var TotalBarons = oPlayer.getBarons();
						var IdleBarons = oPlayer.getBaronsIdle();
						var QueuedBarons = oPlayer.getBaronsQueue();
						var AvailableBarons = _oTech.getBonus("baronCount", webfrontend.data.Tech.research) - ((oPlayer.getNumCities() - 1) + IdleBarons + QueuedBarons);
						panel.BaronValue.setValue("<div style='margin-left: 10px;'>" + TotalBarons + "/" + IdleBarons + "/" + QueuedBarons + "/" + AvailableBarons + "</div>");
						var ix = _oTech.getBonus("baronCount", webfrontend.data.Tech.research) + 3;
						var numCastlesNeeded = Math.floor((ix - 3) / 4) + 1;
						panel.CastleValue.setValue("<div style='margin-left: 4px;'>" + player.getNumCastles() + "/" + numCastlesNeeded + "</div>");
						var numOutgoing = webfrontend.data.Alliance.getInstance().getNumOutgoingAttacks();
						panel.outgoing.setValue("<div style='margin-left: 4px;'>Outgoing Attacks: " + numOutgoing + "</div>");
					},
					formatNumber:            function(str) {
						var num = String(str).replace(/\,/g, '');
						var pos = num.indexOf('.');
						if(pos >= 0) {
							num = num.substring(0, pos)
						}
						;
						if(num.length == 0 || isNaN(num)) {
							return "";
						}
						var val = "";
						for(var i = 0, numLen = num.length; i < numLen; ++i) {
							if(val.length > 0 && (((num.length - i) % 3) == 0)) {
								val = val + ",";
							}
							val += num.substring(i, i + 1);
						}
						return val;
					},
					updateNeededResources:   function() {
						var panel = ava.Main.getInstance().panel;
						var oPlayer = webfrontend.data.Player.getInstance();
						var title = oPlayer.getTitle();
						if(_oTech == null) {
							_oTech = webfrontend.data.Tech.getInstance();
						}
						var ix = _oTech.getBonus("baronCount", webfrontend.data.Tech.research) + 3;
						if(title >= 3) {
							var pr = oPlayer.getVoidResources();
							if(pr) {
								var curGold = oPlayer.getGold();
								var woodImg = '<img src="resource/webfrontend/ui/icons_ressource_voidWood_16.png" style="align:absmiddle;-moz-transform: scaleX(1); width: 10px; height: 10px; padding-right:2px;">';
								var stoneImg = '<img src="resource/webfrontend/ui/icons_ressource_voidStone_16.png" style="align:absmiddle;-moz-transform: scaleX(1); width: 10px; height: 10px; padding-right:2px;">';
								var ironImg = '<img src="resource/webfrontend/ui/icons_ressource_voidIron_16.png" style="align:absmiddle;-moz-transform: scaleX(1); width: 10px; height: 10px; padding-right:2px;">';
								var foodImg = '<img src="resource/webfrontend/ui/icons_ressource_voidFood_16.png" style="align:absmiddle;-moz-transform: scaleX(1); width: 10px; height: 10px; padding-right:2px;">';
								var goldImg = '<img src="resource/webfrontend/ui/icons_ressource_gold.png" style="align:absmiddle;-moz-transform: scaleX(1); width: 10px; height: 10px; padding-right:2px;">';
								var numBarons = _oTech.getBonus("baronCount", webfrontend.data.Tech.research);
								var bW = oPlayer.getTechTree();
								for(i = 0; i < bW.length; i++) {
									var bT = _oTech.getTreeInfoByStepId(bW[i]);
									if(bT.tree == 40) {
										bT.level += 2;
										var bU = _oTech.getStepInfoByTreeId(40, bT.level);
										var goldNeeded = bU.data.g;
										var resNeeded = bU.data.r[5];
									}
								}
								var numCastlesNeeded = Math.floor((ix - 3) / 4) + 1;
								var playerCastles = oPlayer.getNumCastles();
								var sb = new qx.util.StringBuilder(200);
								var mr = this.MissingResourcesValue.getValue();
								var totalNeeded = (resNeeded * 4) + (goldNeeded / 1000);
								var totalOnHand = Math.min(resNeeded, pr[3][1]) + Math.min(resNeeded, pr[2][1]) + Math.min(resNeeded, pr[1][1]) + Math.min(resNeeded, pr[0][1]) + Math.min((goldNeeded / 1000), (curGold / 1000));
								var pct = Math.floor(Math.min(100, (totalOnHand / totalNeeded) * 100) * 100) / 100;
								var curWood = pr[3][1];
								var curStone = pr[2][1];
								var curIron = pr[1][1];
								var curFood = pr[0][1];
								var woodNeeded = Math.max(0, resNeeded - curWood);
								var stoneNeeded = Math.max(0, resNeeded - curStone);
								var ironNeeded = Math.max(0, resNeeded - curIron);
								var foodNeeded = Math.max(0, resNeeded - curFood);
								var goldNeeded = Math.max(0, goldNeeded - curGold);
								if((ix - 5) % 4 == 0) {
									if(playerCastles >= numCastlesNeeded) {
										sb.add("<span style='v-align: middle'>Free</span>");
									} else {
										sb.add(String(numCastlesNeeded - playerCastles), " more castles or ");
										if(mr.indexOf("display:none") > 0) {
											sb.add('<table style="display:none;margin-left: 5px; max-width: 322px; border:1px dotted  #8B693E;" cellspacing="0">');
										} else {
											sb.add('<table style="margin-left: 5px;max-width: 322px; border:1px dotted  #8B693E;" cellspacing="0">');
										}
										sb.add('<tbody><tr alt="PR needed for TA (' + pct + '%)" title="PR needed for TA (' + pct + '%)">');
										sb.add("<td style='padding: 3px;border-bottom:1px dotted  #8B693E;'>" + woodImg + this.formatNumber(woodNeeded) + "</td>");
										sb.add("<td style='padding: 3px;border-bottom:1px dotted  #8B693E;'>" + stoneImg + this.formatNumber(stoneNeeded) + "</td>");
										sb.add("<td style='padding: 3px;border-bottom:1px dotted  #8B693E;'>" + ironImg + this.formatNumber(ironNeeded) + "</td>");
										sb.add("<td style='padding: 3px;border-bottom:1px dotted  #8B693E;'>" + foodImg + this.formatNumber(foodNeeded) + "</td>");
										sb.add("<td style='padding: 3px;border-bottom:1px dotted #8B693E;'>" + goldImg + this.formatNumber(goldNeeded) + "</td>");
										sb.add('</tr><tr>');
										sb.add("<td style='padding: 3px;' alt='" + this.formatNumber(curWood) + "' title='" + this.formatNumber(curWood) + "'>" + woodImg + (curWood > 1000000 ? "> 1 mio." : this.formatNumber(curWood)) + "</td>");
										sb.add("<td style='padding: 3px;' alt='" + this.formatNumber(curStone) + "' title='" + this.formatNumber(curStone) + "'>" + stoneImg + (curStone > 1000000 ? "> 1 mio." : this.formatNumber(curStone)) + "</td>");
										sb.add("<td style='padding: 3px; alt='" + this.formatNumber(curIron) + "' title='" + this.formatNumber(curIron) + "''>" + ironImg + (curIron > 1000000 ? "> 1 mio." : this.formatNumber(curIron)) + "</td>");
										sb.add("<td style='padding: 3px; alt='" + this.formatNumber(curFood) + "' title='" + this.formatNumber(curFood) + "''>" + foodImg + (curFood > 1000000 ? "> 1 mio." : this.formatNumber(curFood)) + "</td>");
										sb.add("<td style='padding: 3px; alt='" + this.formatNumber(curGold) + "' title='" + this.formatNumber(curGold) + "''>" + goldImg + (curGold > 1000000000 ? "> 1 bio." : this.formatNumber(curGold)) + "</td>");
										sb.add('</tr></tbody></table>');
									}
								} else {
									if(mr.indexOf("display:none") > 0) {
										sb.add('<table style="display:none;margin-left: 5px;border:1px dotted #8B693E;" cellspacing="0">');
									} else {
										sb.add('<table style="margin-left: 5px;max-width: 322px; border:1px dotted #8B693E;" cellspacing="0">');
									}
									sb.add('<tbody><tr alt="PR needed for TA (' + pct + '%)" title="PR needed for TA (' + pct + '%)">');
									sb.add("<td style='padding: 3px;border-bottom:1px dotted  #8B693E;'>" + woodImg + this.formatNumber(woodNeeded) + "</td>");
									sb.add("<td style='padding: 3px;border-bottom:1px dotted  #8B693E;'>" + stoneImg + this.formatNumber(stoneNeeded) + "</td>");
									sb.add("<td style='padding: 3px;border-bottom:1px dotted  #8B693E;'>" + ironImg + this.formatNumber(ironNeeded) + "</td>");
									sb.add("<td style='padding: 3px;border-bottom:1px dotted  #8B693E;'>" + foodImg + this.formatNumber(foodNeeded) + "</td>");
									sb.add("<td style='padding: 3px;border-bottom:1px dotted #8B693E;'>" + goldImg + this.formatNumber(goldNeeded) + "</td>");
									sb.add('</tr><tr>');
									sb.add("<td style='padding: 3px;' alt='" + this.formatNumber(curWood) + "' title='" + this.formatNumber(curWood) + "'>" + woodImg + (curWood > 1000000 ? "> 1 mio." : this.formatNumber(curWood)) + "</td>");
									sb.add("<td style='padding: 3px;' alt='" + this.formatNumber(curStone) + "' title='" + this.formatNumber(curStone) + "'>" + stoneImg + (curStone > 1000000 ? "> 1 mio." : this.formatNumber(curStone)) + "</td>");
									sb.add("<td style='padding: 3px; alt='" + this.formatNumber(curIron) + "' title='" + this.formatNumber(curIron) + "''>" + ironImg + (curIron > 1000000 ? "> 1 mio." : this.formatNumber(curIron)) + "</td>");
									sb.add("<td style='padding: 3px; alt='" + this.formatNumber(curFood) + "' title='" + this.formatNumber(curFood) + "''>" + foodImg + (curFood > 1000000 ? "> 1 mio." : this.formatNumber(curFood)) + "</td>");
									sb.add("<td style='padding: 3px; alt='" + this.formatNumber(curGold) + "' title='" + this.formatNumber(curGold) + "''>" + goldImg + (curGold > 1000000000 ? "> 1 bio." : this.formatNumber(curGold)) + "</td>");
									sb.add('</tr></tbody></table>');
								}
								panel.MissingResourcesValue.setValue(sb.get());
							}
						}
					},
					showIncomingAttacks:     function() {
						var dialog = ava.ui.IncomingAttacksWindow.getInstance();
						// dialog.center();
						dialog.show();
					},
					fillBuildingQueue:       function() {
						var activeCity = webfrontend.data.City.getInstance();
						webfrontend.net.CommandManager.getInstance().sendCommand("BuildingQueueFill", {
							cityid: activeCity.getId()
						}, null, function(e) { //ava.Chat.getInstance().addChatMessage(' fill error:' + e.r, true);
						});
					},
					payBuildingQueue:        function() {
						var activeCity = webfrontend.data.City.getInstance();
						webfrontend.net.CommandManager.getInstance().sendCommand("BuildingQueuePayAll", {
							cityid: activeCity.getId()
						}, null, function() {
						});
					},
					showCombatWindow:        function() {
						var dialog = ava.ui.CombatWindow.getInstance();
						dialog.center();
						dialog.open();
					},
					showHelp:                function() {
						var dialog = ava.ui.AboutWindow.getInstance();
						dialog.center();
						dialog.show();
					},
					showFillWithResources:   function() {
						var dialog = ava.ui.FillWithResourcesWindow.getInstance();
						dialog.center();
						dialog.show();
					},
					showAllianceInfo:        function() {
						var dialog = ava.ui.LastLogin.getInstance();
						dialog.center();
						dialog.show();
					},
					showReports:             function() {
						var dialog = ava.ui.PlayerReportsWindow.getInstance();
						dialog.center();
						dialog.show();
					},
					showPalaceItems:         function() {
						var dialog = ava.ui.PalaceItemsWindow.getInstance();
						dialog.show();
						dialog.moveTo(500, 200);
					},
					showMailingLists:        function() {
						var dialog = ava.ui.AllianceMailingListWindow.getInstance();
						dialog.center();
						dialog.show();
					},
					showRaidingWindow:       function() {
						var dialog = ava.ui.RaidingWindow.getInstance();
						var w = qx.bom.Viewport.getWidth(window);
						var h = qx.bom.Viewport.getHeight(window);
						var wh = Math.floor(h * 0.45);
						dialog.setWidth(500);
						dialog.setHeight(500);
						dialog.show();
						dialog.moveTo(w - 520, h - 525);
					}
				}
			});
		}; // CreateAvaTweak

		function initialize() {
			if(!startup.initialized) {
				startup.initialized = true;

				CreateAvaTweak();
				AvaInit();
				ava.Main.getInstance().initialize();
			}
		}

		function initTools() {
			initialize();
		}

		/* startup script to launch the tweak */
		var startup = function() {
			if(typeof window.qx == 'undefined') {
				console.warn('qx not found, retry again in a couple of seconds.');
				window.setTimeout(startup, 2000);
				return;
			}
			// checkDependances
			console.warn('check dependencies');
			var dependencies = [webfrontend.config.Config.getInstance().getChat(), qx.core.Init.getApplication().chat],
				i = dependencies.length;

			while(i--) {
				if(dependencies[i])
					continue;
				console.debug('dependency missing [' + i + ']');
				console.warn('dependencies missing, retry again in a couple seconds');
				window.setTimeout(startup, 2000);
				return;

			}
			console.debug('dependencies found.  initialize tools');
			window.setTimeout(initTools, 2000);
		};

		window.setTimeout(startup, 2000);
	}; // main


	/* inject this script into the website */

	function inject() {
		console.warn('Injecting fun fun fun script');
		var script = document.createElement("script");
		var txt = main.toString();
		//	if(window.opera != undefined)
//			txt = txt.replace(/</g, "&lt;");
		script.innerHTML = "(" + txt + ")();";
		script.type = "text/javascript";
		document.getElementsByTagName("head")[0].appendChild(script);

	}

	if(/lordofultima\.com/i.test(document.domain))
		inject();

})();