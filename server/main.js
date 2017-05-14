'use strict'

const express = require('express')
const app = express()
const server = require('http').Server(app)
const mongoose = require('mongoose')
const io = require('socket.io')(server)

var allClients = [];
var mensajes = [];
var privados = [];
var writting_people = [];

app.use(express.static('public'))

// Cuando se conecta alguien nuevo

io.sockets.on('connection', function(socket)
{
   // Se le envían todos los mensajes (solo al conectarse, después solo los actuales)

   socket.emit('mensajes_general', mensajes)
   io.sockets.emit('usuarios', allClients)

   // -----------------------------------  Cuando se desconecta un usuario  --------------------------------

   socket.on('disconnect', function()
   {
   	  sacarDeArray(writting_people, socket)
      sacarDeArray(allClients, socket)
      io.sockets.emit('receive_used_avatars', used_avatars())
      io.sockets.emit('usuarios', allClients)
   });


   // ----------------------------------- Llega un mensaje nuevo -------------------------------------------

   socket.on('anadir_mensaje_general', (mensaje) =>
   {
      var usuario = buscarEnArray(allClients, socket);
      
      var mensaje_full = {texto: mensaje.mensaje, 
                          hora: mensaje.hora, 
                          nickname: usuario.nickname,
                          avatar: usuario.avatar}
      mensajes.push(mensaje_full)
      
      io.sockets.emit('mensaje_general_nuevo', mensaje_full)
   })

   // ----------------------------------- Llega un mensaje privado nuevo -------------------------------------------

   socket.on('anadir_mensaje_privado', (mensaje) =>
   {
      var id_emisor = id_socket_por_nickname(mensaje.nickEmisor)
      var id_receptor = id_socket_por_nickname(mensaje.nickReceptor)
      var emisor = buscarEnArray(allClients, socket)
      
      var mensaje_full = 
      {
         texto: mensaje.mensaje, 
         hora: mensaje.hora, 
         emisor: mensaje.nickEmisor,
         receptor: mensaje.nickReceptor,
         avatar: emisor.avatar,
       }

      privados.push(mensaje_full)
      io.to(id_emisor).emit('mensaje_privado_nuevo', mensaje_full)
      io.to(id_receptor).emit('mensaje_privado_nuevo', mensaje_full)
   })

   // ------------------------------- Devolvemos los avatares ya usados -------------------------------------

   socket.on('used_avatars', function()
   {
      var avatars = used_avatars();

      io.sockets.emit('receive_used_avatars',avatars)
   })
   
  // --------------------------------  Comprobamos si ya existe el nickname  --------------------------------

  socket.on('check_user', (mensaje) =>
  {
      var encontrado = false;

     for (var i = 0; i < allClients.length  ; i++)
     {
        if (allClients[i].nickname.toUpperCase().trim() == mensaje.nickname.toUpperCase().trim())
        {
            encontrado = true;
            break;
        }
     }
    
     if (encontrado == false)
     {
       socket.emit('user_valid');
     }
     else
     {
       socket.emit('existente');
     }

   })

   // ---------------------------------  Se asigna el avatar y se graba el cliente  -------------------------

   socket.on('seleccion_avatar', (datos) =>
   {
      allClients.push({
                        nickname: datos.nickname, 
                        avatar: datos.avatar, 
                        id_socket: socket.id 
                      });
      socket.emit('registro_ok')
      io.sockets.emit('receive_used_avatars', used_avatars())
      io.sockets.emit('usuarios', allClients)
   })

   // -----------------------------------  El usuario deja de escribir  --------------------------------------
   socket.on('stop_writting', () => 
   {
      sacarDeArray(writting_people, socket)
      io.sockets.emit('updateWritting', writting_people)
     console.log(writting_people)
   })

  
   // ----------------------------  El usuario empieza a escribir, se añade a la gente escribiendo  -----------

   socket.on('start_writting', () => 
   {
     
     var usuario = buscarEnArray(writting_people, socket);
    
     if (usuario == false)
     {
       writting_people.push(buscarEnArray(allClients, socket))
       io.sockets.emit('updateWritting', writting_people)
     }
     console.log(writting_people)
   })

   // ---------------------------------------------   Cargar conversación privada  -----------------------------

   socket.on('cargar_privado', function(datos)
   {
      var mensajes_privados = buscarMensajes(datos.nickEmisor, datos.nickReceptor)
      socket.emit('mensajes_privados', mensajes_privados)
   })

   // ---------------------------------------------   Cargar conversación general  -----------------------------

   socket.on('cargar_general', function(datos)
   {
      socket.emit('mensajes_general', mensajes)
      //io.sockets.emit('usuarios', allClients)
   })

});

server.listen(8080, () =>
{
})


// -------------------------------------------- Funciones -------------------------------------------------------


function sacarDeArray(arr, socket)
{
  for (var i = 0; i < arr.length; i++)
  {
    if (arr[i].id_socket == socket.id)
    {
      arr.splice(i, 1)    
    }
  }
}

function buscarEnArray(arr, socket)
{
  var ret = false;

  for (var i = 0; i < arr.length  ; i++)
  {
    if (arr[i].id_socket == socket.id)
    {
        ret = arr[i]
        break;
    }
  }

  return ret;
}

function used_avatars()
{
    var avatars = [];

    for (var i = 0; i < allClients.length; i++)
    {
      avatars.push(allClients[i].avatar);
    }

    return avatars;
}

function buscarMensajes(nickEmisor, nickReceptor)
{
  var msj_priv = []

  for (var i = 0; i < privados.length; i++)
  {
    if ((nickEmisor == privados[i].emisor && nickReceptor == privados[i].receptor) 
       || (nickEmisor == privados[i].receptor && nickReceptor == privados[i].emisor))
    {
          msj_priv.push(privados[i])
    }
  }

  return msj_priv;
}

function id_socket_por_nickname(nickname)
{

  var ret = "";

  for (var i = 0; i < allClients.length; i++)
  {
    if (allClients[i].nickname == nickname)
    {
      ret = allClients[i].id_socket
      break
    }
  }

  return ret;
}