Students = new Meteor.Collection('students');

if (Meteor.isClient) {
  Meteor.startup(function () {
    if(Session.get('student_key') === undefined) {
    	var key = Students.insert({});
		Session.set('student_key', key);
    }
	
	$('.editor').each(function(i, el) {
	    var editor = ace.edit(el);
		editor.setTheme("ace/theme/chrome");
		editor.getSession().setMode("ace/mode/html");
		editor.session.setOption("useWorker", true);
		editor.setShowPrintMargin(false);
/*		editor.setHighlightActiveLine(false);
	    editor.setShowFoldWidgets(false);
	    
	    editor.session.setUseWrapMode(true);
	    editor.renderer.setShowGutter(false);
	    editor.renderer.setScrollMargin(8, 8, 0, 0);
 	    editor.renderer.setPadding(10);*/
		var update = function() {
			var value = editor.getSession().getValue();
			var doc = $('iframe.preview').contents()[0];
			console.log(doc);
			doc = doc.open('text/html', 'replace');
			doc.write(value);
			doc.close();
			
			Students.update(Session.get('student_key'), {$set: {html: value}});
		};
		editor.on('change', update);
		update();
	});
	$('iframe.preview').height($('.editor').height() + 17);
  });
  
  Template.editor.greeting = function () {
    return "Welcome to livehtml.";
  };
  /*
  Template.hello.events({
    'click input': function () {
      // template data, if any, is available in 'this'
      if (typeof console !== 'undefined')
        console.log("You pressed the button");
    }
  });
  */
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    //console.log('fk');
  });
}
