var semver = require('semver');
var _ = require('lodash');
var NpmStats = require('npm-stats');

var TIMEOUT = 5000;
var NOOP = function() {};

var DEFAULTS = {
  registry: 'https://skimdb.npmjs.com/',
  all: [],
  stable: [],
  updated: undefined
};

module.exports = NpmSource;

function NpmSource(options) {
  _.extend(this, DEFAULTS, options);
}

NpmSource.prototype.update = function(done) {
  done = done || NOOP;

  NpmStats(this.registry)
    .module('npm')
    .info(parseResponse.bind(this));

  function parseResponse(err, info, response) {
    if (err) return done(err, false);
    if (response['status-code'] !== 200) return done(new Error('Bad response'), false);

    this._parse(info);
    done(undefined, true);
  }
};

NpmSource.prototype._parse = function(info) {
  var versions = _.unique(Object.keys(info.versions));
  var tags = _.unique(Object.keys(info['dist-tags']));  // omitting as this breaks semver, needs a 'tags' concept

  this.all = versions.filter(semver.valid).sort(semver.compare);
  this.stable = this.all;
  this.updated = new Date();
};