/*  0.made by zhangchuang
        1.可复用函数pageScroll, 来进行特殊的滚动效果,使用方法: pageScroll('up')向上滑动,pageScroll('down')向下面滑动,
        2.要求html包含id="scrollWrapper"的总容器
            2.1.容器中只可以包含两部分子容器:id="bgWrapper"的背景容器和class="pageWrapper"的页面容器(总容器大小，BFC结构，可以像一个页面一样布局)
                2.1.1.背景容器中书写格式 <div class="bg b1"></div>，bg必须有，b1是自定义的背景样式，可以是背景图片之类的
                2.1.2.页面容器里面正常写html元素就好，如需设置背景需要在最后一位html元素加subBg的class样式,如：<div class="subBg" style="background: mediumaquamarine;"></div>
                    2.1.2.1.子容器可以加layout-container属性的html标签进行对子元素布局，layout-container中的元素也会动, 且layout-container可以嵌套
        3.要求存在必备样式，#scrollWrapper，.pageWrapper， #bgWrapper，.bg， *[layout-container]，*[layout-container]>*  */
// 监听浏览器resize用, 函数防抖
const scrollWrapper = document.querySelector('#scrollWrapper')
let ifBoundary = false // 是否滚动到边界
let ifcloseMouseWheel = false // 关闭鼠标滚动事件
const debounce = (func, wait) => {
    let timeout;
    return function () {
        let context = this;
        let args = arguments;

        if (timeout) clearTimeout(timeout);

        timeout = setTimeout(() => {
            func.apply(context, args)
        }, wait);
    }
}
let scrollHeight = window.innerHeight // 每次移动距离都是scrollWrapper的高度
const resetScrollHeight = debounce(() => {
    scrollHeight = window.innerHeight
}, 300)
resetScrollHeight()
/* 页面滑动特效
/* ------------------------------------------------ */
const pageScroll = (() => {
    let counter = 0
    const [...pageWrapperList] = document.querySelectorAll('.pageWrapper')
    // let scrollHeight = scrollWrapper.offsetHeight // 每次移动距离都是scrollWrapper的高度
    const bgWrapper = document.querySelector('#bgWrapper')

    // 处理兼容性问题, 为多个浏览器设置相同css属性与相同值
    const setElementStyle = (element, styleKey, styleValue) => {
        // 首字母大写，如transform 变成 Transform
        const upFristStyleKey = `${styleKey.charAt(0).toUpperCase()}${styleKey.substring(1)}`
        const assembleKeys = [
            `webkit${upFristStyleKey}`,
            `Moz${upFristStyleKey}`,
            `ms${upFristStyleKey}`,
            `O${upFristStyleKey}`,
            styleKey]

        assembleKeys.map(key => {
            element.style[key] = styleValue
        })
    }

    // 闭包，公用上面的变量和函数
    return (direction) => {
        if ((pageWrapperList.length - 1 === counter && direction === 'up') || (0 === counter && direction === 'down')) {
            ifBoundary = true
            setTimeout(() => {
                ifBoundary = false
            }, 300)
            return
        }
        ifBoundary = false
        if (pageWrapperList.length - 1 === counter && direction === 'down') {
            ifcloseMouseWheel = true
        } else {
            
        }
        // 设置tanslate和tansform进行移动和动画效果
        // 不同的delay造成一个个移动的效果
        const MoveEl = (curNode, delay) => {
            setElementStyle(curNode, 'transition', `all 0.78s ease ${delay}s`)
            // 不设置setTimeout会导致过渡效果消失
            setTimeout(() => {
                setElementStyle(curNode, 'transform', `translateY(${-counter * scrollHeight}px)`)
            }, 0)
        }
        const curCunter = counter // 记录计算前的counter,也就是即将离开页的下标的counter
        // counter在计算前进行加减，表示counter对应的pageWrapperList[counter]实际上是操作结束的pageWrapper
        if (direction === 'up') {
            counter++
        } else {
            counter--
        }

        pageWrapperList.map((curPageWrapper, wrapperIndex) => {
            let defaultOutNodeList = [...curPageWrapper.children] // 即将离开页所有子元素，不包含子元素中的子元素
            let defaultInNodeList = [...pageWrapperList[counter].children] // 即将进入页所有子元素，不包含子元素中的子元素
            let handledInNodeList = [] // 即将离开页所有子元素，包含带有layout-container属性的子元素, 可嵌套
            let handledOutNodeList = [] // 即将进入页所有子元素，包含带有layout-container属性的子元素， 可嵌套
            let moveNodeList = [] // 将被移动的所有元素

            // 将defaultXxxNodeList变为handledXxxNodeList
            const assembleMoveList = (node, moveNodeList) => {
                let res = []
                if (node.hasAttribute('layout-container')) {
                    [...node.children].map(node => assembleMoveList(node, moveNodeList))
                } else {
                    res = [node]
                }

                if (moveNodeList === 'handledOutNodeList') {
                    handledOutNodeList = [...handledOutNodeList, ...res]
                } else {
                    handledInNodeList = [...handledInNodeList, ...res]
                }
            }

            defaultOutNodeList.map(node => assembleMoveList(node, 'handledOutNodeList'))
            defaultInNodeList.map(node => assembleMoveList(node, 'handledInNodeList'))

            const curNodeNumber = handledOutNodeList.length // 记录当前也的标签数。用于确定在当前页的curNodeNumber个标签移动后，移动背景

            //
            if (curCunter === wrapperIndex) {
                if (direction === 'down') {
                    // 先离开再进入
                    // 从最后一个元素到第一个开始移动
                    moveNodeList = [...handledInNodeList, ...handledOutNodeList].reverse()
                    moveNodeList.map((curNode, nodeIndex) => {
                        // 当前页标签移动完，移动背景
                        if (nodeIndex === curNodeNumber - 1) {
                            MoveEl(bgWrapper, 0.06 * curNodeNumber)
                        }
                        MoveEl(curNode, 0.06 * nodeIndex)
                    })
                } else {
                    // 先离开再进入
                    // 从第一个元素到最后一个开始移动
                    moveNodeList = [...handledOutNodeList, ...handledInNodeList]
                    moveNodeList.map((curNode, nodeIndex) => {
                        if (nodeIndex === curNodeNumber - 1) {
                            MoveEl(bgWrapper, 0.06 * curNodeNumber)
                        }
                        MoveEl(curNode, 0.06 * nodeIndex)
                    })
                }
                // 移动其他标签
            } else if ((direction === 'down' && curCunter - 1 !== wrapperIndex) || (direction === 'up' && curCunter + 1 !== wrapperIndex)) {
                handledOutNodeList.map((curNode, nodeIndex) => {
                    MoveEl(curNode, 0)
                })
            }
        })
    }
})()

/* 鼠标滑动触发特效
/* ------------------------------------------------ */
// 首次触发滚动，其后0.4秒内函数防抖
const debounceScorll = (() => {
    let moved = false // 滚动状态
    let preScrollLength = 0 // 滚动距离
    const closeMoved = debounce(() => {
        moved = false
    }, 400) // for Mac触摸板: 一次滑动会触发两次趋势变化，阻止系统的trend变化
    const ffMoveUp = debounce(() => {
        pageScroll('up')
        dir = null
        // moved = false
    }, 120)
    const setffMovedFalse = debounce(() => {
        moved = false
    }, 120)
    const ffMoveDown = debounce(() => {
        pageScroll('down')
        dir = null
    }, 120)
    let dir = null
    const ffMove = (direction) => {
        if (dir !== direction) {
            dir = direction // 只触发同向移动
        }
        setffMovedFalse()
        if (moved == false) {
            moved = true
            if (dir === 'up') {
                ffMoveUp()
            } else {
                ffMoveDown()
            }
        }
    }
    let trend = 0
    const setMoved = (type) => {
        if (moved === false) {
            moved = true
            closeMoved()
        }
    }
    const stopScrollHandler = (e) => {
        if (!ifBoundary) {
            if (e.stopPropagation) { //这是取消冒泡
                e.stopPropagation();
            } else {
                e.cancelBubble = true;
            };
            if (e.preventDefault) {//这是取消默认行为，要弄清楚取消默认行为和冒泡不是一回事
                e.preventDefault();
            } else {
                e.returnValue = false;
            };
        }
    }
    return (direction, scrollLength, type, e) => {
        stopScrollHandler(e)
        if (type === 'fireFox') {
            ffMove(direction)
            return
        } else {
            if (moved === false) {
                // for Chrome等鼠标滚动
                if (Math.abs(scrollLength) === 120) {
                    pageScroll(direction)
                    setMoved()
                } else if (trend !== 0) {
                    // for Mac触摸板: trend(趋势)改变触发滑动，比如说移动距离先变正数再变负数就是一个趋势变化
                    if ((Math.abs(preScrollLength) - Math.abs(scrollLength) > 0 && trend < 0) || (Math.abs(preScrollLength) - Math.abs(scrollLength) < 0 && trend > 0)) {
                        pageScroll(direction)
                        setMoved()
                    }
                }
            } else {
                setMoved()
            }
        }
        // 设置trend
        if (Math.abs(preScrollLength) - Math.abs(scrollLength) !== 0) {
            trend = Math.abs(preScrollLength) - Math.abs(scrollLength)
        }
        // 兼容FireFox,滑动值为1
        preScrollLength = scrollLength
    }
})()

const mouseScroll = () => {
    const scrollFunc = (e) => {
        e = e || window.event;
        if (e.wheelDelta) {  //判断浏览器IE，谷歌滑轮事件
            if (e.wheelDelta > 0) { //当滑轮向上滚动时
                debounceScorll('down', e.wheelDelta, 'other', e)
            }
            if (e.wheelDelta < 0) { //当滑轮向下滚动时
                debounceScorll('up', e.wheelDelta, 'other', e)
            }
        } else if (e.detail) {  //Firefox滑轮事件
            if (e.detail > 0) { //当滑轮向下滚动时
                debounceScorll('up', e.detail, 'fireFox', e)
            }
            if (e.detail < 0) { //当滑轮向上滚动时  
                debounceScorll('down', e.detail, 'fireFox', e)
            }
        }
    }
    
    const activeScroll = (() => {
            /*IE、Opera注册事件*/
            if (document.attachEvent) {
                scrollWrapper.attachEvent('onmousewheel', scrollFunc);
        
            }
            //Firefox使用addEventListener添加滚轮事件  
            if (document.addEventListener) {//firefox  
                scrollWrapper.addEventListener('DOMMouseScroll', scrollFunc, false);
            }
        
        
            scrollWrapper.addEventListener("DOMMouseScroll", scrollFunc);
        
            scrollWrapper.onmousewheel = scrollFunc;//IE/Opera/Chrome
    })()
}

/* 移动端手指滑动触发特效
/* ------------------------------------------------ */
const touchScroll = (scrollUp, scrollDown) => {
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
                scrollDown()
            } else {
                scrollUp()
            }
        }
    }
}
/* 启动mouseScroll和touchScroll监听
/* ------------------------------------------------ */
const executer = (() => {
    mouseScroll()
    touchScroll(() => pageScroll('up'), () => pageScroll('down'));
})()

