const socket = io.connect('http://192.168.1.131:8080', {'forceNew': true})
var nickname = "";
var contador = "";

/*********************************************  EVENTOS SOCKET  ****************************************/

// LOGIN

socket.on('existente', () =>
{
  $(".error").html("El nickname ya está en uso, por favor, elija otro");
    $(".error").removeClass("zoomOut").addClass("zoomIn").css("display","block")
})

socket.on('user_valid', () => 
{
  $("#input_wrapper").removeClass("zoomInLeft").addClass("zoomOutLeft")
  $("#select_avatar").removeClass("zoomOutRight").addClass("zoomInRight").css("display","block");
  socket.emit('used_avatars');   
})

socket.on('receive_used_avatars', function(data)
{
  $(".avatar").removeClass("selected")

  $(data).each(function(index,value)
  {
    $(".avatar[id='"+value+"']").addClass("selected")
  })
})

socket.on('registro_ok', () => 
{
  $("#select_avatar").removeClass("zoomInLeft").addClass("zoomOutLeft").css("display","block")
  setTimeout(() => 
  {
    $("#inicio").fadeOut("slow", () =>
    {
      $("#inside").fadeIn("slow");
      $("#cabecera").css("visibility", "visible")
      $("#messages").animate({ scrollTop: $('#messages').prop("scrollHeight")}, 1000);
      $("#texto").focus();
    })
  }, 300)
  
})

// ENVIO DE MENSAJES


socket.on('mensajes', (data) =>
{
    $("#messages").empty();
    $(data).each((index, elem) =>
    {
        $("#messages").append(`<div class='mensaje'>
                               	<div class='img'>
                               		<img src='imgs/avatar/${elem.avatar}.png' class='img_avatar'>
                               	</div>
                               	<div class='cuerpo_mensaje'>
                               		<img class='pico' src='imgs/recursos/pico.png' />
									<p>
										<span class='user'>${elem.nickname}:</span> 
										<span class='texto_mensaje'>${elem.texto}</span>
										<span class='hora'>${elem.hora}</span>
									</p>
                               	</div>
                          	   </div>`);
    })
})

socket.on('mensaje_nuevo', (data) =>
{
    $("#messages").append(`<div class='mensaje animated zoomIn'>
                               	<div class="img">
                               		<img src="imgs/avatar/${data.avatar}.png" class="img_avatar">
                               	</div>
                               	<div class="cuerpo_mensaje">
                               		<img class='pico' src="imgs/recursos/pico.png" />
									<p>
										<span class='user'>${data.nickname}:</span> 
										<span class='texto_mensaje'>${data.texto}</span>
										<span class='hora'>${data.hora}</span>
									</p>
                               	</div>
                          	   </div>`);
    $("#messages").animate({ scrollTop: $('#messages').prop("scrollHeight")}, 1000);
});

// UPDATES DE USUARIOS

socket.on('usuarios', function(users)  
{
	$("#users").html(users.length)
  $("#listado_usuarios ul").empty();
  soy_yo = "";

  $(users.sort()).each(function(index, value)
  {
    if (value.nickname == nickname)
      soy_yo = "<span style='color:lightgreen'>( tú )</span>";
    else
      soy_yo = "<img src='http://www.linkingarts.com/img/icon/animat-pencil-color.gif' class='writting'/>";

    $("#listado_usuarios ul").append(`<li data-id="${value.nickname}">
                                        <div class="redondo">
                                          <img src="imgs/avatar/${value.avatar}.png" />
                                        </div>
                                      </i>
                                      ${value.nickname}&nbsp;${soy_yo}
                                      </li>`)  
  })
  
})

socket.on('updateWritting', function(users_writting)
{
  $("#listado_usuarios .writting").css("visibility","hidden")
  $(users_writting).each(function(index, value)
  {
    $("#listado_usuarios li[data-id='"+value.nickname+"'] .writting").css("visibility","visible")
  })
})

/**********************************************  EVENTOS  *********************************************/

$(document).ready(() =>
{
  // Seleccionamos el Nickname

  $("#boton_circular").click(() =>
  {
  	login();
  })

  $("#nickname").keypress(function(e)
  {
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if(keycode == '13')
    {
      login();
    }
  })

  // Enviamos el avatar seleccionado

  $(".avatar").click(function() 
  {	
    if ($(this).hasClass("selected") == false)
  	   socket.emit('seleccion_avatar', {avatar: $(this).attr("id"), nickname: nickname})
  })

  // Enviamos un mensaje

  $("#enviar_mensaje").click(() =>
  {
  	enviar_mensaje();
  })

  $("#texto").keypress(function(e)
  {
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if(keycode == '13')
    {
      e.preventDefault();
      enviar_mensaje();
    }
  })

  $("#texto").keyup(function()
  {
  	escribiendo_o_no($(this));
  })

  $("#enviar_mensaje").click(function()
  {
  	escribiendo_o_no($(this));
  })
})

/************************************   FUNCIONES   *************************************************/

	function escribiendo_o_no(e)
	{
		if ($(e).val() == "")
	  {
	  	socket.emit('stop_writting')
	  }
	  else
	  {
      if (contador != "")
        clearTimeout(contador)
	  	socket.emit('start_writting')
      contador = setTimeout(function()
      {
        socket.emit('stop_writting')
      },2000)
	  }
	}

  function login()
  {
    nickname = $("#nickname").val()

     if ($(".error").css("display") == "block")
     {
       $(".error").removeClass("zoomIn").addClass("zoomOut")
     }
     if ($("#nickname").val() != "")
     {
      socket.emit('check_user', {nickname: $("#nickname").val()});  
     }
     else
     {
      $(".error").html("El nickname es obligatorio");
      $(".error").removeClass("zoomOut").addClass("zoomIn").css("display","block")
     }
  }

  function enviar_mensaje()
  {
    if ($("#texto").val() != "")
    {
      horas = (new Date().getHours() > 9) ? new Date().getHours(): "0"+new Date().getHours()
      minutos = (new Date().getMinutes() > 9) ? new Date().getMinutes(): "0"+new Date().getMinutes()
      socket.emit('anadir_mensaje',
      {
        mensaje : $("#texto").val(),
        hora : horas+":"+minutos
      })
      $("#texto").val("").focus()
    }
  }
