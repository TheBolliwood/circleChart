# circleChart

## a nice and easy to use jQuery plugin for drawing circular charts
(full documentation on my website ([english](https://bolli.tech/circleChart)) ([german](https://bolli.tech/circleChart/de.html)))

## default settings
```javascript
color: "#3459eb",
backgroundColor: "#e6e6e6",
background: true,
speed: 2000,
widthRatio: 0.2,
value: 66,
unit: "percent",
counterclockwise: false,
size: 110,
startAngle: 0,
animate: true,
backgroundFix: true,
lineCap: "round",
animation: "easeInOutCubic",
text: false,
redraw: false,
cAngle: 0,
textCenter: true,
textSize: false,
textWeight: "normal",
textFamily: "sans-serif",
relativeTextSize: 1 / 7,
autoCss: true,
onDraw: false
```

## examples
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
