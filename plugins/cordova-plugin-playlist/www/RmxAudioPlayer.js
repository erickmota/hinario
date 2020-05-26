/**
* This file has been generated by Babel. DO NOT EDIT IT DIRECTLY
* 
* Edit the source file at src/js/RmxAudioPlayer.ts
**/
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.AudioPlayer = exports.RmxAudioPlayer = void 0;

var _Constants = require("./Constants");

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var exec = typeof cordova !== 'undefined' ? cordova.require('cordova/exec') : null; // const channel = typeof cordova !== 'undefined' ? cordova.require('cordova/channel') : null;

var log = console;
var itemStatusChangeTypes = [_Constants.RmxAudioStatusMessage.RMXSTATUS_PLAYBACK_POSITION, _Constants.RmxAudioStatusMessage.RMXSTATUS_DURATION, _Constants.RmxAudioStatusMessage.RMXSTATUS_BUFFERING, _Constants.RmxAudioStatusMessage.RMXSTATUS_CANPLAY, _Constants.RmxAudioStatusMessage.RMXSTATUS_LOADING, _Constants.RmxAudioStatusMessage.RMXSTATUS_LOADED, _Constants.RmxAudioStatusMessage.RMXSTATUS_PAUSE, _Constants.RmxAudioStatusMessage.RMXSTATUS_COMPLETED, _Constants.RmxAudioStatusMessage.RMXSTATUS_ERROR];
/**
 * AudioPlayer class implementation. A singleton of this class is exported for use by Cordova,
 * but nothing stops you from creating another instance. Keep in mind that the native players
 * are in fact singletons, so the only thing the separate instance gives you would be
 * separate onStatus callback streams.
 */

var RmxAudioPlayer =
/*#__PURE__*/
function () {
  _createClass(RmxAudioPlayer, [{
    key: "currentState",

    /**
     * The current summarized state of the player, as a string. It is preferred that you use the 'isX' accessors,
     * because they properly interpret the range of these values, but this field is exposed if you wish to observe
     * or interrogate it.
     */
    get: function get() {
      return this._currentState;
    }
    /**
     * True if the plugin has been initialized. You'll likely never see this state; it is handled internally.
     */

  }, {
    key: "isInitialized",
    get: function get() {
      return this._inititialized;
    }
  }, {
    key: "currentTrack",
    get: function get() {
      return this._currentItem;
    }
    /**
     * If the playlist is currently playling a track.
     */

  }, {
    key: "isPlaying",
    get: function get() {
      return this._currentState === 'playing';
    }
    /**
     * True if the playlist is currently paused
     */

  }, {
    key: "isPaused",
    get: function get() {
      return this._currentState === 'paused' || this._currentState === 'stopped';
    }
    /**
     * True if the plugin is currently loading its *current* track.
     * On iOS, many tracks are loaded in parallel, so this only reports for the *current item*, e.g.
     * the item that will begin playback if you press pause.
     * If you need track-specific data, it is better to watch the onStatus stream and watch for RMXSTATUS_LOADING,
     * which will be raised independently & simultaneously for every track in the playlist.
     * On Android, tracks are only loaded as they begin playback, so this value and RMXSTATUS_LOADING should always
     * apply to the same track.
     */

  }, {
    key: "isLoading",
    get: function get() {
      return this._currentState === 'loading';
    }
    /**
     * True if the *currently playing track* has been loaded and can be played (this includes if it is *currently playing*).
     */

  }, {
    key: "hasLoaded",
    get: function get() {
      return this._hasLoaded;
    }
    /**
     * True if the *current track* has reported an error. In almost all cases,
     * the playlist will automatically skip forward to the next track, in which case you will also receive
     * an RMXSTATUS_TRACK_CHANGED event.
     */

  }, {
    key: "hasError",
    get: function get() {
      return this._hasError;
    }
    /**
     * Creates a new RmxAudioPlayer instance.
     */

  }]);

  function RmxAudioPlayer() {
    var _this = this;

    _classCallCheck(this, RmxAudioPlayer);

    _defineProperty(this, "handlers", {});

    _defineProperty(this, "options", {
      verbose: false,
      resetStreamOnPause: true
    });

    _defineProperty(this, "_inititialized", false);

    _defineProperty(this, "_initPromise", void 0);

    _defineProperty(this, "_readyResolve", void 0);

    _defineProperty(this, "_readyReject", void 0);

    _defineProperty(this, "_currentState", 'unknown');

    _defineProperty(this, "_hasError", false);

    _defineProperty(this, "_hasLoaded", false);

    _defineProperty(this, "_currentItem", null);

    _defineProperty(this, "ready", function () {
      return _this._initPromise;
    });

    _defineProperty(this, "initialize", function () {
      // Initialize the plugin to send and receive messages
      // channel.createSticky('onRmxAudioPlayerReady');
      // channel.waitForInitialization('onRmxAudioPlayerReady');
      var onNativeStatus = function onNativeStatus(msg) {
        // better or worse, we got an answer back from native, so we resolve.
        _this._inititialized = true;

        _this._readyResolve(true);

        if (msg.action === 'status') {
          _this.onStatus(msg.status.trackId, msg.status.msgType, msg.status.value);
        } else {
          console.warn('Unknown audio player onStatus message:', msg.action);
        }
      }; // channel.onCordovaReady.subscribe(() => {


      var error = function error(args) {
        var message = 'CORDOVA RMXAUDIOPLAYER: Error storing message channel:';
        console.warn(message, args);

        _this._readyReject({
          message,
          args
        });
      };

      exec(onNativeStatus, error, 'RmxAudioPlayer', 'initialize', []); // channel.initializationComplete('onRmxAudioPlayerReady');
      // });

      return _this._initPromise;
    });

    _defineProperty(this, "setOptions", function (successCallback, errorCallback, options) {
      _this.options = _objectSpread({}, _this.options, options);
      exec(successCallback, errorCallback, 'RmxAudioPlayer', 'setOptions', [options]);
    });

    _defineProperty(this, "setPlaylistItems", function (successCallback, errorCallback, items, options) {
      exec(successCallback, errorCallback, 'RmxAudioPlayer', 'setPlaylistItems', [_this.validateTracks(items), options || {}]);
    });

    _defineProperty(this, "addItem", function (successCallback, errorCallback, trackItem) {
      var validTrackItem = _this.validateTrack(trackItem);

      if (!validTrackItem) {
        return errorCallback(new Error('Provided track is null or not an audio track'));
      }

      exec(successCallback, errorCallback, 'RmxAudioPlayer', 'addItem', [validTrackItem]);
    });

    _defineProperty(this, "addAllItems", function (successCallback, errorCallback, items) {
      exec(successCallback, errorCallback, 'RmxAudioPlayer', 'addAllItems', [_this.validateTracks(items)]);
    });

    _defineProperty(this, "removeItem", function (successCallback, errorCallback, removeItem) {
      if (!removeItem) {
        return errorCallback(new Error('Track removal spec is empty'));
      }

      if (!removeItem.trackId && !removeItem.trackIndex) {
        return errorCallback(new Error('Track removal spec is invalid'));
      }

      exec(successCallback, errorCallback, 'RmxAudioPlayer', 'removeItem', [removeItem.trackIndex, removeItem.trackId]);
    });

    _defineProperty(this, "removeItems", function (successCallback, errorCallback, items) {
      exec(successCallback, errorCallback, 'RmxAudioPlayer', 'removeItems', [items]);
    });

    _defineProperty(this, "clearAllItems", function (successCallback, errorCallback) {
      exec(successCallback, errorCallback, 'RmxAudioPlayer', 'clearAllItems', []);
    });

    _defineProperty(this, "play", function (successCallback, errorCallback) {
      exec(successCallback, errorCallback, 'RmxAudioPlayer', 'play', []);
    });

    _defineProperty(this, "playTrackByIndex", function (successCallback, errorCallback, index, position) {
      exec(successCallback, errorCallback, 'RmxAudioPlayer', 'playTrackByIndex', [index, position || 0]);
    });

    _defineProperty(this, "playTrackById", function (successCallback, errorCallback, trackId, position) {
      exec(successCallback, errorCallback, 'RmxAudioPlayer', 'playTrackById', [trackId, position || 0]);
    });

    _defineProperty(this, "pause", function (successCallback, errorCallback) {
      exec(successCallback, errorCallback, 'RmxAudioPlayer', 'pause', []);
    });

    _defineProperty(this, "skipForward", function (successCallback, errorCallback) {
      exec(successCallback, errorCallback, 'RmxAudioPlayer', 'skipForward', []);
    });

    _defineProperty(this, "skipBack", function (successCallback, errorCallback) {
      exec(successCallback, errorCallback, 'RmxAudioPlayer', 'skipBack', []);
    });

    _defineProperty(this, "seekTo", function (successCallback, errorCallback, position) {
      exec(successCallback, errorCallback, 'RmxAudioPlayer', 'seekTo', [position]);
    });

    _defineProperty(this, "seekToQueuePosition", function (successCallback, errorCallback, position) {
      exec(successCallback, errorCallback, 'RmxAudioPlayer', 'seekToQueuePosition', [position]);
    });

    _defineProperty(this, "setPlaybackRate", function (successCallback, errorCallback, rate) {
      exec(successCallback, errorCallback, 'RmxAudioPlayer', 'setPlaybackRate', [rate]);
    });

    _defineProperty(this, "setVolume", function (successCallback, errorCallback, volume) {
      exec(successCallback, errorCallback, 'RmxAudioPlayer', 'setPlaybackVolume', [volume]);
    });

    _defineProperty(this, "setLoop", function (successCallback, errorCallback, loop) {
      exec(successCallback, errorCallback, 'RmxAudioPlayer', 'setLoopAll', [!!loop]);
    });

    _defineProperty(this, "getPlaybackRate", function (successCallback, errorCallback) {
      exec(successCallback, errorCallback, 'RmxAudioPlayer', 'getPlaybackRate', []);
    });

    _defineProperty(this, "getVolume", function (successCallback, errorCallback) {
      exec(successCallback, errorCallback, 'RmxAudioPlayer', 'getPlaybackVolume', []);
    });

    _defineProperty(this, "getPosition", function (successCallback, errorCallback) {
      exec(successCallback, errorCallback, 'RmxAudioPlayer', 'getPlaybackPosition', []);
    });

    _defineProperty(this, "getCurrentBuffer", function (successCallback, errorCallback) {
      exec(successCallback, errorCallback, 'RmxAudioPlayer', 'getCurrentBuffer', []);
    });

    _defineProperty(this, "getQueuePosition", function (successCallback, errorCallback) {
      exec(successCallback, errorCallback, 'RmxAudioPlayer', 'getQueuePosition', []);
    });

    _defineProperty(this, "validateTracks", function (items) {
      if (!items || !Array.isArray(items)) {
        return [];
      }

      return items.map(_this.validateTrack).filter(function (x) {
        return x;
      }); // may produce an empty array!
    });

    _defineProperty(this, "validateTrack", function (track) {
      if (!track) {
        return null;
      } // For now we will rely on TS to do the heavy lifting, but we can add a validation here
      // that all the required fields are valid. For now we just take care of the unique ID.


      track.trackId = track.trackId || _this.generateUUID();
      return track;
    });

    this.handlers = {};
    this._initPromise = new Promise(function (resolve, reject) {
      _this._readyResolve = resolve;
      _this._readyReject = reject;
    });
  }
  /**
   * Player interface
   */

  /**
   * Returns a promise that resolves when the plugin is ready.
   */


  _createClass(RmxAudioPlayer, [{
    key: "onStatus",

    /**
     * Status event handling
     */

    /**
     * @internal
     * Call this function to emit an onStatus event via the on('status') handler.
     * Internal use only, to raise events received from the native interface.
     */
    value: function onStatus(trackId, type, value) {
      var status = {
        type,
        trackId,
        value
      };

      if (this.options.verbose) {
        log.log("RmxAudioPlayer.onStatus: " + _Constants.RmxAudioStatusMessageDescriptions[type] + "(" + type + ") [" + trackId + "]: ", value);
      }

      if (status.type === _Constants.RmxAudioStatusMessage.RMXSTATUS_TRACK_CHANGED) {
        this._hasError = false;
        this._hasLoaded = false;
        this._currentState = 'loading';
        this._currentItem = status.value.currentItem;
      } // The plugin's status changes only in response to specific events.


      if (itemStatusChangeTypes.indexOf(status.type) >= 0) {
        // Only change the plugin's *current status* if the event being raised is for the current active track.
        if (this._currentItem && this._currentItem.trackId === trackId) {
          if (status.value && status.value.status) {
            this._currentState = status.value.status;
          }

          if (status.type === _Constants.RmxAudioStatusMessage.RMXSTATUS_CANPLAY) {
            this._hasLoaded = true;
          }

          if (status.type === _Constants.RmxAudioStatusMessage.RMXSTATUS_ERROR) {
            this._hasError = true;
          }
        }
      }

      this.emit('status', status);
    }
    /**
     * Subscribe to events raised by the plugin, e.g. on('status', (data) => { ... }),
     * For now, only 'status' is supported.
     *
     * @param eventName Name of event to subscribe to.
     * @param callback The callback function to receive the event data
     */

  }, {
    key: "on",
    value: function on(eventName, callback) {
      if (!Object.prototype.hasOwnProperty.call(this.handlers, eventName)) {
        this.handlers[eventName] = [];
      }

      this.handlers[eventName].push(callback);
    }
    /**
     * Remove an event handler from the plugin
     * @param eventName The name of the event whose subscription is to be removed
     * @param handle The event handler to destroy. Ensure that this is the SAME INSTANCE as the handler
     * that was passed in to create the subscription!
     */

  }, {
    key: "off",
    value: function off(eventName, handle) {
      if (Object.prototype.hasOwnProperty.call(this.handlers, eventName)) {
        var handleIndex = this.handlers[eventName].indexOf(handle);

        if (handleIndex >= 0) {
          this.handlers[eventName].splice(handleIndex, 1);
        }
      }
    }
    /**
     * @internal
     * Raises an event via the corresponding event handler. Internal use only.
     * @param args Event args to pass through to the handler.
     */

  }, {
    key: "emit",
    value: function emit() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var eventName = args.shift();

      if (!Object.prototype.hasOwnProperty.call(this.handlers, eventName)) {
        return false;
      }

      var handler = this.handlers[eventName];

      for (var i = 0; i < handler.length; i++) {
        var _callback = this.handlers[eventName][i];

        if (typeof _callback === 'function') {
          _callback.apply(void 0, args);
        }
      }

      return true;
    }
    /**
     * Validates the list of AudioTrack items to ensure they are valid.
     * Used internally but you can call this if you need to :)
     *
     * @param items The AudioTrack items to validate
     */

  }, {
    key: "generateUUID",

    /**
     * Generate a v4 UUID for use as a unique trackId. Used internally, but you can use this to generate track ID's if you want.
     */
    value: function generateUUID() {
      // Doesn't need to be perfect or secure, just good enough to give each item an ID.
      var d = new Date().getTime();

      if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
        d += performance.now(); //use high-precision timer if available
      } // There are better ways to do this in ES6, we are intentionally avoiding the import
      // of an ES6 polyfill here.


      var template = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
      return [].slice.call(template).map(function (c) {
        if (c === '-' || c === '4') {
          return c;
        }

        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : r & 0x3 | 0x8).toString(16);
      }).join('');
    }
  }]);

  return RmxAudioPlayer;
}();

exports.RmxAudioPlayer = RmxAudioPlayer;
var playerInstance = new RmxAudioPlayer();
/*!
 * AudioPlayer Plugin instance.
 */

var AudioPlayer = playerInstance;
exports.AudioPlayer = AudioPlayer;
var _default = playerInstance; // keep typescript happy

exports.default = _default;