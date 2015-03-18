define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/dom-attr",
	"dojo/dom-construct",
	"dojo/on",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dijit-simple-bind/_SimpleBindMixin",
	"./ChildWidget"
], function(
	declare,
	lang,
	domAttr,
	domContruct,
	on,
	_WidgetBase,
	_TemplatedMixin,
	_WidgetsInTemplateMixin,
	_SimpleBindMixin,
	ChildWidget
) {

	return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _SimpleBindMixin], {

		templateString: '<div class="container"> \
			<h1>{{heading}}</h1> \
			<div data-dojo-attach-point="myChild" data-dojo-type="demo/ChildWidget"></div> \
		</div>',

		heading: "",
		childHeading: "",

		postCreate: function() {
			this.inherited(arguments);

			this.own(
				this.bind(this.myChild, {
					"childHeading": "heading"
				})
			);
		}

	});
});
