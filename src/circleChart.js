(function($) {
    $.fn.circleChart = function(options) {
      var defaults = $.extend({
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
                      }, options);

        return this.each(function() {
                var settings = $.extend({}, defaults, $(this).data());
                //console.log($(this).data());
                if (!$("canvas.circleChart_canvas",this).length) {
                  $(this).append(function() {
                    return $('<canvas/>', {
                            'class': 'circleChart_canvas'
                          }).prop({
                            width: settings.size,
                            height: settings.size
                      }).css({"margin-left": "auto","margin-right": "auto","display": "block"});
                  });
                }
                if (!$("p.circleChart_text",this).length) {
                  if (settings.text!==false) {
                    $(this).append("<p class='circleChart_text'>"+settings.text+"</p>");
                    if(settings.textCenter){
                      $("p.circleChart_text",this).css({"position":"absolute","line-height":(settings.size+"px"),"top":0,"width":"100%","margin":0,"padding":0,"text-align":"center", "font-size":settings.size/10, "font-weight":"bold", "font-family":"sans-serif"});
                    } else {
                      $("p.circleChart_text",this).css({"padding-top":"5px","text-align":"center"});
                    }
                  }
                }
                if (!settings.redraw) {
                  settings.cAngle = settings.currentCAngle?settings.currentCAngle:settings.cAngle;
                  settings.startAngle = settings.currentStartAngle?settings.currentStartAngle:settings.startAngle;
                }

                $(this).css("position", "relative");
                var c = $("canvas",this).get(0);
                var ctx = c.getContext("2d");
                var bAngle;
                var eAngle;
                var cAngle;
                if (!settings.rad) {
                    bAngle = dToR(settings.startAngle);
                    eAngle = dToR(settings.deg);
                    cAngle = dToR(settings.cAngle);
                    if (cAngle>eAngle) {
                      cAngle = Math.abs(2*Math.PI-cAngle);
                      eAngle = Math.abs(2*Math.PI-eAngle);
                      bAngle = Math.abs(2*Math.PI-bAngle);
                      settings.counterclockwise = true;
                    }
                } else {
                    bAngle = settings.startAngle;
                    cAngle = settings.cAngle;
                    if (settings.counterclockwise) {
                      cAngle = 2*Math.PI - cAngle;
                    }
                    eAngle = settings.deg;
                }
                var pos = c.width / 2;
                var radius = pos * (1 - settings.widthRatio / 2);
                var lineWidth = radius * settings.widthRatio;
                var circle = new Circle(pos, bAngle, eAngle, cAngle, radius, lineWidth, cAngle, settings);
                $(c).parent().data("size", settings.size);
                if (!settings.animate) {
                    circle.cAngle = circle.eAngle;
                    requestAnimFrame(function() {
                    if (settings.background) {
                        drawBackground(circle, ctx);
                    }
                    if(settings.deg!==0){
                      drawCircle(circle, ctx);
                      circle.settings.onDraw($(c).parent(), circle);
                    } else {
                      ctx.clearRect(0, 0, c.width, c.height);
                      if (circle.settings.background) {
                          drawBackground(circle, ctx);
                      }
                    }
                  });
                } else {
                    if (settings.deg!==0) {
                      animate(circle, c, ctx, new Date().getTime(), new Date().getTime());
                    } else {
                      requestAnimFrame(function() {
                      ctx.clearRect(0, 0, c.width, c.height);
                      if (circle.settings.background) {
                          drawBackground(circle, ctx);
                      }
                    });
                    }
                }
            });
    };

    function drawBackground(circle, ctx) {
        ctx.beginPath();
        ctx.arc(circle.pos, circle.pos, circle.settings.backgroundFix ? circle.radius * 0.9999 : circle.radius, 0, 2 * Math.PI);
        ctx.lineWidth = circle.settings.backgroundFix ? circle.lineWidth * 0.95 : circle.lineWidth;
        ctx.strokeStyle = circle.settings.backgroundColor;
        ctx.stroke();
    }

    function drawCircle(circle, ctx) {
        ctx.beginPath();
        if (circle.settings.counterclockwise) {
          k = 2*Math.PI;
          ctx.arc(circle.pos, circle.pos, circle.radius, k-(circle.bAngle+circle.cAngle), k-circle.bAngle, circle.settings.counterclockwise);
        } else {
          ctx.arc(circle.pos, circle.pos, circle.radius, circle.bAngle, circle.bAngle+circle.cAngle, circle.settings.counterclockwise);
        }
        ctx.lineWidth = circle.lineWidth;
        ctx.lineCap = circle.settings.lineCap;
        ctx.strokeStyle = circle.settings.color;
        ctx.stroke();
    }

    function animate(circle, c, ctx, time, startTime) {
        var mspf = new Date().getTime() - time;
        if (mspf < 1) {
            mspf = 1;
        }
        var timeOver = time-startTime>circle.settings.speed*10;
        if (!timeOver && (circle.cAngle)*1000 < Math.floor((circle.eAngle)*1000)) {
            circle.cAngle = Math[circle.settings.animation]((time - startTime) / mspf, circle.sAngle, circle.eAngle-circle.sAngle, circle.settings.speed / mspf);
        } else {
            if (circle.settings.timeLog) {
                console.log((new Date().getTime()) - startTime + "ms");
            }
            circle.cAngle = circle.eAngle;
            ctx.clearRect(0, 0, c.width, c.height);
            if (circle.settings.background) {
                drawBackground(circle, ctx);
            }
            drawCircle(circle, ctx);
            if(circle.settings.counterclockwise){
              $(c).parent().data("current-c-angle", 360-rToD(circle.cAngle));
              $(c).parent().data("current-start-angle", 360-rToD(circle.bAngle));
            } else {
              $(c).parent().data("current-c-angle", rToD(circle.cAngle));
              $(c).parent().data("current-start-angle", rToD(circle.bAngle));
            }

            return;
        }
        ctx.clearRect(0, 0, c.width, c.height);
        if (circle.settings.background) {
            drawBackground(circle, ctx);
        }
        drawCircle(circle, ctx);
        circle.settings.onDraw($(c).parent(), circle);

        if(circle.settings.counterclockwise){
          $(c).parent().data("current-c-angle", 360-rToD(circle.cAngle));
          $(c).parent().data("current-start-angle", 360-rToD(circle.bAngle));
        } else {
          $(c).parent().data("current-c-angle", rToD(circle.cAngle));
          $(c).parent().data("current-start-angle", rToD(circle.bAngle));
        }
        time = new Date().getTime();
        requestAnimFrame(function() {
            animate(circle, c, ctx, time, startTime);
        });
    }

    function Circle(pos, bAngle, eAngle, cAngle, radius, lineWidth, sAngle, settings) {
        this.pos = pos;
        this.bAngle = bAngle;
        this.eAngle = eAngle;
        this.cAngle = cAngle;
        this.radius = radius;
        this.lineWidth = lineWidth;
        this.sAngle = sAngle;
        this.settings = settings;
    }

    function rToD(rad) {
        return (rad / Math.PI) * 180;
    }

    function dToR(deg) {
        return (deg / 180) * Math.PI;
    }

    window.requestAnimFrame = (function(callback) {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
            function(callback) {
                window.setTimeout(callback, 1000 / 60);
            };
    })();

    //Math functions

    Math.linearTween = function(t, b, c, d) {
        return c * t / d + b;
    };
    Math.easeInQuad = function(t, b, c, d) {
        t /= d;
        return c * t * t + b;
    };
    Math.easeOutQuad = function(t, b, c, d) {
        t /= d;
        return -c * t * (t - 2) + b;
    };
    Math.easeInOutQuad = function(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    };
    Math.easeInCubic = function(t, b, c, d) {
        t /= d;
        return c * t * t * t + b;
    };
    Math.easeOutCubic = function(t, b, c, d) {
        t /= d;
        t--;
        return c * (t * t * t + 1) + b;
    };
    Math.easeInOutCubic = function(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t * t + b;
        t -= 2;
        return c / 2 * (t * t * t + 2) + b;
    };
    Math.easeInQuart = function(t, b, c, d) {
        t /= d;
        return c * t * t * t * t + b;
    };
    Math.easeOutQuart = function(t, b, c, d) {
        t /= d;
        t--;
        return -c * (t * t * t * t - 1) + b;
    };
    Math.easeInOutQuart = function(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t * t * t + b;
        t -= 2;
        return -c / 2 * (t * t * t * t - 2) + b;
    };
    Math.easeInQuint = function(t, b, c, d) {
        t /= d;
        return c * t * t * t * t * t + b;
    };
    Math.easeOutQuint = function(t, b, c, d) {
        t /= d;
        t--;
        return c * (t * t * t * t * t + 1) + b;
    };
    Math.easeInOutQuint = function(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t * t * t * t + b;
        t -= 2;
        return c / 2 * (t * t * t * t * t + 2) + b;
    };
    Math.easeInSine = function(t, b, c, d) {
        return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
    };
    Math.easeOutSine = function(t, b, c, d) {
        return c * Math.sin(t / d * (Math.PI / 2)) + b;
    };
    Math.easeInOutSine = function(t, b, c, d) {
        return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
    };
    Math.easeInExpo = function(t, b, c, d) {
        return c * Math.pow(2, 10 * (t / d - 1)) + b;
    };
    Math.easeOutExpo = function(t, b, c, d) {
        return c * (-Math.pow(2, -10 * t / d) + 1) + b;
    };
    Math.easeInOutExpo = function(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
        t--;
        return c / 2 * (-Math.pow(2, -10 * t) + 2) + b;
    };
    Math.easeInCirc = function(t, b, c, d) {
        t /= d;
        return -c * (Math.sqrt(1 - t * t) - 1) + b;
    };
    Math.easeOutCubic = function(t, b, c, d) {
        t /= d;
        t--;
        return c * (t * t * t + 1) + b;
    };
    Math.easeInOutCubic = function(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t * t + b;
        t -= 2;
        return c / 2 * (t * t * t + 2) + b;
    };
    Math.easeOutCirc = function (t, b, c, d) {
	    t /= d;
	    t--;
	    return c * Math.sqrt(1 - t*t) + b;
    };
    Math.easeInOutCirc = function (t, b, c, d) {
	    t /= d/2;
	    if (t < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
	    t -= 2;
	    return c/2 * (Math.sqrt(1 - t*t) + 1) + b;
    };

}(jQuery));
