var casper = require("casper").create({
  verbose: true,
  logLevel: 'error',
  pageSettings: {
    loadPlugins: false
  }
});

var fs = require('fs');
var url = 'https://www.amazon.de/Conthfut-Quadrocopter-App-Steuerung-Headless-Faltbare/product-reviews/B07GB35DF7/ref=cm_cr_getr_d_paging_btm_prev_1?ie=UTF8&reviewerType=all_reviews&pageNumber=1';

var currentPage = 1;

var allAuthorsAndReviews = '';

var currentPageAuthors;
var currentReviews;

function terminate() {
  this.echo('\n Reviews: ' + allAuthorsAndReviews).exit();
}

function getAuthors() {
    var authors = document.querySelectorAll('div.a-section.celwidget div.a-row.a-spacing-mini a.a-profile div.a-profile-content span.a-profile-name')
    return Array.prototype.map.call(authors, function(e){
        return e.innerText;
    });
};

function getReviews() {
    var reviews = document.querySelectorAll('a[data-hook="review-title"] span')

    return Array.prototype.map.call(reviews, function(e){
        return e.innerText;
    });
};

var processPage = function() {
  casper.wait(10000, function() {
    console.log('waited 10 second');
    this.echo("capturing page " + currentPage);
    this.capture("drone-results-p" + currentPage + ".png");

    currentPageAuthors = this.evaluate(getAuthors);
    currentReviews = this.evaluate(getReviews);

    var authorsAndReviews = [];

    for(let i = 0; i < currentPageAuthors.length; i++){
        authorsAndReviews.push(currentPageAuthors[i] + ': ' + currentReviews[i]);
    }

    allAuthorsAndReviews += '\n' + authorsAndReviews.join('\n');

    currentPage++;

    if (this.exists("li.a-disabled.a-last")) {
        return terminate.call(casper);
    }

    this.echo("requesting next page: " + currentPage);

    this.thenClick('li.a-last a').then(function() {
        this.waitFor(function() {
            return true;
        }, processPage, terminate);
    });
  });
};

casper.start(url, function() {
  this.echo(this.getTitle());
  this.capture("title" + ".png");
});

casper.waitForSelector('span[data-hook="cr-filter-info-review-count"]', processPage, terminate);

casper.run();
