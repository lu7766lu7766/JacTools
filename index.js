import _BaseRequest from './BaseRequest'
import __ from 'lodash'
import _moment from 'moment'
import _Vue from 'vue'
import qs from 'qs'

__.mixin(
	{
		getVal: function(data, prop, defaultVal = '') {
			let res = _.head(
				_(data)
					.at(prop)
					.value()
			)
			return !_.isUndefined(res) ? res : defaultVal
		}
	},
	{ chain: false }
)

// 增加moment getDateTime方法
_moment.fn.getDateTime = function() {
	return this.format('YYYY-MM-DD HH:mm:ss')
}
// 增加moment getDate方法
_moment.fn.getDate = function() {
	return this.format('YYYY-MM-DD')
}

_Vue.prototype.$open = function(url, title, config) {
	window.open(url, title, qs.stringify(config).replace('&', ','))
}

export const BaseRequest = _BaseRequest
export const _ = __
export const moment = _moment
export const Vue = _Vue
