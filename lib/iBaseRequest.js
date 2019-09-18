import { createApiBody, roopParse } from './myLib'
import axios from 'axios'
import _ from 'lodash'
import path from 'path'

export default class iBaseRequest {

	get host() {
		return '/'
	}

	get baseUrls() {
		return []
	}

	get resultKey() {
		return 'code'
	}

	axiosInit() {
		axios.defaults.baseURL = this.host
		axios.interceptors.response.use(
			response => {
				return response
			},
			error => {
				return error && error.response ? Promise.reject(error.response) : error
			}
		)
	}

	constructor(config) {
		this.axiosInit()
		this.SuccessCodes = config.SuccessCodes
		this.ErrorCodes = config.ErrorCodes
	}

	convertMoment2String(res) {
		_.forEach(res, (val, key) => {
			if (val && typeof val === 'object' && (moment.isMoment(val) || typeof val.getMonth === 'function')) {
				res[key] = moment(val).format('YYYY-MM-DD HH:mm:ss')
			}
		})
		return res
	}

	async request(key, data = {}, options = {}) {
		if (typeof this.config !== 'object') throw 'please init this apiFetch'
		const conf = this.config[key]
		if (!conf) throw `not found the config key:${key}`

		const filter = options.filter || (x => !_.isNull(x) && !_.isUndefined(x)) // x !== '' &&
		let res

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
			)
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
		const errorMessages = this.codeHandle(res)
    const successF = options.success || options.s
    const failF = options.fail || options.f

    if (errorMessages.length) {
      if (failF) {
        failF(res, errorMessages)
      } else {
        this.errorHandle(res, errorMessages)
      }
    } else {
      res.data = roopParse(res.data)
      if (successF) {
        successF(res.data)
      } else {
        return res.data
      }
    }
	}

  /**
   * 錯誤碼處理
   * @param res
   * @returns {Array}
   */
	codeHandle(res) {
    let errorMessages = []
		let codes = res.data[this.resultKey]
    switch(typeof codes) {
      case 'object':
        _.forEach(codes, code => {
          if (this.SuccessCodes.indexOf(code) === -1) {
            errorMessages.push(this.getErrorMessage[code])
          }
        })
        break
      case 'string':
      case 'number':
        if (this.SuccessCodes.indexOf(codes) === -1) {
          errorMessages.push(this.getErrorMessage[codes])
        }
        break
    }
    return errorMessages
	}

  /**
	 * 判空處理
   * @param code
   * @returns {string}
   */
	getErrorMessage(code) {
		return this.ErrorCodes && this.ErrorCodes[code] ? this.ErrorCodes[code] : 'system error!!'
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
