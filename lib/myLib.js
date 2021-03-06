import qs from 'qs'

/**
 * create api request body
 * @param method
 * @param uri
 * @param data
 * @param header
 * @returns {{url: string, headers, method: string, responseType: string, withCredentials: boolean}}
 */
export function createApiBody(method = 'get', uri = '', data = {}, header = {}, options = {}) {
	let res = {
		url: replaceMatchData(uri, data),
		headers: header,
		method,
		responseType: 'json',
		withCredentials: true,
	}
	const isFormData = options.formData || false
	const isPostData = method.toUpperCase() === 'PUT' || method.toUpperCase() === 'POST'
	const dataProperty = isPostData ? 'data' : 'params'
	res[dataProperty] = isPostData ? (isFormData ? createFormDataBody(data) : qs.stringify(data)) : data
	return res
}

/**
 * 只容許兩層參數
 */
function createFormDataBody(datas) {
	const formData = new FormData()
	_.forEach(datas, (data, key) => {
		// data.constructor == File
		if (typeof data === 'object' && !(data instanceof File)) {
			for (const index in data) {
				const val = _.isNull(data[index]) || _.isUndefined(data[index]) ? '' : data[index]
				formData.append(`${key}[${index}]`, val)
			}
		} else {
			formData.append(key, data)
		}
	})
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
	var ts = uri.match(/({[\w]+})/g)
	if (ts) {
		ts.forEach((key) => {
			key = key.replace(/[{}]/g, '')
			if (data[key]) {
				uri = uri.replace(`{${key}}`, data[key])
				delete data[key]
			}
		})
	}
	return uri
}

/**
 * root to parse json at api result
 * @param val
 * @returns {*}
 */
export function roopParse(val) {
	if (_.isObject(val) || _.isArray(val)) {
		_.forEach(val, (v, k) => {
			val[k] = roopParse(v)
		})
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

export const getUrlParameter = (name) => {
	name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]')
	var regex = new RegExp('[\\?&]' + name + '=([^&#]*)')
	var results = regex.exec(location.search)
	return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '))
}

const readImage = (file) => {
	return new Promise((resolve, reject) => {
		let reader = new FileReader()
		reader.readAsDataURL(file)
		reader.onload = (e) => {
			resolve(e.target.result)
		}
		reader.onerror = (e) => {
			throw 'image convert to url error'
			reject(e)
		}
	})
}

var readImageInstance = (file) =>
	new Promise(async (resolve) => {
		const src = await readImage(file)
		var image = new Image()
		image.src = src
		image.onload = function () {
			resolve(this)
		}
	})

const getAllSubNodeID = (datas, key = 'nodes') => {
	return _.reduce(
		_.pickBy(datas),
		(result, data) => {
			return result.concat(data[key] ? getAllSubNodeID(data[key]) : [data.id])
		},
		[]
	)
}

const createID = (prefix = '') => prefix + Math.round(Math.random() * 10000000)

export default {
	readImage,
	getAllSubNodeID,
	readImageInstance,
	createID,
}
