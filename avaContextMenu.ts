/**
 * Created by David on 10/8/13.
 */
function AvaContextMenuInit() {
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
				paDebug(e);

			}
		}

		a.worldViewToolTip.addListener("appear", toolTipAppear, this);
	} catch(e) {
		paDebug(e);
	}
}; // avainit