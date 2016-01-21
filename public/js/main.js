$(document).ready(function() {
    var source = $("#results-template").html();
    var template = Handlebars.compile(source);
    init();

    function init() {
        registerSubmit();
        getUser(searchPrevious);
        goingClicked();
    }

    function goingClicked() {
        $("#table").on("click", ".goingBtn", function(e) {
            var bus_id = $(e.target).attr("id");
            $.ajax({
                url: "/api/going/" + bus_id,
                dataType: "json"
            }).done(function(data) {
                //console.log("Logging in user", data);
                if (data.userLoggedIn === false) {
                    window.location.href = "/auth/github";
                }
                else {
                    $("#num-" + bus_id).html(data.numGoing);

                }
            });

        });
    }

    function searchPrevious() {
        $.ajax({
            url: "/api/getLastSearch",
            dataType: "json"
        }).done(function(data) {
            $("#location").val(data.lastSearch);
            $("#locationSearch").submit();
        });
    }

    function getUser(whenLoggedIn) {
        $.ajax({
                url: "/api/getUser",
                dataType: "json"
            })
            .done(function(data) {
                //console.log(data);    
                if (data.status === "loggedIn") {
                    $("#header").html("<div>Welcome " + data.github.username + "</div><a href='/logout'>Logout</a>");
                    whenLoggedIn();
                }
                else {
                    $("#header").html("<a href='/auth/github'>Login</a>");
                }
            });
    }

    function showResult(data) {
        //console.log(data.businesses);
        var html = template({
            "businesses": data.businesses
        });
        $("#table").empty().append(html);
    }

    function registerSubmit() {
        $("#locationSearch").on("submit", function(event) {
            event.preventDefault();
            event.stopPropagation();
            $.ajax({
                    url: "/api/search/" + $("#location").val(),
                    dataType: "json"
                })
                .done(function(data) {
                    //console.log(data);
                    showResult(data);
                });
        });

    }

});