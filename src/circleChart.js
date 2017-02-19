(function($) {
    $.fn.circleChart = function(options) {
        var defaults = {
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
            text: false,
            redraw: false,
            cAngle: 0,
            textCenter: true,
            textSize: false,
            textWeight: 'normal',
            textFamily: 'sans-serif',
            relativeTextSize: 1 / 7,
            autoCss: true,
            onDraw: false
        };

        return this.each(function() {
            var cache = {};
            var _data = $(this).data();
            for (var key in _data) {
                if (_data.hasOwnProperty(key) && key.indexOf('_cache_') === 0) {
                    if (defaults.hasOwnProperty(key.substring(7))) {
                        cache[key.substring(7)] = _data[key];
                    }
                    $(this).removeData(key);
                }
            }

            var settings = $.extend({}, defaults, cache, options, $(this).data());
            for (var key in settings) {
                $(this).data('_cache_' + key, settings[key]);
            }
            if (!$("canvas.circleChart_canvas", this).length) {
                $(this).append(function() {
                    return $('<canvas/>', {
                        'class': 'circleChart_canvas'
                    }).prop({
                        width: settings.size,
                        height: settings.size
                    }).css(settings.autoCss ? {
                        "margin-left": "auto",
                        "margin-right": "auto",
                        "display": "block"
                    } : {});
                });
            }
            if (!$("p.circleChart_text", this).length) {
                if (settings.text !== false) {
                    $(this).append("<p class='circleChart_text'>" + settings.text + "</p>");
                    if (settings.autoCss) {
                        if (settings.textCenter) {
                            $("p.circleChart_text", this).css({
                                "position": "absolute",
                                "line-height": (settings.size + "px"),
                                "top": 0,
                                "width": "100%",
                                "margin": 0,
                                "padding": 0,
                                "text-align": "center",
                                "font-size": settings.textSize !== false ? settings.textSize : settings.size * settings.relativeTextSize,
                                "font-weight": settings.textWeight,
                                "font-family": settings.textFamily
                            });
                        } else {
                            $("p.circleChart_text", this).css({
                                "padding-top": "5px",
                                "text-align": "center",
                                "font-weight": settings.textWeight,
                                "font-family": settings.textFamily,
                                "font-size": settings.textSize !== false ? settings.textSize : settings.size * settings.relativeTextSize,
                            });
                        }
                    }
                }
            }
            if (!settings.redraw) {
                settings.cAngle = settings.currentCAngle ? settings.currentCAngle : settings.cAngle;
                settings.startAngle = settings.currentStartAngle ? settings.currentStartAngle : settings.startAngle;
            }

            if (settings.autoCss) {
                $(this).css("position", "relative");
            }
            var c = $("canvas", this).get(0);
            var ctx = c.getContext("2d");
            var bAngle;
            var eAngle;
            var cAngle;

            switch (settings.unit) {
                case 'rad':
                    bAngle = settings.startAngle;
                    eAngle = settings.value;
                    cAngle = settings.cAngle;
                    break;
                case 'percent':
                    bAngle = pToR(settings.startAngle);
                    eAngle = pToR(settings.value);
                    cAngle = pToR(settings.cAngle);
                    break;
                case 'deg':
                default:
                    bAngle = dToR(settings.startAngle);
                    eAngle = dToR(settings.value);
                    cAngle = dToR(settings.cAngle);
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
                    if (settings.value !== 0) {
                        drawCircle(circle, ctx);
                        onDraw($(c).parent(), circle);
                    } else {
                        ctx.clearRect(0, 0, c.width, c.height);
                        if (circle.settings.background) {
                            drawBackground(circle, ctx);
                        }
                    }
                });
            } else {
                if (settings.value !== 0) {
                    animate(circle, c, ctx, new Date().getTime(), new Date().getTime(), cAngle > eAngle);
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
            var k = 2 * Math.PI;
            ctx.arc(circle.pos, circle.pos, circle.radius, k - circle.bAngle, k - (circle.bAngle + circle.cAngle), circle.settings.counterclockwise);
        } else {
            ctx.arc(circle.pos, circle.pos, circle.radius, circle.bAngle, circle.bAngle + circle.cAngle, circle.settings.counterclockwise);
        }
        ctx.lineWidth = circle.lineWidth;
        ctx.lineCap = circle.settings.lineCap;
        ctx.strokeStyle = circle.settings.color;
        ctx.stroke();
    }

    function animate(circle, c, ctx, time, startTime, move /*move counterclockwise*/ ) {
        var mspf = new Date().getTime() - time; //milliseconds per frame
        if (mspf < 1) {
            mspf = 1;
        }
        if ((time - startTime < circle.settings.speed * 1.05) /* time not over */ && (!move && (circle.cAngle) * 1000 <= Math.floor((circle.eAngle) * 1000) /* move clockwise */ || move && (circle.cAngle) * 1000 >= Math.floor((circle.eAngle) * 1000) /* move counterclockwise */ )) {
            circle.cAngle = Math[circle.settings.animation]((time - startTime) / mspf, circle.sAngle, circle.eAngle - circle.sAngle, circle.settings.speed / mspf);
            ctx.clearRect(0, 0, c.width, c.height);
            if (circle.settings.background) {
                drawBackground(circle, ctx);
            }
            drawCircle(circle, ctx);
            onDraw($(c).parent(), circle);
            setCurrentAnglesData($(c).parent(), circle);
            time = new Date().getTime();
            requestAnimFrame(function() {
                animate(circle, c, ctx, time, startTime, move);
            });
        } else {
            circle.cAngle = circle.eAngle;
            ctx.clearRect(0, 0, c.width, c.height);
            if (circle.settings.background) {
                drawBackground(circle, ctx);
            }
            drawCircle(circle, ctx);
            setCurrentAnglesData($(c).parent(), circle);
        }
    }

    function onDraw(el, circle) {
        if (circle.settings.onDraw !== false) {
            switch (circle.settings.unit) {
                case 'rad':
                    circle.value = circle.cAngle;
                    break;
                case 'percent':
                    circle.value = rToP(circle.cAngle);
                    break;
                case 'deg':
                default:
                    circle.value = rToD(circle.cAngle);
            }
            circle.settings.onDraw(el, circle);
        }
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

    function pToR(percent) {
        return percent * Math.PI / 50;
    }

    function rToP(rad) {
        return rad * 50 / Math.PI;
    }

    function setCurrentAnglesData(el, circle) {
        var cAngle = circle.cAngle;
        var bAngle = circle.bAngle;

        switch (circle.settings.unit) {
            case 'rad':
                el.data("current-c-angle", circle.cAngle);
                el.data("current-start-angle", circle.bAngle);
                break;
            case 'percent':
                el.data("current-c-angle", rToP(circle.cAngle));
                el.data("current-start-angle", rToP(circle.bAngle));
                break;
            case 'deg':
            default:
                el.data("current-c-angle", rToD(circle.cAngle));
                el.data("current-start-angle", rToD(circle.bAngle));
        }
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
    Math.easeOutCirc = function(t, b, c, d) {
        t /= d;
        t--;
        return c * Math.sqrt(1 - t * t) + b;
    };
    Math.easeInOutCirc = function(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
        t -= 2;
        return c / 2 * (Math.sqrt(1 - t * t) + 1) + b;
    };

}(jQuery));
