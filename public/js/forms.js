{\rtf1\ansi\ansicpg1252\cocoartf2759
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx566\tx1133\tx1700\tx2267\tx2834\tx3401\tx3968\tx4535\tx5102\tx5669\tx6236\tx6803\pardirnatural\partightenfactor0

\f0\fs24 \cf0 document.addEventListener('DOMContentLoaded', function () \{\
    const registerForm = document.getElementById('register-form');\
    const loginForm = document.getElementById('login-form');\
    const showRegisterForm = document.getElementById('show-register-form');\
\
    showRegisterForm.addEventListener('click', function (event) \{\
        event.preventDefault();\
        registerForm.style.display = 'block';\
        loginForm.style.display = 'none';\
    \});\
\
    registerForm.addEventListener('submit', async function (event) \{\
        event.preventDefault();\
        const email = registerForm.email.value;\
        const password = registerForm.password.value;\
\
        const response = await fetch('/register', \{\
            method: 'POST',\
            headers: \{ 'Content-Type': 'application/json' \},\
            body: JSON.stringify(\{ email, password \})\
        \});\
\
        const message = await response.text();\
        alert(message);\
    \});\
\
    loginForm.addEventListener('submit', async function (event) \{\
        event.preventDefault();\
        const email = loginForm.email.value;\
        const password = loginForm.password.value;\
\
        const response = await fetch('/login', \{\
            method: 'POST',\
            headers: \{ 'Content-Type': 'application/json' \},\
            body: JSON.stringify(\{ email, password \})\
        \});\
\
        const message = await response.text();\
        alert(message);\
    \});\
\});\
}