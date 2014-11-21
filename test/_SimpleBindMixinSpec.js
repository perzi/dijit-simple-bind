define([
    'dojo/_base/declare',
    'dojo/on',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dijit-simple-bind/_SimpleBindMixin'
], function(
    declare,
    on,
    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    _SimpleBindMixin
) {

    describe("Bindable Attributes", function() {

        var cls;
        var CLS = declare([_WidgetBase, _TemplatedMixin, _SimpleBindMixin], {
            A: "X",
            B: "Y"
        });

        afterEach(function() {
            cls.destroy();
        });

        it("Should replace bindable attribute with property value at on creation", function() {
            cls = new CLS({ templateString: '<div class="{{A}}"></div>' });
            expect(cls.domNode.className).toBe('X');
        });

        it("Should update bindable attribute when property value is set", function() {
            cls = new CLS({ templateString: '<div class="{{A}}"></div>' });
            cls.set("A", "Z");
            expect(cls.domNode.className).toBe('Z');
        });

        it("Should update multiple bindable attributes when properties are set", function() {
            cls = new CLS({ templateString: '<div class="{{A}} {{B}}"></div>' });
            cls.set("A", "Z");
            cls.set("B", "W");
            expect(cls.domNode.className).toBe('Z W');
        });

        it("Should update multiple bindable attributes in nested node when properties are set", function() {
            cls = new CLS({ templateString: '<div><div class="{{A}} {{B}}"></div></div>' });
            cls.set("A", "Z");
            cls.set("B", "W");
            expect(cls.domNode.childNodes[0].className).toBe('Z W');
        });


        it("Should keep static values in bindable attributes when property value is set", function() {
            cls = new CLS({ templateString: '<div class="q{{A}}w"></div>' });
            cls.set("A", "Z");
            expect(cls.domNode.className).toBe('qZw');
        });
    });

    describe("Properties in text", function() {

        var cls;
        var CLS = declare([_WidgetBase, _TemplatedMixin, _SimpleBindMixin], {
            A: "X",
            B: "Y"
        });

        afterEach(function() {
            cls.destroy();
        });

        it("Should replace bindable text with property value at on creation", function() {
            cls = new CLS({ templateString: '<div>{{A}}</div>' });
            expect(cls.domNode.innerHTML).toBe('X');
        });

        it("Should replace bindable text with property value at on creation", function() {
            cls = new CLS({ templateString: '<div>{{A}}</div>' });
            cls.set("A", "Z");
            expect(cls.domNode.innerHTML).toBe('Z');
        });

        it("Should not create empty text nodes", function() {
            cls = new CLS({ templateString: '<div>{{A}}</div>' });
            expect(cls.domNode.childNodes.length).toBe(1);
        });

        it("Should handle multiple properties in text", function() {
            cls = new CLS({ templateString: '<div>{{A}} {{B}}</div>' });
            expect(cls.domNode.innerHTML).toBe("X Y");
            expect(cls.domNode.childNodes.length).toBe(3);
        });

        it("Should handle property replacement around dom nodes", function() {
            cls = new CLS({ templateString: '<div>{{A}}<h1>Title</h1>{{A}}</div>' });
            expect(cls.domNode.childNodes.length).toBe(3);
            expect(cls.domNode.childNodes[1].innerHTML).toBe("Title");
        });

        it("Should handle property replacement around dom nodes when setting property", function() {
            cls = new CLS({ templateString: '<div>{{A}}<h1>Title</h1>{{A}}</div>' });
            cls.set("A", "Q");
            expect(cls.domNode.childNodes.length).toBe(3);
            expect(cls.domNode.childNodes[0].nodeValue).toBe("Q");
            expect(cls.domNode.childNodes[1].innerHTML).toBe("Title");
            expect(cls.domNode.childNodes[2].nodeValue).toBe("Q");
        });

        it("Should handle property nested in nodes", function() {
            cls = new CLS({ templateString: '<div><h1>{{A}}</h1>{{A}}</div>' });
            cls.set("A", "Q");
            expect(cls.domNode.childNodes[0].innerHTML).toBe("Q");
            expect(cls.domNode.childNodes[1].nodeValue).toBe("Q");
        });

        it("Should escape content", function() {
            cls = new CLS({ templateString: '<div>{{A}}</div>' });
            cls.set("A", "<b>A</b>");
            expect(cls.domNode.innerHTML).toBe("&lt;b&gt;A&lt;/b&gt;");
        });

        it("Should not escape content when using {{!propertyName}}", function() {
            cls = new CLS({ templateString: '<div>{{!A}}</div>' });
            cls.set("A", "<b>A</b>");
            expect(cls.domNode.innerHTML).toBe("<b>A</b>");
        });

        it("Should not escape content when using {{!propertyName}} and have mixed content", function() {
            cls = new CLS({ templateString: '<div>{{!A}}</div>' });
            cls.set("A", "<b>A</b>B");
            expect(cls.domNode.innerHTML).toBe("<b>A</b>B");
        });

        it("Should not escape content when using {{!propertyName}} and have multiple content", function() {
            cls = new CLS({ templateString: '<div>{{!A}}</div>' });

            var s = "1<b>A</b>2<i>B</i>3";

            cls.set("A", s);
            expect(cls.domNode.innerHTML).toBe(s);
        });

        it("Should not escape content when using {{!propertyName}} and have multiple content 2", function() {
            cls = new CLS({ templateString: '<div>{{!A}} {{!A}}</div>' });

            var s = "<b>X</b>2";

            cls.set("A", s);
            expect(cls.domNode.innerHTML).toBe(s + " " + s);
        });
    });

    describe("Widgets in template", function() {

        var Contained = declare("Contained", [_WidgetBase, _TemplatedMixin, _SimpleBindMixin], {
            templateString: '<div><div class="{{B}}" data-dojo-attach-point="titleNode">{{A}}</div><div data-dojo-attach-point="containerNode"></div></div>',
            A: "1",
            B: "2"
        });
        var Main = declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _SimpleBindMixin], {
            templateString: '<div><div data-dojo-attach-point="child" data-dojo-type="Contained">{{A}}</div></div>',
            A: "3",
            B: "4"
        });
        var main;

        beforeEach(function() {
            main = new Main();
        });

        afterEach(function() {
            main.destroy();
        });

        it("Bindable properties in template should be bound to parents properties", function() {
            expect(main.child.containerNode.innerHTML).toBe('3');
            expect(main.child.titleNode.innerHTML).toBe('1');
        });

        it("Bindable attributes in child template should be handled by child widget", function() {
            expect(main.child.titleNode.className).toBe('2');
        });

    });

    describe("Widgets with properties", function() {

        var Contained = declare("Contained2", [_WidgetBase, _TemplatedMixin, _SimpleBindMixin], {
            templateString: '<div>{{title}}</div>',
            title: "A"
        });

        // data-dojo-props="title: {{A}}"
        var Main = declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _SimpleBindMixin], {
            templateString: '<div><div data-dojo-attach-point="child" data-dojo-type="Contained2"></div></div>',

            _setTitleAttr: function(title) {
                this._set("title", title);
                this.child.set("title", title);
            }
        });
        var main;

        beforeEach(function() {
            main = new Main();
        });

        afterEach(function() {
            main.destroy();
        });

        it("Child widget should handle it's property", function() {
            main.child.set("title", "X");
            expect(main.child.domNode.innerHTML).toBe('X');
        });

        it("Main widget should be able to set child widget's property", function() {
            main.set("title", "X");
            expect(main.child.domNode.innerHTML).toBe('X');
        });

    });


    describe("Input text element", function() {

        // data-dojo-props="title: {{A}}"
        var Main = declare([_WidgetBase, _TemplatedMixin, _SimpleBindMixin], {
            templateString: '<div><input type="text" value="{{text}}"></div>',

            text: "-"
        });
        var main;

        beforeEach(function() {
            main = new Main();
        });

        afterEach(function() {
            main.destroy();
        });

        it("Input fields should trigger property change on widget when value changes", function() {
            main.domNode.childNodes[0].value = "x";
            expect(main.text === "x");
        });

        it("Input fields should update value when property changes", function() {
            main.set("text", "z");
            expect(main.domNode.childNodes[0].value === "z");
        });

    });

    describe("Textarea element", function() {

        // data-dojo-props="title: {{A}}"
        var Main = declare([_WidgetBase, _TemplatedMixin, _SimpleBindMixin], {
            templateString: '<div><textarea value="{{text}}"></textarea></div>',

            text: "-"
        });
        var main;

        beforeEach(function() {
            main = new Main();
        });

        afterEach(function() {
            main.destroy();
        });

        it("Textarea should trigger property change on widget when value changes", function() {
            main.domNode.childNodes[0].value = "x";
            expect(main.text === "x");
        });

        it("Textarea should update value when property changes", function() {
            main.set("text", "z");
            expect(main.domNode.childNodes[0].value === "z");
        });
    });


    describe("Select element", function() {

        // data-dojo-props="title: {{A}}"
        var Main = declare([_WidgetBase, _TemplatedMixin, _SimpleBindMixin], {
            templateString: '<div><select value="{{value}}"><option value="a">A</option><option value="b">B</option></select></div>',

            value: "-"
        });
        var main;

        beforeEach(function() {
            main = new Main();
        });

        afterEach(function() {
            main.destroy();
        });

        it("Select should trigger property change on widget when value changes", function() {
            main.domNode.childNodes[0].value = "b";
            expect(main.value === "b");
        });

        it("Select fields should update value when property changes", function() {
            main.set("value", "a");
            expect(main.domNode.childNodes[0].value === "a");
        });

        it("Select fields should update value when selectedIndex changes", function() {
            main.domNode.childNodes[0].selectedIndex = 1;
            expect(main.value === "b");
        });

    });


    describe("Disabled attribute", function() {

        // data-dojo-props="title: {{A}}"
        var Main = declare([_WidgetBase, _TemplatedMixin, _SimpleBindMixin], {
            templateString: '<div><button data-dojo-attach-point="btn" disabled="{{btnDisabled}}"></button></div>',

            btnDisabled: false
        });
        var main;

        beforeEach(function() {
            main = new Main();
        });

        afterEach(function() {
            main.destroy();
        });

        it("Disabled set to false", function() {
            var clicked = false;
            main.own(on(main.btn, "click", function() {
                clicked = true;
            }));
            main.btn.click();
            expect(clicked).toBe(true);
        });

        it("Disabled set to true", function() {
            var clicked = false;
            main.own(on(main.btn, "click", function() {
                clicked = true;
            }));
            main.set("btnDisabled", true);
            main.btn.click();
            expect(clicked).toBe(false);
        });
    });



});
