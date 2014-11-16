define([
    'dojo/_base/declare',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dijit-simple-bind/_SimpleBindMixin'
], function(
    declare,
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

        it("Should keep static values in bindable attributes when property value is set", function() {
            cls = new CLS({ templateString: '<div class="q{{A}}w"></div>' });
            cls.set("A", "Z");
            expect(cls.domNode.className).toBe('qZw');
        });
    });

    describe("Bindable Text", function() {

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

        it("Should handle property replacement around dom nodes", function() {
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

        it("Bindable properties in template should be part of the parents properties", function() {
            expect(main.child.containerNode.innerHTML).toBe('3');
            expect(main.child.titleNode.innerHTML).toBe('1');
        });

        it("Bindable attributes in child template should be handled by child widget", function() {
            expect(main.child.titleNode.className).toBe('2');
        });

    });

});
