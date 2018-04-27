/* global WebSocket */
/* eslint-disable no-console */

import ext from './utils/ext';

const LIVERELOAD_HOST = 'localhost:';
const LIVERELOAD_PORT = 35729;
const connection = new WebSocket(`ws://${LIVERELOAD_HOST}${LIVERELOAD_PORT}/livereload`);

connection.onerror = (error) => {
  console.log('reload connection got error:', error);
};

connection.onmessage = (e) => {
  if (e.data) {
    const data = JSON.parse(e.data);
    if (data && data.command === 'reload') {
      ext.runtime.reload();
    }
  }
};
