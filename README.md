# circleChart

##a nice and easy to use jQuery plugin for drawing circular charts
(full german documentation on [my website](http://bolli.tech/docs.php?p=circleChart))

##default settings
```javascript
color: "#3459eb",
backgroundColor: "#e6e6e6",
background: true,
speed: 2000,
widthRatio: 0.2,
value: 66,
unit: 'percent',
counterclockwise: false,
size: 110,
startAngle: 0,
animate: true,
backgroundFix: true,
lineCap: "round",
animation: "easeInOutCubic",
text: 0 + '%',
redraw: false,
cAngle: 0,
textCenter: true,
textSize: false,
relativeTextSize: 1 / 7,
autoCss: true,
onDraw: function(el, circle) {
    $(".circleChart_text", el).html(Math.round(circle.value) + "%");
}
```

##examples
```javascript
$(".circleChart").circleChart({
      value: 68,
      startAngle: 180,
      speed: 3000,
      animation: "easeInOutCubic"
   });
```

```javascript
setInterval(function() {
   $(".circleChart").circleChart({
      value: Math.random()*100
   });
}, 4000);
```
