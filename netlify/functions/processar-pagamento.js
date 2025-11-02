/* * ROBÔ 2: processar-pagamento.js (O WEBHOOK)
 * Objetivo: Ouvir o "sinal" do Mercado Pago e adicionar créditos no Supabase.
 */

const { createClient } = require('@supabase/supabase-js');
const mercadopago = require('mercadopago');

const { SUPABASE_URL, SUPABASE_SERVICE_KEY, MERCADO_PAGO_ACCESS_TOKEN } = process.env;

exports.handler = async function(event, context) {
    
    // 1. Pega os dados que o Mercado Pago enviou
    const pagamento = JSON.parse(event.body);

    // O Mercado Pago só nos avisa o "ID" do pagamento,
    // precisamos perguntar a ele "quem é esse?"
    if (pagamento.type !== 'payment' || !pagamento.data.id) {
        return { statusCode: 200 }; // Diz "OK" mas não faz nada
    }

    try {
        // 2. Configura o Mercado Pago
        mercadopago.configure({ access_token: MERCADO_PAGO_ACCESS_TOKEN });
        
        // 3. Pede os dados completos do pagamento
        const infoPagamento = await mercadopago.payment.get(pagamento.data.id);
        const { status, external_reference } = infoPagamento.body;

        // 4. VERIFICA SE O PAGAMENTO FOI APROVADO
        if (status === 'approved' && external_reference) {
            
            // 5. Lê a nossa "Etiqueta" (ex: "usuario@gmail.com|3")
            const [email, creditosCompradosStr] = external_reference.split('|');
            const creditosComprados = parseInt(creditosCompradosStr);

            if (!email || !creditosComprados) {
                throw new Error("Referência externa inválida: " + external_reference);
            }

            // 6. Conecta ao Supabase
            const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
            
            // 7. Pega os créditos atuais do usuário
            let { data: usuario, error: selectError } = await supabase
                .from('usuarios')
                .select('id, creditos')
                .eq('email', email)
                .single();

            if (selectError || !usuario) {
                throw new Error("Usuário não encontrado: " + email);
            }

            // 8. SOMA os créditos
            let novosCreditos;
            if (creditosComprados >= 999999) {
                novosCreditos = 999999;
            } else {
                const creditosAtuais = (usuario.creditos >= 999999) ? 0 : usuario.creditos;
                novosCreditos = creditosAtuais + creditosComprados;
            }

            // 9. SALVA no banco de dados
            const { error: updateError } = await supabase
                .from('usuarios')
                .update({ creditos: novosCreditos })
                .eq('email', email);

            if (updateError) {
                throw updateError;
            }

            console.log(`SUCESSO: ${creditosComprados} créditos adicionados para ${email}`);
        }

        // 10. Responde "OK" para o Mercado Pago
        return { statusCode: 200, body: 'OK' };

    } catch (error) {
        console.error('Erro no Webhook:', error.message);
        return { statusCode: 500, body: JSON.stringify({ erro: error.message }) };
    }
};