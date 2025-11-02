/* * ROBÔ 3: get-creditos.js
 * Objetivo: Checar o Supabase e dizer ao Frontend quantos créditos o usuário tem.
 */

const { createClient } = require('@supabase/supabase-js');

exports.handler = async function(event, context) {
    
    const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
    const { email } = JSON.parse(event.body);

    if (!email) {
        return { statusCode: 400, body: JSON.stringify({ erro: 'E-mail não fornecido.' }) };
    }

    try {
        // Procura o usuário
        let { data: usuario, error } = await supabase
            .from('usuarios')
            .select('creditos')
            .eq('email', email)
            .single();

        if (error || !usuario) {
            throw new Error('Usuário não encontrado.');
        }

        // Retorna o número de créditos
        return {
            statusCode: 200,
            body: JSON.stringify({ creditos: usuario.creditos })
        };

    } catch (error) {
        console.error('Erro:', error.message);
        return { statusCode: 500, body: JSON.stringify({ erro: error.message }) };
    }
};