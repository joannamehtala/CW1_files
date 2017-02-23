$(function(){
  $.ajax({url:"a42580.json",success:function(d){

    // -------------------- ADD BASIC INFO -----------------------

    var img = document.createElement("IMG");
    img.src = d.image;
    $("#image").html(img);
    $("#movie").text(d.title);
    var movieDate = new Date(d.date);

    // Format date
    function getDayName() {
      var weekdays = new Array("Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday");
      return weekdays[movieDate.getDay()];
    }

    function getMonthName() {
      var months = new Array("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December");
      return months[movieDate.getMonth()];
    }

    var minutes = ("0" + movieDate.getMinutes()).slice(-2);

    $("#date").text(getDayName() + " " + movieDate.getDate() + " " + getMonthName() + " " + movieDate.getFullYear() + " @ " + movieDate.getHours() + ":" + minutes);
    $("#screen").text(d.screen);
    $("#runtime").text(d.runtime);
    $("#rating").text(d.rating);

    var table = $("<table/>").appendTo("#theatreTab");

    // ---------------- THE LOOPS: CREATE MAP OF THEATRE --------------------

    // The row loop - each step in this loop deals with one row of the table
    for (i = 0; i < d.rowLabels.length; i++){
      // Create a table row
      var tr = $("<tr/>");
      tr.append($("<th/>",{text:d.rowLabels[i]}));
      tr.appendTo(table);

      // Save row letter in variable for giving correct ID to td
      var rowLetter;
      if (i == 0) {
        rowLetter = "G";
      } else if (i == 1) {
        rowLetter = "F";
      } else if (i == 2) {
        rowLetter = "E";
      } else if (i == 3) {
        rowLetter = "D";
      } else if (i == 4) {
        rowLetter = "C";
      } else if (i == 5) {
        rowLetter = "B";
      } else if (i == 6) {
        rowLetter = "A";
      }

      // The cell loop - each step in this loop deals with a row's cells
      for (var j = 0; j < 18; j++) {
        // Create td cell
        var td = $("<td/>");
        // umap indicates if the seat is used
        var u = d.umap[i].charAt(j);
        // Add class to seat to indicate if seat is taken
        if (u==="X") {
          td.addClass("seat");
          td.addClass("taken");
        } else if (u==="O") {
          td.addClass("seat");
          td.addClass("available");
        } else if (u==="M") {
          td.addClass("seat");
          td.addClass("mine");
        }
        // tmap indicates the type of seat
        var t = d.tmap[i].charAt(j);
        // Style according to seat type
        if (t==="L") {
          td.addClass("left-sofa");
          td.addClass("sofa");
          td.attr("price", d.pricing.L);
        }
        else if (t==="R") {
          td.addClass("right-sofa");
          td.addClass("sofa");
          td.attr("price", d.pricing.R);
        }
        else if (t==="A") {
          td.addClass("armchair");
          td.attr("price", d.pricing.A);
        }

        // Add td cell to row
        tr.append(td);
      }

      // Create list of all seats in tr row
      var rowSeats = tr.children(".seat");
      
      // Loop through seats in row to add seat numbers and IDs
      for (k = 0; k < rowSeats.length; k++) {
        var seatNum = k + 1;
        $(rowSeats[k]).append($("<div/>",{text:seatNum}));
        var ID = rowLetter + seatNum.toString();
        $(rowSeats[k]).attr("id", ID);
      }

      tr.append($("<th/>",{text:d.rowLabels[i]}));
    } 

    // ------------------------- END LOOPING -------------------------------

    // -------------------- ADD INITIAL SEAT DETAILS -----------------------

    // Required amount of seats
    var sofaRequired = d.sofaRequired;
    var armchairRequired = d.armchairRequire;
    var totalRequired = sofaRequired*2 + armchairRequired;

    // Add initial seat details
    var allMine = $(".mine");
    var myArmchairs = $(".mine.armchair");
    var mySofas = $(".mine.sofa");
    $("#armchairs").text("Armchairs selected: " + myArmchairs.length + "/" + armchairRequired);
    $("#sofas").text("Sofa seats selected: " + mySofas.length + "/" + sofaRequired*2);
    var totalPrice = 0;
    for (var h = 0; h < allMine.length; h++) {
        var rowString = $(allMine[h]).attr("id").substr(0, 1);
        var numString = $(allMine[h]).attr("id").substr(1, 2);
        var priceString = $(allMine[h]).attr("price");
        var string = "Row " + rowString + ", Seat " + numString + ", Price: £" + priceString;
        $("#seats").append($("<li/>",{"class":"list-group-item", text: string}));
        var price = parseInt(priceString);
        totalPrice += price;
        $("#total-price").text("Total Price: £" + totalPrice);
    }

    // I would have added the initial seats using d.seatData, but apparently the prices are different in that object - sofa seats are listed at £9 and armchairs at £10. So I decided to do it in the above way instead. Below you'll see the code for the other option (where pricing will come out according to the JSON file's seatData object).

    /*for (var h = 0; h < d.seatData.length; h++) {
      var seatDataString = "Row " + d.seatData[h][1].substr(0, 1) + ", Seat " + d.seatData[h][1].substr(3, 2) + ", Price: £" + d.seatData[h][2].substr(0, 2);
      $("#seats").append($("<li/>",{"class":"list-group-item", text: seatDataString}));
    }*/

    // Create variables for click function: the logic is that when clicking on sofa seats, the sofa seat that is switched is the FIRST one that was clicked earlier, not the latest one clicked.

    var obj = $(".mine.sofa");
    var mySofas = $.makeArray(obj);
    // Initialize variables from left to right
    var firstClicked = $(mySofas[0]);
    var lastClicked = $(mySofas[1]);

    // ---------------------- THE CLICK FUNCTION -------------------------

    $("td").click(function(){

      // If seat is taken, do nothing
      if ($(this).hasClass("taken")) {
        // Do nothing
      } 

      // ----- ARMCHAIRS -----
      // If clicked on free armchair, switch armchair

      else if ($(this).hasClass("available") && $(this).hasClass("armchair")) {
        $("table").find(".mine.armchair").removeClass("mine").addClass("available");
        $(this).addClass("mine").removeClass("available");
        // List current chosen seats
        var mySeats = $(".mine");
        // If not enough seats are chosen, disable "next" button
        if (mySeats.length == totalRequired) {
          $("#next").removeAttr("disabled");
        }
      }

      // ------ SOFAS ------
      // If clicked on free sofa seat, switch sofa seat. Switch the one that was chosen the most time ago.

      else if ($(this).hasClass("available") && $(this).hasClass("sofa")) {
        firstClicked.removeClass("mine").addClass("available");
        $(this).addClass("mine").removeClass("available");
        firstClicked = lastClicked;
        lastClicked = $(this);
        // List current chosen seats
        var mySeats = $(".mine");
        // If not enough seats are chosen, disable "next" button
        if (mySeats.length == totalRequired) {
          $("#next").removeAttr("disabled");
        }

        var mySofaSeats = $(".mine.sofa");
        var firstSofaID = $(mySofaSeats[0]).attr("id");
        var secondSofaID = $(mySofaSeats[1]).attr("id");

        // Find out whether sofa seats are next to each other (one whole sofa is selected). If not, "next" button is disabled.
        if (mySofaSeats.length == 2) {
          // Get rows of seats
          var firstSofaRow = firstSofaID.substr(0, 1);
          var secondSofaRow = secondSofaID.substr(0, 1);
          // Get numbers of seats (in row)
          var firstSofaNum = parseInt(firstSofaID.substr(1, 2));
          var secondSofaNum = parseInt(secondSofaID.substr(1, 2));
          if (Math.abs(firstSofaNum % 2) == 1 && secondSofaNum % 2 == 0 && (firstSofaRow == secondSofaRow) && (firstSofaNum+1 == secondSofaNum)) {
            $("#next").removeAttr("disabled");
          } else {
            $("#next").attr("disabled", "disabled");
          }
        }

      }

      // ------- CLICKING ON SELECTED SEATS ------
      // If clicked on selected seat, deselect it. If required amount of seats is not filled, disable "next" button.

      else if ($(this).hasClass("mine")) {
        $(this).addClass("available");
        $(this).removeClass("mine");

        // Check if clicked on a sofa and update the first/last clicked properties. If user deselects only one seat, the next seat clicked should replace the deselected seat instead of the selected seat.
        if ($(this).hasClass("sofa")) {
          if (lastClicked.hasClass("available")) {
            lastClicked = firstClicked;
            firstClicked = $(this);
          }
        }
        // List current chosen seats
        var mySeats = $(".mine");
        // If not enough seats are chosen, disable "next" button
        if (mySeats.length < totalRequired) {
          $("#next").attr("disabled", "disabled");
        }
      }

      // -------- UPDATE INFO FOR USER ---------

      // Find out how many seats are selected after click
      var selectedArmchairs = $(".mine.armchair");
      var selectedSofas = $(".mine.sofa");
      // Inform user
      $("#armchairs").text("Armchairs selected: " + selectedArmchairs.length + "/" + armchairRequired);
      $("#sofas").text("Sofa seats selected: " + selectedSofas.length + "/" + sofaRequired*2);

      // Find out what the newly selected seats are
      var selected = $(".mine");
      var selectedSeats = $.makeArray(selected);

      // Inform user of current selected seats and their prices
      $("#seats").empty();
      var totalPrice = 0;
      for (var m = 0; m < selectedSeats.length; m++) {
        var rowString = $(selectedSeats[m]).attr("id").substr(0, 1);
        var numString = $(selectedSeats[m]).attr("id").substr(1, 2);
        var priceString = $(selectedSeats[m]).attr("price");
        var string = "Row " + rowString + ", Seat " + numString + ", Price: £" + priceString;
        $("#seats").append($("<li/>",{"class":"list-group-item", text: string}));
        var price = parseInt(priceString);
        totalPrice += price;
        $("#total-price").text("Total Price: £" + totalPrice);
      }

      if (selectedSeats.length == 0) {
        totalPrice = 0;
        $("#total-price").text("Total Price: £" + totalPrice);
      }

    });
  }})
});
