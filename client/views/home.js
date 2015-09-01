var facebookInit = new ReactiveVar(false, function() {
  FBWrapper.checkLoginStatus();
});
var facebookIsLoggedIn = new ReactiveVar(false);
var facebookAccessToken = new ReactiveVar();
var facebookUserId = new ReactiveVar();
// TODO: switch from reactive vars to session vars!

var FBWrapper = {
  /* methods */
  asyncInit: function(callback) {
    console.log('FBWrapper: ' + 'asyncInit');
    var urls = ['http://localhost'];
    var appId = '1460690187592636';
    console.log('[window.fbAsyncInit] running with appId ' + appId);
    FB.init({
      appId      : appId,
      status     : true,
      xfbml      : true
    });
    facebookInit.set(true);
  },
  checkLoginStatus: function(callback) {
    console.log('FBWrapper: ' + 'checkLoginStatus');
    FB.getLoginStatus(function(response) {
      var isLoggedIn = (response.status === 'connected');
      facebookIsLoggedIn.set(isLoggedIn);

      if (isLoggedIn)
      {
        facebookAccessToken.set(response.authResponse.accessToken);
        facebookUserId.set(response.authResponse.userID);
      }

      if (callback && typeof callback === "function")
        callback(isLoggedIn);
    });
  },
  performLogin: function(callback) {
    console.log('FBWrapper: ' + 'performLogin');
    FBWrapper.checkLoginStatus(function(loggedIn) {
      if (!loggedIn)
      {
        FB.login(function(response) {
          var isLoggedIn = (response.status === 'connected');
          FBWrapper.checkLoginStatus();
          if (callback && typeof callback === "function")
            callback(isLoggedIn);
        });
      }
      else if (callback && typeof callback === "function")
        callback(loggedIn);
    });
  },

  /* properties */
  isLoggedIn: facebookIsLoggedIn.get(),
  userId: facebookUserId.get(),
  accessToken: facebookAccessToken.get()
};

Template.home.onCreated(function() {
  // window.fbAsyncInit = FBWrapper.asyncInit(FBWrapper.checkLoginStatus());
});

Template.home.onRendered(function() {
  window.fbAsyncInit = FBWrapper.asyncInit(FBWrapper.checkLoginStatus());
});

Template.home.helpers({
  isLoggedIn: function() {
    return facebookIsLoggedIn.get();
  }
});

Template.home.events({
  'click .login-fb': function() {
    if (!FBWrapper.isLoggedIn)
      FBWrapper.performLogin();
  }
});
