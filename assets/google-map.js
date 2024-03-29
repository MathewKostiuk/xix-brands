// do not edit .js files directly - edit src/index.jst



var fastDeepEqual = function equal(a, b) {
    if (a === b) return true;
  
    if (a && b && typeof a == 'object' && typeof b == 'object') {
      if (a.constructor !== b.constructor) return false;
  
      var length, i, keys;
      if (Array.isArray(a)) {
        length = a.length;
        if (length != b.length) return false;
        for (i = length; i-- !== 0;)
          if (!equal(a[i], b[i])) return false;
        return true;
      }
  
  
  
      if (a.constructor === RegExp) return a.source === b.source && a.flags === b.flags;
      if (a.valueOf !== Object.prototype.valueOf) return a.valueOf() === b.valueOf();
      if (a.toString !== Object.prototype.toString) return a.toString() === b.toString();
  
      keys = Object.keys(a);
      length = keys.length;
      if (length !== Object.keys(b).length) return false;
  
      for (i = length; i-- !== 0;)
        if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;
  
      for (i = length; i-- !== 0;) {
        var key = keys[i];
  
        if (!equal(a[key], b[key])) return false;
      }
  
      return true;
    }
  
    // true if both NaN, false otherwise
    return a!==a && b!==b;
  };
  
  /**
   * Copyright 2019 Google LLC. All Rights Reserved.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at.
   *
   *      Http://www.apache.org/licenses/LICENSE-2.0.
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  const DEFAULT_ID = "__googleMapsScriptId";
  /**
   * The status of the [[Loader]].
   */
  var LoaderStatus;
  (function (LoaderStatus) {
      LoaderStatus[LoaderStatus["INITIALIZED"] = 0] = "INITIALIZED";
      LoaderStatus[LoaderStatus["LOADING"] = 1] = "LOADING";
      LoaderStatus[LoaderStatus["SUCCESS"] = 2] = "SUCCESS";
      LoaderStatus[LoaderStatus["FAILURE"] = 3] = "FAILURE";
  })(LoaderStatus || (LoaderStatus = {}));
  /**
   * [[Loader]] makes it easier to add Google Maps JavaScript API to your application
   * dynamically using
   * [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).
   * It works by dynamically creating and appending a script node to the the
   * document head and wrapping the callback function so as to return a promise.
   *
   * ```
   * const loader = new Loader({
   *   apiKey: "",
   *   version: "weekly",
   *   libraries: ["places"]
   * });
   *
   * loader.load().then((google) => {
   *   const map = new google.maps.Map(...)
   * })
   * ```
   */
  class Loader {
      /**
       * Creates an instance of Loader using [[LoaderOptions]]. No defaults are set
       * using this library, instead the defaults are set by the Google Maps
       * JavaScript API server.
       *
       * ```
       * const loader = Loader({apiKey, version: 'weekly', libraries: ['places']});
       * ```
       */
      constructor({ apiKey, channel, client, id = DEFAULT_ID, libraries = [], language, region, version, mapIds, nonce, retries = 3, url = "https://maps.googleapis.com/maps/api/js", }) {
          this.CALLBACK = "__googleMapsCallback";
          this.callbacks = [];
          this.done = false;
          this.loading = false;
          this.errors = [];
          this.version = version;
          this.apiKey = apiKey;
          this.channel = channel;
          this.client = client;
          this.id = id || DEFAULT_ID; // Do not allow empty string
          this.libraries = libraries;
          this.language = language;
          this.region = region;
          this.mapIds = mapIds;
          this.nonce = nonce;
          this.retries = retries;
          this.url = url;
          if (Loader.instance) {
              if (!fastDeepEqual(this.options, Loader.instance.options)) {
                  throw new Error(`Loader must not be called again with different options. ${JSON.stringify(this.options)} !== ${JSON.stringify(Loader.instance.options)}`);
              }
              return Loader.instance;
          }
          Loader.instance = this;
      }
      get options() {
          return {
              version: this.version,
              apiKey: this.apiKey,
              channel: this.channel,
              client: this.client,
              id: this.id,
              libraries: this.libraries,
              language: this.language,
              region: this.region,
              mapIds: this.mapIds,
              nonce: this.nonce,
              url: this.url,
          };
      }
      get status() {
          if (this.errors.length) {
              return LoaderStatus.FAILURE;
          }
          if (this.done) {
              return LoaderStatus.SUCCESS;
          }
          if (this.loading) {
              return LoaderStatus.LOADING;
          }
          return LoaderStatus.INITIALIZED;
      }
      get failed() {
          return this.done && !this.loading && this.errors.length >= this.retries + 1;
      }
      /**
       * CreateUrl returns the Google Maps JavaScript API script url given the [[LoaderOptions]].
       *
       * @ignore
       */
      createUrl() {
          let url = this.url;
          url += `?callback=${this.CALLBACK}`;
          if (this.apiKey) {
              url += `&key=${this.apiKey}`;
          }
          if (this.channel) {
              url += `&channel=${this.channel}`;
          }
          if (this.client) {
              url += `&client=${this.client}`;
          }
          if (this.libraries.length > 0) {
              url += `&libraries=${this.libraries.join(",")}`;
          }
          if (this.language) {
              url += `&language=${this.language}`;
          }
          if (this.region) {
              url += `&region=${this.region}`;
          }
          if (this.version) {
              url += `&v=${this.version}`;
          }
          if (this.mapIds) {
              url += `&map_ids=${this.mapIds.join(",")}`;
          }
          return url;
      }
      deleteScript() {
          const script = document.getElementById(this.id);
          if (script) {
              script.remove();
          }
      }
      /**
       * Load the Google Maps JavaScript API script and return a Promise.
       */
      load() {
          return this.loadPromise();
      }
      /**
       * Load the Google Maps JavaScript API script and return a Promise.
       *
       * @ignore
       */
      loadPromise() {
          return new Promise((resolve, reject) => {
              this.loadCallback((err) => {
                  if (!err) {
                      resolve(window.google);
                  }
                  else {
                      reject(err.error);
                  }
              });
          });
      }
      /**
       * Load the Google Maps JavaScript API script with a callback.
       */
      loadCallback(fn) {
          this.callbacks.push(fn);
          this.execute();
      }
      /**
       * Set the script on document.
       */
      setScript() {
          if (document.getElementById(this.id)) {
              // TODO wrap onerror callback for cases where the script was loaded elsewhere
              this.callback();
              return;
          }
          const url = this.createUrl();
          const script = document.createElement("script");
          script.id = this.id;
          script.type = "text/javascript";
          script.src = url;
          script.onerror = this.loadErrorCallback.bind(this);
          script.defer = true;
          script.async = true;
          if (this.nonce) {
              script.nonce = this.nonce;
          }
          document.head.appendChild(script);
      }
      /**
       * Reset the loader state.
       */
      reset() {
          this.deleteScript();
          this.done = false;
          this.loading = false;
          this.errors = [];
          this.onerrorEvent = null;
      }
      resetIfRetryingFailed() {
          if (this.failed) {
              this.reset();
          }
      }
      loadErrorCallback(e) {
          this.errors.push(e);
          if (this.errors.length <= this.retries) {
              const delay = this.errors.length * Math.pow(2, this.errors.length);
              console.log(`Failed to load Google Maps script, retrying in ${delay} ms.`);
              setTimeout(() => {
                  this.deleteScript();
                  this.setScript();
              }, delay);
          }
          else {
              this.onerrorEvent = e;
              this.callback();
          }
      }
      setCallback() {
          window.__googleMapsCallback = this.callback.bind(this);
      }
      callback() {
          this.done = true;
          this.loading = false;
          this.callbacks.forEach((cb) => {
              cb(this.onerrorEvent);
          });
          this.callbacks = [];
      }
      execute() {
          this.resetIfRetryingFailed();
          if (this.done) {
              this.callback();
          }
          else {
              // short circuit and warn if google.maps is already loaded
              if (window.google && window.google.maps && window.google.maps.version) {
                  console.warn("Google Maps already loaded outside @googlemaps/js-api-loader." +
                      "This may result in undesirable behavior as options and script parameters may not match.");
                  this.callback();
                  return;
              }
              if (this.loading) ;
              else {
                  this.loading = true;
                  this.setCallback();
                  this.setScript();
              }
          }
      }
  }
  
  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation.
  
  Permission to use, copy, modify, and/or distribute this software for any
  purpose with or without fee is hereby granted.
  
  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
  PERFORMANCE OF THIS SOFTWARE.
  ***************************************************************************** */
  
  function __awaiter(thisArg, _arguments, P, generator) {
      function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
      return new (P || (P = Promise))(function (resolve, reject) {
          function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
          function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
          function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
          step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
  }
  
  class GoogleMap {
      initMap(options) {
          return __awaiter(this, void 0, void 0, function* () {
              yield this._loadJSAPI(options);
               //   const mapDiv = this._getMapDiv(options);

              // Initialize the map
            //   const map = new google.maps.Map(mapDiv, options.mapOptions);
            //   return map;
            return google.maps;
          });
      }
    //   _getMapDiv(options) {
    //       // Get the div to load the map into
    //       let mapDiv = document.getElementById(options.divId);
    //       if (options.append) {
    //           mapDiv = this._appendMapDiv(mapDiv);
    //       }
    //       return mapDiv;
    //   }
    //   _appendMapDiv(mapDiv) {
    //       const appendDivId = 'google_map_appended';
    //       const appendDiv = document.createElement('div');
    //       appendDiv.setAttribute('id', appendDivId);
    //       mapDiv.appendChild(appendDiv);
    //       return appendDiv;
    //   }
      _loadJSAPI(options) {
          return __awaiter(this, void 0, void 0, function* () {
              if (!options.apiOptions) {
                  options.apiOptions = {};
              }
              const loaderOptions = Object.assign(options.apiOptions, { apiKey: options.apiKey });
              const loader = new Loader(loaderOptions);
              // Load the Maps JS API
              return loader.load();
          });
      }
  }
  window.GoogleMap = GoogleMap;
//   export { GoogleMap, GoogleMap as default };
  