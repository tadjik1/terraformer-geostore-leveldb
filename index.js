var levelup = require('levelup');
var leveldown = require('leveldown');
var encode = require('encoding-down');
module.exports = LevelStore;
function LevelStore (options, cb) {
  if (typeof options === 'string') {
    options = {
      location: options
    };
  }
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  options = options || {};

  this.location = options.location || './db';

  if (options.defaultCallback) {
    this.defaultCallback = options.defaultCallback;
  }
  cb = cb || this.defaultCallback;

  this.db = levelup(encode(leveldown(this.location), {
    keyEncoding: 'json',
    valueEncoding: 'json'
  }), cb);

  this.close = this.db.close.bind(this.db);
}

LevelStore.prototype.add = function (geojson, callback) {
  callback = callback || this.defaultCallback;
  if (geojson.type === "FeatureCollection") {
    this.db.batch(geojson.features.map(function (feature) {
      return {
        type: 'put',
        key: feature.id,
        value: feature
      };
    }), callback);
  } else {
    this.db.put(geojson.id, geojson, callback);
  }
};

LevelStore.prototype.get = function (id, callback) {
  callback = callback || this.defaultCallback;
  this.db.get(id, callback);
};

LevelStore.prototype.update = function (geojson, callback) {
  callback = callback || this.defaultCallback;
  this.add(geojson, callback);
};

LevelStore.prototype.remove = function (id, callback) {
  callback = callback || this.defaultCallback;
  if (Array.isArray(id)){
    this.db.batch(id.map(function (id) {
      return {
        type: 'del',
        key: id
      };
    }), callback);
  } else {
    this.db.del(id, callback);
  }
};

LevelStore.prototype.defaultCallback = function (err) {
  if (err) {
    throw err;
  }
};