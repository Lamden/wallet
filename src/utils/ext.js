/* global chrome window browser */
/* eslint-disable no-underscore-dangle */
const apis = [
  'alarms',
  'bookmarks',
  'browserAction',
  'commands',
  'contextMenus',
  'cookies',
  'downloads',
  'events',
  'extension',
  'extensionTypes',
  'history',
  'i18n',
  'idle',
  'notifications',
  'pageAction',
  'runtime',
  'storage',
  'tabs',
  'webNavigation',
  'webRequest',
  'windows',
];

function Extension() {
  const _this = this;

  apis.forEach((api) => {
    _this[api] = null;

    try {
      if (chrome[api]) {
        _this[api] = chrome[api];
      }
    } catch (e) {
      // continue regardless of error
    }

    try {
      if (window[api]) {
        _this[api] = window[api];
      }
    } catch (e) {
      // continue regardless of error
    }

    try {
      if (browser[api]) {
        _this[api] = browser[api];
      }
    } catch (e) {
      // continue regardless of error
    }
    try {
      _this.api = browser.extension[api];
    } catch (e) {
      // continue regardless of error
    }
  });

  try {
    if (browser && browser.runtime) {
      this.runtime = browser.runtime;
    }
  } catch (e) {
    // continue regardless of error
  }

  try {
    if (browser && browser.browserAction) {
      this.browserAction = browser.browserAction;
    }
  } catch (e) {
    // continue regardless of error
  }
}

module.exports = new Extension();
