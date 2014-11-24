define([
    'dijit-simple-bind/bind',
    'dojo/Stateful'
], function(
    bind,
    Stateful
) {

    describe("bind", function() {

        var a,b,handles;

        beforeEach(function() {
            a = new Stateful();
            b = new Stateful();
        });

        afterEach(function() {
            if (handles) {
                handles.forEach(function(handle) { handle.remove(); });
            }
        });

        it("bind should return handle", function() {
            var handle = bind(a, b, ["x"]);
            handles = [handle];
            expect(typeof handle).toBe("object");
            expect(typeof handle.remove).toBe("function");
        });

        it("set property on source should update target", function() {
            handles = [bind(a, b, ["x"])];
            a.set("x", 1);
            expect(a.x).toBe(1);
            expect(b.x).toBe(1);
        });

        it("should set property on target should update source", function() {
            handles = [bind(a, b, ["x"])];
            b.set("x", 1);
            expect(a.x).toBe(1);
            expect(b.x).toBe(1);
        });

        it("should do a two way update of property", function() {
            handles = [bind(a, b, ["x"])];
            a.set("x", 1);
            b.set("x", 2);
            expect(a.x).toBe(2);
            expect(b.x).toBe(2);
        });


        it("should remove sync when removing the handle", function() {
            var handle = bind(a, b, ["x"]);
            handles = [handle];
            a.set("x", 1);
            handle.remove();
            b.set("x", 2);
            expect(a.x).toBe(1);
            expect(b.x).toBe(2);
        });

        it("should handle different property names", function() {
            handles = [bind(a, b, { "x": "y" })];
            a.set("x", 1);
            expect(b.y).toBe(1);
            b.set("y", 2);
            expect(a.x).toBe(2);
        });

        it("should handle multiple different property names", function() {
            handles = [bind(a, b, {
                "x": "y",
                "q": "w"
            })];
            a.set("x", 1);
            expect(b.y).toBe(1);
            b.set("y", 2);
            expect(a.x).toBe(2);
            a.set("q", 3);
            expect(b.w).toBe(3);
            b.set("w", 4);
            expect(a.q).toBe(4);
        });

        it("should handle one way syncing", function() {
            handles = [bind(a, b, ["x"], true)];
            a.set("x", 1);
            expect(b.x).toBe(1);
            b.set("x", 2);
            expect(a.x).toBe(1);
        });

    });

});
