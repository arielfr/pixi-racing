const ghPages = require('gh-pages');

ghPages.publish('game', function(err) {
  console.error(`An error ocurr: ${err}`);
});
