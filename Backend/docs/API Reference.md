# Red Carpet API Reference



## Response

```json
{
    status: int // 0: token error; 1: success; -1: fialed.
    msg: string // message
    token: string // used in Admin part. null in User part
    data: object // return data. e.g. a list of nominees
}

```

---

## https://yst.fudan.edu.cn/redCarpet/api

*global route*

---

## GET /statistics

获取全局信息

**Response Data**: 

```json
{
    nomineeNumber: int,
    voteNumber: int,
    endTime: timestamp
}
```

## POST /nominee/nominate

提名

**Body Data**:

```json
{
    name：string,
    introduction: string ,
    story: string,
    photoUrl1：string,
    photoUrl2: string,
	openId: string,
    nominatorName: string,
    nominatorPhone: phone number
}
```

**Response Data** : null

## GET /nominee/all

获取所有通过审核的候选人列表

**Response Data**: 

```json
[
    {
        nominee.id
               .name
               .introduction
               .vote
               .
    }
]
```


## GET /nominee/detail?id={id}

获取某一通过审核的候选人的具体信息

**Response Data**: ```nominee```

## GET /user/login?code={code}

通过微信登陆

**Response Data**: openId: string

## GET /user/nomination?openId={open-id}

查看用户提名

**Response Data** : 

```json
[
    {
        id：number,
        name：string,
        passedTime：timestamp,
        nominatingTime：timestamp,
        state：string // PENDING; PASSED; REJECTED
    },
    ...
]
```


## GET /user/notification?openId={openId}

查看用户消息提示

**Response Data**:  int

## GET /user/clearNotification?openId={openId}

清除用户消息提示

**Response Data**:  null

## GET /user/voted?openId={openId}

查看用户今日已投

**Response Data**: ```[nominee.id]``` 

## GET /user/totalVoted?openId={openId}

查看用户迄今为止一共投了几票

**Response Data**: ```int``` -- 对应已投票数量 

## POST /user/vote?openId={openId}

用户给通过审核的候选人投票

**Body Data**: int -- 对应id 

**Response Data**: int -- 对应候选人票数

## POST /image

上传一张图片

**Body Data**: (form-data)

```json
{
    file: <一个文件>
}
```

Response Data: string // filename

## GET /image/:filename

获取图片

> *filename = banner1, banner2, banner2Detail, share*  has particular usage.

## GET /wx/wxacode?scene={scene}&page={page}

获取导向${page}页面的小程序码

> scene参数不可为空值
>
> page的格式为：/pages/index/index；不必须，默认跳到主页
>
> 具体参见腾讯 [小程序码获取api](https://developers.weixin.qq.com/miniprogram/dev/api-backend/wxacode.getUnlimited.html)

## GET /user/rank?openId={openId}

获取${openId}对应的排名。

**status**：-1：无该用户；

​				1：获取成功。

**Response Data**:  

```json
{
    rank：number, // -1 代表用户没有投满48票，或者用户没有在前200名之内
    lottery: boolean // false 表示未开奖；true表示已开奖
}
```

## GET /user/lottery?openId={openId}

开奖。

**status**：-1：无该用户；

​				1：开奖成功。

