/* 

Escenario de pruebas:
1- Usuario Ingresa al home  (se carga de la página)
2- Se loguea (se obtiene el token de la sesión  y se envía a la url de token, se recarga página)
3- Sleep aleatorio de 1 a 5 seg
4- Usuario filtra la categoría monitores (se recarga vista de productos)
5- Usuario evalúa productos (sleep de 1 a 5 seg)
6- Usuario selecciona un producto para ver más información (se recarga vista)
7- Usuario evalúa producto (sleep de 1 a 5 seg)
8- Usuario decide comprar y selecciona agregar al carrito (se informa ok, se genera un id de la selección)
9- Usuario entra a la vista del carro (se carga el producto elegido, se evalúa que sea el correcto de acuerdo al id y cod de producto)

Para ejecutar: k6 run script3.js

string includes

*/

import { check } from 'k6';
import { sleep } from 'k6';
import http from 'k6/http';
import {randomIntBetween} from "https://jslib.k6.io/k6-utils/1.0.0/index.js";


export default function() {
  home();
  login();
  token();
  bycatMonitors();
  clickFirstOne();
  addToCart();
  viewCart();
  viewProduct();
}

var tokenOb;
var idGuid = guid();

export function guid() {
  function s4() {
  return Math.floor((1 + Math.random()) * 0x10000)
  .toString(16)
  .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
  s4() + '-' + s4() + s4() + s4();
} 


export function home() {
  http.get('https://www.demoblaze.com/index.html'), 
  http.get('https://api.demoblaze.com/entries');
}


export function login() {
  var url = 'https://api.demoblaze.com/login';
  var payload = JSON.stringify({
    username:"Giuli",
    password:"Z2l1bGk="
  });

  var params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  let res = http.post(url, payload, params);
  tokenOb = res.body.substring(13,29);
  console.log(tokenOb);

  check(res, {
    'Status 200 (login)?': (r) => r.status === 200,
  });

}

export function token() {
  var url = 'https://api.demoblaze.com/check';
  var payload = JSON.stringify({
    token: tokenOb
  });

  var params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  http.get('https://www.demoblaze.com/index.html');
  http.post(url, payload, params);
  http.get('https://api.demoblaze.com/entries');

  
}

export function bycatMonitors() {
  var url = 'https://api.demoblaze.com/bycat';
  var payload = JSON.stringify({
    cat: 'monitor'
  });

  var params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  sleep(randomIntBetween(1,5));

  http.post(url, payload, params);
}

export function clickFirstOne() {
  
  var url = 'https://api.demoblaze.com/view';
  var payload = JSON.stringify({
    id: '10'
  });

  var params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  sleep(randomIntBetween(1,5));
  http.get('https://www.demoblaze.com/prod.html?idp_=10'),
  http.post(url, payload, params);
}

export function addToCart() {
  var url = 'https://api.demoblaze.com/addtocart'
  ;
  var payload = JSON.stringify({
    id: idGuid,
    cookie: tokenOb,
    prod_id: '10',
    flag: true,
  });

  var params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  sleep(randomIntBetween(1,5));

  let res= http.post(url, payload, params);

  check(res, {
    'Status 200 (addToCart)?': (r) => r.status === 200,
  });

  console.log(idGuid);
}


export function viewCart() {
  var url = 'https://api.demoblaze.com/viewcart'
  ;
  var payload = JSON.stringify({
    cookie:tokenOb,
    flag:true,
  });

  var params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  http.get('https://www.demoblaze.com/cart.html');
 
  let res = http.post(url, payload, params);
  let jsonBody= res.body;

  let items= JSON.parse(jsonBody);
  let prodId;

  items.Items.forEach(function(Items) { 
    if (Items.id === idGuid) {
      prodId = Items.prod_id;
    } 
  });
  
  console.log(prodId);

  check (prodId, {
    'prodId 10?': (r) => r == 10,
  });

}

export function viewProduct() {
  var url = 'https://api.demoblaze.com/view';
  var payload = JSON.stringify({
    id: '10',
  });

  var params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

http.post(url, payload, params);
 
}