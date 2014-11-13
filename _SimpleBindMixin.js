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
			// even if the nodes are child widgets
			// TODO: only scan child widgets' container nodes. exclude child
			// widgets' domNode
			var nodes = query(this.domNode).concat(query("*", this.domNode));

			// fix attributes updaters
			nodes.forEach(function(node, index) {
				this._findBindableAttributes(node);
			}, this);

			// fix text updaters
			nodes.forEach(function(node, index) {
				this._findBindableTextNodes(node);
			}, this);
		},

		_findBindableTextNodes: function(root) {
			// summary:
			//		Check for text nodes that have a dynamic property

			var i;
			var node;
			var TEXT = 3;

			for (i = 0; i < root.childNodes.length; i++) {
				node = root.childNodes[i];

				if (node.nodeType === TEXT) {
					this._checkTextNode(node, i);
				}
			}
		},

		_checkTextNode: function(node, baseIndex) {

			var reg = this._bindNamespacedPropertyRegex;
			var root = node.parentNode;
			var text = node.nodeValue;
			var matches = text.split(reg);
			var createdIndex = 0;

			// exit if we have no match
			if (!matches || matches.length === 0) {
				return;
			}

			array.forEach(matches, function(match, index) {

				var newNode;

				if (index % 2 === 0) {
					// static node
					// don't create empty text nodes
					if (match.length > 0) {
						newNode = document.createTextNode(match);
						root.insertBefore(newNode, node);
						createdIndex++;
					}
				} else {
					// bindable node
					newNode = document.createTextNode(this.get(match));
					this._createTextNodeUpdater(root, match, (baseIndex + createdIndex));
					root.insertBefore(newNode, node);
					createdIndex++;
				}
			}, this);

			// delete node
			root.removeChild(node);
		},

		_createTextNodeUpdater: function(parent, propertyName, index) {

			var updater = lang.hitch(this, function(p, o, n) {

				var node = parent.childNodes[index];
				var newNode = document.createTextNode(this.get(propertyName));

				parent.insertBefore(newNode, node);

				// delete node
				parent.removeChild(node);
			});

			this.own(this.watch(propertyName, updater));
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
