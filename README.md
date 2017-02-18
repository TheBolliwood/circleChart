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
deg: 240,
rad: false,
counterclockwise: false,
size: 110,
startAngle: 0,
animate: true,
timeLog: false,
backgroundFix: true,
lineCap: "round",
animation: "easeInOutCubic",
text: false,
redraw: false,
cAngle: 0.1,
textCenter: false,
onDraw: function(){}
```

##examples
```javascript
$(".circleChart").circleChart({
      deg: 245,
      startAngle: 180
   });
```

```javascript
setInterval(function() {
   $(".circleChart").circleChart({
      deg: Math.random()*360
   });
}, 4000);
```

```javascript
setInterval(function() {
   $(".circleChart").circleChart({
      deg: Math.random()*360,
      redraw: false,
      text: 0,
      startAngle: 180,
      textCenter: true,
      onDraw: function(el, circle){
                      var angle;
                      if( circle.settings.counterclockwise ) {
                         angle = 360-(circle.cAngle*180/Math.PI); //rad to deg
                      } else {
                         angle = circle.cAngle*180/Math.PI; //rad to deg
                      }
                      $(".circleChart_text", el).html(Math.round(angle));
                   }
   });
}, 4000);
```
