// legacy
function str2transform(str){
	var numbers ;
	try {
		numbers = str.match(/\(.+?\)/)[0] ;
	} catch( e ) {
		return {} ;
	}

	numbers = numbers.substr(1, numbers.length - 2) ;
	numbers = numbers.split(/[,\s]+/g) ;
	numbers = numbers.map(function(elem){
		if( elem.length > 5 ) {
			return elem.substr(0,5) ;
		}
		return elem ;
	}) ;

	if( numbers.length === 6 ) {
		return {
			"m11" : numbers[0], "m21" : numbers[1], "m31" : 0, "m41" : numbers[2],
			"m12" : numbers[1], "m22" : numbers[4], "m32" : 0, "m42" : numbers[5],
			"m13" : 0, 			"m23" : 0, 			"m33" : 1, "m43" : 0,
			"m14" : 0, 			"m24" : 0, 			"m34" : 0, "m44" : 1,
		} ;
	} else if( numbers.length === 16 ){
		return {
			"m11" : numbers[0], "m12" : numbers[1], "m13" : numbers[2] , "m14" : numbers[3] ,
			"m21" : numbers[4], "m22" : numbers[5], "m23" : numbers[6] , "m24" : numbers[7] ,
			"m31" : numbers[8], "m32" : numbers[9], "m33" : numbers[10], "m34" : numbers[11],
			"m41" : numbers[12],"m42" : numbers[13],"m43" : numbers[14], "m44" : numbers[15],
		} ;
	}
	return {} ;
}
// legacy
function transform2str(obj) {
	var arr = [
		obj.m11, obj.m21, obj.m31, obj.m41 ,
		obj.m12, obj.m22, obj.m32, obj.m42 ,
		obj.m13, obj.m23, obj.m33, obj.m43 ,
		obj.m14, obj.m24, obj.m34, obj.m44 ,
	] ;
	return "matrix3d(" + arr.map(function(elem){
		return elem || 0 ;
	}).join(",") + ")" ;
}

var DirectionKeyMag = (function(){
	var left , right , up , down ;
	left = right = up = down = 0 ;

	document.addEventListener('keydown', function (evt) {
		switch (evt.which) {
		case 37:  // left
			left = 1 ;
			break;
		case 38:  // up
			up = 1 ;
			break;
		case 39:  // right
			right = 1 ;
			break;
		case 40:  // down
			down = 1 ;
			break;
		};
	});
	document.addEventListener('keyup', function (evt) {
		switch (evt.which) {
		case 37:  // left
			left = 0 ;
			break;
		case 38:  // up
			up = 0 ;
			break;
		case 39:  // right
			right = 0 ;
			break;
		case 40:  // down
			down = 0 ;
			break;
		};
	});

	function DirectionKeyMag() {
		var that = this;
		document.addEventListener('keydown', function (evt) {
			switch (evt.which) {
			case 37:  // left
			case 38:  // up
			case 39:  // right
			case 40:  // down
				that.refresh() ;
				break;
			default:
				break;
			};
		});
		document.addEventListener('keyup', function (evt) {
			switch (evt.which) {
			case 37:  // left
			case 38:  // up
			case 39:  // right
			case 40:  // down
				that.refresh() ;
				break;
			default:
				break;
			};
		});
	};
	DirectionKeyMag.prototype = {
		refresh: function(){
			var switched = "" + up + right + down + left ;
			var charStr = "" ;
			switch(switched) {
				case "1100" :
					charStr = "↗" ;
					break;
				case "0110" :
					charStr = "↘" ;
					break;
				case "0011" :
					charStr = "↙" ;
					break;
				case "1001" :
					charStr = "↖" ;
					break;

				case "1000" :
				case "1101" :
					charStr = "↑" ;
					break;

				case "0010" :
				case "0111" :
					charStr = "↓" ;
					break;

				case "0001" :
				case "1011" :
					charStr = "←" ;
					break;

				case "0100" :
				case "1110" :
					charStr = "→" ;
					break;
			}
			this.postHandlr && typeof this.postHandlr === "function" && this.postHandlr(switched, charStr) ;
		}
	} ;

	return DirectionKeyMag;
})() ;

function getVectorLength() {
	var arr = Array.prototype.slice.call(arguments) ;
	var sum = 0 ;
	arr.forEach(function(elem){
		sum += elem * elem || 0 ;
	});
	return sum === 0 ? 0 : Math.pow(sum, 0.5) ;
}
function makeRotate3dMatrix(xAxis, yAxis, zAxis, angle) {
	var obj = new CSSMatrix() ;
	var sc = Math.sin(angle) * Math.cos(angle) ;
	var sq = Math.sin(angle) * Math.sin(angle) ;
	var square = getVectorLength(xAxis, yAxis, zAxis) ;
	if( xAxis != 0 || yAxis != 0 || zAxis != 0 ) {
		// normalize
		var x = xAxis / square ;
		var y = yAxis / square ;
		var z = zAxis / square ;

		obj.m11 = 1-2*(y*y+z*z)*sq;
		obj.m12 = 2*(x*y*sq+z*sc);
		obj.m13 = 2*(x*z*sq-y*sc);

		obj.m21 = 2*(x*y*sq-z*sc);
		obj.m22 = 1-2*(x*x+z*z)*sq;
		obj.m23 = 2*(y*z*sq+x*sc);

		obj.m31 = 2*(x*z*sq+y*sc);
		obj.m32 = 2*(y*z*sq-x*sc);
		obj.m33 = 1-2*(x*x+y*y)*sq;
	}
	return obj ;
}

function CountdownTimer(interval, count, options) {
    var timer,
        lastTime;
    this.interval = interval,
    this.timeInterval = 16,
    this.count = count,
    this.options = options,
    that = this;
    this.start = function() {
        if (lastTime) {
            var left = that.count - Math.ceil(
                (+new Date() - lastTime) / that.interval
            );
            that.left = left;
            that.passed = that.count - left;
            if (left <= 0) {
                left = 0;
                that.clear();
                that.options.ITimeout && that.options.ITimeout.call(that);
            } else {
                timer = setTimeout(that.start, that.interval);
            }
            that.options.IProgress && that.options.IProgress.call(that);
        } else {
            lastTime = +new Date();
            timer = setTimeout(that.start, that.timeInterval);
            that.options.IStart && that.options.IStart.call(that);
        }
    };
    this.clear = function() {
        clearTimeout(timer);
        timer = null;
        lastTime = null;
        that.options.IClear && this.options.IClear.call(this);
    };
};

var popupInject = (function() {
    function strrep(str, obj) {
        return str.replace(/\$\w+\$/gi, function(matchs) {
            var returns = obj[matchs.replace(/\$/g, "")];
            return typeof returns === "undefined" ? "" : returns;
        });
    }
    var container = {},
        wrap = document.body.querySelector("#wrap_popup");

    return function(templateName) {
        // cache elem if possible
        if (!(templateName in container)) {
            var newFunc = (function() {
                var template = document.getElementById("template_" + templateName).innerHTML,
                    elem = document.getElementById("popup_" + templateName);
                if (!elem) {
                    // if the target Element is not found, inject it into the document
                    elem = document.createElement("div");
                    elem.id = "popup_" + templateName;
                    wrap.appendChild(elem);
                }
                return function(data) {
                    var data = data || {};
                    elem.innerHTML = strrep(template, data);
                }
            })();
            container[templateName] = newFunc;
        }
        return container[templateName];
    };
})();

var showTrans = popupInject("transform") ;
var theTrans = document.querySelector("ul") ;
function refreshInfo(){
	var obj = new CSSMatrix(getComputedStyle(theTrans).transform) ;
	showTrans(obj) ;
	setTimeout(refreshInfo) ;
}

var showinfo = (function(){
	var infoRefresh = popupInject("info") ;
	return function(info){
	    infoRefresh({
	        info: info
	    });
	};
})() ;