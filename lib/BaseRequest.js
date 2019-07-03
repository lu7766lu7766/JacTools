import { createApiBody, roopParse } from './myLib'
import axios from 'axios'

var path = require('path')

export default class BaseRequest {
	get baseUrls() {
		return []
	}

	axiosInit() {
		axios.defaults.baseURL = this.host || `/`
		axios.interceptors.response.use(
			response => {
				return response
			},
			function(error) {
				return Promise.reject(error.response)
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
		if (!conf) throw 'not found the config'

		let res
		try {
			res = await axios(
				createApiBody(
					conf.method,
					path.join(...this.baseUrls, conf.uri),
					_.merge(
						_.pickBy(this.convertMoment2String(data), x => x !== '' && !_.isNull(x) && !_.isUndefined(x)),
						conf.data
					),
					conf.header
				)
			)
		} catch (e) {
			return this.resultProccess(e, options)
		}
		return this.resultProccess(res, options)
	}

	resultProccess(res, options) {
		const successF = options.success || options.s
		const failF = options.fail || options.f

		const errorMessages = []
		_.forEach(res.data.code, code => {
			if (this.SuccessCodes.indexOf(code) === -1) {
				errorMessages.push(
					this.ErrorCodes && this.ErrorCodes[code]
						? this.ErrorCodes[code]
						: 'system error!! please try again later'
				)
			}
		})
		return errorMessages.length
			? failF
				? failF(res.data, errorMessages)
				: this.errorHandle(res.data, errorMessages)
			: successF
			? successF(roopParse(res.data))
			: roopParse(res.data)
	}

	errorHandle(res, errorMessages) {
		const msg = errorMessages.join('\n')
		alert(msg)
		throw { message: msg, ...res }
	}
}
