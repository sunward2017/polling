import React, { Component } from 'react';
import "babel-polyfill"
import { Row,Col,Tag,message } from 'antd';
import './App.css';
import axios from 'axios'
import qs from 'qs'
import moment from 'moment'
import Swiper from 'swiper'

import echarts from 'echarts/lib/echarts';
import  'echarts/lib/chart/pie';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/legend';
import 'echarts/lib/component/title';
import Stomp from 'stompjs';
import heat from 'heatmap.js'

import danger from './image/danger.png';
import robot from './image/robot.png';
import Heart from './image/Heart.png';
import circle from './image/circle.png'
import task from './image/task.png';
import untask from './image/task-unchecked.png';
import video from './image/video.png';
import unvideo from './image/video-unchecked.png';
import audio from './image/audio.png'
import unaudio from './image/unaudio.png'
import roomInit from './image/roomInit.png'

var pgAtx = '';

var s_sUser = "";
var s_uMethCmnButt = 32;
var s_sServer = "PGServer";
var s_sOnline = "PGOL" + s_sServer;

var url = "ws://218.85.116.194:61614";
var login = "admin";
var passcode = "password";
var destination = "/topic/CriuseRobot";

//var robotId='caf144c6d844407892c2858b0477f99d';
//var customId='43abe352a38d4addb500ffbd0bed7d85';

var robotId ="b0e0c4316ea749978d5cea51ee68f50a";
var customId ='85e8d37d17544889b590fec278e9ef49';


//pptun相关--start
const pgChat = {
  sPeer: "",
  sTxtTemp: "",
  uVolMax: 0,
  uVolMin: 0,
  Init: function() {
    if(!pgAtx.ObjectAdd("Chat", "PG_CLASS_Group", "", (0x10000 | 0x1))) {
      return;
    }
    if(!pgAtx.ObjectAdd("Msg", "PG_CLASS_Data", "Chat", 0x10000)) {
      return;
    }
    if(!pgAtx.ObjectAdd("File", "PG_CLASS_File", "Chat", 0x10000)) {
      return;
    }
    if(!pgAtx.ObjectAdd("Audio", "PG_CLASS_Audio", "Chat", 0x10000)) {
      return;
    }
    if(!pgAtx.ObjectAdd("Video", "PG_CLASS_Video", "Chat", 65584)) {
      return;
    }
    if(!pgAtx.ObjectAdd("Prvw", "PG_CLASS_Video", "", 0x2)) {
      return;
    }

    var sVal = "(BitRate){128}(FrmRate){125}(KeyFrmRate){6250}(LossAllow){0}";
    pgAtx.ObjectRequest("Video", 2, "(Item){5}(Value){" + pgAtx.omlEncode(sVal) + "}", "");

    // Volume gate    var sVolGate = "(TailLen){10}(VolGate){3}";
    //    pgAtx.ObjectRequest("Audio", 2, "(Item){3}(Value){" +
    // pgAtx.omlEncode(sVolGate) + "}", "");

    pgAtx.ObjectRequest("File", 2, "(Item){0}(Value){2048}", "");
  },

  Clean: function() {
    pgChat.CloseSess();
    pgAtx.ObjectDelete("Prvw");
    pgAtx.ObjectDelete("Video");
    pgAtx.ObjectDelete("Audio");
    pgAtx.ObjectDelete("File");
    pgAtx.ObjectDelete("Msg");
    pgAtx.ObjectDelete("Chat");
    // while (UserList.rows.length > 0) {     UserList.deleteRow(0); }
    pgChat.sTxtTemp = "";
  },

  CloseSess: function() {
    if(pgChat.sPeer != "") {
      // pgChat.sTxtTemp = "关闭视频通话----" + (new Date()).valueOf();
      // pgChat.Send();
      pgChat.VideoStop(1);
      pgAtx.ObjectRequest("Chat", (s_uMethCmnButt + 0), "(Action){0}(PeerList){(" + pgChat.sPeer + "){}}", "pgChat.SelUser");
      pgChat.sPeer = "";
    }
  },

  UserTxt: function(sUser) {
    var iInd = sUser.indexOf('@');
    if(iInd > 0) {
      return sUser.substr(iInd + 1);
    }
    return sUser;
  },

  SelUser: function(sUser, uLocal) {
      alert('正在连接机器人直播画面，请稍候...');
    // var sUserTxt = pgChat.UserTxt(sUser);
    if('d94bbc0298274b2aa649e8e9b51c40a6' == sUser) {
      // pgChat.CheckUser(sUser, 0);
      alert("不能选择自己");
      return;
    }
    if(pgChat.sPeer != sUser) {
      setTimeout(()=>{
          pgChat.CloseSess();
          pgAtx.ObjectRequest("Chat", (s_uMethCmnButt + 0), "(Action){1}(PeerList){(" + sUser + "){}}", "pgChat.SelUser");
          pgChat.sPeer = sUser;

          var content = "关闭视频通话";
          var client = Stomp.client(url);
          var onconnect = function(frame) {
            var body = {
              identityMarking: robotId,
              sendMarking: "1",
              kindMarking: "2",
              content: content
            };
            client.send("/topic/" +customId, {}, JSON.stringify(body));
          };
          client.connect(login, passcode, onconnect);

          pgChat.sTxtTemp = content;
          pgChat.Send();

          window.setTimeout(function() {
            pgChat.VideoStart(); //20171106 测试 暂时不发送视频
          }, 500);
      },1000)
     

    } else {
      if(uLocal) {
        pgChat.CloseSess();
      }
    }
  },

  // Enter: function () {     if (event.keyCode == 13) {         pgChat.Send();  }
  // },

  OutHTML: function(sHtml) {
    // chatOut.document.body.insertAdjacentHTML("beforeEnd", sHtml);
    // chatOut.document.body.doScroll("pageDown");
  },

  ShowTxt: function(sData, sPeer) {
    // var dTime = new Date();
    var sTxt = pgAtx.omlGetContent(sData, "Txt");
    // alert('receive msg:' + sTxt + "from speer:" + sPeer);
    // alert(sTxt);
    if(sTxt == '机器人端接收到视频请求') {
      // alert('机器人端接收到视频请求，请稍候...');
    }
  },

  OutString: function(sOut) {
    var sHtml = "<pre style={font-size:12px;word-wrap:break-word;word-break:break-all;white-space" +
      ":normal;}>" + sOut + "</pre>";
    pgChat.OutHTML(sHtml);
  },

  Send: function() {
    if(pgChat.sPeer == "") {
      pgChat.sPeer = 'PGServer@' + robotId;
    }
    if(pgChat.sTxtTemp == "") {
      return;
    }
    pgAtx.ObjectRequest("Msg", (s_uMethCmnButt + 0), "(Txt){" + pgAtx.omlEncode(pgChat.sTxtTemp) + "}", "chatSend");
    var dTime = new Date();
    pgChat.OutHTML("<strong style={color:#0033FF;font-size:12px;}>" + pgChat.UserTxt(s_sUser) + "</strong> <span style={font-size:12px;}>" + dTime.toLocaleString() + "</span>:<pre style={font-size:12px;word-wrap:break-word;word-break:break-all;whi" +
      "te-space:normal;}>" + pgChat.sTxtTemp + "</pre><br>");
    // chatIn.value = "";
  },

  VideoStart: function() {
    if(pgChat.sPeer == "") {
      alert("VideoStart请选中一个用户后再操作");
      return;
    }
    var sWndRect = "(Code){3}(Mode){7}(Rate){66}(Wnd){" + pgAtx.utilGetWndRect() + "}";
    var uErr = pgAtx.ObjectRequest("Video", (s_uMethCmnButt + 0), sWndRect, "pgChat.VideoStart");
    
    if(uErr > 0) {
      debugOutString("pgStartVideo, Video, uErr=" + uErr);
      alert("pgStartVideo, Video, uErr=" + uErr);
      return;
    }
  },
  VideoStop: function(uDirect) {
    pgAtx.ObjectRequest("Prvw", (s_uMethCmnButt + 1), "", "pgChat.PrvwStop");
    pgAtx.ObjectRequest("Video", (s_uMethCmnButt + 1), "", "pgChat.VideoStop");
  },

  VideoHandle: function(uAction, uHandle, sPeer) {
    var sData = "";
    var uErrCode = 0;
    if(uAction) { // Accept
      pgChat.SelUser(sPeer, 0);
      // pgChat.VideoStart();//20171106
      if(sessionStorage.infrared_open == 'true') {

        sData = "(Code){3}(Mode){3}(Rate){66}(Wnd){" + pgAtx.utilGetWndRect() + "}";
      } else if(sessionStorage.infrared_open == 'false' || sessionStorage.infrared_open == undefined) {
        sData = "(Code){3}(Mode){7}(Rate){66}(Wnd){" + pgAtx.utilGetWndRect() + "}";
      }

    } else { // Reject.
      uErrCode = 1;
      alert("&nbsp;&nbsp;<input type='button' value='打开视频VideoHandle' onclick='pgChat.VideoSt" +
        "art()'>");
    }
    pgAtx.ObjectExtReply("Video", uErrCode, sData, uHandle);
    return -1;
  },

  VideoReq: function(sData, sPeer, uHandle) {
    // alert('收到视频请求：'+sPeer);
    // alert(sessionStorage.infrared_open+sPeer);
    pgChat.VideoHandle(1, uHandle, sPeer);
    return -1; // Async reply
  },

  VideoReply: function(uErr, sData) {
    if(uErr != 0) {
      pgAtx.ObjectRequest("Prvw", (s_uMethCmnButt + 1), "", "pgChat.PrvwStop");
      pgChat.OutString("对方拒绝视频通话");
      // alert("对方拒绝视频通话");
    } else {
      // alert("正在视频通话...");
    }
  },

  VideoCamera: function(uOption) {
    var sTempPath = pgAtx.utilCmd("PathGet", "(Type){Temp}");
    debugOutString(sTempPath);
    if(uOption != 0) {
      var sData = "(Peer){}(Path){" + sTempPath + "\\" + s_sUser + ".jpg}";
      pgAtx.ObjectRequest("Prvw", (s_uMethCmnButt + 5), sData, "pgChat.PrvwCamera");
    } else {
      var sData = "(Peer){}(Path){" + sTempPath + "\\" + pgChat.sPeer + ".jpg}";
      pgAtx.ObjectRequest("Video", (s_uMethCmnButt + 5), sData, "pgChat.VideoCamera");
    }
  },

  VideoSavePicture: function(sData) {
    var sSrcFile = pgAtx.omlGetContent(sData, "Path");
    if(sSrcFile != "") {
      var sFile = sSrcFile;
      var iInd = sSrcFile.lastIndexOf('\\');
      if(iInd > 0) {
        sFile = sSrcFile.substr(iInd + 1);
      }
      var sParam = "(Src){" + pgAtx.omlEncode(sSrcFile) + "}(Dst){}(Filter){}";
      var sDstInfo = pgAtx.utilCmd("FileCopy", sParam);
      pgChat.OutString(pgAtx.omlGetContent(sDstInfo, "Path"));
    }
  },

  VideoTransfer: function(uFlag) {
    var sData = "(Peer){}(Local){" + uFlag + "}(Remote){" + uFlag + "}";
    pgAtx.ObjectRequest("Video", (s_uMethCmnButt + 7), sData, "pgChat.VideoTransfer");
  },

  AudioStart: function() {
    if(pgChat.sPeer == "") {
      alert("请选中一个用户后再操作");
      return;
    }
    var sData = "(Code){1}(Mode){0}";
    var iErr = pgAtx.ObjectRequest("Audio", (s_uMethCmnButt + 0), sData, "pgChat.AudioStart");
    if(iErr > 0) {
      debugOutString("AudioStart, uErr=" + iErr);
      return
    }
    alert("正在等待对方接受语音……");
    // ctlAudio.innerHTML = "&nbsp;&nbsp;正在等待对方接受……  " + "<input type='button'
    // value='取消' onclick='pgChat.AudioStop(1)'>";
  },
  AudioStop: function(uDirect) {
    if(uDirect != 0) {
      pgAtx.ObjectRequest("Audio", (s_uMethCmnButt + 1), "", "pgChat.AudioStop");
    }
    // ctlAudio.innerHTML = "&nbsp;&nbsp;<input type='button' value='打开音频'
    // onclick='pgChat.AudioStart()'>";
  },
  AudioHandle: function(uAction, uHandle, sPeer) {
    if(uAction) { // Accept
      pgChat.SelUser(sPeer, 0);
      alert("正在音频通话……");
      // ctlAudio.innerHTML = "&nbsp;&nbsp;正在音频通话…… <input type='button' value='关闭音频'
      // onclick='pgChat.AudioStop(1)'>";
      pgAtx.ObjectExtReply("Audio", 0, "(Code){1}(Mode){0}", uHandle);
      pgChat.AudioGetVolume(0);
      pgChat.AudioGetVolume(1);
    } else { // Reject.
      // ctlAudio.innerHTML = "&nbsp;&nbsp;<input type='button' value='打开音频' onclick='pgChat.AudioStart()'>";
      pgAtx.ObjectExtReply("Audio", 1, "", uHandle);
    }
    return -1;
  },
  AudioReq: function(sData, sPeer, uHandle) {
    if(pgChat.sPeer != "" && pgChat.sPeer != sPeer) {
      return 1;
    }
    alert("&nbsp;&nbsp;(" + pgChat.UserTxt(sPeer) + ")请求音频交谈……  ");
    return -1; // Async reply
  },
  AudioReply: function(uErr, sData) {
    if(uErr != 0) {
      pgChat.OutString("对方拒绝音频通话");
      alert('对方拒绝音频通话');
    } else {
      alert('正在音频通话……');
    }
  }
}

function pgInitialize() {
  // alert('pgInitialize');
  pgAtx.Control = "Type=1;Sandbox=e:\\work\\TestRoom\\im;Popup=1"; //连接类型 沙盒路径
  // pgAtx.Node = "Type=0;SKTBufSize2=96;SKTBufSize3=2048;Option=1";
  pgAtx.Node = "Type=0;SKTBufSize2=256;P2PTryTime=3605;Option=0x01"; // 节点类型、节点性能参数
  pgAtx.Class = "PG_CLASS_Data:4;PG_CLASS_File:64;PG_CLASS_Audio:4;PG_CLASS_Video:4;PG_CLASS_Boar" +
    "d:4;PG_CLASS_Share:128;PG_CLASS_Table:4;PG_CLASS_Live:4"; //指定使能的Peergine 功能类以及每种类的最大实例数
  pgAtx.Local = "Addr=0:0:0:127.0.0.2:0:0"; //本地地址
  pgAtx.Server = "Name=" + s_sServer + ";Addr=120.55.240.188:7781;Digest=1"; //服务设备名称，地址，登录方式；
  pgAtx.Relay = "(Relay0){(Type){0}(Load){0}(Addr){120.55.240.188:443}}";
  pgAtx.OnExtRequest = pgOnExtRequest; //指定一个处理请求的回调函数
  pgAtx.OnReply = pgOnReply; ///指定一个处理应答的回调函数
  if(!pgAtx.Start(0)) {
    alert("初始化失败！");
    return;
  }
  pgLogin();
}

function pgStart(sData) {
  if(!pgAtx.ObjectAdd(s_sOnline, "PG_CLASS_Group", s_sServer, 0x1)) {
    //   alert("Add 'Online' obj failed");
    return;
  }

  var sVal = pgAtx.omlEncode("(Enable){1}(Peer){" + s_sUser + "}(Label){pgATX}");
  pgAtx.ObjectRequest(s_sServer, 2, "(Item){1}(Value){" + sVal + "}", "");

  pgChat.Init();
  //   alert("开启成功！");
}

function pgClean() {
  // alert('pgclean');
  pgLogout();
}

function pgLogin() {
  // alert('登录成功！');

  // s_sUser = s_sServer + '@yrmtest';
  s_sUser = s_sServer + '@d94bbc0298274b2aa649e8e9b51c40a6';
  var sData = "(User){" + s_sUser + "}(Pass){" + s_sUser + "}(Param){}";
  pgAtx.ObjectRequest(s_sServer, (s_uMethCmnButt + 0), sData, "pgLogin");
}

function pgLogout() {
  // alert('dengchu');
  pgChat.CloseSess();
  pgAtx.ObjectDelete(s_sOnline);
  pgAtx.ObjectRequest(s_sServer, (s_uMethCmnButt + 1), "", "pgLogout");
  pgAtx.utilCmd("FileClean", "(Type){Temp}");
  s_sUser = "";
}

function pgOnExtRequest(sObj, uMeth, sData, uHandle, sPeer) {
  //对象名称 方法 参数 句柄 对等节点
  var sReq = (sObj + ':' + uMeth + ':' + sData + ':' + sPeer);
  debugOutString(sReq);
  // 自身节点与服务器节点之间的去同步事件
  if(sObj == s_sUser) {
    if(uMeth == 0) { // PG_METH_COMMON_Sync=0方法
      var sAct = pgAtx.omlGetContent(sData, "Action");
      if(sAct != "1" && sPeer == s_sServer) {
        // 异常离线了。如果设置了自动重新登录选项，则无需处理。
        alert("断线了")
      }
    }
  }

  // 服务器节点事件
  if(sObj == s_sServer) {
    if(uMeth == 0) { // PG_METH_COMMON_Sync=0方法
      var sAct = pgAtx.omlGetContent(sData, "Action");
      if(sAct != "1") { // 服务器节点的去同步事件
        // 异常离线了。如果设置了自动重新登录选项，则无需处理。
        alert('异常离线了')
      }
    } else if(uMeth == 1) { // PG_METH_COMMON_Error=1方法
      var sMeth = pgAtx.omlGetContent(sData, "Meth");
      if(sMeth && parseInt(sMeth) == 32) { // PG_METH_PEER_Login= 32方法
        // 服务器节点的登录方法，上报错误事件
        // 异常离线了。如果设置了自动重新登录选项，则无需处理。
        alert("异常离线")
      }
    }
    return 0;
  }
  if(sObj == "Msg") {
    if(uMeth == (s_uMethCmnButt + 0)) { // receive msg.
      pgChat.ShowTxt(sData, sPeer);
    }
    return 0;
  }

  if(sObj == "Video") {
    if(uMeth == (s_uMethCmnButt + 0)) { // Start Video request
      return pgChat.VideoReq(sData, sPeer, uHandle);
    }
    if(uMeth == (s_uMethCmnButt + 1)) { // Stop Video request
      pgChat.VideoStop(0);
    }
    return 0;
  }

  return 0;
}

function pgOnReply(sObj, uErr, sData, sParam) {
  var sRep = (sObj + ':' + uErr + ':' + sData + ':' + sParam);
  //   alert(sRep);

  if(sObj == s_sServer) {
    if(uErr != 0) {
      return 1;
    }
    if(sParam == "pgLogin") {
      pgStart(sData);
    }
    return 1;
  }

  if(sObj == "Video") {
    if(sParam == "pgChat.VideoStart") {
      pgChat.VideoReply(uErr, sData);
    }
    if(sParam == "pgChat.VideoCamera") {
      pgChat.VideoSavePicture(sData);
    }
    return 1;
  }

  return 1;
}

function debugOutHTML(sHtml) {
  try {
    // debugOut.document.body.insertAdjacentHTML("beforeEnd", sHtml);
    // debugOut.document.body.doScroll("pageDown");
  } catch(e) {}
}

function debugOutString(sOut) {
  // if (debugSwitch.checked) {
  debugOutHTML("<pre style={font-size:12px;word-wrap:break-word;word-break:break-all;white-space" +
    ":normal;}>" + sOut + "</pre>");
  // }

}

//点击左边列表中的‘随工监督’调用的方法
const handleLinkVideo = () => {
  pgClean();
  pgChat.Clean();
  pgInitialize();

  pgChat.SelUser("PGServer@" + robotId, 1); //家里
  pgChat.sTxtTemp = "SendVideoRequestsManually----" + (new Date()).valueOf();
  pgChat.Send();
 
}

const handleCloseVideo =()=>{
   pgChat.sTxtTemp = "关闭视频通话----" + (new Date).valueOf();
   pgChat.Send()
   pgChat.VideoStop(1)
   pgAtx.ObjectRequest("Chat", s_uMethCmnButt + 0, "(Action){0}(PeerList){(" + pgChat.sPeer + "){}}", "pgChat.SelUser");
}

function transformCoor(x,y){
  const a = x-400;
  const b = y-120;
  let l = Math.sqrt(Math.pow(a,2)+Math.pow(b,2));
  let angular = Math.atan2(a,b)*180/Math.PI+39.5;
  let X = l*Math.sin(angular*Math.PI/180)/344
  let Y = (323-l*Math.cos(angular*Math.PI/180))/323
  return {X,Y} 
}
let flag = false;


const realtimeStatus={'0':'空 闲','10':'手工控制中','20':'自动巡检中','30':'随工监督中','40':'充电中','50':'掉  线'};

function renderHeat(Id,type,data,W,H){
    var heatmapInstance = heat.create({
        container: document.getElementById(Id),
          radius: 15,
          maxOpacity: .8,
          minOpacity: 0,
          gradient: {
            '.9': 'blue',
            '.99': 'yellow',
            '1': 'red'  
          }
    });
    //构建一些随机数据点,网页切图价格这里替换成你的业务数据
    var points = [];
    var max = 0;
    var len = data.length;
    while (len--) {
        var item = data[len]
        var val = item[type];
        max = Math.max(max, val);

        let coor = transformCoor(item.positionX,item.positionY);
       
        var point = {
            x:Math.floor(coor.X*W), 
            y:Math.floor(coor.Y*H), 
            value: val
        };
        points.push(point);
    }
    var data = {
        max: max,
        data: points
    };
    //因为data是一组数据,web切图报价所以直接setData
    heatmapInstance.setData(data);
  }

  function newSwiper(con,){
     var swiper = new Swiper(con, {
            direction: 'vertical',
            loop:true,
            slidesPerView: 2,
           // spaceBetween: 30,
            mousewheel: true,
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            speed: 3000,
            autoplay: {
                delay:3000
            }
        });
  }
class App extends Component {
  constructor(props){
    super(props);
    this.state={
     isActive:false,
     mute:false,
     warning:[],
     taskList:[],
     energy:0,
     robotState:'50',
     W:0,
     H:0,
     x:0,
     y:0,
  }
   this.timer=null;
   this.handle=null;

  }
 
  changeState=()=>{
     this.setState({isActive:false});
     try{
        handleCloseVideo();
     }catch{

     }
    
  }
  changeAudio=()=>{
     const {mute} = this.state;
     if(mute){
       try{pgChat.AudioStop(1)}catch{}
       this.setState({mute:false})
     }else{
       try{pgChat.AudioStart() }catch{}
       this.setState({mute:true}) 
     }
  }
  
  drawChart=(title,series)=>{
    var myChart = echarts.init(document.getElementById('main'));
      myChart.setOption({
        title:{
         text:title,
         left:'center',
         y:'24%',
         textStyle:{
            color:'#5b8bce',
            fontStyle:'normal',
            fontWeight:'bold',
            fontFamily:'sans-serif',
    　　　　   fontSize:30
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: "{a} <br/>{b}: {c} ({d}%)"
        },
        color:['#66cd66','#ff9725'],//['red','yellow','blueviolet'],
        legend: {
            orient: 'vertical',
            x: 'center',
            bottom:'6%',
            textStyle:{ 
                color: '#5b8bce',
                fontSize:16
            },
            data:[ '已完成任务','未完成任务']
        },
        series: [
            {
                name:'访问来源',
                type:'pie',
                radius: ['32%', '54%'],
                center: ['50%','30%'],
                avoidLabelOverlap: false,
                label: {
                    normal: {
                        show: false,
                        position: 'center'
                    },
                    emphasis: {
                        show: false,
                        textStyle: {
                            fontSize: '0',
                        }
                    }
                },
                labelLine: {
                    normal: {
                        show: false
                    }
                },
                data: series
            }
        ]
      });
      window.onresize = function() {
          myChart.resize();
      }
  }
  handleLink=()=>{
    try{
      handleLinkVideo()
       this.setState({isActive:true});
    }catch{
      message.error('使用IE浏览器浏览');
       this.setState({isActive:false});
    }
  
  }
  handleWaring=()=>{
    let para = qs.stringify({
      robotId,
      starttime:moment().subtract(7, 'days').format('YYYY-MM-DD HH:mm:ss'),
      endtime:moment().format("YYYY-MM-DD HH:mm:ss")
    })
    axios({
      url:"/listCollectInfos",
      method:'post',
      data:para,
    }).then((res) => {
        if(res.data.data){
           this.setState({warning:res.data.data});
           newSwiper('.swiper-container');
        }else{
           this.setState({warning:[]})
        }
    }).catch((err) => {
        console.log(err)
    });
  }
  handleTask=()=>{
      let para = qs.stringify({
       robotId,
       starttime:moment().subtract(5, 'days').format('YYYY-MM-DD HH:mm:ss'),
       endtime:moment().format("YYYY-MM-DD HH:mm:ss")
      })
      axios({
        url:"xm/getTaskCurrentVO",
        method:'post',
        data:para,
      }).then((res) => {
          if(res.data.data){
            let data = res.data.data;
            let task= data.rbTaskCurrents.filter(i=>(i.taskStatus==2));
            this.setState({taskList:task.slice(-3)});
            let title = parseInt(data.percentageComplete*100)+'%';
            let series = [{value:data.finishedTaskNumber,name:'已完成任务'},{value:data.uncompletedTaskNumber,name:'未完成任务'}]
            this.drawChart(title,series)
          }else{
             this.setState({taskList:[]});
             this.drawChart('demo',[{value:20,name:'已完成任务'},{value:8,name:'未完成任务'}])
          }
      }).catch(e=>{
        console.log(e);
      })  
  }
  handleResult=()=>{
     let para = qs.stringify({
          robotId,
          starttime:moment().subtract(1, 'days').format('YYYY-MM-DD HH:mm:ss'),
          endtime:moment().format("YYYY-MM-DD HH:mm:ss")
      })
      axios({
        url:"/listHumitures",
        method:'post',
        data:para,
      }).then((res) => {
          let {W,H} = this.state;
          if(res.data.data){
            renderHeat('temp',"temperature",res.data.data,W,H)
            renderHeat("humi","humidity",res.data.data,W,H)
          } 
      }).catch((err) => {
          console.log(err)
      });
  }
  handleRobotReal=()=>{
    let _this= this;
    let para = qs.stringify({
           robotId,
        })
        axios({
          url:"/getRobotRealTime",
          method:'post',
          data:para,
        }).then((res) => {
           if(res.data.data){
             let robotRealtime = res.data.data[0].robotRealtime;
             robotRealtime&&_this.setState({energy:robotRealtime.energy,robotState:robotRealtime.realtimeStatus,x:robotRealtime.robotX,y:robotRealtime.robotY});
             _this.renderRobotPositon()
           }else{
             _this.setState({energy:0,robotState:'50',x:0,y:0})
           }
     })
  
    this.handle = setInterval(()=>{
       let para = qs.stringify({
             robotId,
        })
        axios({
          url:"/getRobotRealTime",
          method:'post',
          data:para,
        }).then((res) => {
           if(res.data.data){
             let robotRealtime = res.data.data[0].robotRealtime;
             robotRealtime&&_this.setState({energy:robotRealtime.energy,robotState:robotRealtime.realtimeStatus,x:robotRealtime.robotX,y:robotRealtime.robotY});
           }else{
             _this.setState({energy:0,robotState:'50',x:0,y:0})
           }
        })
    },30000)
  }
  renderHeat=()=>{
    var heatmapInstance = heat.create({
        container: document.getElementById('heatmap'),
          radius: 30,
          maxOpacity: .5,
          minOpacity: 0,
          blur: .85,
          gradient: {
            '.5': 'blue',
            '.8': 'yellow',
            '.95': 'red'
          }
    });
    //构建一些随机数据点,网页切图价格这里替换成你的业务数据
    var points = [];
    var max = 0;
    var width = 600;
    var height = 400;
    var len = 200;
    while (len--) {
        var val = Math.floor(Math.random()*100);
        max = Math.max(max, val);
        var point = {
            x: Math.floor(Math.random()*width),
            y: Math.floor(Math.random()*height),
            value: val
        };
        points.push(point);
    }
    var data = {
        max: max,
        data: points
    };
    //因为data是一组数据,web切图报价所以直接setData
    heatmapInstance.setData(data);
  }
  drawStar=(context,img)=>{
    const {x,y}= this.state;
    flag = !flag;  
    context.clearRect(0,0,768,640)
    context.drawImage(img,0,0,768,640,0,0,768,640);
    if(flag){
      context.beginPath();
      context.arc(x,(640-y),5,0,2*Math.PI);
      context.fillStyle="red";
      context.fill();
      context.stroke();
    }
}
  renderRobotPositon=()=>{
    var canvas=document.getElementById('canvas');
    var context=canvas.getContext("2d");
        context.translate(384,320);
        context.rotate(39.2*Math.PI/180); 
        context.translate(-900,-530);
        context.scale(2,2)
    //绘制图片
    var img=new Image();
    img.src=roomInit;
    let _this = this;
    img.onload=function(){
       if(this.timer){clearInterval(this.timer)}
       this.timer=setInterval(()=>{_this.drawStar(context,img)},500)  
    }
  }
  init=()=>{
     pgAtx = document.getElementById('pgAtx');
      var wrap = document.getElementById('heatmap');
      this.setState({W:wrap.offsetWidth,H:wrap.offsetHeight});
      this.handleWaring();
      this.handleTask();
      this.handleResult();
      this.handleRobotReal();
      this.renderHeat();
  }
  componentDidMount() {
    this.init();
  }
  componentWillUnmount(){
     if(this.handle){
        clearInterval(this.handle);
        this.handle=null;
     }
     if(this.timer){
         clearInterval(this.timer);
        this.timer=null;
     }
  }
  render() {
    const  {isActive,warning ,taskList,energy,robotState,mute} = this.state;
    return (
       <React.Fragment>
           <div style={{height:'50%'}}>
               <Col span={5} className="warning">
                   <div className="danger">
                      <img src={danger} alt="警告"/>
                      <div className="danger_content">本周告警{warning.length}条</div>
                   </div>
                   <div className="swiper-container">
                     <div className="swiper-wrapper">
                     {
                       warning.map(key=>{
                         return(
                            <div key={key.infoId}  className="swiper-slide">
                              <Col span={5} className="meta_serial">
                                  <span className="meta_icon"></span>
                              </Col>
                              <Col span={19} className="meta">
                                 <div className="meta_title">{key.mark}</div>
                                 <div className="meta_content">告警时间:{moment(key.timeStamp).format('YYYY-MM-DD HH:mm:ss')}</div>
                                 <div className="meta_status">{key.operationStatus===10?<Tag color="orange">未处理</Tag>:<Tag color="success">已处理</Tag>}</div>
                              </Col>
                            </div>  
                         )
                       })
                     }
                     </div>
                   </div> 
               </Col>
               <Col span={11} className="viewport">
                  <div onClick={this.handleLink} className= "switch video_position">
                      <img src={isActive?video:unvideo} alt=""/>
                  </div>
                  <div onClick={this.changeState} className="switch task_position">
                      <img src={isActive?untask:task} alt=""/>
                  </div>
                  <div className="video">
                     <object id="pgAtx" classID="clsid:FFC9369F-A8D9-4598-8E22-ED07C7628BFC" width="100%" height="100%"></object>
                  </div>
                  <div className="switch audio_position" onClick={this.changeAudio}>
                      {isActive?(<img src={mute?audio:unaudio} alt=""/>):null} 
                  </div>
               </Col>
               <Col span={8} className="task">                
                 <Col span={12} className="task_chart">
                    <div className="task_title">已执行任务</div>
                    <div id="main" className="task_content"></div>
                 </Col>
                 <Col span={12} className="task_decration">
                      <div className="task_title">未执行任务</div>
                       <div className="task_content task_mate">
                       {
                         taskList.map(item=>{
                           return(
                              <div key={item.startTime}>
                                  <div className="task_name">
                                    <span className="meta_icon"></span>
                                    <span>{item.taskName}</span>
                                  </div>
                                  <div>
                                    <span>计划开始时间：</span>
                                    <span>{moment(item.startTime).format("HH:mm:ss")}</span>
                                  </div>
                                  <div className="hr"></div>
                              </div>
                           )
                         })
                       }
                       </div>
                 </Col>
               </Col>
           </div>
           <div style={{height:'50%'}}>
              <Col span={5} className="robotBox">
               <Row gutter={18} className="step"> 
                  <Col span={15} offset={2} className="step_wrap" ref='en'>
                    <div style={{width:energy+'%'}} className="energy"></div>
                  </Col>
                  <Col span={6} className="step_num">{energy+'%'}</Col>
               </Row>
               <div>
                  <Col span={15} style={{position:'relative'}}>
                     <img src={robot} alt="机器人" className="robotImg"/>
                  </Col>
                  <Col span={9}>
                    <div className="robot_status">{realtimeStatus[robotState+'']}</div>
                    <div className="robot_health">
                       <div className="health_grade">
                        <span>
                          <img src={Heart} alt="flag"/>
                       </span>
                       <span>100%</span>
                       </div>
                       <div className="fault_count">今日故障0个</div>
                    </div>
                  </Col>
               </div>
              </Col>
              <Col span={19} className="resultBox">
                <Row gutter={60} className="result">
                   <Col span={6}>
                     <div className="result_title">
                        <img src={circle} alt="" width="100%" height="100%"/>
                        <span>机器人实时位置</span>
                      </div>
                      <div className="result_img">
                         <canvas id="canvas" width="700" height="660"></canvas>
                      </div>   
                   </Col>
                   <Col span={6}>
                     <div className="result_title">
                        <img src={circle} alt="" width="100%" height="100%"/>
                        <span>机房温度分布图</span>
                      </div>
                      <div className="result_img">
                         <div id="humi" className="container"></div>  
                      </div> 
                   </Col>
                   <Col span={6}>
                     <div className="result_title">
                        <img src={circle} alt="" width="100%" height="100%"/>
                        <span>机房湿度分布图</span>
                      </div>
                      <div  className="result_img">
                         <div id="temp" className="container"></div>  
                      </div> 
                   </Col>
                   <Col span={6}>
                     <div className="result_title">
                        <img src={circle} alt="" width="100%" height="100%"/>
                        <span>机柜红外线图</span>
                      </div>
                      <div className="result_img">
                         <div id="heatmap" className="container"></div>  
                      </div>  
                   </Col>
                </Row>
              </Col>
           </div>
       </React.Fragment>
    );
  }
}

export default App;

