/* global document */
import storage from './utils/storage';

const colorSelectors = document.querySelectorAll('.js-radio');

const setColor = (color) => {
  document.body.style.backgroundColor = color;
};

storage.get('color', (resp) => {
  const { color } = resp;
  let option;
  if (color) {
    option = document.querySelector(`.js-radio.${color}`);
    setColor(color);
  } else {
    option = colorSelectors[0]; // eslint-disable-line prefer-destructuring
  }

  option.setAttribute('checked', 'checked');
});

colorSelectors.forEach((el) => {
  el.addEventListener('click', function click() {
    const { value } = this;
    storage.set({ color: value }, () => {
      setColor(value);
    });
  });
});
