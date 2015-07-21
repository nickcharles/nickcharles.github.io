$(document).ready(function() {
    $(".navLink").click(function () {
        $(".pane").hide();
        $(this.hash).show();
    });

    if ($(window.location.hash).show().length == 0) {
        $("#about").show();
    }
});
