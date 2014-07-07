Students = new Meteor.Collection('students');

me = function() {
    var key = Session.get('student_key');
    return Students.findOne(window.localStorage['student_key']);
}

if (Meteor.isClient) {
  Meteor.startup(function () {

      var editor = ace.edit($('.editor')[0]);
      editor.setTheme("ace/theme/chrome");
      editor.getSession().setMode("ace/mode/html");
      editor.setShowPrintMargin(false);

      var update = function() {
          var value = editor.getSession().getValue();
          var doc = $('iframe.preview').contents()[0];
          doc = doc.open('text/html', 'replace');
          doc.write(value);
          doc.close();

          if(me() !== undefined)
              Students.update(me()._id, {$set: {html: value}});
      };
      editor.on('change', update);
      update();

      Deps.autorun(function () {
          Meteor.subscribe('activestudents', window.localStorage['student_key'], function() {
              if(me() === undefined) {
                  var key = Students.insert({});
                  window.localStorage['student_key'] = key;
                  Session.set('student_key', key)
              }
              Students.update(me()._id, {$set: {idle: false}})
              editor.getSession().setValue(me().html);
          })
      });

      $('iframe.preview').height($('.editor').height() + 17);
  });


  Template.start.me = function() {
      return me();
  }

  Template.start.students = function () {
      return Students.find();
  };

  Template.student.foo = function() {
      var o = this;
      Meteor.defer(function() {
          var doc = $('#iframe_'+o._id).contents()[0];
          if(doc) {
              doc = doc.open('text/html', 'replace');
              doc.write(o.html);
              doc.close();
          }
      });
      return '';
  }

  Meteor.setInterval(function() {
      if (Meteor.status().connected)
          Meteor.call('keepalive', window.localStorage['student_key']);
  }, 20*1000);
}

if (Meteor.isServer) {
  Meteor.startup(function () {

  });
  Meteor.publish('activestudents', function(key) {
      // Return active students
      return Students.find({$or: [{idle: false}, {_id: key}]});
  });

  Meteor.methods({
      keepalive: function(key) {
          console.log('keepalive', key);
          Students.update({_id: key},
                    {$set: {last_keepalive: (new Date()).getTime(), idle: false}});
      }
  });
  Meteor.setInterval(function() {
      console.log('IDLING');
      var now = (new Date()).getTime();
      var idle_threshold = now - 70*1000; // 70 sec

      var u = Students.update({last_keepalive: {$lt: idle_threshold}}, {$set: {idle: true}}, {multi: true});

      console.log('updated: ', u, Students.find().count());

  }, 20*1000);
}
