'use strict';

var app = app || {};

const ENV = {};

ENV.isProduction = window.location.protocol === 'https:';
ENV.productionApiUrl = 'insert cloud API server URL here';
ENV.developmentApiUrl = 'insert local API server URL here';
ENV.apiUrl = ENV.isProduction ? ENV.productionApiUrl : ENV.developmentApiUrl;

(function(module) {
  function errorCallback(err) {
    console.error(err);
    module.errorView.initErrorPage(err);
  }

  function Book(rawBookObj) {
    Object.keys(rawBookObj).forEach(key => this[key] = rawBookObj[key]);
  }

  Book.prototype.toHtml = function() {
    let template = Handlebars.compile($('#book-list-template').text());
    return template(this);
  }

  Book.all = [];
  
  Book.loadAll = rows => Book.all = rows.sort((a, b) => b.title - a.title).map(book => new Book(book));
  
  Book.fetchAll = callback =>
    $.get(`${ENV.apiUrl}/api/v1/books`)
      .then(Book.loadAll)
      .then(callback)
      .catch(errorCallback);

  Book.fetchOne = (ctx, callback) =>
    $.get(`${ENV.apiUrl}/api/v1/books/${ctx.params.book_id}`)
      .then(results => ctx.book = results[0])
      .then(callback)
      .catch(errorCallback);

  Book.create = book =>
    $.post(`${ENV.apiUrl}/api/v1/books`, book)
      .then(() => page('/'))
      .catch(errorCallback);

  Book.update = (book, bookId) =>
      $.ajax({ //Why so asyncronous???
        url: `${ENV.apiUrl}/api/v1/books/${bookId}`,
        method: 'PUT',
        data: book,
      })
      .then(() => page(`/books/${bookId}`))
      .catch(errorCallback)

  Book.destroy = id =>
    $.ajax({
      url: `${ENV.apiUrl}/api/v1/books/${id}`,
      method: 'DELETE',
    })
    .then(() => page('/'))
    .catch(errorCallback)

  // DONE: Where is this method invoked? What is passed in as the 'book' argument when invoked? What callback will be invoked after Book.loadAll is invoked?
  //This is invoked in the book-view.js file in the bookView.initSearchFormPage method. The callback function to be called is bookView.initSearchResultsPage in the book-view.js.
  Book.find = (book, callback) =>
    $.get(`${ENV.apiUrl}/api/v1/books/find`, book)
      .then(Book.loadAll)
      .then(callback)
      .catch(errorCallback)

  // DONE: Where is this method invoked? How does it differ from the Book.find method, above?
  // This is invoked in the book-view.js file in the bookView. This is targeting a specific book that has it's id passed from user interaction on a button that has an event listener which then displays a single detailed view of said book. This has a isbn as a unique value passed as a parameter rather than user input (text search) from the user as parameters. 
  Book.findOne = isbn =>
    $.get(`${ENV.apiUrl}/api/v1/books/find/${isbn}`)
    .then(Book.create)
    .catch(errorCallback)

  module.Book = Book;
})(app)
