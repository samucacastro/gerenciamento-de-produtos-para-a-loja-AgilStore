const readline = require('readline');
const fs = require('fs');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function questionAsync(query) {
    return new Promise((resolve) => {
        rl.question(query, (answer) => {
            resolve(answer);
        });
    });
}

const cor = {
    preto: '\u001b[30m',
    vermelho: '\u001b[31m',
    verde: '\u001b[32m',
    amarelo: '\u001b[33m',
    azul: '\u001b[34m',
    roxo: '\u001b[35m',
    ciano: '\u001b[36m',
    reset: '\u001b[0m'
}
let produtos;
try {
    produtos = JSON.parse(fs.readFileSync("./database.json", "utf8"));
} catch (erro) {
    produtos = [];
}

function showMenu() {
    console.log('\nMenu:');
    console.log('1. Adicionar produto');
    console.log('2. Listar produtos');
    console.log('3. Editar produto');
    console.log('4. Excluir produto');
    console.log('5. Pesquisar produto');
    console.log('6. Fechar programa');
    rl.question('\nEscolha uma opção: ', handleMenu);
}

function handleMenu(option) {
    switch (option) {
        case '1':
            console.clear();
            adicionarProduto();
            break;
        case '2':
            console.clear();
            listarProdutos();

            break;
        case '3':
            console.clear();
            editarProduto();
            break;
        case '4':
            console.clear();
            deletarProduto();
            break;
        case '5':
            console.clear();
            pesquisarProduto();
            break;
        case '6':
            console.clear();
            rl.close();
            break;
        default:
            console.log('\nOpção inválida.');
            showMenu();
    }
}

function adicionarProduto() {
    let id;
    if (produtos.length > 0) {
        id = Number(produtos[produtos.length - 1].id) + 1;
    } else {
        id = 1;
    }
    rl.question('Digite o nome do produto: ', (nome) => {
        rl.question('Digite a categoria do produto:', (categoria) => {
            rl.question('Digite a quantidade do produto: ', (quantidade) => {
                rl.question('Digite o preço do produto:', (preco) => {
                    produtos.push({ id, nome, categoria, quantidade, preco });
                    console.log(`\n ${cor.roxo}  Produto adicionado: ${cor.azul} ID = ${id}, Nome = ${nome}, Categoria = ${categoria}, Quantidade = ${quantidade}, Preço = ${preco}` + cor.reset);
                    salvardados(produtos)
                    showMenu();
                })
            });
        })
    });
    ;
}

function exibirProdutos(produtos) {
    produtos.forEach((produto) => {
        console.log(cor.verde + `ID: ${produto.id}, Nome: ${produto.nome}, Categoria: ${produto.categoria}, Quantidade: ${produto.quantidade}, Preço: ${produto.preco}` + cor.reset);
    });
}

function ordenarProdutos(produtos, criterio) {
    switch (criterio) {
        case 'nome': produtos.sort((a, b) => a.nome.localeCompare(b.nome));
            break;
        case 'quantidade': produtos.sort((a, b) => a.quantidade - b.quantidade);
            break;
        case 'preço': produtos.sort((a, b) => a.preco - b.preco);
            break;
        default: console.log('\nCritério inválido. Produtos não ordenados.');
    }
    exibirProdutos(produtos);
}

function listarProdutos() {
    console.log(cor.azul + '\n Produtos:' + cor.reset);
    if (produtos.length <= 0) {
        console.log(cor.vermelho + 'Nenhum produto cadastrado no banco de dados, adicione um produto e tente novamente.' + cor.reset)
        showMenu();
        return
    }
    rl.question(`\n ${cor.roxo}Deseja filtrar por categoria? (s/n): ${cor.reset}`, (filter) => {
        if (filter.toLowerCase() === 's') {
            rl.question('Digite a categoria: ', (categoria) => {
                const produtosFiltrados = produtos.filter(produto => produto.categoria === categoria);
                exibirProdutos(produtosFiltrados);
                rl.question('\nDeseja ordenar por (nome/quantidade/preço)? ou digite (n) para voltar ao menu. ', (ordem) => {
                    if (ordem.toLowerCase() == 'n') {
                        showMenu();
                        return
                    }
                    ordenarProdutos(produtosFiltrados, ordem);
                    showMenu();
                });
            });
        } else {
            exibirProdutos(produtos);
            rl.question('\nDeseja ordenar por (nome/quantidade/preço)? ou digite (n) para voltar ao menu. ', (ordem) => {
                if (ordem.toLowerCase() == 'n') {
                    showMenu();
                    return
                }
                ordenarProdutos(produtos, ordem);
                showMenu();
            });
        }
    });
}

function deletarProduto() {
    rl.question("digite o ID do  produto que deseja excluir:", (id) => {
        const temProduto = produtos.find((produto) => {
            return produto.id == id;
        });

        if (temProduto) {
            rl.question(`Deseja realmente excluir permanentimente o produto de ID = ${temProduto.id} e nome = ${temProduto.nome}? \ndigite 1 para sim ou 2 para cancelar.`, (resposta) => {
                if (resposta == 1) {
                    const produtosAtualizados = produtos.filter((produto) => {
                        return produto.id != id;
                    });
                    produtos = produtosAtualizados;
                    salvardados(produtosAtualizados);
                    console.log(cor.verde + 'Produto excluido com sucesso!' + cor.reset)
                    showMenu();
                }
                else {
                    showMenu();
                }
            })
        } else {
            console.log(cor.vermelho + `Não existe produto com o ID ${id}` + cor.reset);
            showMenu();
        }
    })
}

async function editarProduto() {
    console.clear();
    rl.question(cor.roxo + 'Digite o ID do produto que deseja editar:', (id) => {
        const validarProduto = produtos.findIndex((produto) => {
            return produto.id == id;
        });
        if (validarProduto < 0) {
            console.log(cor.vermelho + `Produto com ID ${id} não encontrado.` + cor.reset);
            showMenu()
            return
        }
        rl.question(cor.azul + 'Digite os campos que deseja editar separados por virgulas (Ex: Nome, Categoria, Quantidade, Preço ):', async (campos) => {
            const camposrPraEditar = campos.split(',');

            const validarCampos = (isCampoValido) => {
                return camposrPraEditar.find((campo) => {
                    return campo.toLowerCase().trim() == isCampoValido;
                })

            };

            if (!validarCampos('nome') && !validarCampos('categoria') && !validarCampos('quantidade') && !validarCampos('preço')) {
                console.log(cor.vermelho + "CAMPOS INVALIDOS" + cor.reset)
            }

            if (validarCampos('nome')) {
                const nome = await questionAsync('Digite o novo nome do produto:');
                produtos[validarProduto].nome = nome;
            }
            if (validarCampos('categoria')) {
                const categoria = await questionAsync('Digite a nova categoria do produto:');
                produtos[validarProduto].categoria = categoria;
            }
            if (validarCampos('quantidade')) {
                const quantidade = await questionAsync('Digite a nova quantidade do produto:');
                if (!isNaN(Number(quantidade)) || Number(quantidade) > 0) {
                    produtos[validarProduto].quantidade = Number(quantidade);
                } else {
                    console.log(cor.vermelho + 'ERRO: A quantidade tem que ser um número valido maior que 0.' + cor.reset);
                }
            }
            if (validarCampos('preço')) {
                const preco = await questionAsync('Digite o novo preço do produto:');
                if (!isNaN(Number(preco)) || Number(preco) > 0) {
                    produtos[validarProduto].preco = Number(preco);
                } else {
                    console.log(cor.vermelho + 'O preço tem que ser um número valido maior que 0.' + cor.reset);
                }
            }
            salvardados(produtos);
            console.log(cor.verde + 'Produto alterado com sucesso' + cor.reset);
            showMenu()
        });
    });
}

function pesquisarProduto() {
    const pesquisa = rl.question(cor.roxo + 'Digite o termo a ser pesquisado ou o ID do produto:', (pesquisa) => {
        let produtosEncontrados = [];
        produtos.forEach((produto) => {
            if (produto.nome?.toLowerCase().includes(pesquisa) || produto.id == pesquisa) {
                produtosEncontrados.push(produto);
            }
        });
        if (produtosEncontrados.length > 0) {
            console.log(cor.azul + 'Produto(s) encontrado(s):' + cor.reset);
            exibirProdutos(produtosEncontrados);
        } else {
            console.log(cor.vermelho + `Nenhum produto com o nome "${pesquisa}" foi encontrado:` + cor.reset);
        }
        showMenu();
    })
}

showMenu();

function salvardados(data) {
    fs.writeFile('database.json', JSON.stringify(data), 'utf-8', (err) => {
        if (err) throw err;
    });
}

rl.on('close', () => {
    console.log('\nSistema encerrado.');
    process.exit(0);
});
