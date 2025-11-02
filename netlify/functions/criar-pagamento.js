/* * ROBÔ 1: criar-pagamento.js
 * Objetivo: Cria um link de pagamento "etiquetado" no Mercado Pago.
 */

const { createClient } = require('@supabase/supabase-js');
const mercadopago = require('mercadopago');

// Pega as senhas do Netlify
const {
    SUPABASE_URL,
    SUPABASE_SERVICE_KEY,
    MERCADO_PAGO_ACCESS_TOKEN, // Nome correto com 2 "S"s
    NETLIFY_SITE_URL 
} = process.env;

exports.handler = async function(event, context) {
    
    // 1. Pega os dados do Frontend
    const { email, planoId } = JSON.parse(event.body);
    if (!email || !planoId) {
        return { statusCode: 400, body: JSON.stringify({ erro: 'Dados inválidos.' }) };
    }

    // 2. Define nossos planos
    const planos = {
        'plano_1': { nome: '1 Crédito - Forja da Meia Noite', preco: 7.00, creditos: 1 },
        'plano_2': { nome: '3 Créditos - Forja da Meia Noite', preco: 14.00, creditos: 3 },
        'plano_3': { nome: 'Acesso Mestre (Ilimitado)', preco: 57.00, creditos: 999999 }
    };

    const plano = planos[planoId];
    if (!plano) {
        return { statusCode: 404, body: JSON.stringify({ erro: 'Plano não encontrado.' }) };
    }

    try {
        // 3. Configura o Mercado Pago com nossa senha
        mercadopago.configure({
            access_token: MERCADO_PAGO_ACCESS_TOKEN 
        });

        // 4. Cria a "preferência de pagamento"
        let preference = {
            items: [
                {
                    title: plano.nome,
                    unit_price: plano.preco,
                    quantity: 1,
                }
            ],
            external_reference: `${email}|${plano.creditos}`,
            back_urls: {
                success: `${NETLIFY_SITE_URL}/gerador.html?pagamento=sucesso`,
                failure: `${NETLIFY_SITE_URL}/pagamento.html?pagamento=falha`,
            },
            auto_return: "approved", 
            notification_url: `${NETLIFY_SITE_URL}/.netlify/functions/processar-pagamento`

            // ***** A CORREÇÃO *****
            // O bloco 'payment_methods' foi COMPLETAMENTE REMOVIDO
            // para deixar o Mercado Pago usar o checkout padrão.
        };

        // 5. Envia o pedido ao Mercado Pago
        const response = await mercadopago.preferences.create(preference);

        // 6. Devolve o Link de Pagamento para o Frontend
        return {
            statusCode: 200,
            body: JSON.stringify({ link_pagamento: response.body.init_point })
        };

    } catch (error) {
        console.error('Erro ao criar pagamento:', error.message);
        return { statusCode: 500, body: JSON.stringify({ erro: error.message }) };
    }
};