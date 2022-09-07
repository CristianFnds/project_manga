const baseurl = "http://localhost:3333/"

$('document').ready(function () {

    $("#buscar").click(function () {
        var texto_busca = document.getElementById("texto_busca").value;
        var url = `${baseurl}manga?busca=${texto_busca}`;

        $.ajax({url: url, type: 'GET',})
            .done(function (mangas) {
                exibirMangasPesquisa(mangas)
            })
            .fail(function (jqXHR, textStatus, msg) {
                console.error("erro ao obter a lsita de mangas")
            });

    });

    function exibirMangasPesquisa(data) {


        console.log(data);
        for (var i = 0; i < data.length; i++) {
            var content = '<div>'+
            ' <img src=" https://uploads.mangadex.org/covers/'+data[i].id+'/'+data[i].cover_art_file_name+'.256.jpg" alt="icone_manga" height="150" width="100">'+
            '<strong>'+data[i].name+'</strong>'
            '</div>';

            // console.log(  data[i].attributes.title.en)
            $("#listaManga").append("<div>"+content+"</div>");
        }
    }

});