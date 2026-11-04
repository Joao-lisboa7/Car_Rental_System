# DIAW — Laboratório 02: Sistema de Aluguel de Carros

## Identificação da avaliação

- **Curso:** Engenharia de Software
- **Disciplina:** DIAW — Desenvolvimento e Integração de Aplicações Web
- **Professor:** João Paulo Carneiro Aramuni
- **Período indicado no documento:** 2º
- **Valor total:** 15 pontos

## Objetivo

Desenvolver um sistema web para apoiar a gestão de aluguéis de automóveis. O sistema
deve permitir que pedidos de aluguel sejam introduzidos, consultados, modificados e
cancelados pela Internet, e que sejam analisados por agentes. O projeto deve atender
aos requisitos descritos neste documento e à modelagem produzida durante a disciplina.

## Stack tecnológica especificada

- **Linguagem:** Java, JDK 25
- **Back-end:** Spring Boot 4.0.x, com arquitetura MVC
- **Build e dependências:** Apache Maven
- **Front-end:** React e Vite
- **Banco de dados:** Supabase com PostgreSQL
- **Autenticação:** login obrigatório com usuário e senha

O documento também exige uma aplicação web e a integração do front-end, do back-end e
do banco de dados.

## Descrição e requisitos do sistema

### Acesso e perfis

- O sistema só pode ser utilizado após cadastro prévio e autenticação.
- O acesso é realizado por meio de usuário e senha.
- Há usuários individuais, que atuam como clientes, e agentes, representados por
  empresas e bancos.
- O login deve restringir o acesso a usuários cadastrados.

### Pedidos de aluguel

- Clientes podem introduzir, modificar, consultar e cancelar pedidos de aluguel.
- Empresas e bancos, como agentes, podem modificar e avaliar pedidos.
- Após serem introduzidos, os pedidos são analisados pelos agentes do ponto de vista
  financeiro.
- Quando o parecer é positivo, os pedidos ficam à consideração para execução do
  contrato.
- O protótipo deve permitir que usuários criem pedidos e visualizem o status deles.

### Dados dos contratantes

O sistema armazena, sobre os contratantes do aluguel:

- RG e CPF;
- nome e endereço;
- profissão;
- entidades empregadoras e os respectivos rendimentos auferidos, com no máximo três
  fontes de renda.

### Automóveis e contratos

- Dependendo do tipo de contrato, o automóvel alugado pode ser registrado como
  propriedade de um cliente, de uma empresa ou de um banco.
- Sobre cada automóvel, o sistema registra matrícula, ano, marca, modelo e placa.
- O aluguel de um automóvel pode estar associado a um contrato de crédito concedido por
  um dos bancos agentes.

### Contexto de operação e subsistemas

- O servidor central comunica-se pela Internet com os computadores locais dos clientes
  e com os diversos agentes aderentes.
- O sistema pode ser subdividido em dois subsistemas:
  1. gestão de pedidos e contratos;
  2. construção dinâmica das páginas web.

## Processo de desenvolvimento

O processo indicado para o projeto compreende:

1. **Modelagem do sistema:** produzir o diagrama de casos de uso, histórias do usuário,
   diagrama de classes e diagrama de pacotes (visão lógica).
2. **Autenticação:** implementar o login dos clientes e agentes, restringindo o sistema
   a usuários cadastrados.
3. **CRUD de cliente:** implementar o CRUD de cliente, considerando os requisitos não
   funcionais de aplicação web, Spring Boot no back-end, React + Vite no front-end,
   Supabase como banco de dados e arquitetura MVC.
4. **Protótipo do sistema:** permitir que usuários criados façam pedidos de aluguel e
   visualizem o status de um pedido.
5. **Revisão dos diagramas:** revisar e atualizar os diagramas ao longo do
   desenvolvimento de acordo com o feedback recebido em aula.

## Apresentação final e entrega

Ao final do laboratório, os alunos devem apresentar o protótipo produzido e compará-lo
com os modelos descritos inicialmente. A apresentação deve explicar as modificações
introduzidas para que o software funcione adequadamente conforme a especificação.

O produto final deve:

- ser desenvolvido com Spring Boot (Java) no back-end, usando arquitetura MVC;
- utilizar React + Vite no front-end;
- utilizar Supabase como banco de dados;
- conter autenticação por login;
- atender aos requisitos deste laboratório e à modelagem produzida durante o projeto;
- manter o repositório GitHub atualizado com todas as versões produzidas dos modelos
  UML e com o código final.

## Critérios de avaliação

A avaliação final considera:

- qualidade do sistema produzido e adequação aos requisitos apresentados;
- alinhamento entre os modelos (de classes e de arquitetura) e o código;
- atualização dos modelos conforme as necessidades identificadas durante o projeto.

## Template de README

O documento do laboratório indica o uso do template de README disponível em:

[Template README — desenvolvimento-e-integracao-de-aplicacoes-web](https://github.com/joaopauloaramuni/desenvolvimento-e-integracao-de-aplicacoes-web/blob/main/TEMPLATES/template_README.md)

## Material complementar

O PDF lista os seguintes materiais de apoio:

- aulas de Spring Boot;
- curso básico de Spring MVC;
- tutorial Spring MVC;
- Spring Boot (PUC Minas);
- repositório Spring Boot (PUC Minas);
- leitura sobre diagrama de pacotes;
- documentação do Supabase;
- React;
- Vite;
- exemplos de projetos Spring Boot no repositório da disciplina.
