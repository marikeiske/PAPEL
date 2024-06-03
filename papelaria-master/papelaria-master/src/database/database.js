const { result } = require('lodash');

async function conectar() {
    if (global.minhaConexao && global.minhaConexao.state != 'disconected') {
        return global.minhaConexao;
    }

    const mysql = require('mysql2/promise');

    const conect = await mysql.createConnection('mysql://root:root@localhost:3306/papelaria_flamingo')
    global.minhaConexao = conect;
    return conect;
}

async function conferirUsuario(usuario, senha) {
    const conexao = await conectar();
    const sql = 'SELECT * FROM usuarios WHERE nomeUsuario = ? AND senha = ?;';
    const [data] = await conexao.query(sql, [usuario, senha]);

    return data;
}

async function cadastrarProduto(produtos) {
    const conexao = await conectar();
    const query = 'INSERT INTO produtos (quantidade, nome, marca, cor, preco) VALUES (?, ?, ?, ?, ?);';
    const data = [produtos.quantidade, produtos.nome, produtos.marca, produtos.cor, produtos.preco];

    return await conexao.query(query, data);
}

async function cadastrarUsuario(usuario) {
    const conexao = await conectar();
    const query = 'INSERT INTO usuarios (nomeUsuario, nome, email, dataNasc, senha) VALUES (?, ?, ?, ?, ?);';
    const data = [usuario.username, usuario.nome, usuario.email, usuario.nascimento, usuario.senha];

    return await conexao.query(query, data);
}

async function cadastrarFornecedor(fornece) {
    const conexao = await conectar();
    const query = 'INSERT INTO fornecedores (nome, email, endereco, cnpj, telefone) VALUES (?, ?, ?, ?, ?);';
    const data = [fornece.nome, fornece.email, fornece.endereco, fornece.cnpj, fornece.telefone];

    return await conexao.query(query, data);
}

async function listarProdutos() {
    const conexao = await conectar();
    const query = 'SELECT * FROM produtos ORDER BY nome;';
    const [data] = await conexao.query(query);

    return data;
}

async function listarProdutoUnico(codigo) {
    const conexao = await conectar();
    const query = 'SELECT * FROM produtos WHERE codigo = ?;';
    const [data] = await conexao.query(query, [codigo]);

    return data[0];
}

async function finalizarCompra(quant, codigo) {
    const conexao = await conectar();
    const query = 'UPDATE `produtos` SET `quantidade`= ? WHERE `codigo`= ?;';
    const quantidade = (quant - 1);
    return await conexao.query(query, [quantidade, codigo]);
}

async function listarFornecedores() {
    const conexao = await conectar();
    const query = 'SELECT * FROM fornecedores ORDER BY nome;';
    const [data] = await conexao.query(query);

    return data;
}

async function listarFornecedorUnico(codigo) {
    const conexao = await conectar();
    const query = 'SELECT * FROM `fornecedores` WHERE `codigo` = ?;';
    const [data] = await conexao.query(query, [codigo]);

    return data[0];
}

async function editarProduto(produto, codigo) {
    const conexao = await conectar();
    const query = 'UPDATE `produtos` SET `quantidade`= ?, `nome`= ?, `marca`= ?, `cor`= ?, `preco`= ? WHERE `codigo`= ?;';
    const data = [produto.quantidade, produto.nome, produto.marca, produto.cor, produto.preco, codigo];

    return await conexao.query(query, data);
}

async function editarFornecedor(fornecedor, codigo) {
    const conexao = await conectar();
    const query = 'UPDATE `fornecedores` SET `nome`= ?, `email`= ?, `endereco`= ?, `cnpj`= ?, `telefone`= ? WHERE `codigo`= ?;';
    const data = [fornecedor.nome, fornecedor.email, fornecedor.endereco, fornecedor.cnpj, fornecedor.telefone, codigo];

    return await conexao.query(query, data);
}

async function excluirProduto(codigo, qtdPost) {
    const conexao = await conectar();
    const consulta = 'SELECT * FROM produtos WHERE codigo = ?;';
    const [data] = await conexao.query(consulta, [codigo]);
    const qtdBanco = data[0].quantidade;

    if (qtdBanco > qtdPost) {

        const qtdNova = (qtdBanco - qtdPost);
        const query = 'UPDATE `produtos` SET `quantidade`= ? WHERE `codigo`= ?;';
        return await conexao.query(query, [qtdNova, codigo]);

    } else if (qtdBanco == qtdPost || qtdBanco < qtdPost) {

        const query = 'DELETE FROM `produtos` WHERE `codigo` = ?;';
        return await conexao.query(query, [codigo]);

    }
}

async function excluirFornecedor(codigo) {
    const conexao = await conectar();
    const query = 'DELETE FROM `fornecedores` WHERE `codigo`= ?;';
    
    return await conexao.query(query, [codigo]);
}

module.exports = {
    conferirUsuario, cadastrarProduto, cadastrarUsuario, cadastrarFornecedor,
    listarProdutos, listarProdutoUnico, finalizarCompra, listarFornecedores,
    editarProduto, excluirProduto, editarFornecedor, listarFornecedorUnico,
    excluirFornecedor
};