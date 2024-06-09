const computadoresModel = require('../models/computadoresModel');
const utils = require('../../public/script/utils');


function buscarPorId(req, res) {
    computadoresModel.buscarPorId(req.params.idHospital)
        .then((result) => {
            if (result.length > 0) {
                res.status(200).json(result);
            }
            else {
                res.status(100).send(utils.NOT_FOUND);
            }
        })
        .catch((error) => {
            console.log(error);
            res.status(500).send(utils.UNEXPECTED_ERROR);
        });
}

function findLogs(req, res) {
    computadoresModel.findLogs(
        Object.entries(req.params).map((x) => { if (x[1] != 'null') { return x; } }).filter(x => x != undefined)
    )
        .then((result) => {
            if (result.length > 0) {
                res.status(200).json(result);
            } else {
                res.status(400).send('Nenhum registro encontrado.');
            }
        })
        .catch((error) => {
            console.log(error);
            res.status(500).send(utils.UNEXPECTED_ERROR);
        })
}

function historic(req, res) {
    computadoresModel.historic(req.params.fkHospital)
        .then((result) => {
            if (result.length > 0) {
                res.status(200).json(result);
            } else {
                res.status(400).send('Nenhum registro encontrado.');
            }
        })
        .catch((error) => {
            console.log(error);
            res.status(500).send(utils.UNEXPECTED_ERROR);
        });
}

function adicionarPC(req, res) {

    const nome = req.body.nome;
    const codPatrimonio = req.body.codPatrimonio;
    const departamento = req.body.departamento;
    const senha = req.body.senha;
    const fkHospital = req.body.fkHospital;

    if (!/^[a-zA-Z0-9!@#$%^&*()_\s]{3,100}$/.test(nome) ||
        !/^[a-zA-Z0-9\s]{7,50}$/.test(codPatrimonio) ||
        !/^[a-zA-Z0-9!@#$%^&*()]{8,25}$/.test(senha)
    ) {
        res.status(400).send('Dados incorretos');
    } else {
        computadoresModel.adicionarPC(nome, codPatrimonio, departamento, senha, fkHospital)
        
            .then(
                function (result) {
                    res.status(200).send(utils.SUCCESSFULLY_CHANGED)
                }
            ).catch(
                function (erro) {
                    res.status(500).send(utils.UNEXPECTED_ERROR);
                }
            );
    }

}

function deletarPC(req, res) {

    const idComputador = req.params.idComputador;

    computadoresModel.deletar(idComputador)
        .then(
            function (resultado) {
                res.status(200).json(resultado);
            }
        )
        .catch(
            function (erro) {
                console.log(erro);
                console.log("Houve um erro ao deletar a máquina");
                res.status(500).json(erro.sqlMessage);
            }
        );
}

function historicLeituras(req, res) {
    computadoresModel.historicLeituras(req.params.status, req.params.fkHospital)
        .then((result) => {
            if (result.length > 0) {
                res.status(200).json(result);
            } else {
                res.status(400).send(utils.NOT_FOUND);
            }
        })
        .catch((error) => {
            console.log(error);
            res.status(500).send(utils.UNEXPECTED_ERROR);
        })
}


function historicFerramentas(req, res) {
    computadoresModel.historicFerramentas(
        Object.entries(req.params).map((x) => { if (x[1] != 'null') { return x; } }).filter(x => x != undefined)
    )
        .then((result) => {
            if (result.length > 0) {
                res.status(200).json(result);
            } else {
                res.status(400).send(utils.NOT_FOUND);
            }
        })
        .catch((error) => {
            console.log(error);
            res.status(500).send(utils.UNEXPECTED_ERROR);
        })
}

function editarPC(req, res) {
    const idComputador = req.params.idComputador;
    const updateNome = req.body.updateNome;
    const updateCodPatrimonio = req.body.updateCodPatrimonio;
    const updateDepartamento = req.body.updateDepartamento;
    const updateSenha = req.body.updateSenha;

    computadoresModel.editarPC(updateNome, updateCodPatrimonio, updateSenha, updateDepartamento, idComputador)
        .then(
            function (resultado) {
                res.json(resultado);
            }
        )
        .catch(
            function (erro) {
                console.log(erro);
                console.log("Houve um erro ao editar o computador");
                res.status(500).json(erro.sqlMessage);
            }
        );
}

function historicAtividade(req, res) {
    computadoresModel.findComputerByDeps(req.params.idDepartamento)
    .then((result) => {
        if (result.length > 0) {
            let promises = result.map(row => {
                return computadoresModel.historicAtividade(row.idComputador)
                .then((result_) => {
                    row.leituras = result_;
                    return row;
                });
            });

            Promise.all(promises)
            .then((updatedResult) => {
                promises = updatedResult.map(row => {
                    return computadoresModel.lastFourFerramentas(row.idComputador)
                    .then((result_) => {
                        row.ultimasFerramentas = result_;
                        return row;
                    });
                })

                Promise.all(promises)
                .then((updatedResult) => {
                    res.status(200).json(updatedResult);
                })
                .catch((error) => {
                    console.log(error);
                    res.status(500).send(utils.UNEXPECTED_ERROR);
                });
            })
            .catch((error) => {
                console.log(error);
                res.status(500).send(utils.UNEXPECTED_ERROR);
            });
        } else {
            res.status(400).send(utils.NOT_FOUND);
        }
    })
    .catch((error) => {
        console.log(error);
        res.status(500).send(utils.UNEXPECTED_ERROR);
    });
}

function findMetrica(req, res) {
    computadoresModel.findMetrica(req.params.idComputador)
    .then((result) => {
        if (result.length > 0) {
            res.status(200).json(result);
        } else {
            res.status(400).send(utils.NOT_FOUND);
        }
    })
    .catch((error) => {
        console.log(error);
        res.status(500).send(utils.UNEXPECTED_ERROR);
    });
}

function updateMetrica(req, res) {
    if (
        req.body.alertaRam >= req.body.alertaCritRam ||
        req.body.alertaCpu >= req.body.alertaCritCpu ||
        req.body.alertaDisco >= req.body.alertaCritDisco
    ) {
        res.status(500).send(utils.INVALID_ALERT_DATA);
        return;
    }

    computadoresModel.updateMetrica(req.body, req.params.idComputador)
    .then(() => {
        res.status(200).send(utils.SUCCESSFULLY_CHANGED);
    })
    .catch((error) => {
        console.log(error);
        res.status(500).send(utils.UNEXPECTED_ERROR);
    });
}

module.exports = {
    buscarPorId,
    findLogs,
    historic,
    adicionarPC,
    deletarPC,
    historicFerramentas,
    historicLeituras,
    historicAtividade,
    editarPC,
    findMetrica,
    updateMetrica,
}