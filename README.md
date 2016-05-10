# Secure Service

安全相关 web service

- 数字签名

## deloy 

```shell
git clone git@gitlab.dxy.net:f2e/secure-service.git
cd secure-service
npm install
node --harmony index.js
```

## test

```shell
npm test
```

## api
接口：GET`/sign`

描述: 获取应用签名的公钥

请求参数：

| 名称     | 类型   | 定义        | 必需 | 默认值 | 说明|
| ------------- |:-------------:| :-----:|------------- |:-------------:| -----:|
|app | string | 应用名   |   N  | default    | 作用于name和id字段|

响应：文件流

--------------------------------------------------
接口: POST `/sign`

描述: 对文件进行签名

| 名称     | 类型   | 定义        | 必需 | 默认值 | 说明|
| ------------- |:-------------:| :-----:|------------- |:-------------:| -----:|
|app | string | 应用名   |   N  | "default"  | 作用于name和id字段|
|hash | string | hash算法   |   N  | "md5"  | | 
|sign | string | 应用名   |   N  |  "RSA-SHA256"  | openssl list-public-key-algorithms 中列出的算法| 
|format | string | 返回签名的格式  |   N  | "binary" | 可为 "hex", "base64", "binary" |

响应：文件流

--------------------------------------------------




