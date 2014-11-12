define([
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/dom-attr",
	"dojo/string",
	"dojo/query"
], function(
	array,
	declare,
	lang,
	domAttr,
	string,
	query
) {
	// variable to use for namespacing properties before buildRendering
	var _bindiId = 0;

	return declare(null, {

		// bindPropertyRegex: RegEx
		//		Regular expression to match bindable properties in template
		bindPropertyRegex: /\{\{\s*([^\}\s]+)\s*\}\}/g,

		// _bindNamespacedPropertyRegex: [private] RegEx
		//		Regular expression to match bindable properties after
		//		namespacing has been done
		_bindNamespacedPropertyRegex: /\{\{[^:\}]+:([^\}]+)\}\}/g,

		postMixInProperties: function() {
			this.inherited(arguments);

			// increase id counter
			_bindiId++;

			// convert names to namespaced names
			// {{property}} -> {{<_bindiId>:property}}
			var nameSpacedDynamicProperty = string.substitute("{{${0}:$1}}", [_bindiId]);
			var namespacedTemplateString = this.templateString.replace(this.bindPropertyRegex, nameSpacedDynamicProperty);

			// update templateString
			this.templateString = namespacedTemplateString;
		},

		buildRendering: function() {
			this.inherited(arguments);

			this._findPropertiesInNodes();
		},

		_findPropertiesInNodes: function() {
			// first approach: get all child nodes and this.domNode
			var nodes = query(this.domNode).concat(query("*", this.domNode));

			// fix attributes updaters
			nodes.forEach(function(node, index) {
				this._findBindableAttributes(node);
			}, this);
		},

		_findBindableAttributes: function(node) {
			var i;
			var attr;
			var name;
			var value;
			var format;
			var names;
			var values;

			for (i = 0; i < node.attributes.length; i++) {

				attr = node.attributes[i];
				name = attr.name;
				value = attr.value;

				format = value.replace(this._bindNamespacedPropertyRegex, "${$1}");
				names = array.filter(value.split(this._bindNamespacedPropertyRegex), function(o, index) {
					return index % 2 === 1;
				});

				// TODO: check for special attributes as "style" which can have sub keys/values
				// TODO: maybe do special code when attribute="{{propertyName}}"
				this._createAttributeUpdater(node, name, names, format);
			}
		},

		_createAttributeUpdater: function(node, attributeName, names, format) {

			var created = {};
			var uniqueNames = array.filter(names, function(propertyName) {
				if (propertyName in created) {
					return false;
				}
				created[propertyName] = true;
				return true;
			});

			var setAttribute = lang.hitch(this, function() {
				var data = {};

				array.forEach(uniqueNames, function(name) {
					data[name] = this.get(name);
				}, this);

				var newValue = string.substitute(format, data);

				domAttr.set(node, attributeName, newValue);
			});

			array.forEach(uniqueNames, function(propertyName, index) {
				this.own(this.watch(propertyName, setAttribute));
			}, this);

			setAttribute();
		}
	});
});
