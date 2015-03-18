define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/dom-attr",
	"dojo/dom-construct",
	"dojo/on",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit-simple-bind/_SimpleBindMixin"
], function(
	declare,
	lang,
	domAttr,
	domContruct,
	on,
	_WidgetBase,
	_TemplatedMixin,
	_SimpleBindMixin
) {

	return declare([_WidgetBase, _TemplatedMixin, _SimpleBindMixin], {

		templateString: '<div class="simple-template"> \
			<div class="defaultClass {{classA}} {{classB}}">{{text}}</div> \
			<div>Counter is now: {{counter}}!</div> \
			<input type="text" value="{{text}}"> \
			<!-- old style -->\
			<div data-dojo-attach-point="myOldStyleAttachPoint"></div> \
		</div>',

		classA: "",
		classB: "",
		text: "",
		counter: 0,
		oldStyle: "",

		_setOldStyleAttr: {
			node: "myOldStyleAttachPoint",
			type: "innerHTML"
		}

	});
});
