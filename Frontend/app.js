//app.js
const TotalVotes = 6;
const Promise = require('./utils/promise.js')


App({
  onLaunch: function () {
    const vm = this
    let res = wx.getSystemInfoSync();
    if (res.platform == 'android') {
      let customNavBarHeight = res.statusBarHeight + res.screenWidth * 96 / 750;
      vm.globalData.topNavigatorHeight = customNavBarHeight
    } else {
      let customNavBarHeight = res.statusBarHeight + res.screenWidth * 88 / 750;
      vm.globalData.topNavigatorHeight = customNavBarHeight
    }
  },
  globalData: {
    openId: null,
    nominees: [],
    votedList: [],
    remainingVotes: -1,
    scrollToDistance: 443 * 2 * wx.getSystemInfoSync().windowWidth / 750
  },
  baseUrl: "https://yst.fudan.edu.cn/redCarpet/api",
  // baseUrl: "https://10.107.11.223/redCarpet/api",
  getOpenId: function () {
    let that = this;
    return new Promise(
      function (resolve, reject) {
        wx.login({
          success: res => {
            
            // 发送 res.code 到后台换取 openId, sessionKey, unionId
            wx.request({
              url: that.baseUrl + '/user/login?code=' + res.code,
              success: function (res) {
                if(res.data.status==1){
                  let data = JSON.parse(res.data.data);
                  console.log("openId: ", data.openid);
                  that.globalData.openId = data.openid;
                  resolve("get openId successfully...");
                }
                else{
                  wx.showToast({
                    title: res.data.msg,
                    icon: 'none',
                    duration: 1000,
                  })
                }
              },
              fail: function(res) {
                wx.showToast({
                  title: "服务器正忙，请稍后再试",
                  icon: 'none',
                  duration: 1000,
                })
              }
            })
          },
          fail: res => {
            wx.showToast({
              title: "服务器正忙，请稍后再试",
              icon: 'none',
              duration: 1000,
            })
          }
        })
      }
    )
  },

  loadGLobalData: function () {
    //console.log("enter function");
    let that = this;
    return new Promise(
      function (resolve, reject) {
        //get nominees logic
        wx.request({
          url: that.baseUrl + '/nominee/all',
          success: function (res) {
            if (res.data.status == 1) {
              console.log("nominee list: ", res.data.data);
              that.globalData.nominees = res.data.data;
              
              //if success, then get voted list
              wx.request({
                url: that.baseUrl + '/user/voted?openId=' + that.globalData.openId,
                success: function (res1) {
                  if (res1.data.status == 1) {
                    console.log("voted list", res1.data.data);
                    that.globalData.votedList = res1.data.data;
                    that.globalData.remainingVotes = TotalVotes - that.globalData.votedList.length;
                    //done, then resolve
                    resolve("Load data successfully...");
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
            //console.log("fail");
            wx.showToast({
              title: "服务器正忙，请稍后再试",
              icon: 'none',
              duration: 1000,
            })
          }
        });
      }
    )
  },
})