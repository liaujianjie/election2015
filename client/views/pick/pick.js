Template.pick.onRendered(function() {
  var checkProfileImageReadiness = Meteor.setInterval(function() {
    if(typeof FBWrapper.pictureSmallURL() !== 'undefined')
    {
       Meteor.clearInterval(checkProfileImageReadiness);

       _.forEach(parties, function(party) {
         var canvasId = '#preview-img-' + party.slug;
         var partyBadgeURL = '/images/logo-' + party.slug + 'xx.png';

         $(canvasId).clearCanvas();
         $(canvasId).drawImage({
           source: FBWrapper.pictureSmallURL(),
           x: 90, y: 90, width: 180, height: 180,
           load: function() {
             $(canvasId).drawImage({
               source: partyBadgeURL,
               x: 150, y: 150, width: 60, height: 60
             });
           }
         });
       });
    }
  }, 100);
});

Template.pick.helpers({
  facebookProfileImageURL: function() {
    return FBWrapper.pictureSmallURL();
  },
  parties: function() {
    return parties;
  }
});


Template.pick.events({
  'click .select-party': function(event) {
    FlowRouter.go('/confirm/' + currentTarget.attr('id'));
  }
})
