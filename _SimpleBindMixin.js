define([
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/dom-attr",
	"dojo/dom-construct",
	"dojo/string",
	"dojo/query",
	"dijit/registry",
	"dijit/_WidgetsInTemplateMixin",
	"dojo/NodeList-traverse"
], function(
	array,
	declare,
	lang,
	domAttr,
	domConstruct,
	string,
	query,
	registry,
	_WidgetsInTemplateMixin
) {
	// variable to use for namespacing properties before buildRendering
	var idCounter = 0;

	return declare(null, {

		// _simpleBindPropertyRegex: [private] RegEx
		//		Regular expression to match bindable properties
		_simpleBindPropertyRegex: /\{\{([^\}]+)\}\}/g,

		postMixInProperties: function() {
			this.inherited(arguments);

			if (this.isInstanceOf(_WidgetsInTemplateMixin)) {
				// increase id counter
				idCounter++;

				// convert names in template to namespaced names
				// {{property}} -> {{<idCounter>:property}}
				var nameSpacedDynamicProperty = string.substitute("{{${0}:$1}}", [idCounter]);
				var namespacedTemplateString = this.templateString.replace(this._simpleBindPropertyRegex, nameSpacedDynamicProperty);

				// update templateString
				this.templateString = namespacedTemplateString;

				// set regex to include the idCounter when finding created nodes
				this._simpleBindPropertyRegex = new RegExp("\\{\\{" + idCounter + ":([^\\}]+)\\}\\}", "g");
			}
		},

		buildRendering: function() {
			this.inherited(arguments);

			// check for attributes
			this._simpleBindAttributes(this.domNode);
			this._simpleBindProperties(this.domNode);
		},

		_simpleBindProperties: function(root) {

			var TEXT = 3;
			var node;
			var isMyContainerNode;
			var widget;

			for (var i = 0, l = root.childNodes.length; i < l; i++) {
				node = root.childNodes[i];

				if (node.nodeType === TEXT) {
					// find properties it text
					this._simpleBindTextNode(node);

				} else {
					isMyContainerNode = (this.containerNode === node);

 					if (!isMyContainerNode) {
						// check for both attributes
						this._simpleBindAttributes(node);
						this._simpleBindProperties(node);

					} else if (isMyContainerNode) {
						// check attributes in my containernode
						this._simpleBindAttributes(node);

					} else if (domAttr.has(node, "widgetid")) {
						// it's a child widget
						widget = registry.byNode(node);

						// only continue if the node has a containerNode
						if (widget.containerNode) {
							this._simpleBindProperties(node);
						}
					}
				}
			}
		},

		_simpleBindTextNode: function(node) {

			var reg = this._simpleBindPropertyRegex;
			var root = node.parentNode;
			var text = node.nodeValue;
			var matches = text.split(reg);

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
					}
				} else {
					// bindable node
					this._createTextNodeUpdater(root, match, node);
				}
			}, this);

			// delete node when all others have been created
			root.removeChild(node);
		},

		_createTextNodeUpdater: function(parent, propertyDirective, initalNode)  {

			var ref = initalNode;
			var propertyName = propertyDirective;
			var htmlEscape = true;

			// html in value
			if (propertyName[0] === "!") {
				propertyName = propertyName.substr(1);
				htmlEscape = false;
				ref = [initalNode];
			}

			// TODO: handle property value that includes html content
			// see: https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment
			// how to use properties for the document fragment
			// This updater does not handle creating document fragments
			// it inserts "<b>A</b" as text and there won't be any bold element
			// it should be {{!A}} in text?
			// TODO: handle formatters for the text and escaping
			var update = lang.hitch(this, function(p, o, n) {

				var newContent;

				if (htmlEscape) {
					newContent = document.createTextNode(this.get(propertyName));

					parent.insertBefore(newContent, ref);

					// delete ref if it's not the initial node
					if (ref !== initalNode) {
						parent.removeChild(ref);
					}

					ref = newContent;
				} else {

					// Don't escape content
					var newRef = [];
					newContent = domConstruct.toDom(this.get(propertyName));

					// copy references
					if (newContent.childElementCount > 0) {
						for (var i = 0; i < newContent.childElementCount; i++) {
							newRef.push(newContent.children[i]);
						}
					} else {
						newRef = [newContent];
					}

					// insert before first item in ref
					parent.insertBefore(newContent, ref[0]);

					// remove previous content
					if (ref[0] !== initalNode) {
						array.forEach(ref, function(node) {
							parent.removeChild(node);
						});
					}

					ref = newRef;
				}
			});

			this.own(this.watch(propertyName, update));
			update();
		},

		_simpleBindAttributes: function(node) {
			var i;
			var attr;
			var name;
			var value;
			var format;
			var names;
			var values;
			var matches;
			var keepEven = function(o, index) {
				return index % 2 === 1;
			};

			for (i = 0; i < node.attributes.length; i++) {

				attr = node.attributes[i];
				value = attr.value;
				matches = value.split(this._simpleBindPropertyRegex);

				// exit if no properties are found
				if (matches && matches.length < 3) {
					break;
				}

				name = attr.name;
				format = value.replace(this._simpleBindPropertyRegex, "${$1}");

				// the names are the
				names = array.filter(matches, keepEven);

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
