$(document).ready(function() {
    var source = $("#results-template").html();
    var template = Handlebars.compile(source);
    init();

    function init() {
        $("#progress-bar").hide();
        registerSubmit();
        getUser(searchPrevious);
        goingClicked();
    }

    function goingClicked() {
        $("#table").on("click", ".card-action .goingBtn", function(e) {
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
                    $("#header").html("<span>Welcome " + data.github.username + "</span>");
                    $("#head").append("<li><a href='/logout'>Logout</a></li>");
                    whenLoggedIn();
                }
                else {
                    $("#header").html("<a href='/auth/github'>Login with <img id='git-img' src='/public/img/github_32px.png'></a>");
                }
            });
    }

    function showResult(data) {
        //console.log(data.businesses);
        var html = template({
            "businesses": data.businesses
        });
        $("#progress-bar").hide();
        $("#table").empty().append(html);
    }

    function registerSubmit() {
        $("#locationSearch").on("submit", function(event) {
            $("#progress-bar").show();
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