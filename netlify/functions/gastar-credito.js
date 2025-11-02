/* * ESTE É O NOSSO SEGUNDO "ROBÔ" BACKEND
 * Nome: gastar-credito.js
 * Objetivo: Receber um e-mail, verificar se o usuário tem créditos,
 * subtrair 1 crédito e retornar o novo total.
 */

const { createClient } = require('@supabase/supabase-js');

exports.handler = async function(event, context) {
    
    // 1. Pega as "senhas" do Netlify
    const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // 2. Pega o e-mail do usuário que o Frontend enviou
    const { email } = JSON.parse(event.body);

    if (!email) {
        return { statusCode: 400, body: JSON.stringify({ erro: 'E-mail não fornecido.' }) };
    }

    try {
        // 3. PROCURA o usuário no banco de dados
        let { data: usuario, error: selectError } = await supabase
            .from('usuarios')
            .select('id, creditos')
            .eq('email', email)
            .single();

        if (selectError || !usuario) {
            throw new Error('Usuário não encontrado.');
        }

        // 4. VERIFICA os créditos
        if (usuario.creditos >= 999999) {
            // É Mestre Forjador (ilimitado), não faz nada, só retorna sucesso
            return { statusCode: 200, body: JSON.stringify(usuario) };
        
        } else if (usuario.creditos > 0) {
            // Tem créditos, vamos gastar 1
            const novosCreditos = usuario.creditos - 1;

            const { data: usuarioAtualizado, error: updateError } = await supabase
                .from('usuarios')
                .update({ creditos: novosCreditos })
                .eq('id', usuario.id) // Atualiza usando o ID (mais seguro)
                .select('id, email, creditos')
                .single();
            
            if (updateError) {
                throw updateError;
            }

            // Sucesso! Retorna o usuário com os créditos atualizados
            return { statusCode: 200, body: JSON.stringify(usuarioAtualizado) };

        } else {
            // Créditos insuficientes (0)
            return { 
                statusCode: 402, // 402 = "Payment Required" (Pagamento Necessário)
                body: JSON.stringify({ erro: 'Créditos insuficientes.' }) 
            };
        }

    } catch (error) {
        console.error('Erro no Supabase:', error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ erro: error.message })
        };
    }
};