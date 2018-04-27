/* global document */
import ext from './utils/ext';
import storage from './utils/storage';

const popup = document.getElementById('app');
storage.get('color', (resp) => {
  const { color } = resp;
  if (color) {
    popup.style.backgroundColor = color;
  }
});

popup.addEventListener('click', (e) => {
  if (e.target && e.target.matches('#sign-btn')) {
    e.preventDefault();
    const unsignedTx = document.getElementById('unsigned_tx').value;
    document.getElementById('signed_tx').value = unsignedTx.split('').reverse().join('');
  }
});

const optionsLink = document.querySelector('.js-options');
optionsLink.addEventListener('click', (e) => {
  e.preventDefault();
  ext.runtime.openOptionsPage();
});
