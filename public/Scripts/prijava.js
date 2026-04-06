window.onload =function(){
    var username=document.getElementById("username")
    var password=document.getElementById("password")
    var brojacPokusaja = 0;

    let dugme=document.getElementById("dugme")
    
    dugme.onclick = function(){
        PoziviAjax.postLogin(username.value,password.value,function(err,data){
            console.log('dugme.onClick()');
            brojacPokusaja++;
            if(err != null){
                window.alert(JSON.parse(err.responseText).greska)
            }else{
                var message=JSON.parse(data)
                console.log(message);
                console.log(JSON.parse(data));
                if(message.poruka==="Neuspješna prijava"){
                    var divElement=document.getElementById("areaBelow")
                    divElement.innerHTML = `<h2>Neispravni podaci.</h2>`;
                }else{
                    window.location.href="http://localhost:3000/nekretnine.html"
                }
            }
        })
    }
}