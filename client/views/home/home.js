Template.home.onCreated(function() {
});

Template.home.onRendered(function() {
});

Template.home.helpers({
  isLoggedIn: function() {
    return FBWrapper.isLoggedIn();
  },
  name: function() {
    return FBWrapper.name();
  },
  parties: function() {
    return ['pap','nsp','rp','sda','sdp','sfp','spp','wp'];
  }
});

Template.home.events({
  'click .login-fb': function() {
    if (!FBWrapper.isLoggedIn())
      FBWrapper.performLogin();
    else
      FlowRouter.go('/pick');
  }
});
