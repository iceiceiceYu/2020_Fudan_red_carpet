// pages/nominationState/nominationState.js
const app = getApp()
const util = require("../../utils/util.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    nominationList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // get nomanation state logic
    let that = this;
    wx.request({
      url: app.baseUrl + '/user/nomination?openId=' + app.globalData.openId,
      success: function(res) {
        if (res.data.status == 1) {
          console.log("state list:", res.data.data);
          that.timeFormat(res.data.data);
          that.setData({
            nominationList: res.data.data
          });
          //clear notification logic here
          wx.request({
            url: app.baseUrl + '/user/clearNotification?openId=' + app.globalData.openId,
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

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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

  },

  timeFormat: function(stateList) {
    let item;
    for (item of stateList) {
      item.nominatingTime = this.timeFormatHelper(item.nominatingTime);
      item.reviewedTime = this.timeFormatHelper(item.reviewedTime);
    }
  },

  timeFormatHelper: function(timeString) {
    if (timeString == null)
      return null;
    let t = util.parseDate(timeString);
    let result = util.formatTime(t);
    return result;
  }
})