/* * ESTE É O NOSSO TERCEIRO "ROBÔ" BACKEND
 * Nome: comprar-creditos.js
 * Objetivo: Receber um e-mail e uma quantidade de créditos,
 * encontrar o usuário no Supabase e SOMAR os créditos.
 */

const { createClient } = require('@supabase/supabase-js');

exports.handler = async function(event, context) {
    
    // 1. Pega as "senhas" do Netlify
    const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // 2. Pega o e-mail e os créditos que o Frontend enviou
    const { email, creditosComprados } = JSON.parse(event.body);

    if (!email || !creditosComprados) {
        return { statusCode: 400, body: JSON.stringify({ erro: 'Dados incompletos.' }) };
    }

    try {
        // 3. PROCURA o usuário no banco de dados
        let { data: usuario, error: selectError } = await supabase
            .from('usuarios')
            .select('id, creditos')
            .eq('email', email)
            .single();

        if (selectError || !usuario) {
            throw new Error('Usuário não encontrado. Faça login novamente.');
        }

        // 4. CALCULA os novos créditos
        let novosCreditos;
        if (creditosComprados >= 999999) {
            // Se for o plano ilimitado
            novosCreditos = 999999;
        } else {
            // Se for um plano normal, SOMA
            // (Previne que "ilimitado" + 3 vire "999999 + 3")
            const creditosAtuais = (usuario.creditos >= 999999) ? 0 : usuario.creditos;
            novosCreditos = creditosAtuais + creditosComprados;
        }

        // 5. SALVA os novos créditos no banco de dados
        const { data: usuarioAtualizado, error: updateError } = await supabase
            .from('usuarios')
            .update({ creditos: novosCreditos })
            .eq('id', usuario.id) // Atualiza usando o ID
            .select('id, email, creditos')
            .single();
        
        if (updateError) {
            throw updateError;
        }

        // 6. Sucesso! Retorna o usuário com os créditos atualizados
        return { statusCode: 200, body: JSON.stringify(usuarioAtualizado) };

    } catch (error) {
        console.error('Erro no Supabase:', error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ erro: error.message })
        };
    }
};