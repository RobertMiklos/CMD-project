
document.addEventListener("DOMContentLoaded", function () {

    
    var formular = document.querySelector("form");
    var input = document.querySelector("input");
    var output = document.getElementById("outputShell");

    
    formular.addEventListener("submit", function (e) {
        e.preventDefault();

        
        var prikaz = input.value.trim().toLowerCase();

       
        if (prikaz === "moonup") {
            document.getElementById("moon").style.display = "block";
            output.innerHTML += "<p>> Přidal jsi měsíc na oběžnou dráhu</p>";
        } 
        else if (prikaz === "moondelete") {
            document.getElementById("moon").style.display = "none";
            output.innerHTML += "<p>> Měsíc byl odstraněn z oběžné dráhy</p>";
        } 
        else if (prikaz === "bloodmoon") {
            document.getElementById("moon").style.background = "radial-gradient(circle at 35% 35%, #ff0101ff, #3a3939ff)";
            output.innerHTML += "<p>> krvavý měsíc</p>";
        }
        else {
            output.innerHTML += "<p>> Neznámý příkaz: " + prikaz + "</p>";
        }

        
        input.value = "";
    });

});

