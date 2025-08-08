# 📡 WS Orquestrator

Servidor WebSocket em **Node.js + TypeScript** para gerenciamento de salas de chat, usuários e mensagens em tempo real.  
Parte da arquitetura de **microserviços**, este servidor é responsável pela comunicação em tempo real entre clientes.

## 🚀 Funcionalidades

- 🔒 **Autenticação via JWT** para acesso privado e de sala.
- 💬 Envio e recebimento de mensagens em tempo real.
- 🏠 Gerenciamento de salas (entrar, sair, expulsar usuários).
- 📢 Sistema de notificações centralizado (`Notifier`).
- ⚡ Integração com **Redis** para controle de estado e publicação/assinatura.
- 🗄 Persistência de mensagens e usuários com **MongoDB**.
- 👤 Suporte a três tipos de clientes:
  - **Público**: acesso sem login.
  - **Privado**: usuário autenticado.
  - **Sala**: usuário ativo em uma sala específica.

## 🛠 Tecnologias Utilizadas

- **Node.js** + **TypeScript**
- **ws** (WebSocket server)
- **Redis**
- **MongoDB**
