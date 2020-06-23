// pages/home/home.js
const app = getApp();
const util = require("../../utils/util.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
      top: 0,
      statistics: {
        nomineeNumber: 0,
        voteNumber: 0,
        endTime: null
      },
      remainingVotes: 0,
      nominationList: [],
      hottest: 0,
      timer: null,
      leftDays: '0',
      leftHours: '0',
      leftMinutes: '0',
      leftSeconds:'0',
      searchKey: "",
      totalVoted: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("On load:", options);

    wx.request({
      url: 'https://yst.fudan.edu.cn/redCarpet/api/user/test',
      success: res => {
        console.log(res);
        if (res.statusCode != 200 || !res.data.status || res.data.status != 1) {
          wx.redirectTo({
            url: '../error/error',
          })
        }
      },
      fail: res => {
        console.log("hello", res);
        wx.redirectTo({
          url: '../error/error',
        })
      }
    })

    if (options.nomineeId){
      wx.navigateTo({
        url: '../detail/detail?id=' + options.nomineeId,
      })
    }
    if(options.scene){
      const scene = decodeURIComponent(options.scene)
      console.log("scene: ", scene);
      wx.navigateTo({
        url: '../detail/detail?id=' + scene,
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    const vm = this
    vm.setData({
      topNavigatorHeight: getApp().globalData.topNavigatorHeight
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.refreshPage();
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
    // console.log("refresh!");
    // wx.showNavigationBarLoading();
    // wx.hideNavigationBarLoading();
    // wx.stopPullDownRefresh();
    // console.log("refresh occur!");
    this.refreshPage();
    wx.showLoading({
      title: '正在刷新',
    })
    setTimeout(() => {
      wx.stopPullDownRefresh()
      wx.hideLoading()
      wx.showToast({
        title: '刷新成功！',
        icon: 'succes',
        duration: 1000,
        mask: true
      });
      },1000)
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

  },

  onPageScroll: function (e) {
    // console.log(e.scrollTop);
    this.setData({
      top: e.scrollTop
    })
  },

  countDown: function(curTime, endTime) {
    let leftTime = endTime - curTime;
    let that = this;
    that.data.timer = setInterval(function () {
      leftTime = leftTime-1000;
      //倒计时结束
      if (leftTime <= 1) {
        clearInterval(that.data.timer);
        that.setData({
          leftDays: '00',
          leftHours: '00',
          leftMinutes: '00',
          leftSeconds: '00',
          timer: null
        })
        return;
      }

      let leftSecond = parseInt(leftTime / 1000);
      let Day = Math.floor(leftSecond / (60 * 60 * 24)); //天数
      let Hour = Math.floor((leftSecond - Day * 24 * 60 * 60) / 3600); //小时
      let Minute = Math.floor((leftSecond - Day * 24 * 60 * 60 - Hour * 3600) / 60); //分钟
      let Second = Math.floor(leftSecond - Day * 24 * 60 * 60 - Hour * 3600 - Minute * 60); //秒数
      if (Day >= 0 || Hour >= 0 || Minute >= 0 || Second >= 0) {
        that.setData({
          leftDays: Day < 10 ? '0' + Day : Day,
          leftHours: Hour < 10 ? '0' + Hour : Hour,
          leftMinutes: Minute < 10 ? '0' + Minute : Minute,
          leftSeconds: Second < 10 ? '0' + Second : Second,
        })
      }
    }, 1000)
  },

  idSequence: function(e) {
    let nominees = this.data.nominationList;
    let i;
    for (i = 1; i < nominees.length; i++) {
      let nominee = nominees[i];
      let j = i - 1;
      while (j >= 0 && nominees[j].id > nominee.id) {
        nominees[j + 1] = nominees[j];
        j--;
      }
      nominees[j + 1] = nominee;
    }
    this.setData({
      nominationList: nominees,
      hottest: 0
    })
    if (this.data.top > app.globalData.scrollToDistance) {
      wx.pageScrollTo({
        scrollTop: app.globalData.scrollToDistance,
        duration: 0
      })
    }
  },

  votesSequence: function(e) {
    // console.log("I am here");
    let nominees = this.data.nominationList;
    let i;
    for (i = 1; i < nominees.length; i++) {
      let nominee = nominees[i];
      let j = i - 1;
      while (j >= 0 && nominees[j].votes < nominee.votes) {
        nominees[j + 1] = nominees[j];
        j--;
      }
      nominees[j + 1] = nominee;
    }
    this.setData({
      nominationList: nominees,
      hottest: 1
    })
    if (this.data.top > app.globalData.scrollToDistance){
      wx.pageScrollTo({
        scrollTop: app.globalData.scrollToDistance,
        duration: 0
      })
    }
  },

  goToDetail: function (e) {
    wx.navigateTo({
      url: '../detail/detail?id='+e.currentTarget.dataset.id,
    })
  },

  vote: function (e){
    let id = e.currentTarget.dataset.voteId;
    let that = this;
    console.log("vote for ",id);
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
          that.refreshPage();
        }
        else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 1000,
          })
        }
        // that.updateVotes(id, res.data.data);
        // that.upddateStatistics();
        // app.globalData.votedList.push(id);
        // app.globalData.remainingVotes = app.globalData.remainingVotes - 1;
        // let item;
        // for (item of that.data.nominationList) {
        //   if (item.id == id) {
        //     item.votable = 0;
        //     item.votes = res.data.data;
        //     break;
        //   }
        // };
        // that.setData({
        //   nominationList: that.data.nominationList,
        //   remainingVotes: app.globalData.remainingVotes
        // });
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

  updateVotes: function(id, votes){
    let nominee;
    for (nominee of app.globalData.nominees) {
      if(nominee.id == id){
        nominee.votes = votes;
        return;
      }
    }
  },

  upddateStatistics: function() {
    let that = this;
    wx.request({
      url: app.baseUrl + '/statistics',
      success: function (res) {
        if (res.data.status == 1) {
          that.setData({
            statistics: res.data.data
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
    });
  },

  refreshPage: function() {
    //statistic part
    let that = this;
    wx.request({
      url: app.baseUrl + '/statistics',
      success: function (res) {
        if (res.data.status == 1) {
          that.setData({
            statistics: res.data.data
          });
          //before countDown,clean old countDown
          if(that.data.timer){
            clearInterval(that.data.timer);
          }
          that.countDown(new Date().getTime(), util.parseDate(res.data.data.endTime).getTime());
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
    //nominees part
    if(app.globalData.openId==null){
      //login in first
      app.getOpenId()
      .then(
        () => {
          that.refreshHelper();
          wx.request({
            url: app.baseUrl + '/user/totalVoted?openId=' + app.globalData.openId,
            success: function (res) {
              if (res.data.status == 1) {
                that.setData({
                  totalVoted: res.data.data
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
          });
        }
      )
    }
    //logined, fetch data directly
    else{
      that.refreshHelper();
      wx.request({
        url: app.baseUrl + '/user/totalVoted?openId=' + app.globalData.openId,
        success: function (res) {
          if (res.data.status == 1) {
            that.setData({
              totalVoted: res.data.data
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
      });
    }
  },

  refreshHelper: function(){
    this.setData({
      searchKey: ""
    })
    let that = this;
    app.loadGLobalData()
      .then(
        () => {
          let nominee;
          let nominees = app.globalData.nominees;
          for (nominee of nominees) {
            if (app.globalData.votedList.includes(nominee.id) || app.globalData.remainingVotes == 0) {
              nominee.votable = 0;
            }
            else {
              nominee.votable = 1;
            }
          }

          if (that.data.hottest == 1) {
            let i;
            for (i = 1; i < nominees.length; i++) {
              let nominee = nominees[i];
              let j = i - 1;
              while (j >= 0 && nominees[j].votes < nominee.votes) {
                nominees[j + 1] = nominees[j];
                j--;
              }
              nominees[j + 1] = nominee;
            }
          }
          else{
            let i;
            for (i = 1; i < nominees.length; i++) {
              let nominee = nominees[i];
              let j = i - 1;
              while (j >= 0 && nominees[j].id > nominee.id) {
                nominees[j + 1] = nominees[j];
                j--;
              }
              nominees[j + 1] = nominee;
            }
          }
          that.setData({
            nominationList: nominees,
            remainingVotes: app.globalData.remainingVotes
          })
        }
      )
  },

  search: function(event) {
    // console.log("search for ", event.detail.value);
    let key = event.detail.value;
    if(key.charAt(0)=='#'){
      key = key.substr(1);
    }
    this.data.searchKey = key;
    let result = [];
    let nominee;
    for(nominee of app.globalData.nominees){
      if (nominee.name.toLowerCase().indexOf(key.toLowerCase()) != -1 || this.add_zero_to_fourbits(nominee.id).indexOf(key) != -1){
        //find
        result.push(nominee);
      }
      
    }
    this.setData({
      nominationList:result,
    })
    //todo: search top adjust
    // if (this.data.top >= 267){
    //   console.log("yes too !");
    //   wx.pageScrollTo({
    //     scrollTop: 300,
    //     duration: 0
    //   })
    // }
  },

  add_zero_to_fourbits: function (num) {
    for (let len = (num + "").length; len < 4; len = num.length) {
      num = "0" + num;
    }
    return num;
  }
})
