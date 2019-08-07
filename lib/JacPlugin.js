import qs from 'qs'

export default {
	install: (Vue, options) => {
		const _ = options._
		const moment = options.moment

		if (_) {
			_.mixin(
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
			Vue.prototype._ = _
		}

		if (moment) {
			// 增加moment getDateTime方法
			moment.fn.getDateTime = function() {
				return this.format('YYYY-MM-DD HH:mm:ss')
			}
			// 增加moment getDate方法
			moment.fn.getDate = function() {
				return this.format('YYYY-MM-DD')
			}
			Vue.prototype.moment = moment
		}

		Vue.prototype.$open = function(url, title, config) {
			window.open(url, title, qs.stringify(config).replace('&', ','))
		}
	}
}
