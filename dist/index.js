import qs from 'qs';
import axios from 'axios';

/**
 * create api request body
 * @param method
 * @param uri
 * @param data
 * @param header
 * @returns {{url: string, headers, method: string, responseType: string, withCredentials: boolean}}
 */
function createApiBody(method = 'get', uri = '', data = {}, header = {}, options = {}) {
	let res = {
		url: replaceMatchData(uri, data),
		headers: header,
		method,
		responseType: 'json',
		withCredentials: true
	};
	const isFormData = options.formData || false;
	const isPostData = method.toUpperCase() === 'PUT' || method.toUpperCase() === 'POST';
	const dataProperty = isPostData ? 'data' : 'params';
	res[dataProperty] = isPostData ? (isFormData ? createFormDataBody(data) : qs.stringify(data)) : data;
	return res
}

/**
 * 只容許兩層參數
 */
function createFormDataBody(datas) {
	const formData = new FormData();
	_.forEach(datas, (data, key) => {
		// data.constructor == File
		if (typeof data === 'object' && !(data instanceof File)) {
			for (const index in data) {
				formData.append(`${key}[${index}]`, data[index]);
			}
		} else {
			formData.append(key, data);
		}
	});
	return formData
}

/**
 * find the key match in uri and replace it
 * ex. uri: '/aa/{id}', data: {a: 'a', id: 1}
 * result. /aa/1 data: {a: 'a'}
 * @param uri
 * @param data
 * @returns {*}
 */
function replaceMatchData(uri, data) {
	var ts = uri.match(/({[\w]+})/g);
	if (ts) {
		ts.forEach(key => {
			key = key.replace(/[{}]/g, '');
			if (data[key]) {
				uri = uri.replace(`{${key}}`, data[key]);
				delete data[key];
			}
		});
	}
	return uri
}

/**
 * root to parse json at api result
 * @param val
 * @returns {*}
 */
function roopParse(val) {
	if (_.isObject(val) || _.isArray(val)) {
		_.forEach(val, (v, k) => {
			val[k] = roopParse(v);
		});
		return val
	} else {
		if (typeof val === 'string' && _.includes(val.substr(0, 2), '{', '[')) {
			try {
				return JSON.parse(val)
			} catch (err) {
				return val
			}
		} else {
			return val
		}
	}
}

class iBaseRequest {
	get baseUrls() {
		return []
	}

	axiosInit() {
		axios.defaults.baseURL = this.host || `/`;
		axios.interceptors.response.use(
			response => {
				return response
			},
			error => {
				return error && error.response ? Promise.reject(error.response) : error
			}
		);
	}

	constructor(config) {
		this.axiosInit();
		this.SuccessCodes = config.SuccessCodes;
		this.ErrorCodes = config.ErrorCodes;
	}

	convertMoment2String(res) {
		_.forEach(res, (val, key) => {
			if (val && typeof val === 'object' && (moment.isMoment(val) || typeof val.getMonth === 'function')) {
				res[key] = moment(val).format('YYYY-MM-DD HH:mm:ss');
			}
		});
		return res
	}

	async request(key, data = {}, options = {}) {
		if (typeof this.config !== 'object') throw 'please init this apiFetch'
		const conf = this.config[key];
		if (!conf) throw `not found the config key:${key}`

		const filter = options.filter || (x => !_.isNull(x) && !_.isUndefined(x)); // x !== '' &&
		let res;
		try {
			res = await axios(
				createApiBody(
					conf.method,
					path.join(...this.baseUrls, conf.uri),
					_.merge(
						_.pickBy(this.convertMoment2String(data), filter),
						conf.data
					),
					_.merge(this.header, conf.header),
					options
				)
			);
		} catch (e) {
			return this.errorHandle(e, ['system error!! please try again later'])
		}
		return res.status === 200
			? this.resultHandle(res, options)
			: this.errorHandle(res, ['system error!! please try again later'])
	}

  /**
	 * 處理api回傳結果
   * @param res
   * @param options
   * @returns {*}
   */
	resultHandle(res, options) {
		const errorMessages = this.resultMessageHandle(res);
    const successF = options.success || options.s;
    const failF = options.fail || options.f;

    if (errorMessages.length) {
      if (failF) {
        failF(res, errorMessages);
      } else {
        this.errorHandle(res, errorMessages);
      }
    } else {
      res.data = roopParse(res.data);
      if (successF) {
        successF(res.data);
      } else {
        return res.data
      }
    }
	}

  /**
	 * 處理api回傳訊息
   * @param res
   * @returns {Array}
   */
	resultMessageHandle(res) {
    let errorMessages = [];

    if (this.codeHandle) {
      // custom
      errorMessages = this.codeHandle(res);
    } else {
    	// default
      switch(typeof res.data.code) {
        case 'object':
          _.forEach(res.data.code, code => {
            if (this.SuccessCodes.indexOf(code) === -1) {
              errorMessages.push(this.ErrorCodes && this.ErrorCodes[code] ? this.ErrorCodes[code] : 'system error!!');
            }
          });
          break
        case 'string':
        case 'number':
          if (this.SuccessCodes.indexOf(res.data.code) === -1) {
            errorMessages.push(this.ErrorCodes && this.ErrorCodes[code] ? this.ErrorCodes[code] : 'system error!!');
          }
          break
      }
    }
    return errorMessages
	}

  /**
	 * 處理request錯誤
   * @param res
   * @param errorMessages
   */
	errorHandle(res, errorMessages) {
		switch(res.status) {
			case 404:
				throw { res:res.data.error, msg:'page not found' }
				break
      case 500:
        throw { res:res.data.error, msg:'api crashed' }
        break
			default:
        // alert(msg)
        throw { message: errorMessages.join('\n'), ...res }
				break
		}
	}
}

var _JacPlugin = {
	install: (Vue, options = {}) => {
		const _ = options._;
		const moment = options.moment;

		if (_) {
			_.mixin(
				{
					getVal: function(data, prop, defaultVal = '') {
						let res = _.head(
							_(data)
								.at(prop)
								.value()
						);
						return !_.isUndefined(res) ? res : defaultVal
					}
				},
				{ chain: false }
			);
			Vue.prototype._ = _;
		}

		if (moment) {
			// 增加moment getDateTime方法
			moment.fn.getDateTime = function() {
				return this.format('YYYY-MM-DD HH:mm:ss')
			};
			// 增加moment getDate方法
			moment.fn.getDate = function() {
				return this.format('YYYY-MM-DD')
			};
			Vue.prototype.moment = moment;
		}

		Vue.prototype.$open = function(url, title, config) {
			window.open(url, title, qs.stringify(config).replace('&', ','));
		};
	}
};

const iBaseRequest$1 = iBaseRequest;
const JacPlugin = _JacPlugin;


// import iBaseRequest from './lib/iBaseRequest'
// import JacPlugin from './lib/JacPlugin'

// export {iBaseRequest, JacPlugin}

export { JacPlugin, iBaseRequest$1 as iBaseRequest };
