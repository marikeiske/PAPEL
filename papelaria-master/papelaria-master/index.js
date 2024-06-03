const express = require('express');
const ejs = require('ejs');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const conexao = require('./src/database/database');


const viewsPath = path.join(__dirname, '/src/views');
const porta = 8080;
const app = express();


const newSecret = 'this-is-a-secret';
app.use(session({ secret: newSecret }));
app.use(bodyParser.urlencoded({ extended: true }));
app.engine('html', ejs.renderFile);
app.set('view engine', 'html');
app.set('views', viewsPath);
app.use(express.static('public'));

function confereLogin(req) {
    return (req.session.usuario && req.session.usuario != "");
}

app.get('/', (req, res) => {
    res.render('login');
})

app.get('/home', (req, res) => {
    if (confereLogin(req)) {
        res.render('home')
    } else {
        res.render('error', { mensagem: 'Acesso Proíbido', link: '/' })
    }
})

app.get('/cadastro-usuario', (req, res) => {
    if (confereLogin(req)) {
        res.render('cadastroUsuario');
    } else {
        res.render('error', { mensagem: 'Acesso Proíbido', link: '/' })
    }
})

app.get('/produtos', async (req, res) => {
    if (confereLogin(req)) {
        const data = await conexao.listarProdutos();
        res.render('produtos', { data });
    } else {
        res.render('error', { mensagem: 'Acesso Proíbido', link: '/' })
    }
})

app.get('/editar-produto/:codigo', async (req, res) => {
    if (confereLogin(req)) {
        const codigo = parseInt(req.params.codigo);
        const data = await conexao.listarProdutoUnico(codigo);

        res.render('editProduto', { data,  action: '/editar-produto/' + codigo });
    } else {
        res.render('error', { mensagem: 'Acesso Proíbido', link: '/' })
    }
})

app.get('/excluir-produto/:codigo', async (req, res) => {
    if (confereLogin(req)) {
        const codigo = parseInt(req.params.codigo);
        const data = await conexao.listarProdutoUnico(codigo);

        res.render('excluirProduto', { data, action: '/excluir-produto/' + codigo });
    } else {
        res.render('error', { mensagem: 'Acesso Proíbido', link: '/' })
    }
})

app.get('/excluir-fornecedor/:codigo', async (req, res) => {
    if (confereLogin(req)) {
        const codigo = parseInt(req.params.codigo);
        
        await conexao.excluirFornecedor(codigo);

        res.render('obrigado', { 
            mensagem: 'Parabéns, fornecedor excluído com sucesso!'
         });
    } else {
        res.render('error', { mensagem: 'Acesso Proíbido', link: '/' })
    }
})

app.get('/carrinho-de-compras/:codigo', async (req, res) => {
    if (confereLogin(req)) {
        const cod = parseInt(req.params.codigo)
        const data = await conexao.listarProdutoUnico(cod);
        res.render('carrinhoCompras', { data });
    } else {
        res.render('error', { mensagem: 'Acesso Proíbido', link: '/' })
    }
})

app.get('/finalizar-compra/:codigo/:quantidade', async (req, res) => {
    if (confereLogin(req)) {
        const cod = parseInt(req.params.codigo);
        const quant = parseInt(req.params.quantidade);
        const final = await conexao.finalizarCompra(quant, cod);
        res.render('obrigado', { final, mensagem: 'Muito obrigado pela sua compra!' });
    } else {
        res.render('error', { mensagem: 'Acesso Proíbido', link: '/' })
    }
})

app.get('/cadastrar-produto', (req, res) => {
    if (confereLogin(req)) {
        res.render('cadastroProduto');
    } else {
        res.render('error', { mensagem: 'Acesso Proíbido', link: '/' })
    }
})

app.get('/cadastrar-fornecedor', (req, res) => {
    if (confereLogin(req)) {
        res.render('cadastroFornecedor');
    } else {
        res.render('error', { mensagem: 'Acesso Proíbido', link: '/' })
    }
})

app.get('/fornecedores', async (req, res) => {
    if (confereLogin(req)) {
        const data = await conexao.listarFornecedores();
        res.render('fornecedores', { data });
    } else {
        res.render('error', { mensagem: 'Acesso Proíbido', link: '/' })
    }
})

app.get('/editar-fornecedor/:codigo', async (req, res) => {
    if (confereLogin(req)) {
        const codigo = parseInt(req.params.codigo);
        const data = await conexao.listarFornecedorUnico(codigo);
    
        res.render('editFornecedor', { data,  action: '/editar-fornecedor/' + codigo });
    } else {
        res.render('error', { mensagem: 'Acesso Proíbido', link: '/' })
    }
    
})

app.post('/', async (req, res) => {
    const usernameLogin = req.body.usuarioLogin;
    const senhaLogin = req.body.pswLogin;

    const data = await conexao.conferirUsuario(usernameLogin, senhaLogin);

    if (data && data[0].codigo) {
        req.session.usuario = data[0].nomeUsuario;
        res.redirect('home');
    } else {
        res.render('login');
    }
})

app.post('/cadastrar-produto', async (req, res) => {
    const quantidade = req.body.produtoQuant;
    const nome = req.body.produtoNome;
    const marca = req.body.produtoMarca;
    const cor = req.body.produtoCor;
    const preco = req.body.produtoPreco;

    const produto = {
        quantidade,
        nome,
        marca,
        cor,
        preco
    };

    await conexao.cadastrarProduto(produto);
    res.render('obrigado', { 
        mensagem: 'Parabéns, seu produto foi cadastrado com sucesso!'
    });
})

app.post('/cadastro-usuario', async (req, res) => {
    const username = req.body.usernameCadastro;
    const nome = req.body.nomeCadastro;
    const email = req.body.emailCadastro;
    const nascimento = req.body.birthdayCadastro;
    const senha = req.body.pswCadastro;

    const usuario = {
        username,
        nome,
        email,
        nascimento,
        senha
    };

    await conexao.cadastrarUsuario(usuario);
    res.render('obrigado', { 
        mensagem: 'Parabéns, usuário cadastrado com sucesso!'
     });
})

app.post('/cadastrar-fornecedor', async (req, res) => {
    const nome = req.body.nomeFornece;
    const cnpj = req.body.cnpjFornece;
    const email = req.body.emailFornece;
    const endereco = req.body.enderecoFornece;
    const telefone = req.body.telefoneFornece;

    const fornece = {
        nome,
        cnpj,
        email,
        endereco,
        telefone
    }

    await conexao.cadastrarFornecedor(fornece);
    res.render('obrigado', { 
        mensagem: 'Parabéns, fornecedor cadastrado com sucesso!'
    });
});

app.post('/excluir-produto/:codigo', async (req, res) => {
    const codigo = parseInt(req.params.codigo);
    const quantidade = req.body.produtoQuant;

    await conexao.excluirProduto(codigo, quantidade);

    res.render('obrigado', { 
        mensagem: 'Parabéns, a quantidade informada foi excluída com sucesso!' 
    });
})

app.post('/editar-produto/:codigo', async (req, res) => {
    const codigo = parseInt(req.params.codigo);
    const quantidade = req.body.produtoQuant;
    const nome = req.body.produtoNome;
    const marca = req.body.produtoMarca;
    const cor = req.body.produtoCor;
    const preco = req.body.produtoPreco;

    const produto = {
        quantidade,
        nome,
        marca,
        cor,
        preco
    };

    await conexao.editarProduto(produto, codigo);
    res.render('obrigado', { 
        mensagem: 'Parabéns, produto editado com sucesso!'
    });
})

app.post('/editar-fornecedor/:codigo', async (req, res) => {
    const codigo = parseInt(req.params.codigo);
    const nome = req.body.nomeFornece;
    const cnpj = req.body.cnpjFornece;
    const email = req.body.emailFornece;
    const endereco = req.body.enderecoFornece;
    const telefone = req.body.telefoneFornece;

    const fornecedor = {
        nome,
        cnpj,
        email,
        endereco,
        telefone
    }

    await conexao.editarFornecedor(fornecedor, codigo);

    res.render('obrigado', { 
        mensagem: 'Parabéns, fornecedor editado com sucesso!'
    });
})

app.listen(porta);
