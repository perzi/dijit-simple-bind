dijit-simple-bind
=================

Add two way binding to observables.

```javascript
// bind with properties that are not the same
var object1 = new Stateful({ a: 1, b, 2 });
var object2 = new Stateful({ x: 0, y: 0 });

bind(object1, object2, {
    "a": "x", // a in object1 is mapped to x in object2
    "b": "y"  // b in object1 is mapped to y in object2
});

console.log(object2.x); // => 0

// change object1 property
object1.set("a", 3)
// object2 property has changed
console.log(object2.x); //=> 3

// change object2 property
object2.set("y", 4)
// object1 property has changed
console.log(object1.b); // => 4


// Use _SimpleBindMixin for widgets
var MyWidget = declare([_WidgetBase, _TemplatedWidget, _SimpleBindMixin], {
    templateString: "<div><span class="staticClass {{className}}">{{text}}</span></div>",
    className: "defaultClass",
    text: ""
});

var w = new MyWidget();

// Change span content to be "Lorem ipsum"
w.set("text", "Lorem Ipsum");

// Change span class to be "staticClass anotherClass"
// "staticClass" will always be present before content of className
w.set("className", "anotherClass");

```
