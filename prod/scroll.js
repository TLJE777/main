"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _toArray(arr) { return _arrayWithHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

/*  0.made by zhangchuang
        1.可复用函数pageScroll, 来进行特殊的滚动效果,使用方法: pageScroll('up')向上滑动,pageScroll('down')向下面滑动,
        2.要求html包含id="scrollWrapper"的总容器
            2.1.容器中只可以包含两部分子容器:id="bgWrapper"的背景容器和class="pageWrapper"的页面容器(总容器大小，BFC结构，可以像一个页面一样布局)
                2.1.1.背景容器中书写格式 <div class="bg b1"></div>，bg必须有，b1是自定义的背景样式，可以是背景图片之类的
                2.1.2.页面容器里面正常写html元素就好，如需设置背景需要在最后一位html元素加subBg的class样式,如：<div class="subBg" style="background: mediumaquamarine;"></div>
                    2.1.2.1.子容器可以加layout-container属性的html标签进行对子元素布局，layout-container中的元素也会动, 且layout-container可以嵌套
        3.要求存在必备样式，#scrollWrapper，.pageWrapper， #bgWrapper，.bg， *[layout-container]，*[layout-container]>*  */
// 监听浏览器resize用, 函数防抖
var scrollWrapper = document.querySelector('#scrollWrapper');
scrollWrapper.onresize = debounce(function () {
  scrollHeight = scrollWrapper.offsetHeight;
}, 300); // 处理兼容性问题, 为多个浏览器设置相同css属性与相同值
var debounce = function debounce(func, wait) {
  var timeout;
  return function () {
    var context = this;
    var args = arguments;
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(function () {
      func.apply(context, args);
    }, wait);
  };
};
/* 页面滑动特效
/* ------------------------------------------------ */


var pageScroll = function () {
  var counter = 0;

  var _document$querySelect = document.querySelectorAll('.pageWrapper'),
      _document$querySelect2 = _toArray(_document$querySelect),
      pageWrapperList = _document$querySelect2.slice(0);

  var scrollHeight = scrollWrapper.offsetHeight; // 每次移动距离都是scrollWrapper的高度

  var bgWrapper = document.querySelector('#bgWrapper');

  var setElementStyle = function setElementStyle(element, styleKey, styleValue) {
    // 首字母大写，如transform 变成 Transform
    var upFristStyleKey = "".concat(styleKey.charAt(0).toUpperCase()).concat(styleKey.substring(1));
    var assembleKeys = ["webkit".concat(upFristStyleKey), "Moz".concat(upFristStyleKey), "ms".concat(upFristStyleKey), "O".concat(upFristStyleKey), styleKey];
    assembleKeys.map(function (key) {
      element.style[key] = styleValue;
    });
  }; // 闭包，公用上面的变量和函数


  return function (direction) {
    if (pageWrapperList.length - 1 === counter && direction === 'up' || 0 === counter && direction === 'down') return; // 设置tanslate和tansform进行移动和动画效果
    // 不同的delay造成一个个移动的效果

    var MoveEl = function MoveEl(curNode, delay) {
      setElementStyle(curNode, 'transition', "all 0.78s ease ".concat(delay, "s")); // 不设置setTimeout会导致过渡效果消失

      setTimeout(function () {
        setElementStyle(curNode, 'transform', "translateY(".concat(-counter * scrollHeight, "px)"));
      }, 0);
    };

    var curCunter = counter; // 记录计算前的counter,也就是即将离开页的下标的counter
    // counter在计算前进行加减，表示counter对应的pageWrapperList[counter]实际上是操作结束的pageWrapper

    if (direction === 'up') {
      counter++;
    } else {
      counter--;
    }

    pageWrapperList.map(function (curPageWrapper, wrapperIndex) {
      var defaultOutNodeList = _toConsumableArray(curPageWrapper.children); // 即将离开页所有子元素，不包含子元素中的子元素


      var defaultInNodeList = _toConsumableArray(pageWrapperList[counter].children); // 即将进入页所有子元素，不包含子元素中的子元素


      var handledInNodeList = []; // 即将离开页所有子元素，包含带有layout-container属性的子元素, 可嵌套

      var handledOutNodeList = []; // 即将进入页所有子元素，包含带有layout-container属性的子元素， 可嵌套

      var moveNodeList = []; // 将被移动的所有元素
      // 将defaultXxxNodeList变为handledXxxNodeList

      var assembleMoveList = function assembleMoveList(node, moveNodeList) {
        var res = [];

        if (node.hasAttribute('layout-container')) {
          _toConsumableArray(node.children).map(function (node) {
            return assembleMoveList(node, moveNodeList);
          });
        } else {
          res = [node];
        }

        if (moveNodeList === 'handledOutNodeList') {
          handledOutNodeList = [].concat(_toConsumableArray(handledOutNodeList), _toConsumableArray(res));
        } else {
          handledInNodeList = [].concat(_toConsumableArray(handledInNodeList), _toConsumableArray(res));
        }
      };

      defaultOutNodeList.map(function (node) {
        return assembleMoveList(node, 'handledOutNodeList');
      });
      defaultInNodeList.map(function (node) {
        return assembleMoveList(node, 'handledInNodeList');
      });
      var curNodeNumber = handledOutNodeList.length; // 记录当前也的标签数。用于确定在当前页的curNodeNumber个标签移动后，移动背景
      //

      if (curCunter === wrapperIndex) {
        if (direction === 'down') {
          // 先离开再进入
          // 从最后一个元素到第一个开始移动
          moveNodeList = [].concat(_toConsumableArray(handledInNodeList), _toConsumableArray(handledOutNodeList)).reverse();
          moveNodeList.map(function (curNode, nodeIndex) {
            // 当前页标签移动完，移动背景
            if (nodeIndex === curNodeNumber - 1) {
              MoveEl(bgWrapper, 0.06 * curNodeNumber);
            }

            MoveEl(curNode, 0.06 * nodeIndex);
          });
        } else {
          // 先离开再进入
          // 从第一个元素到最后一个开始移动
          moveNodeList = [].concat(_toConsumableArray(handledOutNodeList), _toConsumableArray(handledInNodeList));
          moveNodeList.map(function (curNode, nodeIndex) {
            if (nodeIndex === curNodeNumber - 1) {
              MoveEl(bgWrapper, 0.06 * curNodeNumber);
            }

            MoveEl(curNode, 0.06 * nodeIndex);
          });
        } // 移动其他标签

      } else if (direction === 'down' && curCunter - 1 !== wrapperIndex || direction === 'up' && curCunter + 1 !== wrapperIndex) {
        handledOutNodeList.map(function (curNode, nodeIndex) {
          MoveEl(curNode, 0);
        });
      }
    });
  };
}();
/* 鼠标滑动触发特效
/* ------------------------------------------------ */
// 首次触发滚动，其后0.4秒内函数防抖


var debounceScorll = function () {
  var moved = false; // 滚动状态

  var preScrollLength = 0; // 滚动距离

  var closeMoved = debounce(function () {
    console.log('mouse');
    moved = false;
  }, 400); // for Mac触摸板: 一次滑动会触发两次趋势变化，阻止系统的trend变化

  var ffMoveUp = debounce(function () {
    pageScroll('up');
    dir = null; // moved = false
  }, 120);
  var setffMovedFalse = debounce(function () {
    console.log('set');
    moved = false;
  }, 120);
  var ffMoveDown = debounce(function () {
    pageScroll('down');
    dir = null;
  }, 120);
  var dir = null;

  var ffMove = function ffMove(direction) {
    if (dir !== direction) {
      dir = direction; // 只触发同向移动
    }

    setffMovedFalse();

    if (moved == false) {
      console.log('moved');
      moved = true;

      if (dir === 'up') {
        ffMoveUp();
      } else {
        ffMoveDown();
      }
    }
  };

  var trend = 0;

  var setMoved = function setMoved(type) {
    if (moved === false) {
      moved = true;
      closeMoved();
    }
  };

  return function (direction, scrollLength, type) {
    if (type === 'fireFox') {
      ffMove(direction);
      return;
    } else {
      if (moved === false) {
        // for Chrome等鼠标滚动
        if (Math.abs(scrollLength) === 120) {
          pageScroll(direction);
          setMoved();
        } else if (trend !== 0) {
          // for Mac触摸板: trend(趋势)改变触发滑动，比如说移动距离先变正数再变负数就是一个趋势变化
          if (Math.abs(preScrollLength) - Math.abs(scrollLength) > 0 && trend < 0 || Math.abs(preScrollLength) - Math.abs(scrollLength) < 0 && trend > 0) {
            pageScroll(direction);
            setMoved();
          }
        }
      } else {
        setMoved();
      }
    } // 设置trend


    if (Math.abs(preScrollLength) - Math.abs(scrollLength) !== 0) {
      trend = Math.abs(preScrollLength) - Math.abs(scrollLength);
    } // 兼容FireFox,滑动值为1


    preScrollLength = scrollLength;
  };
}();

var mouseScroll = function mouseScroll(scrollUp, scrollDown) {
  var scrollFunc = function scrollFunc(e) {
    e = e || window.event;

    if (e.stopPropagation) {
      //这是取消冒泡
      e.stopPropagation();
    } else {
      e.cancelBubble = true;
    }

    ;

    if (e.preventDefault) {
      //这是取消默认行为，要弄清楚取消默认行为和冒泡不是一回事
      e.preventDefault();
    } else {
      e.returnValue = false;
    }

    ;

    if (e.wheelDelta) {
      //判断浏览器IE，谷歌滑轮事件
      if (e.wheelDelta > 0) {
        //当滑轮向上滚动时
        debounceScorll('down', e.wheelDelta);
      }

      if (e.wheelDelta < 0) {
        //当滑轮向下滚动时
        debounceScorll('up', e.wheelDelta);
      }
    } else if (e.detail) {
      //Firefox滑轮事件
      if (e.detail > 0) {
        //当滑轮向下滚动时
        // ffScrollUp(e.detail)
        debounceScorll('up', e.detail, 'fireFox');
      }

      if (e.detail < 0) {
        //当滑轮向上滚动时  
        // ffScrollDown(e.detail)
        debounceScorll('down', e.detail, 'fireFox');
      }
    }
  };
  /*IE、Opera注册事件*/


  if (document.attachEvent) {
    document.attachEvent('onmousewheel', scrollFunc);
  } //Firefox使用addEventListener添加滚轮事件  


  if (document.addEventListener) {
    //firefox  
    document.addEventListener('DOMMouseScroll', scrollFunc, false);
  }

  scrollWrapper.addEventListener("DOMMouseScroll", scrollFunc);
  scrollWrapper.onmousewheel = scrollFunc; //IE/Opera/Chrome
};
/* 移动端手指滑动触发特效
/* ------------------------------------------------ */


var touchScroll = function touchScroll(scrollUp, scrollDown) {
  scrollWrapper.addEventListener("touchmove", function (e) {
    e.preventDefault();
  }, false);
  var startY, endY, diff;
  scrollWrapper.addEventListener("touchstart", touchStart, false);
  scrollWrapper.addEventListener("touchmove", touchMove, false);
  scrollWrapper.addEventListener("touchend", touchEnd, false);

  function touchStart(e) {
    var touch = e.touches[0];
    startY = touch.pageY;
  }

  function touchMove(e) {
    var touch = e.touches[0];
    endY = touch.pageY;
    diff = endY - startY;
  }

  function touchEnd(e) {
    if (Math.abs(diff) > 150) {
      if (diff > 0) {
        scrollDown();
      } else {
        scrollUp();
      }
    }
  }
};
/* 启动mouseScroll和touchScroll监听
/* ------------------------------------------------ */


var executer = function () {
  mouseScroll();
  touchScroll(function () {
    return pageScroll('up');
  }, function () {
    return pageScroll('down');
  });
}();