// ZONA 33 · Bridge for the modern operations layer
// app.js exposes Supabase as a global lexical binding (`sb`), not a window property.
// Make it available to enhancements21.js without changing the existing app.js.
(function(){
  try {
    if (typeof sb !== 'undefined' && !window.sb) window.sb = sb;
  } catch (e) {
    console.error('ZONA33 modern layer bridge failed:', e);
  }
})();
