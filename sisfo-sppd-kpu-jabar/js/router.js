/* ===========================================================================
   router.js — Router hash sederhana untuk SPA (cocok untuk hosting statis /
   GitHub Pages). app.js menyediakan fungsi resolve(path, parts).
   ========================================================================= */

let resolver = null;

export function startRouter(resolve) {
  resolver = resolve;
  window.addEventListener('hashchange', dispatch);
  dispatch();
}

function dispatch() {
  const hash = location.hash.replace(/^#/, '') || '/dashboard';
  const parts = hash.split('/').filter(Boolean); // ['sppd','id']
  if (resolver) resolver('/' + parts.join('/'), parts);
}

export function go(path) {
  if (location.hash === '#' + path) dispatchManual(path);
  else location.hash = path;
}

function dispatchManual(path) {
  const parts = path.split('/').filter(Boolean);
  if (resolver) resolver('/' + parts.join('/'), parts);
}

export function currentPath() {
  return (location.hash.replace(/^#/, '') || '/dashboard');
}
