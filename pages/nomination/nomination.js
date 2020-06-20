// pages/nomination/nomination.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    notification: -1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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
    let that = this;
    wx.request({
      url: app.baseUrl + '/user/notification?openId=' + app.globalData.openId,
      success: function(res) {
        if (res.data.status == 1) {
          console.log("notification number: ", res.data.data);
          that.setData({
            notification: res.data.data
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
      fail: function(res) {
        wx.showToast({
          title: "服务器正忙，请稍后再试",
          icon: 'none',
          duration: 1000,
        })
      }
    });
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

  goToNonimationForm: function () {
    wx.navigateTo({
      url: '../nominationForm/nominationForm',
    })
  },

  goToNonimationState: function () {
    wx.navigateTo({
      url: '../nominationState/nominationState',
    })
  },

  showDetail: function(){
    wx.previewImage({
      urls: ["https://yst.fudan.edu.cn/redCarpet/api/image/banner2Detail?" + Math.random() / 9999]
    })
  }
})