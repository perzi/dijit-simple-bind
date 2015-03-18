define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/dom-attr",
	"dojo/dom-construct",
	"dojo/on",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dijit-simple-bind/_SimpleBindMixin"
], function(
	declare,
	lang,
	domAttr,
	domContruct,
	on,
	_WidgetBase,
	_TemplatedMixin,
	_WidgetsInTemplateMixin,
	_SimpleBindMixin
) {

	return declare([_WidgetBase, _TemplatedMixin, _SimpleBindMixin], {

		templateString: '<div class="child"> \
			<h2>{{heading}}</h2> \
		</div>',

		heading: ""
	});
});
