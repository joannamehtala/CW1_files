$(function(){
  //Get flight details from the server
  $.getJSON('booking2.json',function(d){
    $('#whereFrom').text(d.whereFrom);

    var leave = new Date(d.departAt);
    $('#date').text(leave.toUTCString());
  });

  //Handle the click event
  $('#plan td.n').click(function(){
  	$(this).text('B');
  });
})