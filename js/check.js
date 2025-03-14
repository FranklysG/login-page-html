// document.addEventListener('DOMContentLoaded', () => {
//   const input = document.querySelector('input[name=jwt]');

//   if (input) {
//     const observer = new MutationObserver(() => {
//       if (input.value) {
//         const baseUrl = document.body.getAttribute('data-base-url');
//         localStorage.setItem('jwt', input.value);
//         localStorage.setItem('base_url', baseUrl);
//       }
//     });

//     observer.observe(input, { attributes: true, attributeFilter: ['value'] });
//   }
// });
