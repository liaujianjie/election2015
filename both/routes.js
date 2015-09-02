FlowRouter.route('/', {
  action: function() {
    BlazeLayout.render("mainLayout", {content: "home"});
  }
});

FlowRouter.route('/pick', {
  action: function() {
    BlazeLayout.render("mainLayout", {content: "pick"});
  }
});

FlowRouter.route('/confirm/:slug', {
  action: function(params, queryParams) {
    BlazeLayout.render("mainLayout", {content: "confirm"});
  }
});

FlowRouter.route('/test', {
  action: function() {
    BlazeLayout.render("mainLayout", {content: "test"});
  }
});

// Router.route('/', function () {
//   this.render('home');
// });
//
// Router.route('/pick', function () {
//   this.render('pick');
// });
//
// Router.route('/test', function () {
//   this.render('test');
// });
