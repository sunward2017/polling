/**
 * Created by jiachenpan on 16/11/18.
 */

 export function parseTime(time, cFormat) {
   if (arguments.length === 0) {
     return null;
   }
   const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}';
   let date;
   if (typeof time == 'object') {
     date = time;
   } else {
     if (('' + time).length === 10) time = parseInt(time) * 1000;
     date = new Date(time);
   }
   const formatObj = {
     y: date.getFullYear(),
     m: date.getMonth() + 1,
     d: date.getDate(),
     h: date.getHours(),
     i: date.getMinutes(),
     s: date.getSeconds(),
     a: date.getDay()
   };
   const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
     let value = formatObj[key];
     if (key === 'a') return ['一', '二', '三', '四', '五', '六', '日'][value - 1];
     if (result.length > 0 && value < 10) {
       value = '0' + value;
     }
     return value || 0;
   });
   return time_str;
 }

 export function formatTime(time, option) {
   time = +time * 1000;
   const d = new Date(time);
   const now = Date.now();

   const diff = (now - d) / 1000;

   if (diff < 30) {
     return '刚刚'
   } else if (diff < 3600) { // less 1 hour
     return Math.ceil(diff / 60) + '分钟前'
   } else if (diff < 3600 * 24) {
     return Math.ceil(diff / 3600) + '小时前'
   } else if (diff < 3600 * 24 * 2) {
     return '1天前'
   }
   if (option) {
     return parseTime(time, option)
   } else {
     return d.getMonth() + 1 + '月' + d.getDate() + '日' + d.getHours() + '时' + d.getMinutes() + '分'
   }
 }

// 格式化时间
 export function getQueryObject(url) {
   url = url == null ? window.location.href : url;
   const search = url.substring(url.lastIndexOf('?') + 1);
   const obj = {};
   const reg = /([^?&=]+)=([^?&=]*)/g;
   search.replace(reg, (rs, $1, $2) => {
     const name = decodeURIComponent($1);
     let val = decodeURIComponent($2);
     val = String(val);
     obj[name] = val;
     return rs;
   });
   return obj;
 }


/**
 *get getByteLen
 * @param {Sting} val input value
 * @returns {number} output value
 */
 export function getByteLen(val) {
   let len = 0;
   for (let i = 0; i < val.length; i++) {
     if (val[i].match(/[^\x00-\xff]/ig) != null) {
       len += 1;
     } else { len += 0.5; }
   }
   return Math.floor(len);
 }

 export function cleanArray(actual) {
   const newArray = [];
   for (let i = 0; i < actual.length; i++) {
     if (actual[i]) {
       newArray.push(actual[i]);
     }
   }
   return newArray;
 }

 export function param(json) {
   if (!json) return '';
   return cleanArray(Object.keys(json).map(key => {
     if (json[key] === undefined) return '';
     return encodeURIComponent(key) + '=' +
            encodeURIComponent(json[key]);
   })).join('&');
 }

 export function str2Obj(str) {
    return JSON.parse(str);
 }

 export function param2Obj(url) {
   const search = url.split('?')[1];
   return JSON.parse('{"' + decodeURIComponent(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}')
 }

 export function html2Text(val) {
   const div = document.createElement('div');
   div.innerHTML = val;
   return div.textContent || div.innerText;
 }

 export function objectMerge(target, source) {
    /* Merges two  objects,
     giving the last one precedence */

   if (typeof target !== 'object') {
     target = {};
   }
   if (Array.isArray(source)) {
     return source.slice();
   }
   for (const property in source) {
     if (source.hasOwnProperty(property)) {
       const sourceProperty = source[property];
       if (typeof sourceProperty === 'object') {
         target[property] = objectMerge(target[property], sourceProperty);
         continue;
       }
       target[property] = sourceProperty;
     }
   }
   return target;
 }


 export function scrollTo(element, to, duration) {
   if (duration <= 0) return;
   const difference = to - element.scrollTop;
   const perTick = difference / duration * 10;
   setTimeout(() => {
     
     element.scrollTop = element.scrollTop + perTick;
     if (element.scrollTop === to) return;
     scrollTo(element, to, duration - 10);
   }, 10);
 }

 export function toggleClass(element, className) {
   if (!element || !className) {
     return;
   }
   let classString = element.className;
   const nameIndex = classString.indexOf(className);
   if (nameIndex === -1) {
     classString += '' + className;
   } else {
     classString = classString.substr(0, nameIndex) + classString.substr(nameIndex + className.length);
   }
   element.className = classString;
 }

 export const pickerOptions = [
   {
     text: '今天',
     onClick(picker) {
       const end = new Date();
       const start = new Date(new Date().toDateString());
       end.setTime(start.getTime());
       picker.$emit('pick', [start, end]);
     }
   }, {
     text: '最近一周',
     onClick(picker) {
       const end = new Date(new Date().toDateString());
       const start = new Date();
       start.setTime(end.getTime() - 3600 * 1000 * 24 * 7);
       picker.$emit('pick', [start, end]);
     }
   }, {
     text: '最近一个月',
     onClick(picker) {
       const end = new Date(new Date().toDateString());
       const start = new Date();
       start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
       picker.$emit('pick', [start, end]);
     }
   }, {
     text: '最近三个月',
     onClick(picker) {
       const end = new Date(new Date().toDateString());
       const start = new Date();
       start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
       picker.$emit('pick', [start, end]);
     }
   }]

 export function getTime(type) {
   if (type === 'start') {
     return new Date().getTime() - 3600 * 1000 * 24 * 90
   } else {
     return new Date(new Date().toDateString())
   }
 }


    function S4() {
        return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    }
  export  function guid() {
        return (S4()+S4()+S4()+S4()+S4()+S4()+S4()+S4());
  }
  
  export function compare(propertyName) {
    return function(object1, object2) {
      var value1 = object1[propertyName];
      var value2 = object2[propertyName];
      return value1 - value2;
    }
  }


export function compareU(pro) { 
  return function (obj1, obj2) { 
      var val1 = +obj1[pro].split("-")[0]; 
      var val2 = +obj2[pro].split('-')[0]; 
      return val2-val1;
  } 
}


//判断对象的数据类型
function isClass(o){
  if(o===null) return "Null";
  if(o===undefined) return "Undefined";
  return Object.prototype.toString.call(o).slice(8,-1);
}


export var cloneObj=function clone(obj){
  var result;
  var oClass=isClass(obj);
  if(oClass==="Object"){
      result={};
  }else if(oClass==="Array"){
      result=[];
  }else{
      return obj;
  }
  for(var key in obj){
     var copy=obj[key];
     if(isClass(copy)=="Object"){
         result[key]=clone(copy);//递归调用
      }else if(isClass(copy)=="Array"){
         result[key]=clone(copy);
      }else{
          result[key]=obj[key];
      }
  }
return result;
}

export function randomColor(){
  var r = Math.floor(Math.random()*256);
  var g = Math.floor(Math.random()*256);
  var b = Math.floor(Math.random()*256);
  return "rgba("+r+","+g+","+b+",0.2)";
}

// 进入全屏
export function requestFullScreen () {
  var elem = document.documentElement
  if (elem.requestFullscreen) {
    elem.requestFullscreen()
  } else if (elem.mozRequestFullScreen) {
    elem.mozRequestFullScreen()
  } else if (elem.webkitRequestFullScreen) {
    elem.webkitRequestFullScreen()
  } else if (elem.msRequestFullscreen) {
    // elem.msRequestFullscreen() 没有指定元素
    document.body.msRequestFullscreen()
  }
}
// 退出全屏
export function exitFullscreen () {
  var doc = document
  if (doc.exitFullscreen) {
    doc.exitFullscreen()
  } else if (doc.mozCancelFullScreen) {
    doc.mozCancelFullScreen()
  } else if (doc.webkitCancelFullScreen) {
    doc.webkitCancelFullScreen()
  } else if (doc.msExitFullscreen) {
    document.msExitFullscreen()
  }
}

