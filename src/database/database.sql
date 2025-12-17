CREATE DATABASE rsti_final;
USE rsti_final;


CREATE TABLE usuario (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, 
    nome VARCHAR(100) NOT NULL, 
    email VARCHAR(100) NOT NULL UNIQUE, 
    senha VARCHAR(255) NOT NULL, 
    nivel_acesso ENUM('admin', 'colaborador', 'cliente') NOT NULL DEFAULT 'cliente' 
); 

CREATE TABLE tipo_servico (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE 
);

CREATE TABLE demandas (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(45) NOT NULL, 
    tipo_servico_id INT NOT NULL,
    descricao TEXT NOT NULL,
    cliente_id INT NOT NULL,
    orcamento DECIMAL(8,2) NOT NULL,
    prazo DATE NOT NULL,
    data_entrega DATE NOT NULL,
    status_servico ENUM('Em andamento', 'Atrasado', 'Concluído', 'Cancelado') NOT NULL DEFAULT 'Em andamento', 
    
    FOREIGN KEY (data_entrega) REFERENCES entregas(id)
    FOREIGN KEY (tipo_servico_id) REFERENCES tipo_servico(id),
    FOREIGN KEY (cliente_id) REFERENCES usuario(id)
);

