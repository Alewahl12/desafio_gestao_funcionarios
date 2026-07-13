# Sistema de Gestão de Funcionários

Aplicação web completa para gerenciamento de funcionários, cargos e departamentos, desenvolvida como solução para um desafio técnico full stack. O sistema permite cadastrar, editar, pesquisar e gerar relatórios em PDF de departamentos, cargos e funcionários, incluindo o gerenciamento dos vínculos empregatícios de cada funcionário (empresa, matrícula, cargo e departamento).

## Índice

1. [Sobre o projeto](#sobre-o-projeto)
2. [Tecnologias utilizadas](#tecnologias-utilizadas)
3. [Estrutura do projeto](#estrutura-do-projeto)
4. [Pré-requisitos](#pré-requisitos)
5. [Obtendo o projeto](#obtendo-o-projeto)
6. [Subindo o banco de dados](#subindo-o-banco-de-dados)
7. [Executando o backend](#executando-o-backend)
8. [Executando o frontend](#executando-o-frontend)
9. [Usando o sistema](#usando-o-sistema)
10. [Documentação da API](#documentação-da-api)
11. [Testes automatizados](#testes-automatizados)
12. [Testes end-to-end (Cypress)](#testes-end-to-end-cypress)
13. [Logs estruturados](#logs-estruturados)
14. [Solução de problemas comuns](#solução-de-problemas-comuns)

---

## Sobre o projeto

O sistema é dividido em três entidades principais:

- **Departamento**: cadastro simples com código e descrição.
- **Cargo**: cadastro simples com código e descrição.
- **Funcionário**: cadastro com nome e CPF, podendo ter um ou mais **vínculos** empregatícios. Cada vínculo tem sua própria empresa, matrícula, cargo e departamento (selecionados a partir dos cadastros existentes).

Regras de negócio importantes:

- O código de um Departamento ou Cargo não pode se repetir.
- O CPF de um Funcionário não pode se repetir.
- Um Funcionário pode ter múltiplos vínculos, e esses vínculos podem ser editados ou substituídos a qualquer momento.
- Todas as listagens têm busca (por texto e, no caso de Funcionário, também por cargo/departamento) e paginação.
- Todas as listagens permitem baixar um relatório em PDF com os dados filtrados.

O sistema também tem uma tela de login simples, com criação de conta, para controlar o acesso à aplicação.

## Tecnologias utilizadas

### Backend

- **Java 21**
- **Spring Boot 4** (Spring Framework 7), com os módulos Spring Web MVC e Spring Data JPA
- **PostgreSQL** como banco de dados
- **Maven** como gerenciador de build e dependências
- **Springdoc OpenAPI** para documentação interativa da API (Swagger UI)
- **JUnit 5**, **Mockito** e **AssertJ** para testes unitários e de repositório
- **H2** (banco em memória) usado exclusivamente durante a execução dos testes
- **JaCoCo** para medir cobertura de testes
- Log estruturado em JSON (formato Elastic Common Schema), nativo do Spring Boot, sem bibliotecas externas

### Frontend

- **React** com **Vite** como bundler
- **React Router** para navegação entre telas
- **Axios** para comunicação com a API
- **jsPDF** e **jspdf-autotable** para geração dos relatórios em PDF
- **cpf-cnpj-validator** para validação de CPF
- CSS puro, organizado em um pequeno design system compartilhado entre as telas (CSS Modules)
- **Vitest** e **Testing Library** para testes unitários de componentes, hooks e serviços
- **Cypress** para testes end-to-end (E2E)

### Infraestrutura

- **Docker** e **Docker Compose**, usados para subir o banco de dados PostgreSQL sem precisar instalá-lo manualmente

## Estrutura do projeto

```
desafio-gestao-funcionarios/
├── backend/                  Aplicação Spring Boot (API REST)
│   ├── src/main/java/...     Código-fonte (entidades, controllers, repositórios, etc.)
│   ├── src/main/resources/   application.properties, scripts de configuração
│   ├── src/test/java/...     Testes unitários e de repositório
│   ├── database/init.sql     Script de criação das tabelas
│   ├── docker-compose.yml    Configuração do container do PostgreSQL
│   └── pom.xml                Dependências e configuração de build (Maven)
│
└── frontend/                 Aplicação React (interface do usuário)
    ├── src/
    │   ├── components/       Componentes reutilizáveis (sidebar, ícones, guarda de rota)
    │   ├── pages/             Telas do sistema (login, listagens e formulários)
    │   ├── services/         Comunicação com a API e controle de sessão
    │   ├── hooks/             Hooks reutilizáveis (ex.: debounce de busca)
    │   └── utils/             Funções auxiliares
    ├── cypress/               Testes end-to-end
    ├── vite.config.js
    └── package.json
```

## Pré-requisitos

Antes de começar, instale na sua máquina:

| Ferramenta | Versão recomendada | Link para download |
|---|---|---|
| Git | qualquer versão recente | https://git-scm.com/downloads |
| JDK (Java) | 21 ou superior | https://adoptium.net/ |
| Maven | qualquer versão recente | https://maven.apache.org/download.cgi |
| Node.js (inclui o npm) | 20 ou superior | https://nodejs.org/ |
| Docker Desktop | qualquer versão recente | https://www.docker.com/products/docker-desktop/ |

Para confirmar que tudo foi instalado corretamente, abra um terminal e rode:

```
git --version
java -version
mvn -version
node -version
npm -version
docker --version
```

Cada comando deve responder com um número de versão, sem erro.

## Obtendo o projeto

Clone o repositório e entre na pasta criada:

```
git clone <URL_DO_REPOSITORIO>
cd desafio-gestao-funcionarios
```

Substitua `<URL_DO_REPOSITORIO>` pelo endereço real do repositório Git do projeto.

## Subindo o banco de dados

O banco de dados PostgreSQL roda dentro de um container Docker, configurado pelo arquivo `docker-compose.yml` na pasta `backend/`. Isso evita ter que instalar o PostgreSQL manualmente na sua máquina.

Na pasta `backend/`, rode:

```
cd backend
docker compose up -d
```

O parâmetro `-d` faz o container rodar em segundo plano. Para conferir se ele subiu corretamente:

```
docker ps
```

Deve aparecer um container chamado `gestao_funcionarios_db`, com a porta `5432` mapeada.

Na primeira vez que o container é criado, o script `database/init.sql` roda automaticamente e cria todas as tabelas necessárias. Se você já tinha esse container criado antes de alguma atualização no `init.sql`, pode ser necessário recriar o volume para que as tabelas novas sejam criadas:

```
docker compose down -v
docker compose up -d
```

Atenção: o comando acima apaga todos os dados salvos no banco.

Para parar o banco de dados quando terminar de usar o sistema:

```
docker compose down
```

## Executando o backend

Com o banco de dados no ar, entre na pasta `backend/` (se ainda não estiver nela) e rode:

```
mvn spring-boot:run
```

O backend vai iniciar e ficar disponível em `http://localhost:8080`. Deixe esse terminal aberto enquanto estiver usando o sistema.

As configurações de conexão com o banco (usuário, senha, nome do banco) já estão prontas no arquivo `src/main/resources/application.properties` e não precisam ser alteradas para rodar localmente.

## Executando o frontend

Em um novo terminal, entre na pasta `frontend/` e instale as dependências (só é necessário na primeira vez, ou sempre que o `package.json` for atualizado):

```
cd frontend
npm install
```

Depois, inicie o servidor de desenvolvimento:

```
npm run dev
```

O terminal vai mostrar um endereço parecido com `http://localhost:5173` — abra esse endereço no navegador para acessar o sistema. Deixe esse terminal aberto enquanto estiver usando o sistema.

Resumindo: para usar o sistema completo, é preciso ter três coisas rodando ao mesmo tempo, cada uma em seu próprio terminal:

1. Banco de dados (`docker compose up -d`, na pasta `backend/`)
2. Backend (`mvn spring-boot:run`, na pasta `backend/`)
3. Frontend (`npm run dev`, na pasta `frontend/`)

## Usando o sistema

Ao acessar o endereço do frontend pela primeira vez, você verá a tela de login. Como ainda não existe nenhuma conta cadastrada, clique em "Criar conta", escolha um login e uma senha (mínimo de 6 caracteres) e confirme. Depois disso, use as mesmas credenciais na tela de login para entrar no sistema.

Dentro do sistema, a barra lateral dá acesso às três telas principais (Funcionário, Cargo e Departamento). Em cada uma delas é possível:

- Ver a listagem paginada dos registros cadastrados
- Buscar por diferentes campos (a busca é automática, com um pequeno atraso após parar de digitar)
- Cadastrar um novo registro
- Editar um registro existente
- Baixar um relatório em PDF com os registros que atendem ao filtro atual

Na tela de Funcionário, é possível ainda:

- Adicionar um ou mais vínculos empregatícios ao cadastrar ou editar um funcionário
- Clicar em qualquer linha da listagem para visualizar todos os vínculos daquele funcionário em detalhe

Para sair da sua conta, use o botão "Sair" na parte de baixo da barra lateral.

## Documentação da API

Com o backend em execução, a documentação interativa da API (gerada automaticamente pelo Springdoc) fica disponível em:

```
http://localhost:8080/swagger-ui.html
```

Nela é possível ver todos os endpoints disponíveis, os parâmetros que cada um aceita, e testar as requisições diretamente pelo navegador.

## Testes automatizados

O projeto tem testes automatizados tanto no backend quanto no frontend, cobrindo as principais regras de negócio.

### Backend

Os testes cobrem, entre outras coisas: validação de código e CPF duplicado, criação e edição de vínculos, filtros de pesquisa e paginação. Para rodar todos os testes do backend, na pasta `backend/`:

```
mvn test
```

Os testes de repositório usam um banco H2 em memória, criado e destruído automaticamente a cada execução — não é necessário ter o Docker rodando para rodar os testes.

Para gerar o relatório de cobertura de testes (JaCoCo), rode:

```
mvn test
```

O relatório é gerado automaticamente em `backend/target/site/jacoco/index.html`. Abra esse arquivo no navegador para ver a cobertura detalhada por classe, incluindo linhas e branches (condicionais) cobertos.

### Frontend

Os testes do frontend cobrem hooks, serviços e componentes (incluindo a tela de login, a barra lateral e a proteção de rotas). Na pasta `frontend/`:

Para rodar os testes uma vez e encerrar:

```
npm run test:run
```

Para rodar os testes em modo interativo, re-executando automaticamente a cada alteração salva:

```
npm run test
```

Para rodar os testes com relatório de cobertura:

```
npm run test:coverage
```

O relatório em texto aparece direto no terminal, e uma versão navegável em HTML é gerada em `frontend/coverage/index.html`.

## Testes end-to-end (Cypress)

Os testes end-to-end simulam o uso real do sistema por um usuário, num navegador de verdade, cobrindo os fluxos completos de cadastro, edição, pesquisa, paginação e geração de relatório para Departamento, Cargo e Funcionário, além do fluxo de autenticação (criação de conta, login, logout e proteção de rotas).

Diferente dos testes unitários, o Cypress precisa do sistema completo no ar. Antes de rodar, garanta que os três serviços descritos na seção [Executando o backend](#executando-o-backend) e [Executando o frontend](#executando-o-frontend) estejam ativos (banco de dados, backend e frontend).

Com tudo no ar, na pasta `frontend/`, você pode rodar os testes de duas formas:

Para abrir a interface visual do Cypress (recomendado para acompanhar o teste rodando passo a passo):

```
npm run cypress:open
```

Escolha "E2E Testing", selecione um navegador, e clique em qualquer um dos arquivos de teste listados para executá-lo.

Para rodar todos os testes direto no terminal, sem abrir nenhuma janela:

```
npm run cypress:run
```

Os testes criam seus próprios dados de teste automaticamente (com identificadores únicos a cada execução), então podem ser rodados repetidas vezes sem conflito. Vale notar que, como usam o mesmo banco de dados da aplicação, cada execução deixa alguns registros de teste salvos no banco.

## Logs estruturados

O backend registra logs em formato JSON estruturado (em vez de texto simples) no console, o que facilita a leitura por ferramentas de monitoramento. Cada requisição HTTP recebe automaticamente um identificador único (`requestId`), que aparece em todas as linhas de log geradas durante aquela requisição, junto com o método HTTP, a rota acessada, o status da resposta e o tempo de duração.

## Solução de problemas comuns

**O backend não inicia e mostra um erro de conexão recusada com a porta 5432.**
O banco de dados não está rodando. Verifique com `docker ps` se o container `gestao_funcionarios_db` aparece na lista; se não aparecer, rode `docker compose up -d` na pasta `backend/`.

**A tela do sistema abre em branco ou mostra erro de conexão com a API.**
Confirme que o backend está rodando (`http://localhost:8080` deve responder) antes de usar o frontend.

**Uma tabela nova não aparece no banco depois de uma atualização.**
O script `database/init.sql` só roda automaticamente na primeira vez que o container do banco é criado. Se o container já existia de antes, recrie o volume com `docker compose down -v` seguido de `docker compose up -d` (isso apaga os dados salvos).

**Os testes do Cypress falham porque não encontram um elemento na tela.**
Confirme que o backend e o frontend estão rodando antes de iniciar o Cypress — diferente dos testes unitários, os testes end-to-end dependem do sistema completo estar no ar.