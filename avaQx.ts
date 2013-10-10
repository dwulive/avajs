window.qx = {};
qx.$$domReady = true;
GAMEDATA = {
};


var m = ".prototype",
	k = "Boolean",
	j = "Error",
	h = "Object.keys requires an object as argument.",
	g = "constructor",
	f = "warn",
	e = "default",
	d = "hasOwnProperty",
	c = "string",
	b = "toLocaleString",
	N = "RegExp",
	M = '\", "',
	L = "info",
	K = "BROKEN_IE",
	J = "isPrototypeOf",
	I = "Date",
	H = "qx.Bootstrap",
	G = "]",
	F = "Class",
	E = "error",
	t = "[Class ",
	u = "valueOf",
	r = "Number",
	s = "debug",
	p = "ES5",
	q = "propertyIsEnumerable",
	n = "object",
	o = "function",
	v = "Object",
	w = '"',
	z = "",
	y = "Array",
	B = "()",
	A = "String",
	D = "Function",
	C = "toString",
	x = ".";
if (!window.qx) {
	window.qx = {};
};
qx.Bootstrap = {
	genericToString: function () {
		return t + this.classname + G;
	},
	createNamespace: function (name, O) {
		var Q = name.split(x);
		var parent = window;
		var P = Q[0];
		for (var i = 0, R = Q.length - 1; i < R; i++, P = Q[i]) {
			if (!parent[P]) {
				parent = parent[P] = {};
			} else {
				parent = parent[P];
			};
		};
		parent[P] = O;
		return P;
	},
	setDisplayName: function (S, T, name) {
		S.displayName = T + x + name + B;
	},
	setDisplayNames: function (U, V) {
		for (var name in U) {
			var W = U[name];
			if (W instanceof Function) {
				W.displayName = V + x + name + B;
			};
		};
	},
	define: function (name, X) {
		if (!X) {
			var X = {
				statics: {}
			};
		};
		var bd;
		var bb = null;
		qx.Bootstrap.setDisplayNames(X.statics, name);
		if (X.members || X.extend) {
			qx.Bootstrap.setDisplayNames(X.members, name + m);
			bd = X.construct || new Function;
			if (X.extend) {
				this.extendClass(bd, bd, X.extend, name, bc);
			};
			var Y = X.statics || {};
			for (var i = 0, be = qx.Bootstrap.keys(Y), l = be.length; i < l; i++) {
				var bf = be[i];
				bd[bf] = Y[bf];
			};
			bb = bd.prototype;
			var ba = X.members || {};
			for (var i = 0, be = qx.Bootstrap.keys(ba), l = be.length; i < l; i++) {
				var bf = be[i];
				bb[bf] = ba[bf];
			};
		} else {
			bd = X.statics || {};
		};
		var bc = name ? this.createNamespace(name, bd) : z;
		bd.name = bd.classname = name;
		bd.basename = bc;
		bd.$$type = F;
		if (!bd.hasOwnProperty(C)) {
			bd.toString = this.genericToString;
		};
		if (X.defer) {
			X.defer(bd, bb);
		};
		qx.Bootstrap.$$registry[name] = bd;
		return bd;
	}
};
qx.Bootstrap.define(H, {
	statics: {
		LOADSTART: qx.$$start || new Date(),
		DEBUG: (function () {
			var bg = true;
			if (qx.$$environment && qx.$$environment["qx.debug"] === false) {
				bg = false;
			};
			return bg;
		})(),
		getEnvironmentSetting: function (bh) {
			if (qx.$$environment) {
				return qx.$$environment[bh];
			};
		},
		setEnvironmentSetting: function (bi, bj) {
			if (!qx.$$environment) {
				qx.$$environment = {};
			};
			if (qx.$$environment[bi] === undefined) {
				qx.$$environment[bi] = bj;
			};
		},
		createNamespace: qx.Bootstrap.createNamespace,
		define: qx.Bootstrap.define,
		setDisplayName: qx.Bootstrap.setDisplayName,
		setDisplayNames: qx.Bootstrap.setDisplayNames,
		genericToString: qx.Bootstrap.genericToString,
		extendClass: function (bk, bl, bm, name, bn) {
			var bq = bm.prototype;
			var bp = new Function();
			bp.prototype = bq;
			var bo = new bp();
			bk.prototype = bo;
			bo.name = bo.classname = name;
			bo.basename = bn;
			bl.base = bm;
			bk.superclass = bm;
			bl.self = bk.constructor = bo.constructor = bk;
		},
		getByName: function (name) {
			return qx.Bootstrap.$$registry[name];
		},
		$$registry: {},
		objectGetLength: function (br) {
			return qx.Bootstrap.keys(br).length;
		},
		objectMergeWith: function (bs, bt, bu) {
			if (bu === undefined) {
				bu = true;
			};
			for (var bv in bt) {
				if (bu || bs[bv] === undefined) {
					bs[bv] = bt[bv];
				};
			};
			return bs;
		},
		__a: [J, d, b, C, u, q, g],
		getKeys: function (bw) {
			if (qx.Bootstrap.DEBUG) {
				qx.Bootstrap.warn("'qx.Bootstrap.getKeys' is deprecated. " + "Please use the native 'Object.keys()' instead.");
			};
			return qx.Bootstrap.keys(bw);
		},
		keys: ({
			"ES5": Object.keys,
			"BROKEN_IE": function (bx) {
				if (bx === null || (typeof bx != "object" && typeof bx != "function")) {
					throw new TypeError("Object.keys requires an object as argument.");
				};
				var by = [];
				var bA = Object.prototype.hasOwnProperty;
				for (var bB in bx) {
					if (bA.call(bx, bB)) {
						by.push(bB);
					};
				};
				var bz = qx.Bootstrap.__a;
				for (var i = 0, a = bz, l = a.length; i < l; i++) {
					if (bA.call(bx, a[i])) {
						by.push(a[i]);
					};
				};
				return by;
			},
			"default": function (bC) {
				if (bC === null || (typeof bC != n && typeof bC != o)) {
					throw new TypeError(h);
				};
				var bD = [];
				var bE = Object.prototype.hasOwnProperty;
				for (var bF in bC) {
					if (bE.call(bC, bF)) {
						bD.push(bF);
					};
				};
				return bD;
			}
		})[typeof (Object.keys) == o ? p : (function () {
			for (var bG in {
				toString: 1
			}) {
				return bG;
			};
		})() !== C ? K : e],
		getKeysAsString: function (bH) {
			{};
			var bI = qx.Bootstrap.keys(bH);
			if (bI.length == 0) {
				return z;
			};
			return w + bI.join(M) + w;
		},
		__b: {
			"[object String]": A,
			"[object Array]": y,
			"[object Object]": v,
			"[object RegExp]": N,
			"[object Number]": r,
			"[object Boolean]": k,
			"[object Date]": I,
			"[object Function]": D,
			"[object Error]": j
		},
		bind: function (bJ, self, bK) {
			var bL = Array.prototype.slice.call(arguments, 2, arguments.length);
			return function () {
				var bM = Array.prototype.slice.call(arguments, 0, arguments.length);
				return bJ.apply(self, bL.concat(bM));
			};
		},
		firstUp: function (bN) {
			return bN.charAt(0).toUpperCase() + bN.substr(1);
		},
		firstLow: function (bO) {
			return bO.charAt(0).toLowerCase() + bO.substr(1);
		},
		getClass: function (bP) {
			var bQ = Object.prototype.toString.call(bP);
			return (qx.Bootstrap.__b[bQ] || bQ.slice(8, -1));
		},
		isString: function (bR) {
			return (bR !== null && (typeof bR === c || qx.Bootstrap.getClass(bR) == A || bR instanceof String || ( !! bR && !! bR.$$isString)));
		},
		isArray: function (bS) {
			return (bS !== null && (bS instanceof Array || (bS && qx.data && qx.data.IListData && qx.util.OOUtil.hasInterface(bS.constructor, qx.data.IListData)) || qx.Bootstrap.getClass(bS) == y || ( !! bS && !! bS.$$isArray)));
		},
		isObject: function (bT) {
			return (bT !== undefined && bT !== null && qx.Bootstrap.getClass(bT) == v);
		},
		isFunction: function (bU) {
			return qx.Bootstrap.getClass(bU) == D;
		},
		$$logs: [],
		debug: function (bV, bW) {
			qx.Bootstrap.$$logs.push([s, arguments]);
		},
		info: function (bX, bY) {
			qx.Bootstrap.$$logs.push([L, arguments]);
		},
		warn: function (ca, cb) {
			qx.Bootstrap.$$logs.push([f, arguments]);
		},
		error: function (cc, cd) {
			qx.Bootstrap.$$logs.push([E, arguments]);
		},
		trace: function (ce) {}
	}
});
})();


(function () {
	var cH = "qx.bom.client.Xml.getSelectSingleNode",
		cG = "qx.bom.client.Stylesheet.getInsertRule",
		cF = "qx.bom.client.Html.getDataset",
		cE = "qx.bom.client.PhoneGap.getPhoneGap",
		cD = "qx.bom.client.EcmaScript.getArrayReduce",
		cC = "qx.bom.client.Html.getAudioAif",
		cB = "qx.bom.client.CssTransform.get3D",
		cA = "qx.bom.client.EcmaScript.getArrayLastIndexOf",
		cz = "qx.debug.dispose",
		cy = "qx.bom.client.EcmaScript.getArrayForEach",
		bI = "qx.bom.client.Xml.getAttributeNS",
		bH = "qx.bom.client.Stylesheet.getRemoveImport",
		bG = "qx.bom.client.Css.getUserModify",
		bF = "qx.bom.client.Css.getBoxShadow",
		bE = "qx.bom.client.Html.getXul",
		bD = "qx.bom.client.Plugin.getWindowsMedia",
		bC = ":",
		bB = "qx.blankpage",
		bA = "qx.bom.client.Html.getVideo",
		bz = "qx.bom.client.Device.getName",
		cO = "qx.bom.client.Event.getTouch",
		cP = "qx.optimization.strings",
		cM = "qx.debug.property.level",
		cN = "qx.bom.client.EcmaScript.getArrayFilter",
		cK = "qx.bom.client.EcmaScript.getStringTrim",
		cL = "qx.optimization.variables",
		cI = "qx.bom.client.EcmaScript.getDateNow",
		cJ = "qx.bom.client.EcmaScript.getArrayEvery",
		cQ = "qx.bom.client.Xml.getImplementation",
		cR = "qx.bom.client.Html.getConsole",
		ch = "qx.bom.client.Engine.getVersion",
		cg = "qx.bom.client.Plugin.getQuicktime",
		cj = "qx.bom.client.Html.getNaturalDimensions",
		ci = "qx.bom.client.Xml.getSelectNodes",
		cl = "qx.bom.client.Xml.getElementsByTagNameNS",
		ck = "qx.nativeScrollBars",
		cn = "qx.bom.client.Html.getDataUrl",
		cm = "qx.bom.client.Flash.isAvailable",
		cf = "qx.bom.client.Html.getCanvas",
		ce = "qx.bom.client.Css.getBoxModel",
		l = "qx.bom.client.Plugin.getSilverlight",
		m = "qx/static/blank.html",
		n = "qx.bom.client.EcmaScript.getArrayMap",
		o = "qx.bom.client.Css.getUserSelect",
		p = "qx.bom.client.Css.getRadialGradient",
		q = "module.property",
		r = "qx.bom.client.Plugin.getWindowsMediaVersion",
		s = "qx.bom.client.Stylesheet.getCreateStyleSheet",
		t = "qx.bom.client.Locale.getLocale",
		u = "module.events",
		dg = "qx.bom.client.Plugin.getSkype",
		df = "module.databinding",
		de = "qx.bom.client.Html.getFileReader",
		dd = "qx.bom.client.Css.getBorderImage",
		dk = "qx.bom.client.Stylesheet.getDeleteRule",
		dj = "qx.bom.client.EcmaScript.getErrorToString",
		di = "qx.bom.client.Plugin.getDivXVersion",
		dh = "qx.bom.client.Scroll.scrollBarOverlayed",
		dm = "qx.bom.client.Plugin.getPdfVersion",
		dl = "qx.bom.client.Xml.getCreateNode",
		Y = "qx.bom.client.Css.getLinearGradient",
		ba = "qx.bom.client.Transport.getXmlHttpRequest",
		W = "qx.bom.client.Css.getBorderImageSyntax",
		X = "qx.bom.client.Html.getClassList",
		bd = "qx.bom.client.Event.getHelp",
		be = "qx.optimization.comments",
		bb = "qx.bom.client.Locale.getVariant",
		bc = "qx.bom.client.Css.getBoxSizing",
		U = "qx.bom.client.OperatingSystem.getName",
		V = "module.logger",
		H = "qx.bom.client.Css.getOverflowXY",
		G = "qx.mobile.emulatetouch",
		J = "css.overflowxy",
		I = "qx.bom.client.Html.getAudioWav",
		D = "qx.bom.client.Browser.getName",
		C = "qx.bom.client.Css.getInlineBlock",
		F = "qx.bom.client.Plugin.getPdf",
		E = "qx.dynlocale",
		B = "ecmascript.error.stacktrace",
		A = "qx.bom.client.Html.getAudio",
		bj = "qx.core.Environment",
		bk = "qx.bom.client.EcmaScript.getFunctionBind",
		bl = "qx.bom.client.CssTransform.getSupport",
		bm = "qx.bom.client.Html.getTextContent",
		bf = "qx.bom.client.Css.getPlaceholder",
		bg = "qx.bom.client.Css.getFloat",
		bh = "false",
		bi = "qx.bom.client.Css.getFilterGradient",
		bn = "qx.bom.client.Html.getHistoryState",
		bo = "qxenv",
		R = "qx.bom.client.Html.getSessionStorage",
		Q = "qx.bom.client.Html.getAudioAu",
		P = "qx.bom.client.Css.getOpacity",
		O = "qx.bom.client.Css.getFilterTextShadow",
		N = "qx.bom.client.Html.getVml",
		M = "qx.bom.client.Transport.getMaxConcurrentRequestCount",
		L = "qx.bom.client.Event.getHashChange",
		K = "qx.bom.client.Css.getRgba",
		T = "qx.bom.client.Css.getBorderRadius",
		S = "qx.bom.client.Event.getPointer",
		bp = "qx.bom.client.EcmaScript.getArraySome",
		bq = "qx.bom.client.Transport.getSsl",
		br = "qx.bom.client.Html.getWebWorker",
		bs = "qx.bom.client.Json.getJson",
		bt = "qx.bom.client.Browser.getQuirksMode",
		bu = "qx.bom.client.Css.getTextOverflow",
		bv = "qx.bom.client.EcmaScript.getArrayIndexOf",
		bw = "qx.bom.client.Xml.getQualifiedItem",
		bx = "qx.bom.client.Html.getVideoOgg",
		by = "&",
		bM = "qx.bom.client.EcmaScript.getArrayReduceRight",
		bL = "qx.bom.client.Device.getType",
		bK = "qx.bom.client.Browser.getDocumentMode",
		bJ = "qx.allowUrlVariants",
		bQ = "qx.debug.ui.queue",
		bP = "qx.bom.client.Html.getContains",
		bO = "qx.bom.client.Plugin.getActiveX",
		bN = ".",
		bS = "qx.bom.client.Xml.getDomProperties",
		bR = "qx.bom.client.CssAnimation.getSupport",
		ca = "qx.debug.databinding",
		cb = "qx.optimization.basecalls",
		bX = "ecmascript.stacktrace",
		bY = "qx.bom.client.Browser.getVersion",
		bV = "qx.bom.client.Css.getUserSelectNone",
		bW = "qx.bom.client.Html.getSvg",
		bT = "qx.bom.client.EcmaScript.getObjectKeys",
		bU = "qx.bom.client.Plugin.getDivX",
		cc = "qx.bom.client.Runtime.getName",
		cd = "qx.bom.client.Html.getLocalStorage",
		cr = "qx.bom.client.Flash.getStrictSecurityModel",
		cq = "qx.aspects",
		ct = "qx.debug",
		cs = "qx.dynamicmousewheel",
		cv = "qx.bom.client.Html.getAudioMp3",
		cu = "qx.bom.client.Engine.getName",
		cx = "qx.bom.client.Html.getUserDataStorage",
		cw = "qx.bom.client.Plugin.getGears",
		cp = "qx.bom.client.Plugin.getQuicktimeVersion",
		co = "qx.bom.client.Html.getAudioOgg",
		cY = "qx.bom.client.Css.getTextShadow",
		da = "qx.bom.client.Plugin.getSilverlightVersion",
		db = "qx.bom.client.Html.getCompareDocumentPosition",
		dc = "qx.bom.client.Flash.getExpressInstall",
		cU = "qx.bom.client.OperatingSystem.getVersion",
		cV = "qx.bom.client.Html.getXPath",
		cW = "qx.bom.client.Html.getGeoLocation",
		cX = "qx.optimization.privates",
		cS = "qx.bom.client.Css.getAppearance",
		cT = "qx.mobile.nativescroll",
		k = "qx.bom.client.Xml.getDomParser",
		j = "qx.bom.client.Stylesheet.getAddImport",
		h = "qx.optimization.variants",
		g = "qx.bom.client.Html.getVideoWebm",
		f = "qx.bom.client.Flash.getVersion",
		e = "qx.bom.client.CssAnimation.getRequestAnimationFrame",
		d = "qx.bom.client.Css.getLegacyWebkitGradient",
		c = "qx.bom.client.PhoneGap.getNotification",
		b = "qx.bom.client.Html.getVideoH264",
		a = "qx.bom.client.Xml.getCreateElementNS",
		x = "qx.bom.client.EcmaScript.getStackTrace",
		y = "default",
		v = "|",
		w = "true",
		z = "qx.allowUrlSettings";
	qx.Bootstrap.define(bj, {
		statics: {
			_checks: {},
			_asyncChecks: {},
			__c: {},
			_checksMap: {
				"engine.version": ch,
				"engine.name": cu,
				"browser.name": D,
				"browser.version": bY,
				"browser.documentmode": bK,
				"browser.quirksmode": bt,
				"runtime.name": cc,
				"device.name": bz,
				"device.type": bL,
				"locale": t,
				"locale.variant": bb,
				"os.name": U,
				"os.version": cU,
				"os.scrollBarOverlayed": dh,
				"plugin.gears": cw,
				"plugin.activex": bO,
				"plugin.skype": dg,
				"plugin.quicktime": cg,
				"plugin.quicktime.version": cp,
				"plugin.windowsmedia": bD,
				"plugin.windowsmedia.version": r,
				"plugin.divx": bU,
				"plugin.divx.version": di,
				"plugin.silverlight": l,
				"plugin.silverlight.version": da,
				"plugin.flash": cm,
				"plugin.flash.version": f,
				"plugin.flash.express": dc,
				"plugin.flash.strictsecurity": cr,
				"plugin.pdf": F,
				"plugin.pdf.version": dm,
				"io.maxrequests": M,
				"io.ssl": bq,
				"io.xhr": ba,
				"event.touch": cO,
				"event.pointer": S,
				"event.help": bd,
				"event.hashchange": L,
				"ecmascript.stacktrace": x,
				"ecmascript.error.stacktrace": x,
				"ecmascript.array.indexof": bv,
				"ecmascript.array.lastindexof": cA,
				"ecmascript.array.foreach": cy,
				"ecmascript.array.filter": cN,
				"ecmascript.array.map": n,
				"ecmascript.array.some": bp,
				"ecmascript.array.every": cJ,
				"ecmascript.array.reduce": cD,
				"ecmascript.array.reduceright": bM,
				"ecmascript.function.bind": bk,
				"ecmascript.object.keys": bT,
				"ecmascript.date.now": cI,
				"ecmascript.error.toString": dj,
				"ecmascript.string.trim": cK,
				"html.webworker": br,
				"html.filereader": de,
				"html.geolocation": cW,
				"html.audio": A,
				"html.audio.ogg": co,
				"html.audio.mp3": cv,
				"html.audio.wav": I,
				"html.audio.au": Q,
				"html.audio.aif": cC,
				"html.video": bA,
				"html.video.ogg": bx,
				"html.video.h264": b,
				"html.video.webm": g,
				"html.storage.local": cd,
				"html.storage.session": R,
				"html.storage.userdata": cx,
				"html.classlist": X,
				"html.xpath": cV,
				"html.xul": bE,
				"html.canvas": cf,
				"html.svg": bW,
				"html.vml": N,
				"html.dataset": cF,
				"html.dataurl": cn,
				"html.console": cR,
				"html.stylesheet.createstylesheet": s,
				"html.stylesheet.insertrule": cG,
				"html.stylesheet.deleterule": dk,
				"html.stylesheet.addimport": j,
				"html.stylesheet.removeimport": bH,
				"html.element.contains": bP,
				"html.element.compareDocumentPosition": db,
				"html.element.textcontent": bm,
				"html.image.naturaldimensions": cj,
				"html.history.state": bn,
				"json": bs,
				"css.textoverflow": bu,
				"css.placeholder": bf,
				"css.borderradius": T,
				"css.borderimage": dd,
				"css.borderimage.standardsyntax": W,
				"css.boxshadow": bF,
				"css.gradient.linear": Y,
				"css.gradient.filter": bi,
				"css.gradient.radial": p,
				"css.gradient.legacywebkit": d,
				"css.boxmodel": ce,
				"css.rgba": K,
				"css.userselect": o,
				"css.userselect.none": bV,
				"css.usermodify": bG,
				"css.appearance": cS,
				"css.float": bg,
				"css.boxsizing": bc,
				"css.animation": bR,
				"css.animation.requestframe": e,
				"css.transform": bl,
				"css.transform.3d": cB,
				"css.inlineblock": C,
				"css.opacity": P,
				"css.overflowxy": H,
				"css.textShadow": cY,
				"css.textShadow.filter": O,
				"phonegap": cE,
				"phonegap.notification": c,
				"xml.implementation": cQ,
				"xml.domparser": k,
				"xml.selectsinglenode": cH,
				"xml.selectnodes": ci,
				"xml.getelementsbytagnamens": cl,
				"xml.domproperties": bS,
				"xml.attributens": bI,
				"xml.createnode": dl,
				"xml.getqualifieditem": bw,
				"xml.createelementns": a
			},
			get: function (dn) {
				if (qx.Bootstrap.DEBUG) {
					if (dn == J) {
						qx.Bootstrap.warn("The environment key 'css.overflowxy' is deprecated.");
					};
					if (dn == bX) {
						qx.Bootstrap.warn("The environment key 'ecmascript.stacktrace' is now 'ecmascript.error.stacktrace'.");
						dn = B;
					};
				};
				if (this.__c[dn] != undefined) {
					return this.__c[dn];
				};
				var dr = this._checks[dn];
				if (dr) {
					var ds = dr();
					this.__c[dn] = ds;
					return ds;
				};
				var dq = this._getClassNameFromEnvKey(dn);
				if (dq[0] != undefined) {
					var dt = dq[0];
					var dp = dq[1];
					var ds = dt[dp]();
					this.__c[dn] = ds;
					return ds;
				};
				if (qx.Bootstrap.DEBUG) {
					qx.Bootstrap.warn(dn + " is not a valid key. Please see the API-doc of " + "qx.core.Environment for a list of predefined keys.");
					qx.Bootstrap.trace(this);
				};
			},
			_getClassNameFromEnvKey: function (du) {
				var dA = this._checksMap;
				if (dA[du] != undefined) {
					var dw = dA[du];
					var dz = dw.lastIndexOf(bN);
					if (dz > -1) {
						var dy = dw.slice(0, dz);
						var dv = dw.slice(dz + 1);
						var dx = qx.Bootstrap.getByName(dy);
						if (dx != undefined) {
							return [dx, dv];
						};
					};
				};
				return [undefined, undefined];
			},
			getAsync: function (dB, dC, self) {
				var dG = this;
				if (this.__c[dB] != undefined) {
					window.setTimeout(function () {
						dC.call(self, dG.__c[dB]);
					}, 0);
					return;
				};
				var dF = this._asyncChecks[dB];
				if (dF) {
					dF(function (dI) {
						dG.__c[dB] = dI;
						dC.call(self, dI);
					});
					return;
				};
				var dE = this._getClassNameFromEnvKey(dB);
				if (dE[0] != undefined) {
					var dH = dE[0];
					var dD = dE[1];
					dH[dD](function (dJ) {
						dG.__c[dB] = dJ;
						dC.call(self, dJ);
					});
					return;
				};
				if (qx.Bootstrap.DEBUG) {
					qx.Bootstrap.warn(dB + " is not a valid key. Please see the API-doc of " + "qx.core.Environment for a list of predefined keys.");
					qx.Bootstrap.trace(this);
				};
			},
			select: function (dK, dL) {
				return this.__d(this.get(dK), dL);
			},
			selectAsync: function (dM, dN, self) {
				this.getAsync(dM, function (dO) {
					var dP = this.__d(dM, dN);
					dP.call(self, dO);
				}, this);
			},
			__d: function (dQ, dR) {
				var dT = dR[dQ];
				if (dR.hasOwnProperty(dQ)) {
					return dT;
				};
				for (var dS in dR) {
					if (dS.indexOf(v) != -1) {
						var dU = dS.split(v);
						for (var i = 0; i < dU.length; i++) {
							if (dU[i] == dQ) {
								return dR[dS];
							};
						};
					};
				};
				if (dR[y] !== undefined) {
					return dR[y];
				};
				if (qx.Bootstrap.DEBUG) {
					throw new Error('No match for variant "' + dQ + '" (' + (typeof dQ) + ' type)' + ' in variants [' + qx.Bootstrap.keys(dR) + '] found, and no default ("default") given');
				};
			},
			filter: function (dV) {
				var dX = [];
				for (var dW in dV) {
					if (this.get(dW)) {
						dX.push(dV[dW]);
					};
				};
				return dX;
			},
			invalidateCacheKey: function (dY) {
				delete this.__c[dY];
			},
			add: function (ea, eb) {
				if (this._checks[ea] == undefined) {
					if (eb instanceof Function) {
						this._checks[ea] = eb;
					} else {
						this._checks[ea] = this.__g(eb);
					};
				};
			},
			addAsync: function (ec, ed) {
				if (this._checks[ec] == undefined) {
					this._asyncChecks[ec] = ed;
				};
			},
			getChecks: function () {
				return this._checks;
			},
			getAsyncChecks: function () {
				return this._asyncChecks;
			},
			_initDefaultQxValues: function () {
				this.add(w, function () {
					return true;
				});
				this.add(z, function () {
					return false;
				});
				this.add(bJ, function () {
					return false;
				});
				this.add(cM, function () {
					return 0;
				});
				this.add(ct, function () {
					return true;
				});
				this.add(bQ, function () {
					return true;
				});
				this.add(cq, function () {
					return false;
				});
				this.add(E, function () {
					return true;
				});
				this.add(G, function () {
					return false;
				});
				this.add(cT, function () {
					return false;
				});
				this.add(bB, function () {
					return m;
				});
				this.add(cs, function () {
					return true;
				});
				this.add(ca, function () {
					return false;
				});
				this.add(cz, function () {
					return false;
				});
				this.add(cb, function () {
					return false;
				});
				this.add(be, function () {
					return false;
				});
				this.add(cX, function () {
					return false;
				});
				this.add(cP, function () {
					return false;
				});
				this.add(cL, function () {
					return false;
				});
				this.add(h, function () {
					return false;
				});
				this.add(df, function () {
					return true;
				});
				this.add(V, function () {
					return true;
				});
				this.add(q, function () {
					return true;
				});
				this.add(u, function () {
					return true;
				});
				this.add(ck, function () {
					return false;
				});
			},
			__e: function () {
				if (qx && qx.$$environment) {
					for (var ef in qx.$$environment) {
						var ee = qx.$$environment[ef];
						this._checks[ef] = this.__g(ee);
					};
				};
			},
			__f: function () {
				if (window.document && window.document.location) {
					var eg = window.document.location.search.slice(1).split(by);
					for (var i = 0; i < eg.length; i++) {
						var ei = eg[i].split(bC);
						if (ei.length != 3 || ei[0] != bo) {
							continue;
						};
						var ej = ei[1];
						var eh = decodeURIComponent(ei[2]);
						if (eh == w) {
							eh = true;
						} else if (eh == bh) {
							eh = false;
						} else if (/^(\d|\.)+$/.test(eh)) {
							eh = parseFloat(eh);
						};
						this._checks[ej] = this.__g(eh);
					};
				};
			},
			__g: function (ek) {
				return qx.Bootstrap.bind(function (el) {
					return el;
				}, null, ek);
			}
		},
		defer: function (em) {
			em._initDefaultQxValues();
			em.__e();
			if (em.get(z) === true) {
				em.__f();
			};
		}
	});
})();
(function () {
	var u = "ecmascript.array.lastindexof",
		t = "ecmascript.array.map",
		s = "ecmascript.date.now",
		r = "ecmascript.array.reduce",
		q = "qx.bom.client.EcmaScript",
		p = "ecmascript.object.keys",
		o = "ecmascript.error.stacktrace",
		n = "ecmascript.string.trim",
		m = "ecmascript.array.indexof",
		l = "ecmascript.error.toString",
		d = "[object Error]",
		k = "ecmascript.array.foreach",
		h = "ecmascript.function.bind",
		c = "ecmascript.array.reduceright",
		b = "ecmascript.array.some",
		g = "ecmascript.array.filter",
		f = "ecmascript.array.every",
		i = "stack",
		a = "stacktrace",
		j = "function";
	qx.Bootstrap.define(q, {
		statics: {
			getStackTrace: function () {
				var v;
				var e = new Error("e");
				v = e.stack ? i : e.stacktrace ? a : null;
				if (!v) {
					try {
						throw e;
					} catch (w) {
						e = w;
					};
				};
				return e.stacktrace ? a : e.stack ? i : null;
			},
			getArrayIndexOf: function () {
				return !!Array.prototype.indexOf;
			},
			getArrayLastIndexOf: function () {
				return !!Array.prototype.lastIndexOf;
			},
			getArrayForEach: function () {
				return !!Array.prototype.forEach;
			},
			getArrayFilter: function () {
				return !!Array.prototype.filter;
			},
			getArrayMap: function () {
				return !!Array.prototype.map;
			},
			getArraySome: function () {
				return !!Array.prototype.some;
			},
			getArrayEvery: function () {
				return !!Array.prototype.every;
			},
			getArrayReduce: function () {
				return !!Array.prototype.reduce;
			},
			getArrayReduceRight: function () {
				return !!Array.prototype.reduceRight;
			},
			getErrorToString: function () {
				return typeof Error.prototype.toString == j && Error.prototype.toString() !== d;
			},
			getFunctionBind: function () {
				return typeof Function.prototype.bind === j;
			},
			getObjectKeys: function () {
				return !!Object.keys;
			},
			getDateNow: function () {
				return !!Date.now;
			},
			getStringTrim: function () {
				return typeof String.prototype.trim === j;
			}
		},
		defer: function (x) {
			qx.core.Environment.add(m, x.getArrayIndexOf);
			qx.core.Environment.add(u, x.getArrayLastIndexOf);
			qx.core.Environment.add(k, x.getArrayForEach);
			qx.core.Environment.add(g, x.getArrayFilter);
			qx.core.Environment.add(t, x.getArrayMap);
			qx.core.Environment.add(b, x.getArraySome);
			qx.core.Environment.add(f, x.getArrayEvery);
			qx.core.Environment.add(r, x.getArrayReduce);
			qx.core.Environment.add(c, x.getArrayReduceRight);
			qx.core.Environment.add(s, x.getDateNow);
			qx.core.Environment.add(l, x.getErrorToString);
			qx.core.Environment.add(o, x.getStackTrace);
			qx.core.Environment.add(h, x.getFunctionBind);
			qx.core.Environment.add(p, x.getObjectKeys);
			qx.core.Environment.add(n, x.getStringTrim);
		}
	});
})();