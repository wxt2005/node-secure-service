# Secure Service

安全相关 web service

- 数字签名

## deloy 

安装 node 稳定版本 

```
sudo npm install -g n
n stable
```
------

```shell
curl http://npmjs.org/install.sh | sudo sh
git clone git@gitlab.dxy.net:f2e/secure-service.git
cd secure-service
npm install
```

配置`lib/config.json`中的密钥

```json
{
	"sign" : {
		"dxydoctor" : { //应用名
			"private" : "/Users/yanhaibiao/code/secure-service/private1.pem", //密钥存放路径
			"public" : "/Users/yanhaibiao/code/secure-service/public.pem"
		},
		"default": { //默认应用
			"private" : "/Users/yanhaibiao/code/secure-service/private1.pem", 
			"public" : "/Users/yanhaibiao/code/secure-service/public.pem"
		}
	}
}

```

启动server

```shell
node --harmony index.js
```

## 密钥生成

```shell
#生成私钥pem
openssl genrsa -out rsa_private_key.pem 1024
#生成公钥
openssl rsa -in rsa_private_key.pem -pubout -out rsa_public_key.pem
#将RSA私钥转换成PKCS8格式,解决java对私钥读取问题
openssl pkcs8 -topk8 -inform PEM -in private.pem -outform PEM -nocrypt 
openssl pkcs8 -topk8 -inform PEM -in rsa_private_key.pem -outform PEM -nocrypt -out rsa_private_key1.pem
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
|app | string | 应用名   |   N  | default    | |

响应：文件流

--------------------------------------------------
接口: POST `/sign`

描述: 对文件进行签名

| 名称     | 类型   | 定义        | 必需 | 默认值 | 说明|
| ------------- |:-------------:| :-----:|------------- |:-------------:| -----:|
|app | string | 应用名   |   N  | "default"  | |
|hash | string | hash算法   |   N  | "md5"  | | 
|sign | string | 签名算法   |   N  |  "RSA-SHA256"  | openssl list-public-key-algorithms 中列出的算法| 
|format | string | 返回签名的格式  |   N  | "binary" | 可为 "hex", "base64", "binary" |

响应：文件流

--------------------------------------------------




