import qs from 'qs'
import {Decimal} from 'decimal.js'

export default {
	install: (Vue, options = {}) => {
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
					},
					keyVal: function(datas, key, value) {
						return _.reduce(datas, (result, data) => {
							result[data[key]] = data[value]
							return result
						}, {})
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

      // 增加moment get php timestamp方法
      moment.fn.timestamp = function() {
        return this.valueOf() / 1000
      }

			Vue.prototype.moment = moment
		}

		Vue.prototype.$open = function(url, title, config) {
			window.open(url, title, qs.stringify(config).replace('&', ','))
		}

    Vue.prototype.$decimal = value => new Decimal(value)
    Decimal.prototype.value = Decimal.prototype.toNumber
    Decimal.prototype['+'] = Decimal.prototype.add
    Decimal.prototype['-'] = Decimal.prototype.sub
    Decimal.prototype['*'] = Decimal.prototype.mul
    Decimal.prototype['/'] = Decimal.prototype.div
	}
}
