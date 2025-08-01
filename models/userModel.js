// Representa um Usuário do sistema.

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); // Importa a função para gerar UUID v4

const userSchema = new mongoose.Schema({

    // Identificador único do usuário.
    _id: {
        type: String,
        default: uuidv4 // Define a função uuidv4 como valor padrão para o _id
    },

    // Nome completo do usuário.
    name: {
        type: String,
        required: true,
        trim: true
    },

    // Endereço de e-mail do usuário, usado para login. Deve ser único.
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    // Papel (Role) do usuário no sistema, para controle de permissões.
    // Ex: "User", "Manager". Utilizado na Regra de Negócio 5.
    role: {
        type: String,
        enum: ['Manager', 'User'],
        default: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);