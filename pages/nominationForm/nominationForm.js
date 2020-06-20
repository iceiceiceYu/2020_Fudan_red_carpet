// pages/nominationForm/nominationForm.js
const app = getApp();
const Promise = require('../../utils/promise.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    photoUrls: [],
    photoName0: "",
    photoName1: "",
    submitable: 0,
    name: "",
    introduction: "",
    story: "",
    nominatorName: "",
    nominatorPhone: "",
    longtap: false,
    tagLength:0,
    storyLength:0,
    tagInputable:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var phone = wx.getSystemInfoSync();
    let that = this;
    if (phone.platform == 'ios') { 
      that.setData({
        detail: true
      }); 
    } else if (phone.platform == 'android') {
      that.setData({
        detail: false
      }); 
    }
    wx.getStorage({
      key: 'redCarpet.name',
      success: function(res) {
        that.isSubmitable();
        that.setData({
          name: res.data
        })
      },
    });
    wx.getStorage({
      key: 'redCarpet.introduction',
      success: function (res) {
        that.isSubmitable();
        let value = res.data;
        let length = 0;
        for (let i = 0; i < value.length; i++) {
          let c = value[i];
          if (c.match(/[\u0000-\u00ff]/g)) {
            length++;
          }
          else {
            length += 2;
          }
        }
        that.setData({
          introduction: res.data,
          tagLength: Math.ceil(length/2)
        })
      },
    });
    wx.getStorage({
      key: 'redCarpet.story',
      success: function (res) {
        that.isSubmitable();
        that.setData({
          story: res.data,
          storyLength: res.data.length
        })
      },
    });
    wx.getStorage({
      key: 'redCarpet.nominatorName',
      success: function (res) {
        that.isSubmitable();
        that.setData({
          nominatorName: res.data
        })
      },
    });
    wx.getStorage({
      key: 'redCarpet.nominatorPhone',
      success: function (res) {
        that.isSubmitable();
        that.setData({
          nominatorPhone: res.data
        })
      },
    });
    wx.getStorage({
      key: 'redCarpet.photoUrls',
      success: function (res) {
        that.isSubmitable();
        that.setData({
          photoUrls: res.data
        })
      },
    });
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

  uploadPhoto() {
    let that = this;
    wx.chooseImage({
      count: 2-this.data.photoUrls.length, // 默认9
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = that.data.photoUrls;
        let item;
        for (item of res.tempFilePaths) {
          tempFilePaths.push(item);
        }
        that.saveLocally("redCarpet.photoUrls", tempFilePaths);
        that.setData({
          photoUrls: tempFilePaths
        });
      }
    })
  },

  formSubmit(e) {
    let that = this;
    // if(e.detail.value.name==""){
    //   wx.showToast({
    //     title: '请完善 提名对象 信息后再提交！',
    //     icon: 'none',
    //     duration: 1000,
    //     mask: true
    //   });
    //   return;
    // }
    // if (e.detail.value.introduction == "") {
    //   wx.showToast({
    //     title: '请完善 提名标签 信息后再提交！',
    //     icon: 'none',
    //     duration: 1000,
    //     mask: true
    //   });
    //   return;
    // }
    // if (e.detail.value.story == "") {
    //   wx.showToast({
    //     title: '请完善 复旦故事 信息后再提交！',
    //     icon: 'none',
    //     duration: 1000,
    //     mask: true
    //   });
    //   return;
    // }
    // if (e.detail.value.nominatorName == "") {
    //   wx.showToast({
    //     title: '请完善 联系人 信息后再提交！',
    //     icon: 'none',
    //     duration: 1000,
    //     mask: true
    //   });
    //   return;
    // }
    // if (e.detail.value.nominatorPhone == "") {
    //   wx.showToast({
    //     title: '请完善 联系方式 信息后再提交！',
    //     icon: 'none',
    //     duration: 1000,
    //     mask: true
    //   });
    //   return;
    // }

    if (!(/^1[34578]\d{9}$/.test(e.detail.value.nominatorPhone))) {
      wx.showToast({
        title: '请输入正确的联系方式后再提交！',
        icon: 'none',
        duration: 1000,
        mask: true
      });
      return;
    }

    //all fine, submit

    wx.showLoading({
      title: '正在提交',
      // mask: true,
    });

    //upload image first
    if(this.data.photoUrls.length==1) {
      this.uploadImage(this.data.photoUrls[0], 0)
      .then(
        () => {
          wx.request({
            url: app.baseUrl + '/nominee/nominate?openId=' + app.globalData.openId,
            method: "POST",
            data: {
              name: e.detail.value.name,
              introduction: e.detail.value.introduction,
              story: e.detail.value.story,
              photoUrl1: that.data.photoName0,
              photoUrl2: "",
              nominatorName: e.detail.value.nominatorName,
              nominatorPhone: e.detail.value.nominatorPhone
            },
            success: function (res) {
              if (res.data.status == 1) {
                that.clearLocalStorage();
                wx.hideLoading();
                wx.showToast({
                  title: '提交成功',
                  icon: 'succes',
                  duration: 1000,
                  mask: true
                });

                setTimeout(function () {
                  wx.redirectTo({
                    url: '../nominationState/nominationState',
                  })
                }, 1000);
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
                title: '提交失败了，请再试试',
                icon: 'none',
                duration: 1000,
                mask: true
              });
            }
          });
        }
      )
    }
    else if (this.data.photoUrls.length == 2) {
      this.uploadImage(this.data.photoUrls[0], 0)
      .then(
        () => {
          return that.uploadImage(that.data.photoUrls[1], 1);
        }
      )
      .then(
        () => {
          wx.request({
            url: app.baseUrl + '/nominee/nominate?openId=' + app.globalData.openId,
            method: "POST",
            data: {
              name: e.detail.value.name,
              introduction: e.detail.value.introduction,
              story: e.detail.value.story,
              photoUrl1: that.data.photoName0,
              photoUrl2: that.data.photoName1,
              nominatorName: e.detail.value.nominatorName,
              nominatorPhone: e.detail.value.nominatorPhone
            },
            success: function (res) {
              if (res.data.status == 1) {
                that.clearLocalStorage();
                wx.hideLoading();
                wx.showToast({
                  title: '提交成功',
                  icon: 'succes',
                  duration: 1000,
                  mask: true
                });

                setTimeout(function () {
                  wx.redirectTo({
                    url: '../nominationState/nominationState',
                  })
                }, 1000);
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
                title: '提交失败了，请再试试',
                icon: 'none',
                duration: 1000,
                mask: true
              });
            }
          });
        }
      )
    }
    else{
      wx.request({
        url: app.baseUrl + '/nominee/nominate?openId=' + app.globalData.openId,
        method: "POST",
        data: {
          name: e.detail.value.name,
          introduction: e.detail.value.introduction,
          story: e.detail.value.story,
          photoUrl1: "",
          photoUrl2: "",
          nominatorName: e.detail.value.nominatorName,
          nominatorPhone: e.detail.value.nominatorPhone
        },
        success: function (res) {
          if (res.data.status == 1) {
            that.clearLocalStorage();
            wx.hideLoading();
            wx.showToast({
              title: '提交成功',
              icon: 'succes',
              duration: 1000,
              mask: true
            });

            setTimeout(function () {
              wx.redirectTo({
                url: '../nominationState/nominationState',
              })
            }, 1000);
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
            title: '提交失败了，请再试试',
            icon: 'none',
            duration: 1000,
            mask: true
          });
        }
      });
    }
  },

  uploadImage: function(img, index) {
    let that = this;
    return new Promise(
      function(resolve, reject){
        wx.uploadFile({
          url: app.baseUrl + '/image',
          filePath: img,
          name:"file",
          header: {
            'content-type': 'multipart/form-data'
          },
          success: function(res) {
            let result = JSON.parse(res.data);
            if (result.status == 1) {
              // that.uploadSuccessCallBack(result.data, index);
              if (index == 0) {
                that.data.photoName0 = result.data;
              }
              else if (index == 1) {
                that.data.photoName1 = result.data;
              }
              resolve("upload success");
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
      }
    )
  },

  previewImg: function (e) {
    if(this.data.longtap){
      return;
    }
    let index = e.currentTarget.dataset.index;
    let urls = this.data.photoUrls;
    wx.previewImage({
      current: urls[index],
      urls: urls,
    });
  },

  nameInput: function(event){
    this.setData({
      name: event.detail.value
    })
    this.isSubmitable();
  },

  introductionInput: function (event) {
    let value = event.detail.value;
    let length = 0;
    let index;
    for(let i = 0; i<value.length; i++){
      let c = value[i];
      if (c.match(/[\u0000-\u00ff]/g)) {
        length++;
        if(length==29 || length==30){
          index = i;
        }
      }
      else{
        length +=2;
        if (length == 29 || length == 30) {
          index = i;
        }
      }
    }
    // console.log("length: ", length);
    if(length>30){
      this.setData({
        introduction: value.slice(0,index+1),
        tagLength: 15
      })
    }
    else{
      this.setData({
        introduction: event.detail.value,
        tagLength: Math.ceil(length/2)
      })
    }
    this.isSubmitable();
  },

  storyInput: function (event) {
    this.setData({
      story: event.detail.value,
      storyLength: event.detail.value.length
    })
    this.isSubmitable();
  },

  nominatorNameInput: function (event) {
    this.setData({
      nominatorName: event.detail.value
    })
    this.isSubmitable();
  },

  nominatorPhoneInput: function (event) {
    this.setData({
      nominatorPhone: event.detail.value
    })
    this.isSubmitable();
  },

  isSubmitable: function(){
    if(this.data.name==""){
      this.setData({
        submitable: 0
      })
      return;
    }
    if (this.data.introduction == "") {
      this.setData({
        submitable: 0
      })
      return;
    }
    if (this.data.story == "") {
      this.setData({
        submitable: 0
      })
      return;
    }
    if (this.data.nominatorName == "") {
      this.setData({
        submitable: 0
      })
      return;
    }
    if (this.data.nominatorPhone == "") {
      this.setData({
        submitable: 0
      })
      return;
    }
    //all valid, submit enable
    this.setData({
      submitable: 1
    })
  },

  deleteImage: function(event){
    this.data.longtap=true;
    let index = event.currentTarget.dataset.index;
    let that = this;
    wx.showActionSheet({
      itemList: ["删除本照片"],
      success: res => {
        that.data.photoUrls.splice(index,1);
        that.saveLocally("redCarpet.photoUrls", that.data.photoUrls);
        that.setData({
          photoUrls: that.data.photoUrls
        })
      }
    })
  },

  deleteImagewithCheck: function(event){
    let index = event.currentTarget.dataset.index;
    let that = this;
    wx.showModal({
      title: '',
      content: '确认删除本张照片吗？',
      success(res) {
        if (res.confirm) {
          that.data.photoUrls.splice(index, 1);
          that.saveLocally("redCarpet.photoUrls", that.data.photoUrls);
          that.setData({
            photoUrls: that.data.photoUrls
          })
        }
      }
    })
  },

  touchend: function(){
    if(this.data.longtap){
      setTimeout(() => {
        this.setData({ longtap: false });
      }, 100);
    }
  },

  saveName: function(event){
    this.saveLocally("redCarpet.name", event.detail.value);
  },

  saveIntroduction: function (event) {
    this.saveLocally("redCarpet.introduction", event.detail.value);
  },

  saveStory: function (event) {
    this.saveLocally("redCarpet.story", event.detail.value);
  },

  saveNominatorName: function (event) {
    this.saveLocally("redCarpet.nominatorName", event.detail.value);
  },

  saveNominatorPhone: function (event) {
    this.saveLocally("redCarpet.nominatorPhone", event.detail.value);
  },

  saveLocally: function(key, value) {
    wx.setStorage({
      key: key,
      data: value
    })
  },

  clearLocalStorage: function() {
    wx.removeStorage({
      key: 'redCarpet.name'
    });
    wx.removeStorage({
      key: 'redCarpet.introduction'
    });
    wx.removeStorage({
      key: 'redCarpet.story'
    });
    wx.removeStorage({
      key: 'redCarpet.nominatorName'
    });
    wx.removeStorage({
      key: 'redCarpet.nominatorPhone'
    });
    wx.removeStorage({
      key: 'redCarpet.photoUrls'
    });
  }
})