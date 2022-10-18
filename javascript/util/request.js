/**
 * 封装 axios
 */
import axios from "axios"

const handleChangeRequestHeader = (config) => {
  config["xxxx"] = "xxx"
  return config
}

const handleConfigureAuth = (config) => {
  config.headers["token"] = localStorage.getItem("token") || ""
  return config
}

const handleNetworkError = (errStatus) => {
  const networkErrMap = {
    "400": "错误的请求", // token 失效
    "401": "未授权，请重新登录",
    "403": "拒绝访问",
    "404": "请求错误，未找到该资源",
    "405": "请求方法未允许",
    "408": "请求超时",
    "500": "服务器端出错",
    "501": "网络未实现",
    "502": "网络错误",
    "503": "服务不可用",
    "504": "网络超时",
    "505": "http版本不支持该请求",
  }
  if (errStatus) {
    this.$message.error(networkErrMap[errStatus] ?? `其他连接错误 --${errStatus}`)
    return
  }

  this.message.error("无法连接到服务器！")
}

const handleAuthError = errNo => {
  const authErrMap = {
    "10031": "登录失效，需要重新登录", // token 失效
    "10032": "您太久没登录，请重新登录", // token 过期
    "10033": "账户未绑定角色，请联系管理员绑定角色",
    "10034": "该用户未注册，请联系管理员注册用户",
    "10035": "code 无法获取对应第三方平台用户",
    "10036": "该账户未关联员工，请联系管理员做关联",
    "10037": "账号已无效",
    "10038": "账号未找到",
  }

  // eslint-disable-next-line no-prototype-builtins
  if (authErrMap.hasOwnProperty(errNo)) {
    this.message.error(authErrMap[errNo])
    // 授权错误，登出账户
    // logout()
    return false
  }
  return true
}

const handleGeneralError = (errNo, errMsg) => {
  if (errNo !== "0") {
    this.message.error(errMsg)
    return false
  }
  return true
}

axios.interceptors.request.use(config => {
  config = handleChangeRequestHeader(config)
  config = handleConfigureAuth(config)
  return config
})

axios.interceptors.response.use(
    response => {
      if (response.status !== 200) return Promise.reject(response.data)
      handleAuthError(response.data.code)
      handleGeneralError(response.data.code, response.data.msg)
      return response
    },
    err => {
      handleNetworkError(err.response.status)
      return Promise.reject(err.response)
    }
)

export const get = (url, params = {}, clearFn) => {
  return new Promise(resolve => {
    axios
        .get(url, {params})
        .then(result => {
          let res
          if (clearFn !== undefined) {
            res = clearFn(result.data)
          } else {
            res = result.data
          }
          resolve([null, res])
        })
        .catch((err) => {
          resolve([err, undefined])
        })
  });
}

export const post = (url, data, params = {}) => {
  return new Promise((resolve) => {
    axios
        .post(url, data, {params})
        .then((result) => {
          resolve([null, result.data])
        })
        .catch((err) => {
          resolve([err, undefined])
        })
  })
}
