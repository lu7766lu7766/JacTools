import qs from 'qs';
import axios from 'axios';
import _$1 from 'lodash';
import path from 'path';

function _typeof(obj) {
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(source, true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(source).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  }
}

function _iterableToArray(iter) {
  if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance");
}

/**
 * create api request body
 * @param method
 * @param uri
 * @param data
 * @param header
 * @returns {{url: string, headers, method: string, responseType: string, withCredentials: boolean}}
 */

function createApiBody() {
  var method = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'get';
  var uri = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var header = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
  var res = {
    url: replaceMatchData(uri, data),
    headers: header,
    method: method,
    responseType: 'json',
    withCredentials: true
  };
  var isFormData = options.formData || false;
  var isPostData = method.toUpperCase() === 'PUT' || method.toUpperCase() === 'POST';
  var dataProperty = isPostData ? 'data' : 'params';
  res[dataProperty] = isPostData ? isFormData ? createFormDataBody(data) : qs.stringify(data) : data;
  return res;
}
/**
 * 只容許兩層參數
 */

function createFormDataBody(datas) {
  var formData = new FormData();

  _.forEach(datas, function (data, key) {
    // data.constructor == File
    if (_typeof(data) === 'object' && !(data instanceof File)) {
      for (var index in data) {
        formData.append("".concat(key, "[").concat(index, "]"), data[index]);
      }
    } else {
      formData.append(key, data);
    }
  });

  return formData;
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
    ts.forEach(function (key) {
      key = key.replace(/[{}]/g, '');

      if (data[key]) {
        uri = uri.replace("{".concat(key, "}"), data[key]);
        delete data[key];
      }
    });
  }

  return uri;
}
/**
 * root to parse json at api result
 * @param val
 * @returns {*}
 */


function roopParse(val) {
  if (_.isObject(val) || _.isArray(val)) {
    _.forEach(val, function (v, k) {
      val[k] = roopParse(v);
    });

    return val;
  } else {
    if (typeof val === 'string' && _.includes(val.substr(0, 2), '{', '[')) {
      try {
        return JSON.parse(val);
      } catch (err) {
        return val;
      }
    } else {
      return val;
    }
  }
}

var iBaseRequest =
/*#__PURE__*/
function () {
  _createClass(iBaseRequest, [{
    key: "axiosInit",
    value: function axiosInit() {
      axios.defaults.baseURL = this.host;
      axios.interceptors.response.use(function (response) {
        return response;
      }, function (error) {
        return error && error.response ? Promise.reject(error.response) : error;
      });
    }
  }, {
    key: "host",
    get: function get() {
      return '/';
    }
  }, {
    key: "baseUrls",
    get: function get() {
      return [];
    }
  }, {
    key: "resultKey",
    get: function get() {
      return 'code';
    }
  }]);

  function iBaseRequest(config) {
    _classCallCheck(this, iBaseRequest);

    this.axiosInit();
    this.SuccessCodes = config.SuccessCodes;
    this.ErrorCodes = config.ErrorCodes;
  }

  _createClass(iBaseRequest, [{
    key: "convertMoment2String",
    value: function convertMoment2String(res) {
      _$1.forEach(res, function (val, key) {
        if (val && _typeof(val) === 'object' && (moment.isMoment(val) || typeof val.getMonth === 'function')) {
          res[key] = moment(val).format('YYYY-MM-DD HH:mm:ss');
        }
      });

      return res;
    }
  }, {
    key: "request",
    value: function () {
      var _request = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(key) {
        var data,
            options,
            conf,
            filter,
            res,
            _args = arguments;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                data = _args.length > 1 && _args[1] !== undefined ? _args[1] : {};
                options = _args.length > 2 && _args[2] !== undefined ? _args[2] : {};

                if (!(_typeof(this.config) !== 'object')) {
                  _context.next = 4;
                  break;
                }

                throw 'please init this apiFetch';

              case 4:
                conf = this.config[key];

                if (conf) {
                  _context.next = 7;
                  break;
                }

                throw "not found the config key:".concat(key);

              case 7:
                filter = options.filter || function (x) {
                  return !_$1.isNull(x) && !_$1.isUndefined(x);
                }; // x !== '' &&


                _context.prev = 8;
                _context.next = 11;
                return axios(createApiBody(conf.method, path.join.apply(path, _toConsumableArray(this.baseUrls).concat([conf.uri])), _$1.merge(_$1.pickBy(this.convertMoment2String(data), filter), conf.data), _$1.merge(this.header, conf.header), options));

              case 11:
                res = _context.sent;
                _context.next = 17;
                break;

              case 14:
                _context.prev = 14;
                _context.t0 = _context["catch"](8);
                return _context.abrupt("return", this.errorHandle(_context.t0, ['system error!! please try again later']));

              case 17:
                return _context.abrupt("return", res.status === 200 ? this.resultHandle(res, options) : this.errorHandle(res, ['system error!! please try again later']));

              case 18:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[8, 14]]);
      }));

      function request(_x) {
        return _request.apply(this, arguments);
      }

      return request;
    }()
    /**
    * 處理api回傳結果
     * @param res
     * @param options
     * @returns {*}
     */

  }, {
    key: "resultHandle",
    value: function resultHandle(res, options) {
      var errorMessages = this.codeHandle(res);
      var successF = options.success || options.s;
      var failF = options.fail || options.f;

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
          return res.data;
        }
      }
    }
    /**
     * 錯誤碼處理
     * @param res
     * @returns {Array}
     */

  }, {
    key: "codeHandle",
    value: function codeHandle(res) {
      var _this = this;

      var errorMessages = [];
      var codes = res.data[this.resultKey];

      switch (_typeof(codes)) {
        case 'object':
          _$1.forEach(codes, function (code) {
            if (_this.SuccessCodes.indexOf(code) === -1) {
              errorMessages.push(_this.getErrorMessage[code]);
            }
          });

          break;

        case 'string':
        case 'number':
          if (this.SuccessCodes.indexOf(codes) === -1) {
            errorMessages.push(this.getErrorMessage[codes]);
          }

          break;
      }

      return errorMessages;
    }
    /**
    * 判空處理
     * @param code
     * @returns {string}
     */

  }, {
    key: "getErrorMessage",
    value: function getErrorMessage(code) {
      return this.ErrorCodes && this.ErrorCodes[code] ? this.ErrorCodes[code] : 'system error!!';
    }
    /**
    * 處理request錯誤
     * @param res
     * @param errorMessages
     */

  }, {
    key: "errorHandle",
    value: function errorHandle(res, errorMessages) {
      switch (res.status) {
        case 404:
          throw {
            res: res.data.error,
            msg: 'page not found'
          };
          break;

        case 500:
          throw {
            res: res.data.error,
            msg: 'api crashed'
          };
          break;

        default:
          // alert(msg)
          throw _objectSpread2({
            message: errorMessages.join('\n')
          }, res);
          break;
      }
    }
  }]);

  return iBaseRequest;
}();

var _JacPlugin = {
  install: function install(Vue) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var _ = options._;
    var moment = options.moment;

    if (_) {
      _.mixin({
        getVal: function getVal(data, prop) {
          var defaultVal = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

          var res = _.head(_(data).at(prop).value());

          return !_.isUndefined(res) ? res : defaultVal;
        }
      }, {
        chain: false
      });

      Vue.prototype._ = _;
    }

    if (moment) {
      // 增加moment getDateTime方法
      moment.fn.getDateTime = function () {
        return this.format('YYYY-MM-DD HH:mm:ss');
      }; // 增加moment getDate方法


      moment.fn.getDate = function () {
        return this.format('YYYY-MM-DD');
      }; // 增加moment get php timestamp方法


      moment.fn.timestamp = function () {
        return this.valueOf() / 1000;
      };

      Vue.prototype.moment = moment;
    }

    Vue.prototype.$open = function (url, title, config) {
      window.open(url, title, qs.stringify(config).replace('&', ','));
    };
  }
};

var iBaseRequest$1 = iBaseRequest;
var JacPlugin = _JacPlugin; // import iBaseRequest from './lib/iBaseRequest'
// import JacPlugin from './lib/JacPlugin'
// export {iBaseRequest, JacPlugin}

export { JacPlugin, iBaseRequest$1 as iBaseRequest };
