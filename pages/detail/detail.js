// pages/detail/detail.js
const Promise = require('../../utils/promise.js')

const app = getApp();
let touchDot = 0;
let time = 0;
let interval = "";
let drawTimer = null;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: -1,
    remainingVotes: 0,
    candidate: null,
    shareImgPath:"",
    showShareImg:0,
    actionSheetHidden: true,
    acodeSrc:"",
    cancelHeight:100,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    let id = options.id;
    if (app.globalData.remainingVotes==-1){
      //need load add first
      app.loadGLobalData().then(
        () =>{
          that.loadDetail(id);
        }
      )
    }
    else{
      this.loadDetail(id);
    }
    this.fadeIn();
    this.fadeOut();
    let res = wx.getSystemInfoSync();
    if(res.platform=="ios"){
      if (res.screenHeight/res.screenWidth>1.78){
        //iphone x
        this.setData({
          cancelHeight:168
        })
      }
    }
  },

  loadDetail: function(id){
    let that =this;
    wx.request({
      url: app.baseUrl + '/nominee/detail?id=' + id,
      success: function (res) {
        if (res.data.status == 1) {
          console.log("Detail for ", id, res.data.data);
          that.data.candidate = res.data.data;
          // that.data.candidate.story = that.data.candidate.story.replace("",);//处理换行
          if (app.globalData.votedList.includes(that.data.candidate.id) || app.globalData.votedList.length >= 6) {
            that.data.candidate.votable = 0;
          }
          else {
            that.data.candidate.votable = 1;
          }
          that.setData({
            candidate: that.data.candidate,
            remainingVotes: app.globalData.remainingVotes
          })
        }
        else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 1000,
          })
        }
      },
      fail: function (res) {
        wx.showToast({
          title: "服务器正忙，请稍后再试",
          icon: 'none',
          duration: 1000,
        })
      }
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    setInterval(this.preloadSrc,1000);
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    console.log("share logic here");
    return {
      title: "复旦大学2019届毕业红毯提名投票",
      path: "pages/home/home?nomineeId=" + this.data.candidate.id,
      // imageUrl: this.data.candidate.photoUrls[0]
    }
  },

  vote: function (e) {
    let id = e.currentTarget.dataset.voteId;
    let that = this;
    // console.log("vote logic here");
    console.log("vote for ", id);
    wx.request({
      url: app.baseUrl + '/user/vote?openId=' + app.globalData.openId,
      method: "POST",
      data: id,
      success: function (res) {
        if (res.data.status == 1) {
          wx.showToast({
            title: '投票成功！',
            icon: 'succes',
            duration: 1000,
            mask: true
          });
          that.updateVotes(id, res.data.data);
          app.globalData.votedList.push(id);
          app.globalData.remainingVotes = app.globalData.remainingVotes - 1;
          that.data.candidate.votable = 0;
          that.data.candidate.votes = res.data.data;
          that.setData({
            candidate: that.data.candidate,
            remainingVotes: app.globalData.remainingVotes
          });
        }
        else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 1000,
          })
        }

      },
      fail: function (res) {
        wx.showToast({
          title: "服务器正忙，请稍后再试",
          icon: 'none',
          duration: 1000,
        })
      }
    })
  },

  previewImg: function(e) {
    let that = this;
    let index = e.currentTarget.dataset.index;
    let urls = [];
    urls.push(app.baseUrl + "/image/" + that.data.candidate.photoUrl1);
    if (that.data.candidate.photoUrl2 != ""){
      urls.push(app.baseUrl + "/image/" + that.data.candidate.photoUrl2);
    }
    wx.previewImage({
      current: urls[index],
      urls: urls,
    });
  },

  updateVotes: function (id, votes) {
    let nominee;
    for (nominee of app.globalData.nominees) {
      if (nominee.id == id) {
        nominee.votes = votes;
        return;
      }
    }
  },

  drawShareImgWrapper: function(){
    wx.showLoading({
      title: '正在生成图片',
    })
    this.data.shareImgPath="";
    this.drawShareImg();
    drawTimer = setInterval(this.drawShareImg,1000);
  },

  drawShareImg: function(){
    let that = this;
    if(this.data.acodeSrc=="" || this.data.shareImgPath=="" || this.data.candidate==null){
    // if (this.data.acodeSrc == "") {
      console.log("Information not ready...");
      return;
    }
    clearInterval(drawTimer);
    wx.hideLoading();
    const ctx = wx.createCanvasContext('shareCanvas');
    // console.log("drawing...", this.data.shareImgPath);
    // ctx.drawImage(this.data.shareImgPath, 0, 0, 250, 350); 

    if (this.countLength(this.data.candidate.name) > 16){//two line
      ctx.drawImage('../../image/double' + this.data.shareImgPath + '.png', 0, 0, 250, 225.5);
      ctx.drawImage(this.data.acodeSrc, 178, 41, 45, 45);
      //text part
      ctx.font = "normal bold 7px -apple-system, BlinkMacSystemFont, Helvetica Neue, Roboto, Arial, PingFang SC, Hiragino Sans GB, Source Han Sans SC, Source Han San CN, 思源黑体 CN, Microsoft Yahei, Microsoft JhengHei, sans-serif";
      ctx.setFillStyle("#FFFFFF")
      ctx.fillText("#" + this.add_zero_to_fourbits(this.data.candidate.id), 23, 34.5);
      ctx.draw();
      let str = this.data.candidate.name;
      let len = 0;
      let i;
      for (i = 0; i < str.length; i++) {
        let c = str[i];
        if (c.match(/[\u0000-\u00ff]/g)) {
          len++;
          if (len == 15 || len == 16) {
            break;
          }
        }
        else {
          len += 2;
          if (len == 15 || len == 16) {
            break;
          }
        }
      }
      //draw two line
      ctx.font = "normal bold 16px -apple-system, BlinkMacSystemFont, Helvetica Neue, Roboto, Arial, PingFang SC, Hiragino Sans GB, Source Han Sans SC, Source Han San CN, 思源黑体 CN, Microsoft Yahei, Microsoft JhengHei, sans-serif";
      ctx.setFillStyle("#1D3149")
      ctx.fillText(this.data.candidate.name.substring(0, i + 1), 20, 58);
      ctx.fillText(this.data.candidate.name.substring(i + 1), 20, 78);
      ctx.font = "normal normal 9px -apple-system, BlinkMacSystemFont, Helvetica Neue, Roboto, Arial, PingFang SC, Hiragino Sans GB, Source Han Sans SC, Source Han San CN, 思源黑体 CN, Microsoft Yahei, Microsoft JhengHei, sans-serif";
      ctx.setFillStyle("#616B7B")
      ctx.fillText(this.data.candidate.introduction, 20, 95);
      ctx.draw(true);
    }
    else{
      ctx.drawImage('../../image/single' + this.data.shareImgPath + '.png', 0, 0, 250, 225.5);
      ctx.drawImage(this.data.acodeSrc, 178, 41, 45, 45);
      //text part
      ctx.font = "normal bold 7px -apple-system, BlinkMacSystemFont, Helvetica Neue, Roboto, Arial, PingFang SC, Hiragino Sans GB, Source Han Sans SC, Source Han San CN, 思源黑体 CN, Microsoft Yahei, Microsoft JhengHei, sans-serif";
      ctx.setFillStyle("#FFFFFF")
      ctx.fillText("#" + this.add_zero_to_fourbits(this.data.candidate.id), 23, 44);
      ctx.draw();
      ctx.font = "normal bold 16px -apple-system, BlinkMacSystemFont, Helvetica Neue, Roboto, Arial, PingFang SC, Hiragino Sans GB, Source Han Sans SC, Source Han San CN, 思源黑体 CN, Microsoft Yahei, Microsoft JhengHei, sans-serif";
      ctx.setFillStyle("#1D3149")
      ctx.fillText(this.data.candidate.name, 20, 67);
      ctx.draw(true);
      ctx.font = "normal normal 9px -apple-system, BlinkMacSystemFont, Helvetica Neue, Roboto, Arial, PingFang SC, Hiragino Sans GB, Source Han Sans SC, Source Han San CN, 思源黑体 CN, Microsoft Yahei, Microsoft JhengHei, sans-serif";
      ctx.setFillStyle("#616B7B")
      ctx.fillText(this.data.candidate.introduction, 20, 82);
      ctx.draw(true);
    }
  },



  saveImgLocal: function(){
    let that = this;
    wx.canvasToTempFilePath({
      canvasId: 'shareCanvas',
      success: function (res) {
        console.log(res.tempFilePath)
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: function () {
            wx.showToast({
              title: '保存图片成功！',
              icon: "success"
            }),
            that.setData({
              showShareImg: 0
            })
          },
          fail: function (res) {
            console.log(res);
            wx.showToast({
              title: '保存图片失败！',
              icon: "none"
            })
          }
        })
      },
    })
  },

  hideShareImg: function(){
    this.setData({
      showShareImg: 0
    }),
    this.fadeOut();
  },

  showShareImg: function(){
    // this.drawShareImg();
    this.drawShareImgWrapper();
    this.setData({
      showShareImg: 1,
      actionSheetHidden:true
    }),
    this.fadeIn();

  },

  bindItemTap: function(){
    this.setData({
      actionSheetHidden:true
    })
  },

  fadeIn: function() {
    var animation = wx.createAnimation({
      duration: 0,
      timingFunction: 'step-end',
    })
    animation.opacity(1).scale(0.8, 0.8).step();
    this.setData({
      animationData: animation.export()
    })
    animation = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease',
      // transformOrigin: '0% 0%'
    })
    animation.opacity(0).scale(1.0, 1.0).step({duration:2})
    animation.opacity(1).step({duration:200})
    this.setData({
      animationData: animation.export()
    })

    var animationBg = wx.createAnimation({
      duration: 200,
      timingFunction: 'step-start',
    })
    animationBg.opacity(0).step()
    animationBg = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease',
    })
    animationBg.opacity(0.5).step()
    this.setData({
      animationBgData: animationBg.export()
    })
  },

  fadeOut: function(){
    var _this = this
    var animation = wx.createAnimation({
      duration: 2000,
      timingFunction: 'ease',
    })
    animation.opacity(0).scale(0.8, 0.8).step();
    this.setData({
      animationData: animation.export()
    })

    var animationBg = wx.createAnimation({
      duration: 2000,
      timingFunction: 'ease',
    })
    animationBg.opacity(0).step()
    this.setData({
      animationBgData: animationBg.export()
    })

    // setTimeout(function () {
    //   this.setData({
    //     showModalDlg: false
    //   })
    // }.bind(this), 200)
  },

  actionSheetTap: function (e) {
    this.setData({
      actionSheetHidden: !this.data.actionSheetHidden
    })
  },
  actionSheetChange: function (e) {
    this.setData({
      actionSheetHidden: !this.data.actionSheetHidden
    })
  },

  //pre load
  preloadSrc: function(){
    this.downloadacode();
    // this.downloadBackgound();
    this.getRandomBackground();
  },

  downloadacode: function(){
    if(this.data.candidate==null || this.data.acodeSrc!=""){
      return;
    }
    else{
      let that = this;
      wx.downloadFile({
        url: app.baseUrl + '/wx/wxacode?scene=' + this.data.candidate.id,
        success: function(res){
          console.log("acode load successfully~");
          that.data.acodeSrc = res.tempFilePath
        }
      })
    }
  },
  downloadBackgound: function(){
    if (this.data.shareImgPath != "") {
      return;
    }
    else{
      let that = this;
      wx.getImageInfo({
        src: app.baseUrl + '/image/share',
        success: function (res) {
          console.log("background load successfully~");
          that.data.shareImgPath = res.path;
        }
      })
    }
  },

  getRandomBackground: function(){
    if(this.data.shareImgPath!=""){
      return;
    }
    let index = parseInt(Math.random() * 9)+1;
    this.data.shareImgPath=index;
    // let that = this;
    // wx.getImageInfo({
    //   src: '../../image/' + index + '.png',
    //   // src: '../../image/1.png',
    //   success: function(res){
    //     console.log("adsfadsf")
    //     console.log(res);
    //     that.data.shareImgPath = res.path;
    //   },
    //   fail: function(res){
    //     console.log(res);
    //   }
    // })
  },

  add_zero_to_fourbits: function (num) {
    for (var len = (num + "").length; len < 4; len = num.length) {
      num = "0" + num;
    }
    return num;
  },

  countLength: function(str) {
    let len = 0;
    for (let i = 0; i < str.length; i++){
      let c = str[i];
      if (c.match(/[\u0000-\u00ff]/g)) {
        len++;
      }
      else {
        len += 2;
      }
    }
    return len;
  }
})