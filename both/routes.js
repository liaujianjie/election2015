// FlowRouter.route('/', {
//   action: function() {
//     BlazeLayout.render("mainLayout", {content: "home"});
//   }
// });

Router.route('/', function () {
  this.render('home');
});

Router.route('/pick', function () {
  this.render('pick');
});

Router.route('/test', function () {
  this.render('test');
});
